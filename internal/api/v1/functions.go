package v1

import "github.com/gin-gonic/gin"

func registerFunctionsRoutes(r *gin.Engine, h *Handler) {
	functionsGroup := r.Group("api/v1/functions")
	{
		functionsGroup.POST("", h.CreateFunctionHandler)
	}
}

func registerInvokeRoutes(r *gin.Engine, h *Handler) {
	invokeGroup := r.Group("api/v1/invoke")
	{
		invokeGroup.POST("/:name", h.InvokeFunctionHandler)
	}

}
