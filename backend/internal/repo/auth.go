package repo

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/thantko20/synapse-donations/backend/internal/core"
)

type adminSessionRepo struct {
	db *sqlx.DB
}

func (r *adminSessionRepo) Create(ctx context.Context, session *core.AdminSession) error {
	now := time.Now().UTC()
	if session.CreatedAt.IsZero() {
		session.CreatedAt = now
	}
	if session.UpdatedAt.IsZero() {
		session.UpdatedAt = now
	}
	stmt := `
	INSERT INTO admin_sessions (id, admin_id, token, ip_address, user_agent, expires_at, created_at, updated_at)
	VALUES (:id, :admin_id, :token, :ip_address, :user_agent, :expires_at, :created_at, :updated_at)
	`
	_, err := r.db.NamedExecContext(ctx, stmt, session)
	return err
}

func (r *adminSessionRepo) GetByToken(ctx context.Context, token string) (*core.AdminSession, error) {
	var session core.AdminSession
	query := `
	SELECT id, admin_id, token, ip_address, user_agent, expires_at, created_at, updated_at
	FROM admin_sessions
	WHERE token = $1
	LIMIT 1
	`
	err := r.db.GetContext(ctx, &session, query, token)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &session, nil
}

func NewAdminSessionRepo(db *sqlx.DB) *adminSessionRepo {
	return &adminSessionRepo{db: db}
}

type sessionRepo struct {
	db *sqlx.DB
}

func (r *sessionRepo) Create(ctx context.Context, session *core.Session) error {
	now := time.Now().UTC()
	if session.CreatedAt.IsZero() {
		session.CreatedAt = now
	}
	if session.UpdatedAt.IsZero() {
		session.UpdatedAt = now
	}
	stmt := `
	INSERT INTO sessions (id, user_id, token, ip_address, user_agent, expires_at, created_at, updated_at)
	VALUES (:id, :user_id, :token, :ip_address, :user_agent, :expires_at, :created_at, :updated_at)
	`
	_, err := r.db.NamedExecContext(ctx, stmt, session)
	return err
}

func NewSessionRepo(db *sqlx.DB) *sessionRepo {
	return &sessionRepo{db: db}
}
