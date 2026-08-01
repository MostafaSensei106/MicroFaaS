package v1

import (
	"github.com/MostafaSensei106/Micro-FaaS/internal/config"
	"github.com/MostafaSensei106/Micro-FaaS/internal/container"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine, dockerMgr *container.DockerManager, cfg *config.Config) {
	registerHealthCheckRoutes(router)
	registerAuthRoutes(router)
	registerTestRunRoutes(router, dockerMgr, cfg)
	// registerFunctionsRoutes(router)
}
