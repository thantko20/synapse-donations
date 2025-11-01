package repo

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"

	"github.com/thantko20/synapse-donations/backend/internal/core"
)

type userRepo struct {
	db *sqlx.DB
}

func (r *userRepo) GetUserById(id string) (*core.User, error) {
	// TODO: implement
	return nil, nil
}

func (r *userRepo) GetAllUsers() ([]*core.User, error) {
	// TODO: implement
	return nil, nil
}

func (r *userRepo) GetUserByEmail(ctx context.Context, email string) (*core.User, error) {
	var user core.User

	if err := r.db.GetContext(ctx, &user, "SELECT * FROM users WHERE email = $1", email); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &user, nil
}

func NewUserRepo(db *sqlx.DB) *userRepo {
	return &userRepo{db: db}
}
