package http_test

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/pressly/goose/v3"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
	"github.com/thantko20/synapse-donations/backend/internal/helpers"
)

var (
	testDbName = "synapse_donations_test_db"
	testDbUser = "postgres"
	testDbPass = "password"
)

var (
	bootstrapAdminEmail    = "admin@example.com"
	bootstrapAdminPassword = "12345678"
	bootstrapAdminName     = "Admin"
)

var (
	boostrapUserEmail     = "johndoe@example.com"
	bootstrapUserName     = "John Doe"
	bootstrapUserPassword = "password123"
)

var (
	testDb *sqlx.DB
)

func TestMain(m *testing.M) {
	ctx := context.Background()

	pgContainer := setupPostgresContainer(ctx)

	host, err := pgContainer.Host(ctx)
	if err != nil {
		panic("failed to get container host: " + err.Error())
	}

	mappedPort, err := pgContainer.MappedPort(ctx, "5432/tcp")
	if err != nil {
		panic("failed to get mapped port: " + err.Error())
	}

	dsn := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?sslmode=disable", testDbUser, testDbPass,
		host, mappedPort.Port(), testDbName)

	testDb, err = sqlx.Connect("pgx", dsn)
	if err != nil {
		panic("failed to connect to database: " + err.Error())
	}

	if err = applyMigrations(testDb.DB); err != nil {
		panic("failed to apply migrations with goose: " + err.Error())
	}

	ensureBootstrapAdminExists(ctx, testDb)
	ensureBootstrapUserExists(ctx, testDb)

	code := m.Run()

	if err = pgContainer.Terminate(ctx); err != nil {
		panic("failed to terminate postgres container: " + err.Error())
	}

	testDb.Close()
	fmt.Printf("Tests completed. Exiting with code %d\n", code)
	os.Exit(code)
}

func setupPostgresContainer(ctx context.Context) testcontainers.Container {

	pgContainerReq := testcontainers.ContainerRequest{
		Image: "postgres:16-alpine",
		Env: map[string]string{
			"POSTGRES_DB":       testDbName,
			"POSTGRES_USER":     testDbUser,
			"POSTGRES_PASSWORD": testDbPass,
		},
		ExposedPorts: []string{"5432/tcp"},
		WaitingFor:   wait.ForListeningPort("5432/tcp").WithStartupTimeout(60 * time.Second),
	}

	pgContainer, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: pgContainerReq,
		Started:          true,
	})

	if err != nil {
		panic("failed to start postgres container: " + err.Error())
	}
	return pgContainer
}

func applyMigrations(db *sql.DB) error {
	goose.SetDialect("postgres")
	migrationDir := "../internal/migrations"
	return goose.Up(db, migrationDir)
}

func truncateTables(t *testing.T) {
	_, err := testDb.DB.Exec(`TRUNCATE admin_sessions, platform_admins, sessions, users RESTART IDENTITY CASCADE`)
	if err != nil {
		t.Fatalf("failed to truncate tables: %v", err)
	}
}

func ensureBootstrapAdminExists(ctx context.Context, db *sqlx.DB) {
	var count int
	if err := db.GetContext(ctx, &count, "SELECT COUNT(*) FROM platform_admins"); err != nil {
		panic("count admins failed: " + err.Error())
	}
	if count == 0 {
		hash, err := helpers.HashPassword(bootstrapAdminPassword)
		if err != nil {
			panic("hash password failed: " + err.Error())
		}
		_, err = db.ExecContext(ctx, `
			INSERT INTO platform_admins (id, email, name, password_hash, created_at, updated_at)
			VALUES ($1, $2, $3, $4, NOW(), NOW())
		`, uuid.New(), bootstrapAdminEmail, bootstrapAdminName, hash)
		if err != nil {
			panic("insert bootstrap admin failed: " + err.Error())
		}
	}
}

func ensureBootstrapUserExists(ctx context.Context, db *sqlx.DB) error {
	var count int
	if err := db.GetContext(ctx, &count, "SELECT COUNT(*) FROM users WHERE email=$1", boostrapUserEmail); err != nil {
		return fmt.Errorf("count users failed: %w", err)
	}
	if count == 0 {
		hash, err := helpers.HashPassword(bootstrapUserPassword)
		if err != nil {
			return fmt.Errorf("hash password failed: %w", err)
		}
		_, err = db.ExecContext(ctx, `
			INSERT INTO users (id, email, name, password_hash, created_at, updated_at)
			VALUES ($1, $2, $3, $4, NOW(), NOW())
		`, uuid.New(), boostrapUserEmail, bootstrapUserName, hash)
		if err != nil {
			return fmt.Errorf("insert bootstrap user failed: %w", err)
		}
	}
	return nil
}
