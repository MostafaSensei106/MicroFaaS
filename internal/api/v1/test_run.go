package v1

import (
	"context"
	"log"
	"net/http"

	"github.com/MostafaSensei106/Micro-FaaS/internal/config"
	"github.com/MostafaSensei106/Micro-FaaS/internal/container"
	"github.com/MostafaSensei106/Micro-FaaS/internal/delivery"
	"github.com/gin-gonic/gin"
)

func registerTestRunRoutes(router *gin.Engine, dockerMgr *container.DockerManager, cfg *config.Config) {
	testRunGroup := router.Group("api/v1/test-run")
	{
		testRunGroup.POST("", func(c *gin.Context) {
			result := dockerMgr.RunFunction(
				context.Background(),
				"alpine:latest",
				map[string]string{"MESSAGE": "Hello from Micro-FaaS Engine!"},
				10,  // 10s Timeout
				128, // 128MB RAM
				false, // NeedsInternet
			)
			if result.Error != nil {
				delivery.NewResponser(c).Status(http.StatusInternalServerError).WithError(http.StatusText(http.StatusInternalServerError), result.Error.Error()).Send()
				return
			}
			delivery.NewResponser(c).Status(http.StatusOK).WithData(struct {
				StatusCode int    `json:"status_code"`
				Logs       string `json:"logs"`
				DurationMS int64  `json:"duration_ms"`
			}{
				StatusCode: result.StatusCode,
				Logs:       result.Logs,
				DurationMS: result.DurationMS,
			}).Send()
		})
		log.Printf("Micro-FaaS Gateway Server starting on port %s...", cfg.Server.Port)
		if err := router.Run(":" + cfg.Server.Port); err != nil {
			log.Fatalf("Server failed to run: %v", err)
		}
	}
}
