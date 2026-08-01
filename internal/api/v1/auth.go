package v1

import "github.com/gin-gonic/gin"

func registerAuthRoutes(router *gin.Engine) {
	authGroup := router.Group("api/v1/auth")
	{
		//login
		authGroup.POST("/login", func(c *gin.Context) {
			// Implement login logic here
		})
		//register
		authGroup.POST("/register", func(c *gin.Context) {
			// Implement register logic here
		})
		//logout
		authGroup.POST("/logout", func(c *gin.Context) {
			// Implement logout logic here
		})
		//refresh token
		authGroup.POST("/refresh", func(c *gin.Context) {
			// Implement refresh token logic here
		})

		// forgot password
		authGroup.POST("/forgot-password", func(c *gin.Context) {
			// Implement forgot password logic here
		})

		// Firebase FCM token
		authGroup.POST("/fcm-token", func(c *gin.Context) {
			// Implement FCM token registration logic here
		})

	}
}
