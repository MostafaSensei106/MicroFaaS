package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"text/tabwriter"
	"time"

	"github.com/spf13/cobra"
)

const defaultServerURL = "http://localhost:8080"

// Function represents the structure of a function returned by the API
type Function struct {
	ID             string      `json:"id"`
	Name           string      `json:"name"`
	Runtime        string      `json:"runtime"`
	ImageTag       string      `json:"image_tag"`
	EnvVars        interface{} `json:"env_vars"`
	TimeoutSeconds int         `json:"timeout_seconds"`
	TimeoutSec     int         `json:"timeout_sec"`
	MemoryLimitMB  int         `json:"memory_limit_mb"`
	Status         string      `json:"status"`
	CreatedAt      time.Time   `json:"created_at"`
	UpdatedAt      time.Time   `json:"updated_at"`
}

func (f Function) GetTimeout() int {
	if f.TimeoutSeconds > 0 {
		return f.TimeoutSeconds
	}
	return f.TimeoutSec
}

// APIResponse wraps server responses
type APIResponse struct {
	Success bool            `json:"success"`
	Data    json.RawMessage `json:"data,omitempty"`
	Error   *APIError       `json:"errors,omitempty"`
}

type APIError struct {
	Code    string `json:"code,omitempty"`
	Message string `json:"message,omitempty"`
}

// InvokeData represents response data for function execution
type InvokeData struct {
	ExecutionID string `json:"execution_id"`
	StatusCode  int    `json:"status_code"`
	DurationMS  int64  `json:"duration_ms"`
	Logs        string `json:"logs"`
}

func buildURL(baseURL, endpoint string) string {
	baseURL = strings.TrimRight(baseURL, "/")
	endpoint = strings.TrimLeft(endpoint, "/")
	return fmt.Sprintf("%s/%s", baseURL, endpoint)
}

func formatStatus(status string) string {
	switch strings.ToLower(status) {
	case "ready", "completed":
		return "🟢 " + status
	case "running":
		return "⚡ " + status
	case "pending", "building", "deploying":
		return "🟡 " + status
	case "failed":
		return "🔴 " + status
	default:
		return "⚪ " + status
	}
}

func formatEnvVars(env interface{}) string {
	if env == nil {
		return "none"
	}
	switch v := env.(type) {
	case map[string]interface{}:
		if len(v) == 0 {
			return "none"
		}
		var pairs []string
		for k, val := range v {
			pairs = append(pairs, fmt.Sprintf("%s=%v", k, val))
		}
		return strings.Join(pairs, ", ")
	case map[string]string:
		if len(v) == 0 {
			return "none"
		}
		var pairs []string
		for k, val := range v {
			pairs = append(pairs, fmt.Sprintf("%s=%s", k, val))
		}
		return strings.Join(pairs, ", ")
	default:
		b, err := json.Marshal(v)
		if err != nil || string(b) == "{}" || string(b) == "null" {
			return "none"
		}
		return string(b)
	}
}

func main() {
	var serverURL string

	var rootCmd = &cobra.Command{
		Use:   "mfaas",
		Short: "⚡ Micro-FaaS CLI - Manage your self-hosted serverless functions",
		Long: `🚀 Micro-FaaS CLI is a powerful command-line interface for managing self-hosted serverless functions.
It allows you to create, deploy, list, and invoke your serverless functions with ease directly from your terminal.`,
	}
	rootCmd.PersistentFlags().StringVarP(&serverURL, "server", "s", defaultServerURL, "📡 Micro-FaaS Gateway Server URL")
	rootCmd.Version = "1.0.0"
	rootCmd.SetVersionTemplate("⚡ Micro-FaaS CLI Version: {{printf \"%s\" .Version}}\n")

	// --- LIST COMMAND ---
	var listCmd = &cobra.Command{
		Use:   "list",
		Short: "📋 List all deployed serverless functions",
		Long:  "📋 List all deployed functions currently hosted on the Micro-FaaS engine.",
		Run: func(cmd *cobra.Command, args []string) {
			url := buildURL(serverURL, "api/v1/functions")
			resp, err := http.Get(url)
			if err != nil {
				fmt.Printf("❌ Error connecting to server (%s): %v\n", serverURL, err)
				fmt.Println("💡 Please make sure the Micro-FaaS server is running.")
				os.Exit(1)
			}
			defer resp.Body.Close()

			body, err := io.ReadAll(resp.Body)
			if err != nil {
				fmt.Printf("❌ Error reading response body: %v\n", err)
				os.Exit(1)
			}

			if resp.StatusCode != http.StatusOK {
				fmt.Printf("❌ Failed to list functions (HTTP %d):\n%s\n", resp.StatusCode, string(body))
				os.Exit(1)
			}

			var apiResp APIResponse
			if err := json.Unmarshal(body, &apiResp); err != nil {
				var funcs []Function
				if err2 := json.Unmarshal(body, &funcs); err2 == nil {
					renderFunctionsTable(funcs)
					return
				}
				fmt.Printf("❌ Error parsing server response: %v\n", err)
				fmt.Println("📄 Raw response:", string(body))
				os.Exit(1)
			}

			if !apiResp.Success {
				errMsg := "Unknown error"
				if apiResp.Error != nil && apiResp.Error.Message != "" {
					errMsg = apiResp.Error.Message
				}
				fmt.Printf("❌ Server reported an error: %s\n", errMsg)
				os.Exit(1)
			}

			var funcs []Function
			if err := json.Unmarshal(apiResp.Data, &funcs); err != nil {
				fmt.Printf("❌ Error parsing functions data: %v\n", err)
				os.Exit(1)
			}

			renderFunctionsTable(funcs)
		},
	}

	// --- CREATE COMMAND ---
	var name, runtime, imageTag string
	var envVars map[string]string
	var timeoutSeconds, memoryLimitMB int

	var createCmd = &cobra.Command{
		Use:   "create",
		Short: "➕ Create and deploy a new function",
		Long:  "➕ Create and register a new serverless function with specified runtime, container image, environment variables, and limits.",
		Run: func(cmd *cobra.Command, args []string) {
			payload := map[string]interface{}{
				"name":            name,
				"runtime":         runtime,
				"image_tag":       imageTag,
				"env_vars":        envVars,
				"timeout_seconds": timeoutSeconds,
				"memory_limit_mb": memoryLimitMB,
			}

			jsonPayload, err := json.Marshal(payload)
			if err != nil {
				fmt.Printf("❌ Error marshaling JSON payload: %v\n", err)
				os.Exit(1)
			}

			url := buildURL(serverURL, "api/v1/functions")
			resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonPayload))
			if err != nil {
				fmt.Printf("❌ Error creating function: %v\n", err)
				fmt.Println("💡 Please check if the Micro-FaaS server is reachable.")
				os.Exit(1)
			}
			defer resp.Body.Close()

			body, _ := io.ReadAll(resp.Body)
			if resp.StatusCode == http.StatusCreated || resp.StatusCode == http.StatusOK {
				fmt.Println("\n✨ Function created successfully!")
				var apiResp APIResponse
				if err := json.Unmarshal(body, &apiResp); err == nil && apiResp.Success && len(apiResp.Data) > 0 {
					var fn Function
					if err := json.Unmarshal(apiResp.Data, &fn); err == nil {
						renderFunctionCard(fn)
						return
					}
				}
				fmt.Println(string(body))
			} else {
				fmt.Printf("\n❌ Function creation failed (HTTP %d):\n", resp.StatusCode)
				var apiResp APIResponse
				if err := json.Unmarshal(body, &apiResp); err == nil && apiResp.Error != nil {
					fmt.Printf("   Error: %s (%s)\n", apiResp.Error.Message, apiResp.Error.Code)
				} else {
					fmt.Println("  ", string(body))
				}
				os.Exit(1)
			}
		},
	}

	createCmd.Flags().StringVarP(&name, "name", "n", "", "🏷️ Function Name (required)")
	createCmd.Flags().StringVarP(&runtime, "runtime", "r", "alpine", "⚙️ Runtime environment")
	createCmd.Flags().StringVarP(&imageTag, "image", "i", "alpine:latest", "📦 Docker image tag (required)")
	createCmd.Flags().StringToStringVarP(&envVars, "env-vars", "e", nil, "🔑 Environment variables (e.g. KEY1=VAL1,KEY2=VAL2)")
	createCmd.Flags().IntVarP(&timeoutSeconds, "timeout", "t", 30, "⏱️ Timeout in seconds")
	createCmd.Flags().IntVarP(&memoryLimitMB, "memory", "m", 128, "💾 Memory limit in MB")

	_ = createCmd.MarkFlagRequired("name")
	_ = createCmd.MarkFlagRequired("image")

	// --- INVOKE COMMAND ---
	var invokeCmd = &cobra.Command{
		Use:   "invoke [function-name]",
		Short: "⚡ Invoke a function by name",
		Long:  "⚡ Invoke a deployed serverless function by its name and display execution results and logs.",
		Args:  cobra.ExactArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			funcName := args[0]
			url := buildURL(serverURL, "api/v1/invoke/"+funcName)

			fmt.Printf("🚀 Invoking function '%s'...\n\n", funcName)

			resp, err := http.Post(url, "application/json", nil)
			if err != nil {
				fmt.Printf("❌ Error invoking function: %v\n", err)
				fmt.Println("💡 Please verify that the server is running and accessible.")
				os.Exit(1)
			}
			defer resp.Body.Close()

			body, err := io.ReadAll(resp.Body)
			if err != nil {
				fmt.Printf("❌ Error reading response body: %v\n", err)
				os.Exit(1)
			}

			var apiResp APIResponse
			if err := json.Unmarshal(body, &apiResp); err == nil {
				var invData InvokeData
				if len(apiResp.Data) > 0 {
					_ = json.Unmarshal(apiResp.Data, &invData)
				}

				if apiResp.Success {
					fmt.Println("⚡ Execution Completed Successfully!")
					fmt.Println("──────────────────────────────────────────────────")
					if invData.ExecutionID != "" {
						fmt.Printf("🆔 Execution ID: %s\n", invData.ExecutionID)
					}
					fmt.Printf("📊 Status Code:  %d\n", invData.StatusCode)
					fmt.Printf("⏱️ Duration:     %d ms\n", invData.DurationMS)
					fmt.Println("──────────────────────────────────────────────────")
					fmt.Println("📜 Execution Logs:")
					if strings.TrimSpace(invData.Logs) != "" {
						renderLogsBox(invData.Logs)
					} else {
						fmt.Println("   (No logs produced)")
					}
					return
				} else {
					fmt.Println("❌ Function Execution Failed!")
					fmt.Println("──────────────────────────────────────────────────")
					if apiResp.Error != nil {
						fmt.Printf("🔴 Error Code:    %s\n", apiResp.Error.Code)
						fmt.Printf("💬 Message:       %s\n", apiResp.Error.Message)
					}
					if invData.ExecutionID != "" {
						fmt.Printf("🆔 Execution ID: %s\n", invData.ExecutionID)
					}
					if invData.Logs != "" {
						fmt.Println("──────────────────────────────────────────────────")
						fmt.Println("📜 Logs:")
						renderLogsBox(invData.Logs)
					}
					os.Exit(1)
				}
			}

			fmt.Printf("⚡ Response Status (HTTP %d):\n", resp.StatusCode)
			fmt.Println(string(body))
		},
	}

	rootCmd.AddCommand(listCmd, createCmd, invokeCmd)

	if err := rootCmd.Execute(); err != nil {
		fmt.Printf("❌ Error executing command: %v\n", err)
		os.Exit(1)
	}
}

func renderFunctionsTable(funcs []Function) {
	if len(funcs) == 0 {
		fmt.Println("ℹ️ No functions deployed yet. Use 'mfaas create' to deploy your first function!")
		return
	}

	fmt.Printf("📋 Deployed Functions (%d total):\n\n", len(funcs))

	w := tabwriter.NewWriter(os.Stdout, 0, 0, 3, ' ', 0)
	fmt.Fprintln(w, "ID\tNAME\tRUNTIME\tIMAGE TAG\tTIMEOUT\tMEMORY\tSTATUS")
	fmt.Fprintln(w, "--\t----\t-------\t---------\t-------\t------\t------")

	for _, fn := range funcs {
		timeoutStr := fmt.Sprintf("%ds", fn.GetTimeout())
		memStr := fmt.Sprintf("%dMB", fn.MemoryLimitMB)
		statusStr := formatStatus(fn.Status)

		fmt.Fprintf(w, "%s\t%s\t%s\t%s\t%s\t%s\t%s\n",
			fn.ID,
			fn.Name,
			fn.Runtime,
			fn.ImageTag,
			timeoutStr,
			memStr,
			statusStr,
		)
	}
	w.Flush()
	fmt.Println()
}

func renderFunctionCard(fn Function) {
	w := tabwriter.NewWriter(os.Stdout, 0, 0, 2, ' ', 0)
	fmt.Fprintf(w, "  🆔 ID:\t%s\n", fn.ID)
	fmt.Fprintf(w, "  🏷️ Name:\t%s\n", fn.Name)
	fmt.Fprintf(w, "  ⚙️ Runtime:\t%s\n", fn.Runtime)
	fmt.Fprintf(w, "  📦 Image Tag:\t%s\n", fn.ImageTag)
	fmt.Fprintf(w, "  ⏱️ Timeout:\t%ds\n", fn.GetTimeout())
	fmt.Fprintf(w, "  💾 Memory:\t%dMB\n", fn.MemoryLimitMB)
	statusVal := fn.Status
	if statusVal == "" {
		statusVal = "ready"
	}
	fmt.Fprintf(w, "  🟢 Status:\t%s\n", formatStatus(statusVal))
	fmt.Fprintf(w, "  🔑 Env Vars:\t%s\n", formatEnvVars(fn.EnvVars))
	w.Flush()
	fmt.Println()
}

func renderLogsBox(logs string) {
	fmt.Println("┌──────────────────────────────────────────────────────────┐")
	lines := strings.Split(strings.TrimRight(logs, "\n"), "\n")
	for _, line := range lines {
		fmt.Printf("│ %s\n", line)
	}
	fmt.Println("└──────────────────────────────────────────────────────────┘")
}
