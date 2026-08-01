package container

import (
	"context"
	"fmt"
	"os/exec"

	"github.com/moby/moby/api/types/network"
	"github.com/moby/moby/client"
)

const (
	FunctionsNetworkName = "microfaas_functions_net"
)

func (m *DockerManager) ensureFunctionNetwork() error {
	ctx := context.Background()
	networks, err := m.cli.NetworkList(ctx, client.NetworkListOptions{})
	if err != nil {
		return fmt.Errorf("failed to list networks: %w", err)
	}

	networkExists := false
	var subnet string
	for _, nw := range networks.Items {
		if nw.Name == FunctionsNetworkName {
			networkExists = true
			if len(nw.IPAM.Config) > 0 {
				subnet = nw.IPAM.Config[0].Subnet.String()
			}
			break
		}
	}

	if !networkExists {
		resp, err := m.cli.NetworkCreate(ctx, FunctionsNetworkName, client.NetworkCreateOptions{
			Driver: "bridge",
			IPAM: &network.IPAM{
				Driver: "default",
			},
		})
		if err != nil {
			return fmt.Errorf("failed to create network: %w", err)
		}

		// Get subnet of the newly created network
		netInfo, err := m.cli.NetworkInspect(ctx, resp.ID, client.NetworkInspectOptions{})
		if err != nil {
			return fmt.Errorf("failed to inspect created network: %w", err)
		}
		if len(netInfo.Network.IPAM.Config) > 0 {
			subnet = netInfo.Network.IPAM.Config[0].Subnet.String()
		}
	}

	if subnet != "" {
		if err := applyIptablesRules(subnet); err != nil {
			return fmt.Errorf("failed to apply iptables rules: %w", err)
		}
	}

	return nil
}

func applyIptablesRules(subnet string) error {
	privateRanges := []string{
		"10.0.0.0/8",
		"172.16.0.0/12",
		"192.168.0.0/16",
		"127.0.0.0/8",
	}

	for _, pr := range privateRanges {
		// Prevent traffic from the functions subnet to private IP ranges
		// Using DOCKER-USER chain which is specifically for user rules

		cmd := exec.Command("iptables", "-C", "DOCKER-USER", "-s", subnet, "-d", pr, "-j", "DROP")
		if err := cmd.Run(); err != nil { // Rule doesn't exist
			cmdAdd := exec.Command("iptables", "-I", "DOCKER-USER", "1", "-s", subnet, "-d", pr, "-j", "DROP")
			if errAdd := cmdAdd.Run(); errAdd != nil {
				fmt.Printf("Warning: failed to add iptables rule for %s to %s. Requires root privileges.\n", subnet, pr)
			}
		}
	}
	return nil
}
