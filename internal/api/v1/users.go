package v1

import (
	"net/http"

	"github.com/MostafaSensei106/Micro-FaaS/internal/api/middleware"
	"github.com/MostafaSensei106/Micro-FaaS/internal/delivery"
	"github.com/MostafaSensei106/Micro-FaaS/internal/domain"
	"github.com/MostafaSensei106/Micro-FaaS/internal/repository"
	"github.com/MostafaSensei106/Micro-FaaS/internal/server"
	"github.com/gin-gonic/gin"
)

type UsersHandler struct {
	userRepo *repository.UserRepository
}

func NewUsersHandler(userRepo *repository.UserRepository) *UsersHandler {
	return &UsersHandler{userRepo: userRepo}
}

func registerUsersRoutes(router *gin.Engine, uh *UsersHandler, jwtService *server.JWTService) {
	usersGroup := router.Group("api/v1/users")
	usersGroup.Use(middleware.JWTAuthMiddleware(jwtService))
	// Example of restricting to admin (you can add this if needed):
	// usersGroup.Use(middleware.RequireRole("admin"))
	{
		usersGroup.GET("", uh.ListUsers)
		usersGroup.PUT("/:id/role", uh.UpdateRole)
		usersGroup.DELETE("/:id", uh.DeleteUser)
	}
}

func (uh *UsersHandler) ListUsers(c *gin.Context) {
	users, err := uh.userRepo.ListAll()
	if err != nil {
		delivery.NewResponser(c).
			Status(http.StatusInternalServerError).
			WithError("INTERNAL_ERROR", "Failed to list users").
			Send()
		return
	}

	// Mask passwords
	var resp []UserResponse
	for _, u := range users {
		resp = append(resp, UserResponse{
			ID:     u.ID.String(),
			Name:   u.Name,
			Email:  u.Email,
			Role:   string(u.Role),
			Status: string(u.Status),
		})
	}

	delivery.NewResponser(c).Status(http.StatusOK).WithData(resp).Send()
}

func (uh *UsersHandler) UpdateRole(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Role string `json:"role" binding:"required,oneof=admin developer viewer"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		delivery.NewResponser(c).Status(http.StatusBadRequest).WithError("VALIDATION_ERROR", err.Error()).Send()
		return
	}

	if err := uh.userRepo.UpdateRole(id, domain.UserRole(req.Role)); err != nil {
		delivery.NewResponser(c).Status(http.StatusInternalServerError).WithError("INTERNAL_ERROR", "Failed to update role").Send()
		return
	}

	delivery.NewResponser(c).Status(http.StatusOK).WithData(map[string]string{"message": "Role updated successfully"}).Send()
}

func (uh *UsersHandler) DeleteUser(c *gin.Context) {
	id := c.Param("id")
	if err := uh.userRepo.Delete(id); err != nil {
		delivery.NewResponser(c).Status(http.StatusInternalServerError).WithError("INTERNAL_ERROR", "Failed to delete user").Send()
		return
	}

	delivery.NewResponser(c).Status(http.StatusOK).WithData(map[string]string{"message": "User deleted successfully"}).Send()
}
