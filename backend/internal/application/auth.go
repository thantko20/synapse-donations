package application

import (
	"context"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/thantko20/synapse-donations/backend/internal/core"
	"github.com/thantko20/synapse-donations/backend/internal/helpers"
)

type authService struct {
	userRepo         core.UserRepository
	adminRepo        core.PlatformAdminRepository
	adminSessionRepo core.AdminSessionRepo
	sessionRepo      core.SessionRepo
}

func NewAuthService(userRepo core.UserRepository, adminSessionRepo core.AdminSessionRepo,
	adminRepo core.PlatformAdminRepository, sessionRepo core.SessionRepo) *authService {
	return &authService{
		userRepo:         userRepo,
		adminSessionRepo: adminSessionRepo,
		adminRepo:        adminRepo,
		sessionRepo:      sessionRepo,
	}
}

func (s *authService) Login(ctx context.Context, dto core.LoginUserDto) (*core.Session, error) {
	user, err := s.userRepo.GetUserByEmail(ctx, dto.Email)
	if err != nil {
		log.Println("Error fetching user:", err)
		return nil, err
	}
	if user == nil {
		log.Println("User not found with email:", dto.Email)
		return nil, core.ErrInvalidCredentials
	}

	isValidPassword := helpers.VerifyPassword(dto.Password, user.PasswordHash)
	if !isValidPassword {
		return nil, core.ErrInvalidCredentials
	}

	token, err := helpers.GenerateToken(16)
	if err != nil {
		return nil, err
	}

	session := &core.Session{
		ID:        uuid.New(),
		UserID:    user.ID,
		Token:     token,
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}

	err = s.sessionRepo.Create(ctx, session)
	if err != nil {
		return nil, err
	}

	return session, nil
}

func (s *authService) LoginAdmin(ctx context.Context, dto core.LoginUserDto) (*core.AdminSession, error) {
	admin, err := s.adminRepo.GetByEmail(ctx, dto.Email)
	if err != nil {
		return nil, err
	}
	if admin == nil {
		return nil, core.ErrInvalidCredentials
	}

	isValidPassword := helpers.VerifyPassword(dto.Password, admin.PasswordHash)
	if !isValidPassword {
		return nil, core.ErrInvalidCredentials
	}

	token, err := helpers.GenerateToken(16)
	if err != nil {
		return nil, err
	}

	adminSession := &core.AdminSession{
		ID:        uuid.New(),
		AdminID:   admin.ID,
		Token:     token,
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}

	err = s.adminSessionRepo.Create(ctx, adminSession)
	if err != nil {
		return nil, err
	}

	return adminSession, nil
}
