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

type AuthHandler struct {
	userRepo   *repository.UserRepository
	jwtService *server.JWTService
}

func NewAuthHandler(userRepo *repository.UserRepository, jwtService *server.JWTService) *AuthHandler {
	return &AuthHandler{
		userRepo:   userRepo,
		jwtService: jwtService,
	}
}

func registerAuthRoutes(router *gin.Engine, ah *AuthHandler, jwtService *server.JWTService) {
	authGroup := router.Group("api/v1/auth")
	{
		// Public routes
		authGroup.POST("/login", ah.Login)
		authGroup.POST("/register", ah.Register)
		authGroup.POST("/forgot-password", ah.ForgotPassword)

		// Protected routes (require valid JWT)
		protected := authGroup.Group("")
		protected.Use(middleware.JWTAuthMiddleware(jwtService))
		{
			protected.POST("/logout", ah.Logout)
			protected.POST("/refresh", ah.Refresh)
			protected.POST("/fcm-token", ah.RegisterFcmToken)
		}
	}
}

// Login authenticates a user and returns JWT tokens
// POST /api/v1/auth/login
func (ah *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		delivery.NewResponser(c).
			Status(http.StatusBadRequest).
			WithError(http.StatusText(http.StatusBadRequest), err.Error()).
			Send()
		return
	}

	// Find user by email
	user, err := ah.userRepo.FindByEmail(req.Email)
	if err != nil {
		delivery.NewResponser(c).
			Status(http.StatusInternalServerError).
			WithError(http.StatusText(http.StatusInternalServerError), err.Error()).
			Send()
		return
	}

	if user == nil {
		delivery.NewResponser(c).
			Status(http.StatusUnauthorized).
			WithError(http.StatusText(http.StatusUnauthorized), "Invalid email or password").
			Send()
		return
	}

	// Verify password
	if !user.CheckPassword(req.Password) {
		delivery.NewResponser(c).
			Status(http.StatusUnauthorized).
			WithError(http.StatusText(http.StatusUnauthorized), "Invalid email or password").
			Send()
		return
	}

	// Generate JWT
	token, err := ah.jwtService.GenerateToken(user.ID.String(), user.Email, string(user.Role))
	if err != nil {
		delivery.NewResponser(c).
			Status(http.StatusInternalServerError).
			WithError(http.StatusText(http.StatusInternalServerError), "Failed to generate authentication token: "+err.Error()).
			Send()
		return
	}

	delivery.NewResponser(c).
		Status(http.StatusOK).
		WithData(AuthResponse{
			User: UserResponse{
				ID:     user.ID.String(),
				Name:   user.Name,
				Email:  user.Email,
				Role:   string(user.Role),
				Status: string(user.Status),
			},
			Tokens: TokenPair{
				AccessToken: token,
				TokenType:   "Bearer",
			},
		}).
		Send()
}

// Register creates a new user account
// POST /api/v1/auth/register
func (ah *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		delivery.NewResponser(c).
			Status(http.StatusBadRequest).
			WithError(http.StatusText(http.StatusBadRequest), err.Error()).
			Send()
		return
	}

	// Check if email already exists
	existing, err := ah.userRepo.FindByEmail(req.Email)
	if err != nil {
		delivery.NewResponser(c).
			Status(http.StatusInternalServerError).
			WithError(http.StatusText(http.StatusInternalServerError), "Failed to check existing user").
			Send()
		return
	}

	if existing != nil {
		delivery.NewResponser(c).
			Status(http.StatusConflict).
			WithError(http.StatusText(http.StatusConflict), "A user with this email already exists").
			Send()
		return
	}

	// Determine role (default: developer)
	role := domain.UserRoleDeveloper
	if req.Role != "" {
		role = domain.UserRole(req.Role)
	}

	// Create user with hashed password
	user := &domain.User{
		Name:   req.Name,
		Email:  req.Email,
		Role:   role,
		Status: domain.UserStatusActive,
	}

	if err := user.SetPassword(req.Password); err != nil {
		delivery.NewResponser(c).
			Status(http.StatusInternalServerError).
			WithError(http.StatusText(http.StatusInternalServerError), "Failed to process password").
			Send()
		return
	}

	if err := ah.userRepo.Create(user); err != nil {
		delivery.NewResponser(c).
			Status(http.StatusInternalServerError).
			WithError(http.StatusText(http.StatusInternalServerError), "Failed to create user account").
			Send()
		return
	}

	// Generate JWT for immediate sign-in after registration
	token, err := ah.jwtService.GenerateToken(user.ID.String(), user.Email, string(user.Role))
	if err != nil {
		delivery.NewResponser(c).
			Status(http.StatusInternalServerError).
			WithError(http.StatusText(http.StatusInternalServerError), "Account created but failed to generate token").
			Send()
		return
	}

	delivery.NewResponser(c).
		Status(http.StatusCreated).
		WithData(AuthResponse{
			User: UserResponse{
				ID:     user.ID.String(),
				Name:   user.Name,
				Email:  user.Email,
				Role:   string(user.Role),
				Status: string(user.Status),
			},
			Tokens: TokenPair{
				AccessToken: token,
				TokenType:   "Bearer",
			},
		}).
		Send()
}

// Logout invalidates the current session (client-side token discard)
// POST /api/v1/auth/logout
func (ah *AuthHandler) Logout(c *gin.Context) {
	// With stateless JWTs, logout is handled client-side by discarding the token.
	// For production, implement a token blocklist in Redis.
	delivery.NewResponser(c).
		Status(http.StatusOK).
		WithData(map[string]string{
			"message": "Successfully logged out",
		}).
		Send()
}

// Refresh generates a new access token for the authenticated user
// POST /api/v1/auth/refresh
func (ah *AuthHandler) Refresh(c *gin.Context) {
	userID, _ := c.Get(middleware.AuthUserIDKey)
	email, _ := c.Get(middleware.AuthEmailKey)
	role, _ := c.Get(middleware.AuthRoleKey)

	token, err := ah.jwtService.GenerateToken(userID.(string), email.(string), role.(string))
	if err != nil {
		delivery.NewResponser(c).
			Status(http.StatusInternalServerError).
			WithError("TOKEN_ERROR", "Failed to refresh token").
			Send()
		return
	}

	delivery.NewResponser(c).
		Status(http.StatusOK).
		WithData(TokenPair{
			AccessToken: token,
			TokenType:   "Bearer",
		}).
		Send()
}

// ForgotPassword sends a password reset link (stub — returns success message)
// POST /api/v1/auth/forgot-password
func (ah *AuthHandler) ForgotPassword(c *gin.Context) {
	var req ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		delivery.NewResponser(c).
			Status(http.StatusBadRequest).
			WithError("VALIDATION_ERROR", err.Error()).
			Send()
		return
	}

	// In production, send an email with a reset link.
	// Always return success to prevent email enumeration attacks.
	delivery.NewResponser(c).
		Status(http.StatusOK).
		WithData(map[string]string{
			"message": "If an account with this email exists, a password reset link has been sent.",
		}).
		Send()
}

// RegisterFcmToken stores a Firebase Cloud Messaging token for push notifications
// POST /api/v1/auth/fcm-token
func (ah *AuthHandler) RegisterFcmToken(c *gin.Context) {
	var req FcmTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		delivery.NewResponser(c).
			Status(http.StatusBadRequest).
			WithError("VALIDATION_ERROR", err.Error()).
			Send()
		return
	}

	userID, _ := c.Get(middleware.AuthUserIDKey)

	if err := ah.userRepo.UpdateFcmToken(userID.(string), req.Token); err != nil {
		delivery.NewResponser(c).
			Status(http.StatusInternalServerError).
			WithError(http.StatusText(http.StatusInternalServerError), "Failed to register FCM token").
			Send()
		return
	}

	delivery.NewResponser(c).
		Status(http.StatusOK).
		WithData(map[string]string{
			"message": "FCM token registered successfully",
		}).
		Send()
}
