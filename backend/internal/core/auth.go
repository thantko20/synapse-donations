package core

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
)

var ErrInvalidCredentials = errors.New("invalid credentials")

type Session struct {
	ID        uuid.UUID `db:"id"`
	UserID    uuid.UUID `db:"user_id"`
	Token     string    `db:"token"`
	IPAddress *string   `db:"ip_address"`
	UserAgent *string   `db:"user_agent"`
	CreatedAt time.Time `db:"created_at"`
	UpdatedAt time.Time `db:"updated_at"`
}

type AdminSession struct {
	ID        uuid.UUID `db:"id"`
	AdminID   uuid.UUID `db:"admin_id"`
	Token     string    `db:"token"`
	IPAddress string    `db:"ip_address"`
	UserAgent string    `db:"user_agent"`
	CreatedAt time.Time `db:"created_at"`
	UpdatedAt time.Time `db:"updated_at"`
}

type SessionDto struct {
	ID        string    `json:"id"`
	UserID    string    `json:"userId"`
	Token     string    `json:"token"`
	IPAddress *string   `json:"ipAddress,omitempty"`
	UserAgent *string   `json:"userAgent,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type AdminSessionDto struct {
	ID        string    `json:"id"`
	AdminID   string    `json:"adminId"`
	Token     string    `json:"token"`
	IPAddress *string   `json:"ipAddress,omitempty"`
	UserAgent *string   `json:"userAgent,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type LoginUserDto struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AdminSessionRepo interface {
	Create(ctx context.Context, session *AdminSession) error
}
