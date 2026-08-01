package middleware

import (
	"net/http"
	"strings"

	"github.com/MostafaSensei106/Micro-FaaS/internal/delivery"
	"github.com/MostafaSensei106/Micro-FaaS/internal/server"
	"github.com/gin-gonic/gin"
)

const (
	AuthUserIDKey = "auth_user_id"
	AuthEmailKey  = "auth_email"
	AuthRoleKey   = "auth_role"
)

// JWTAuthMiddleware validates the Bearer token and injects user claims into the context
func JWTAuthMiddleware(jwtService *server.JWTService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			delivery.NewResponser(c).
				Status(http.StatusUnauthorized).
				WithError("UNAUTHORIZED", "Authorization header is required").
				Send()
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			delivery.NewResponser(c).
				Status(http.StatusUnauthorized).
				WithError("UNAUTHORIZED", "Authorization header must be: Bearer <token>").
				Send()
			c.Abort()
			return
		}

		claims, err := jwtService.ValidateToken(parts[1])
		if err != nil {
			delivery.NewResponser(c).
				Status(http.StatusUnauthorized).
				WithError("UNAUTHORIZED", "Invalid or expired token").
				Send()
			c.Abort()
			return
		}

		// Inject authenticated user info into Gin context
		c.Set(AuthUserIDKey, claims.UserID)
		c.Set(AuthEmailKey, claims.Email)
		c.Set(AuthRoleKey, claims.Role)

		c.Next()
	}
}

// RequireRole checks that the authenticated user has one of the allowed roles
func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get(AuthRoleKey)
		if !exists {
			delivery.NewResponser(c).
				Status(http.StatusForbidden).
				WithError("FORBIDDEN", "Access denied").
				Send()
			c.Abort()
			return
		}

		roleStr, ok := userRole.(string)
		if !ok {
			delivery.NewResponser(c).
				Status(http.StatusForbidden).
				WithError("FORBIDDEN", "Invalid role").
				Send()
			c.Abort()
			return
		}

		for _, allowed := range roles {
			if roleStr == allowed {
				c.Next()
				return
			}
		}

		delivery.NewResponser(c).
			Status(http.StatusForbidden).
			WithError("FORBIDDEN", "Insufficient permissions").
			Send()
		c.Abort()
	}
}
