package v1

import (
	"encoding/json"
	"errors"
	"net/http"
	"sync"

	"github.com/MostafaSensei106/Micro-FaaS/internal/container"
	"github.com/MostafaSensei106/Micro-FaaS/internal/delivery"
	"github.com/MostafaSensei106/Micro-FaaS/internal/domain"
	"github.com/gin-gonic/gin"
	"github.com/gofrs/uuid"
	"gorm.io/gorm"
)

var (
	functionCache sync.Map
	envCache      sync.Map
)

// / InvokeFunction - POST /api/v1/invoke/:name
func (h *Handler) InvokeFunctionHandler(c *gin.Context) {
	funcName := c.Param("name")

	// 1. In-memory cache for function lookup
	var fn *domain.Function
	if cachedFn, ok := functionCache.Load(funcName); ok {
		fn = cachedFn.(*domain.Function)
	} else {
		fn = &domain.Function{}
		if err := h.db.Where("name = ?", funcName).First(fn).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				delivery.NewResponser(c).Status(http.StatusNotFound).WithError(http.StatusText(http.StatusNotFound), err.Error()).Send()
				return
			}
			delivery.NewResponser(c).Status(http.StatusInternalServerError).WithError(http.StatusText(http.StatusInternalServerError), err.Error()).Send()
			return
		}
		functionCache.Store(funcName, fn)
	}

	// 2. In-memory cache for environment variables
	var envVars map[string]string
	if cachedEnv, ok := envCache.Load(funcName); ok {
		envVars = cachedEnv.(map[string]string)
	} else {
		if len(fn.EnvVars) > 0 {
			_ = json.Unmarshal(fn.EnvVars, &envVars)
		}
		envCache.Store(funcName, envVars)
	}

	execRes := h.dockerMgr.RunFunction(
		c.Request.Context(),
		fn.ImageTag,
		envVars,
		fn.TimeoutSeconds,
		fn.MemoryLimitMB,
		fn.NeedsInternet,
	)

	// 3. Async database insertion for execution log to unblock response
	execID, _ := uuid.NewV7()
	go func(fnID uuid.UUID, id uuid.UUID, res *container.ExecutionResult) {
		status := domain.ExecutionStatusSuccess
		if res.Error != nil || res.StatusCode != 0 {
			status = domain.ExecutionStatusFailed
		}
		exec := domain.Execution{
			ID:         id,
			FunctionID: fnID,
			Status:     status,
			StatusCode: res.StatusCode,
			DurationMS: res.DurationMS,
			Logs:       res.Logs,
		}
		_ = h.db.Create(&exec)
	}(fn.ID, execID, execRes)

	if execRes.Error != nil {
		delivery.NewResponser(c).Status(http.StatusInternalServerError).WithError(http.StatusText(http.StatusInternalServerError), execRes.Error.Error()).WithData(struct {
			ExecutionID string `json:"execution_id"`
			Logs        string `json:"logs"`
		}{
			ExecutionID: execID.String(),
			Logs:        execRes.Logs,
		}).Send()
		return
	}
	delivery.NewResponser(c).Status(http.StatusOK).WithData(InvokeResponse{
		ExecutionID: execID.String(),
		StatusCode:  execRes.StatusCode,
		DurationMS:  execRes.DurationMS,
		Logs:        execRes.Logs,
	}).Send()
}
