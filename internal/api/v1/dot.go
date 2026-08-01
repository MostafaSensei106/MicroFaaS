package v1

import "github.com/gofrs/uuid"

type CreateFunctionRequest struct {
	Name          string            `json:"name" binding:"required,min=3, max=50"`
	Runtime       string            `json:"runtime" binding:"required"`
	ImageTag      string            `json:"image_tag" binding:"required"`
	EnvVars       map[string]string `json:"env_vars"`
	TimeoutSec    int               `json:"timeout_Sec" binding:"required"`
	MemoryLimitMB int               `json:"memory_limit_mb" binding:"required"`
}

type FunctionResponse struct {
	ID            uuid.UUID         `json:"id"`
	Name          string            `json:"name"`
	Runtime       string            `json:"runtime"`
	ImageTag      string            `json:"image_tag"`
	EnvVars       map[string]string `json:"env_vars"`
	TimeoutSec    int               `json:"timeout_sec"`
	MemoryLimitMB int               `json:"memory_limit_mb"`
	Status        string            `json:"status"`
}

type InvokeResponse struct {
	ExecutionID string `json:"execution_id"`
	StatusCode  int    `json:"status_code"`
	DurationMS  int64  `json:"duration_ms"`
	Logs        string `json:"logs"`
}
