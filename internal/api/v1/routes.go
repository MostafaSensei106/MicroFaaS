package v1

import "github.com/gin-gonic/gin"

func SetupRoutes(router *gin.Engine) {
	registerHealthCheckRoutes(router)
	registerAuthRoutes(router)
	// registerFunctionsRoutes(router)
}
