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
	ID         uuid.UUID       `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	FunctionID uuid.UUID       `gorm:"type:uuid;index;not null" json:"function_id"`
	Status     ExecutionStatus `gorm:"type:varchar(20);not null" json:"status"`
	StatusCode int             `json:"status_code"`
	DurationMS int64           `json:"duration_ms"`
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
