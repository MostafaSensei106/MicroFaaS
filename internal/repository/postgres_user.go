package repository

import (
	"errors"

	"github.com/MostafaSensei106/Micro-FaaS/internal/domain"
	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

// FindByEmail looks up a user by email, returns nil if not found
func (r *UserRepository) FindByEmail(email string) (*domain.User, error) {
	var user domain.User
	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// FindByID looks up a user by UUID
func (r *UserRepository) FindByID(id string) (*domain.User, error) {
	var user domain.User
	if err := r.db.Where("id = ?", id).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// Create inserts a new user
func (r *UserRepository) Create(user *domain.User) error {
	return r.db.Create(user).Error
}

// ListAll returns all users
func (r *UserRepository) ListAll() ([]domain.User, error) {
	var users []domain.User
	if err := r.db.Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

// UpdateRole changes the role of a user
func (r *UserRepository) UpdateRole(id string, role domain.UserRole) error {
	return r.db.Model(&domain.User{}).Where("id = ?", id).Update("role", role).Error
}

// UpdateFcmToken sets the FCM push token for a user
func (r *UserRepository) UpdateFcmToken(id string, token string) error {
	return r.db.Model(&domain.User{}).Where("id = ?", id).Update("fcm_token", token).Error
}

// Delete soft-deletes a user by ID
func (r *UserRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&domain.User{}).Error
}
