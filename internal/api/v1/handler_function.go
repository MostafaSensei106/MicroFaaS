package v1

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/MostafaSensei106/Micro-FaaS/internal/container"
	"github.com/MostafaSensei106/Micro-FaaS/internal/delivery"
	"github.com/MostafaSensei106/Micro-FaaS/internal/domain"
	"github.com/gin-gonic/gin"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Handler struct {
	db        *gorm.DB
	dockerMgr *container.DockerManager
}

func NewHandler(db *gorm.DB, dockerMgr *container.DockerManager) *Handler {
	return &Handler{
		db:        db,
		dockerMgr: dockerMgr,
	}
}

// / Create Function - POST /api/v1/functions
func (h *Handler) CreateFunctionHandler(c *gin.Context) {
	var req CreateFunctionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		delivery.NewResponser(c).Status(http.StatusBadRequest).WithError(http.StatusText(http.StatusBadRequest), err.Error()).Send()
		return
	}

	envVarsJSON, err := json.Marshal(req.EnvVars)
	if err != nil {
		delivery.NewResponser(c).Status(http.StatusInternalServerError).WithError(http.StatusText(http.StatusInternalServerError), err.Error()).Send()
		return
	}

	fn := domain.Function{
		Name:           req.Name,
		Runtime:        req.Runtime,
		ImageTag:       req.ImageTag,
		EnvVars:        datatypes.JSON(envVarsJSON),
		TimeoutSeconds: req.TimeoutSeconds,
		MemoryLimitMB:  req.MemoryLimitMB,
		Status:         domain.FunctionStatusReady,
	}

	if err := h.db.Create(&fn).Error; err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			delivery.NewResponser(c).Status(http.StatusConflict).WithError(http.StatusText(http.StatusConflict), err.Error()).Send()
			return
		}
		delivery.NewResponser(c).Status(http.StatusInternalServerError).WithError(http.StatusText(http.StatusInternalServerError), err.Error()).Send()
		return
	}

	delivery.NewResponser(c).Status(http.StatusCreated).WithData(
		FunctionResponse{
			ID:            fn.ID,
			Name:          fn.Name,
			Runtime:       fn.Runtime,
			ImageTag:      fn.ImageTag,
			EnvVars:       req.EnvVars,
			TimeoutSec:    req.TimeoutSeconds,
			MemoryLimitMB: req.MemoryLimitMB,
			Status:        string(fn.Status),
		},
	).Send()

}

// ListFunctions - GET /api/v1/functions
func (h *Handler) ListFunctionsHandler(c *gin.Context) {
	var functions []domain.Function
	if err := h.db.Find(&functions).Error; err != nil {
		delivery.NewResponser(c).Status(http.StatusInternalServerError).WithError(http.StatusText(http.StatusInternalServerError), err.Error()).Send()
		return
	}

	delivery.NewResponser(c).Status(http.StatusOK).WithData(functions).Send()
}

// GetFunctionByName - GET /api/v1/functions/:name
func (h *Handler) GetFunctionByNameHandler(c *gin.Context) {
	name := c.Param("name")
	var fn domain.Function
	if err := h.db.Where("name = ?", name).First(&fn).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			delivery.NewResponser(c).Status(http.StatusNotFound).WithError("NOT_FOUND", "Function not found").Send()
			return
		}
		delivery.NewResponser(c).Status(http.StatusInternalServerError).WithError(http.StatusText(http.StatusInternalServerError), err.Error()).Send()
		return
	}

	var envVars map[string]string
	if len(fn.EnvVars) > 0 {
		_ = json.Unmarshal(fn.EnvVars, &envVars)
	}

	delivery.NewResponser(c).Status(http.StatusOK).WithData(
		FunctionResponse{
			ID:            fn.ID,
			Name:          fn.Name,
			Runtime:       fn.Runtime,
			ImageTag:      fn.ImageTag,
			EnvVars:       envVars,
			TimeoutSec:    fn.TimeoutSeconds,
			MemoryLimitMB: fn.MemoryLimitMB,
			Status:        string(fn.Status),
		},
	).Send()
}
