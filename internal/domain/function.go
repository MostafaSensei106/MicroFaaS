package domain

import (
	"time"

	"github.com/gofrs/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type FunctionStatus string

const (
	FunctionStatusReady     FunctionStatus = "ready"
	FunctionStatusPending   FunctionStatus = "pending"
	FunctionStatusBuilding  FunctionStatus = "building"
	FunctionStatusDeploying FunctionStatus = "deploying"
	FunctionStatusRunning   FunctionStatus = "running"
	FunctionStatusCompleted FunctionStatus = "completed"
	FunctionStatusFailed    FunctionStatus = "failed"
)

type Function struct {
	ID             uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name           string         `gorm:"type:varchar(100);uniqueIndex;not null" json:"name"`
	Runtime        string         `gorm:"type:varchar(50);not null" json:"runtime"`
	ImageTag       string         `gorm:"type:varchar(255)" json:"image_tag"`
	EnvVars        datatypes.JSON `gorm:"type:json" json:"env_vars"`
	TimeoutSeconds int            `gorm:"default:30" json:"timeout_seconds"`
	MemoryLimitMB  int            `gorm:"default:128" json:"memory_limit_mb"`
	Status         FunctionStatus `gorm:"type:varchar(20);default:'PENDING'" json:"status"`

	Executions []Execution `gorm:"foreignKey:FunctionID;constraint:OnDelete:CASCADE" json:"executions,omitempty"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (f *Function) BeforeCreate(tx *gorm.DB) (err error) {
	if f.ID == uuid.Nil {
		f.ID, err = uuid.NewV7()
		if err != nil {
			return err
		}
	}
	return nil
}
