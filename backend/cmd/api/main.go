package main

import (
	"context"
	"log"

	"github.com/gofiber/fiber/v2"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/jmoiron/sqlx"
	"github.com/thantko20/synapse-donations/backend/internal/application"
	"github.com/thantko20/synapse-donations/backend/internal/core"
	"github.com/thantko20/synapse-donations/backend/internal/repo"
)

var ctx = context.Background()

type appCtx struct {
	db *sqlx.DB
}

type handler func(c *fiber.Ctx) error

func main() {

	app := fiber.New()
	db, err := sqlx.Connect("pgx", "postgresql://postgres:password@database:5432/synapse_donations_db")

	if err != nil {
		log.Fatalln(err)
	}

	if err = db.Ping(); err != nil {
		log.Fatalf("database ping failed: %v", err)
	}
	defer db.Close()

	log.Print("Connection to Database: SUCCESS")

	// Create a superadmin user if not exists
	adminService := application.NewAdminService(repo.NewAdminRepo(db))

	admin, err := adminService.GetOne(ctx)

	if admin == nil {
		dto := core.CreatePlatformAdminDto{
			Email:    "admin@example.com",
			Name:     "Admin",
			Password: "12345678",
		}
		newAdmin, err := adminService.CreateAdmin(ctx, dto)
		if err != nil {
			log.Fatalf("failed to create superadmin: %v", err)
		}
		log.Printf("Superadmin created: %v", newAdmin.Email)
	}

	app.Get("/", helloWorldHandler(&appCtx{db: db}))
	app.Post("/auth/login", loginUserHandler(&appCtx{db: db}))
	app.Post("/auth/login/admin", loginAdminHandler(&appCtx{db: db}))

	app.Listen(":3000")
}
