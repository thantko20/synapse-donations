package application

import (
	"context"
	"log"

	"github.com/google/uuid"
	"github.com/thantko20/synapse-donations/backend/internal/core"
	"github.com/thantko20/synapse-donations/backend/internal/helpers"
)

type authService struct {
	userRepo         core.UserRepository
	adminRepo        core.PlatformAdminRepository
	adminSessionRepo core.AdminSessionRepo
}

func NewAuthService(userRepo core.UserRepository, adminSessionRepo core.AdminSessionRepo, adminRepo core.PlatformAdminRepository) *authService {
	return &authService{
		userRepo:         userRepo,
		adminSessionRepo: adminSessionRepo,
		adminRepo:        adminRepo,
	}
}

func (s *authService) Login(ctx context.Context, dto core.LoginUserDto) error {
	user, err := s.userRepo.GetUserByEmail(ctx, dto.Email)
	if err != nil {
		log.Println("Error fetching user:", err)
		return err
	}
	if user == nil {
		log.Println("User not found with email:", dto.Email)
		return core.ErrInvalidCredentials
	}

	// Auth Logic

	return nil
}

func (s *authService) LoginAdmin(ctx context.Context, dto core.LoginUserDto) (*core.AdminSession, error) {
	admin, err := s.adminRepo.GetByEmail(ctx, dto.Email)
	if err != nil {
		return nil, err
	}
	if admin == nil {
		return nil, nil
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
		ID:      uuid.New(),
		AdminID: admin.ID,
		Token:   token,
	}

	err = s.adminSessionRepo.Create(ctx, adminSession)
	if err != nil {
		return nil, err
	}

	return adminSession, nil
}
