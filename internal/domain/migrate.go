package domain

import (
	"fmt"
	"log"

	"gorm.io/gorm"
)

func AutoMigrate(db *gorm.DB) error {
	log.Println("Running PostgreSQL Auto-Migrations...")

	err := db.AutoMigrate(
		&User{},
		&Function{},
		&Execution{},
	)

	if err != nil {
		return fmt.Errorf("auto-migration failed: %w", err)
	}

	log.Println("Database Auto-Migrations completed successfully!")
	return nil
}
