package core

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
)

var ErrAdminAlreadyExists = errors.New("platform admin with this email already exists")

type PlatformAdmin struct {
	ID           uuid.UUID `db:"id"`
	Email        string    `db:"email"`
	Name         string    `db:"name"`
	PasswordHash string    `db:"password_hash"`
	CreatedAt    time.Time `db:"created_at"`
	UpdatedAt    time.Time `db:"updated_at"`
}

type PlatformAdminDto struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (a *PlatformAdmin) ToDto() *PlatformAdminDto {
	if a == nil {
		return nil
	}
	return &PlatformAdminDto{
		ID:        a.ID.String(),
		Email:     a.Email,
		Name:      a.Name,
		CreatedAt: a.CreatedAt,
		UpdatedAt: a.UpdatedAt,
	}
}

type PlatformAdminRepository interface {
	GetByEmail(ctx context.Context, email string) (*PlatformAdmin, error)
	Create(ctx context.Context, admin *PlatformAdmin) error
	GetList(ctx context.Context) ([]*PlatformAdmin, error)
	GetOne(ctx context.Context) (*PlatformAdmin, error)
}

type PlatformAdminService interface {
	CreateAdmin(ctx context.Context, dto CreatePlatformAdminDto) (*PlatformAdmin, error)
	GetList(ctx context.Context) ([]*PlatformAdmin, error)
	GetOne(ctx context.Context) (*PlatformAdmin, error)
}

type CreatePlatformAdminDto struct {
	Email    string `json:"email"`
	Name     string `json:"name"`
	Password string `json:"password"`
}
