package application

import (
	"context"
	"log"

	"github.com/google/uuid"
	"github.com/thantko20/synapse-donations/backend/internal/core"
	"github.com/thantko20/synapse-donations/backend/internal/helpers"
)

type adminService struct {
	adminRepo core.PlatformAdminRepository
}

func NewAdminService(adminRepo core.PlatformAdminRepository) *adminService {
	return &adminService{
		adminRepo: adminRepo,
	}
}

func (s *adminService) CreateAdmin(ctx context.Context, dto core.CreatePlatformAdminDto) (*core.PlatformAdmin, error) {
	existingAdmin, err := s.adminRepo.GetByEmail(ctx, dto.Email)
	if err != nil {
		return nil, err
	}
	if existingAdmin != nil {
		log.Println("Admin with email already exists:", dto.Email)
		return nil, core.ErrAdminAlreadyExists
	}

	passwordHash, err := helpers.HashPassword(dto.Password)
	if err != nil {
		return nil, err
	}

	newAdmin := &core.PlatformAdmin{
		ID:           uuid.New(),
		Email:        dto.Email,
		PasswordHash: passwordHash,
		Name:         dto.Name,
	}

	if err = s.adminRepo.Create(ctx, newAdmin); err != nil {
		return nil, err
	}

	return newAdmin, nil
}

func (s *adminService) GetList(ctx context.Context) ([]*core.PlatformAdmin, error) {
	return s.adminRepo.GetList(ctx)
}

func (s *adminService) GetOne(ctx context.Context) (*core.PlatformAdmin, error) {
	return s.adminRepo.GetOne(ctx)
}
