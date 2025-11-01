package application

import (
	"context"

	"github.com/thantko20/synapse-donations/backend/internal/core"
)

type UserService struct {
	userRepo core.UserRepository
}

func NewUserService(userRepo core.UserRepository) *UserService {
	return &UserService{userRepo: userRepo}
}

func (s *UserService) GetUserById(userId string) (*core.User, error) {
	return s.userRepo.GetUserById(userId)
}

func (s *UserService) GetUserByEmail(ctx context.Context, email string) (*core.User, error) {
	return s.userRepo.GetUserByEmail(ctx, email)
}
