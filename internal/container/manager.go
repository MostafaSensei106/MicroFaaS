package container

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"

	cont "github.com/moby/moby/api/types/container"
	"github.com/moby/moby/api/types/network"
	"github.com/moby/moby/client"
)

type DockerManager struct {
	cli *client.Client
}

type ExecutionResult struct {
	Logs       string
	StatusCode int
	DurationMS int64
	Error      error
}

func NewDockerManager() (*DockerManager, error) {
	cli, err := client.New(client.FromEnv)
	if err != nil {
		return nil, fmt.Errorf("failed to create docker client: %w", err)
	}

	mgr := &DockerManager{cli: cli}
	if err := mgr.ensureFunctionNetwork(); err != nil {
		return nil, fmt.Errorf("failed to ensure function network: %w", err)
	}

	return mgr, nil
}

var knownImages sync.Map // map[string]bool

func (m *DockerManager) RunFunction(ctx context.Context, imageName string, envVars map[string]string, timeoutSeconds int, memoryLimitMB int, needsInternet bool) *ExecutionResult {
	startTime := time.Now()

	if _, known := knownImages.Load(imageName); !known {
		_, err := m.cli.ImageInspect(ctx, imageName)
		if err != nil {
			reader, pullErr := m.cli.ImagePull(ctx, imageName, client.ImagePullOptions{})
			if pullErr != nil {
				return &ExecutionResult{
					StatusCode: http.StatusInternalServerError,
					Error:      fmt.Errorf("failed to pull image %s: %w", imageName, pullErr),
				}
			}
			io.Copy(io.Discard, reader)
			reader.Close()
		}
		knownImages.Store(imageName, true)
	}

	var env []string
	for key, value := range envVars {
		env = append(env, fmt.Sprintf("%s=%s", key, value))
	}

	hostConfig := &cont.HostConfig{
		Resources: cont.Resources{
			Memory:    int64(memoryLimitMB * 1024 * 1024),
			NanoCPUs:  1000000000, // 1 CPU
			PidsLimit: func() *int64 { v := int64(50); return &v }(),
		},
		AutoRemove:     true,
		Runtime:        "runsc",
		ReadonlyRootfs: true,
		Tmpfs: map[string]string{
			"/tmp": "rw,noexec,nosuid,size=65536k"},
		CapDrop: []string{"ALL"},
	}

	var networkingConfig *network.NetworkingConfig
	if needsInternet {
		networkingConfig = &network.NetworkingConfig{
			EndpointsConfig: map[string]*network.EndpointSettings{
				FunctionsNetworkName: {},
			},
		}
	}

	containerConfig := &cont.Config{
		Image:           imageName,
		Env:             env,
		Cmd:             []string{"sh", "-c", "echo $MESSAGE"},
		NetworkDisabled: !needsInternet,
	}

	resp, err := m.cli.ContainerCreate(ctx, client.ContainerCreateOptions{
		Config:           containerConfig,
		HostConfig:       hostConfig,
		NetworkingConfig: networkingConfig,
		Name:             "",
	})
	if err != nil {
		return &ExecutionResult{
			StatusCode: http.StatusInternalServerError,
			Error:      fmt.Errorf("failed to create container: %w", err),
		}
	}
	ContainerID := resp.ID

	defer func(cid string) {
		go func() {
			removeCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			_, _ = m.cli.ContainerRemove(removeCtx, cid, client.ContainerRemoveOptions{Force: true, RemoveVolumes: true})
		}()
	}(ContainerID)

	execCtx, cancel := context.WithTimeout(ctx, time.Duration(timeoutSeconds)*time.Second)
	defer cancel()

	if _, err := m.cli.ContainerStart(execCtx, ContainerID, client.ContainerStartOptions{}); err != nil {
		return &ExecutionResult{
			StatusCode: http.StatusInternalServerError,
			Error:      fmt.Errorf("failed to start container: %w", err),
		}
	}

	waitRes := m.cli.ContainerWait(execCtx, ContainerID, client.ContainerWaitOptions{Condition: cont.WaitConditionNotRunning})
	var statusCode int64
	select {
	case err := <-waitRes.Error:
		if err != nil {
			if execCtx.Err() == context.DeadlineExceeded || execCtx.Err() == context.Canceled {
				return &ExecutionResult{
					Logs:       "Execution Error: Function execution timed out",
					DurationMS: time.Since(startTime).Milliseconds(),
					StatusCode: http.StatusGatewayTimeout,
					Error:      fmt.Errorf("function execution timed out after %d seconds", timeoutSeconds),
				}
			}
			return &ExecutionResult{
				StatusCode: http.StatusInternalServerError,
				Error:      fmt.Errorf("failed while waiting for container: %w", err),
			}
		}
	case waitResp := <-waitRes.Result:
		statusCode = waitResp.StatusCode
	}

	duration := time.Since(startTime).Milliseconds()
	logOptions := client.ContainerLogsOptions{ShowStdout: true, ShowStderr: true}
	output, err := m.cli.ContainerLogs(ctx, ContainerID, logOptions)
	var logBuffer bytes.Buffer
	if err == nil {
		io.Copy(&logBuffer, output)
		output.Close()
	}
	return &ExecutionResult{
		Logs:       logBuffer.String(),
		StatusCode: int(statusCode),
		DurationMS: duration,
	}
}
