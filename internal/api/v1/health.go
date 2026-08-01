package v1

import (
	"net/http"

	"github.com/MostafaSensei106/Micro-FaaS/internal/delivery"
	"github.com/gin-gonic/gin"
)

func registerHealthCheckRoutes(router *gin.Engine) {
	healthGroup := router.Group("api/v1/health")
	{
		healthGroup.GET("/", func(c *gin.Context) {
			delivery.NewResponser(c).Status(http.StatusOK).WithData(struct {
				Status  string `json:"status"`
				Service string `json:"service"`
			}{
				Status:  "UP",
				Service: "Micro-FaaS Engine",
			}).Send()
		})
	}
}
