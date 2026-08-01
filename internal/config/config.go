package config

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/spf13/viper"
)

const AppName = "myapp" // Change to your application name

type Config struct {
	Server   ServerConfig   `mapstructure:"server"`
	Database DatabaseConfig `mapstructure:"database"`
	Docker   DockerConfig   `mapstructure:"docker"`
}

type ServerConfig struct {
	Port string `mapstructure:"port"`
	Mode string `mapstructure:"mode"`
}

type DatabaseConfig struct {
	Host         string        `mapstructure:"host"`
	Port         int           `mapstructure:"port"`
	User         string        `mapstructure:"user"`
	Password     string        `mapstructure:"password"`
	DBName       string        `mapstructure:"dbname"`
	SSLMode      string        `mapstructure:"sslmode"`
	MaxOpenConns int           `mapstructure:"max_open_conns"`
	MaxIdleConns int           `mapstructure:"max_idle_conns"`
	MaxLifetime  time.Duration `mapstructure:"max_lifetime"`
}

type DockerConfig struct {
	Network        string `mapstructure:"network"`
	TimeoutSeconds int    `mapstructure:"timeout_seconds"`
}

func (d *DatabaseConfig) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s Timestamptz=true",
		d.Host, d.Port, d.User, d.Password, d.DBName, d.SSLMode,
	)
}

func LoadConfig() (*Config, error) {
	configPath, err := getConfigPath()
	if err != nil {
		return nil, err
	}

	if err := ensureDefaultConfig(configPath); err != nil {
		return nil, err
	}

	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(configPath)
	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err != nil {
		return nil, fmt.Errorf("error reading config file: %w", err)
	}

	var cfg Config
	if err := viper.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("error unmarshalling config: %w", err)
	}

	return &cfg, nil
}

func getConfigPath() (string, error) {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return "", fmt.Errorf("failed to get config directory: %w", err)
	}

	path := filepath.Join(configDir, AppName)

	if err := os.MkdirAll(path, 0o755); err != nil {
		return "", fmt.Errorf("failed to create config directory: %w", err)
	}

	return path, nil
}

func ensureDefaultConfig(configDir string) error {
	configFile := filepath.Join(configDir, "config.yaml")

	if _, err := os.Stat(configFile); err == nil {
		return nil // Config already exists
	}

	defaultConfig := `server:
	port: "8080"
	mode: "debug"
  
  database:
	host: "localhost"
	port: 5432
	user: "root"
	password: "root"
	dbname: "MicroFaaS"
	sslmode: "disable"
	max_open_conns: 100
	max_idle_conns: 10
	max_lifetime: 1800
  
  docker:
	network: "bridge"
	timeout_seconds: 30
  
`

	if err := os.WriteFile(configFile, []byte(defaultConfig), 0o644); err != nil {
		return fmt.Errorf("failed to create default config: %w", err)
	}

	return nil
}
