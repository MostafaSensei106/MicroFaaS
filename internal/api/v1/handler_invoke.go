package v1

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/MostafaSensei106/Micro-FaaS/internal/delivery"
	"github.com/MostafaSensei106/Micro-FaaS/internal/domain"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// / InvokeFunction - POST /api/v1/invoke/:name
func (h *Handler) InvokeFunctionHandler(c *gin.Context) {
	funcName := c.Param("name")

	var fn domain.Function
	if err := h.db.Where("name = ?", funcName).First(&fn).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			delivery.NewResponser(c).Status(http.StatusNotFound).WithError(http.StatusText(http.StatusNotFound), err.Error()).Send()
			return
		}
		delivery.NewResponser(c).Status(http.StatusInternalServerError).WithError(http.StatusText(http.StatusInternalServerError), err.Error()).Send()
		return
	}

	var envVars map[string]string
	if len(fn.EnvVars) > 0 {
		_ = json.Unmarshal(fn.EnvVars, &envVars)
	}

	execRes := h.dockerMgr.RunFunction(
		c.Request.Context(),
		fn.ImageTag,
		envVars,
		fn.TimeoutSeconds,
		fn.MemoryLimitMB,
	)

	status := domain.ExecutionStatusSuccess
	if execRes.Error != nil || execRes.StatusCode != 0 {
		status = domain.ExecutionStatusFailed
	}
	exec := domain.Execution{
		FunctionID: fn.ID,
		Status:     status,
		StatusCode: execRes.StatusCode,
		DurationMS: execRes.DurationMS,
		Logs:       execRes.Logs,
	}
	_ = h.db.Create(&exec)

	if execRes.Error != nil {
		delivery.NewResponser(c).Status(http.StatusInternalServerError).WithError(http.StatusText(http.StatusInternalServerError), execRes.Error.Error()).WithData(struct {
			ExecutionID string `json:"execution_id"`
			Logs        string `json:"logs"`
		}{
			ExecutionID: exec.ID.String(),
			Logs:        execRes.Logs,
		}).Send()
		return
	}
	delivery.NewResponser(c).Status(http.StatusOK).WithData(InvokeResponse{
		ExecutionID: exec.ID.String(),
		StatusCode:  execRes.StatusCode,
		DurationMS:  execRes.DurationMS,
		Logs:        execRes.Logs,
	}).Send()

}
