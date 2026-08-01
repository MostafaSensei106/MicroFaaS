package v1

import (
	"github.com/MostafaSensei106/Micro-FaaS/internal/config"
	"github.com/MostafaSensei106/Micro-FaaS/internal/container"
	"github.com/MostafaSensei106/Micro-FaaS/internal/repository"
	"github.com/MostafaSensei106/Micro-FaaS/internal/server"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(r *gin.Engine, db *gorm.DB, dockerMgr *container.DockerManager, cfg *config.Config) {
	h := NewHandler(db, dockerMgr)

	// Initialize auth dependencies
	userRepo := repository.NewUserRepository(db)
	jwtService := server.NewJWTService(cfg.JWT.Secret, cfg.JWT.ExpirationHours)
	authHandler := NewAuthHandler(userRepo, jwtService)

	usersHandler := NewUsersHandler(userRepo)

	registerHealthCheckRoutes(r)
	registerAuthRoutes(r, authHandler, jwtService)
	registerUsersRoutes(r, usersHandler, jwtService)
	registerFunctionsRoutes(r, h)
	registerInvokeRoutes(r, h)
	registerTestRunRoutes(r, dockerMgr, cfg)
}
