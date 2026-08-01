package v1

import (
	"github.com/MostafaSensei106/Micro-FaaS/internal/config"
	"github.com/MostafaSensei106/Micro-FaaS/internal/container"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(r *gin.Engine, db *gorm.DB, dockerMgr *container.DockerManager, cfg *config.Config) {
	h := NewHandler(db, dockerMgr)
	registerHealthCheckRoutes(r)
	registerAuthRoutes(r)
	registerFunctionsRoutes(r, h)
	registerInvokeRoutes(r, h)
	registerTestRunRoutes(r, dockerMgr, cfg)
}
