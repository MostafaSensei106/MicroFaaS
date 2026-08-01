package main

import (
	"log"

	v1 "github.com/MostafaSensei106/Micro-FaaS/internal/api/v1"
	"github.com/MostafaSensei106/Micro-FaaS/internal/config"
	"github.com/MostafaSensei106/Micro-FaaS/internal/db"
	"github.com/gin-gonic/gin"
)

func startEngine() {

	/// load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("failed to load configuration: %v", err)
	}

	/// Initialize the database connection
	database, err := db.InitPostgresDB(&cfg.Database)
	if err != nil {
		log.Fatalf("failed to initialize database: %v", err)
	}
	_ = database // Use the database connection as needed

	log.Println("Database connection established successfully.")

	/// Setup Gin router
	router := ginSetup(cfg)

	/// Start the server
	serverAddress := ":" + cfg.Server.Port
	log.Printf("Starting server on %s in %s mode...", serverAddress, cfg.Server.Mode)
	if err := router.Run(serverAddress); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}

}

func ginSetup(cfg *config.Config) *gin.Engine {
	gin.SetMode(cfg.Server.Mode)
	router := gin.Default()
	v1.SetupRoutes(router)

	return router
}
