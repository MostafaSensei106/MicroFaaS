package domain

import (
	"time"

	"github.com/gofrs/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type FunctionStatus string

const (
	FunctionStatusPending   FunctionStatus = "pending"
	FunctionStatusBuilding  FunctionStatus = "building"
	FunctionStatusDeploying FunctionStatus = "deploying"
	FunctionStatusRunning   FunctionStatus = "running"
	FunctionStatusCompleted FunctionStatus = "completed"
	FunctionStatusFailed    FunctionStatus = "failed"
)

type Function struct {
	ID             uuid.UUID      `gorm:"type:uuid;default:uuid_generate_v7();primaryKey" json:"id"`
	Name           string         `gorm:"type:varchar(100);unique;not null" json:"name"`
	Runtime        string         `gorm:"type:varchar(50);not null" json:"runtime"`
	ImageTag       string         `gorm:"type:varchar(100);not null" json:"image_tag"`
	EnvVars        datatypes.JSON `gorm:"type:jsonb;default:'{}'" json:"env_vars"`
	TimeoutSeconds int            `gorm:"type:int;default:30" json:"timeout_seconds"`
	MemoryLimitMB  int            `gorm:"type:int;default:128" json:"memory_limit_mb"`
	Status         FunctionStatus `gorm:"type:varchar(20);default:'pending'" json:"status"`
	Executions     []Execution    `gorm:"foreignKey:FunctionID;constraint:OnDelete:CASCADE" json:"executions,omitempty"`

	CreatedAt time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
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
