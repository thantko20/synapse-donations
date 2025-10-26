package repo

import (
	"context"
	"log"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/thantko20/synapse-donations/backend/internal/core"
)

type adminRepo struct {
	db *sqlx.DB
}

func (r *adminRepo) GetByEmail(ctx context.Context, email string) (*core.PlatformAdmin, error) {
	var admin core.PlatformAdmin
	params := map[string]any{"email": email}
	rows, err := r.db.NamedQueryContext(ctx, "SELECT * FROM platform_admins WHERE email = :email", params)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		if err := rows.StructScan(&admin); err != nil {
			return nil, err
		}
	} else {
		return nil, nil
	}

	log.Printf("%v", admin)

	return &admin, nil
}

func (r *adminRepo) Create(ctx context.Context, admin *core.PlatformAdmin) error {
	now := time.Now().UTC()
	admin.CreatedAt = now
	admin.UpdatedAt = now
	_, err := r.db.NamedExecContext(ctx, `
		INSERT INTO platform_admins (id, email, name, password_hash, created_at, updated_at)
		VALUES (:id, :email, :name, :password_hash, :created_at, :updated_at)
	`, admin)
	return err
}

func (r *adminRepo) GetList(ctx context.Context) ([]*core.PlatformAdmin, error) {
	var admins []*core.PlatformAdmin
	err := r.db.SelectContext(ctx, &admins, "SELECT * FROM platform_admins")
	if err != nil {
		return nil, err
	}
	return admins, nil
}

func (r *adminRepo) GetOne(ctx context.Context) (*core.PlatformAdmin, error) {
	var admin core.PlatformAdmin
	err := r.db.GetContext(ctx, &admin, "SELECT * FROM platform_admins LIMIT 1")
	if err != nil {
		return nil, err
	}
	return &admin, nil
}

func NewAdminRepo(db *sqlx.DB) *adminRepo {
	return &adminRepo{db: db}
}
