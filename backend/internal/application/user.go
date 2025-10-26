package application

import (
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
