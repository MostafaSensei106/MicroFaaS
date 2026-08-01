package domain

import (
	"time"

	"github.com/gofrs/uuid"
	"gorm.io/gorm"
)

type ExecutionStatus string

const (
	ExecutionStatusSuccess  ExecutionStatus = "success"
	ExecutionStatusFailed   ExecutionStatus = "failed"
	ExecutionStatusTimedOut ExecutionStatus = "timed_out"
)

type Execution struct {
	ID         uuid.UUID       `gorm:"type:uuid;default:uuid_generate_v7();primaryKey" json:"id"`
	FunctionID uuid.UUID       `gorm:"type:uuid;not null" json:"function_id"`
	Status     ExecutionStatus `gorm:"type:varchar(20);not null" json:"status"`
	StatusCode int             `gorm:"type:int;not null" json:"status_code"`
	DurationMs int64           `gorm:"type:bigint;not null" json:"duration_ms"`
	Logs       string          `gorm:"type:text" json:"logs"`
	ExecutedAt time.Time       `gorm:"index" json:"executed_at"`
}

func (e *Execution) BeforeCreate(tx *gorm.DB) (err error) {
	if e.ID == uuid.Nil {
		e.ID, err = uuid.NewV7()
		if err != nil {
			return err
		}
	}
	return nil
}
