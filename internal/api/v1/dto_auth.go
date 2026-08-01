package v1

// Auth DTOs

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type RegisterRequest struct {
	Name     string `json:"name" binding:"required,min=2,max=100"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Role     string `json:"role" binding:"omitempty,oneof=admin developer viewer"`
}

type AuthResponse struct {
	User   UserResponse `json:"user"`
	Tokens TokenPair    `json:"tokens"`
}

type UserResponse struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	Status string `json:"status"`
}

type TokenPair struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type FcmTokenRequest struct {
	Token string `json:"token" binding:"required"`
}
