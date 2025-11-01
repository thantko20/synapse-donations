package core

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID `db:"id"`
	Email        string    `db:"email"`
	Name         string    `db:"name"`
	PasswordHash string    `db:"password_hash"`
	CreatedAt    time.Time `db:"created_at"`
	UpdatedAt    time.Time `db:"updated_at"`
	IsVerified   bool      `db:"is_verified"`
}

type UserDto struct {
	Id        string    `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type UserRepository interface {
	GetUserById(id string) (*User, error)
	GetAllUsers() ([]*User, error)
	GetUserByEmail(ctx context.Context, email string) (*User, error)
}

type UserService interface {
	GetUserById(userId string) (*User, error)
	GetUserByEmail(ctx context.Context, email string) (*User, error)
}
