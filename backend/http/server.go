package http

import (
	"context"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/thantko20/synapse-donations/backend/internal/application"
	"github.com/thantko20/synapse-donations/backend/internal/core"
	"github.com/thantko20/synapse-donations/backend/internal/repo"
)

func NewServer(db *sqlx.DB) *Server {
	ctx := context.Background()
	app := fiber.New()

	// Create a superadmin user if not exists
	adminService := application.NewAdminService(repo.NewAdminRepo(db))

	admin, err := adminService.GetOne(ctx)

	if err != nil {
		log.Fatalf("error while getting an admin user: %v", err)
	}

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

	adminRepo := repo.NewAdminRepo(db)
	adminService = application.NewAdminService(adminRepo)

	userRepo := repo.NewUserRepo(db)
	userService := application.NewUserService(userRepo)
	adminSessionRepo := repo.NewAdminSessionRepo(db)
	sessionRepo := repo.NewSessionRepo(db)

	authService := application.NewAuthService(userRepo, adminSessionRepo, adminRepo, sessionRepo)

	server := &Server{
		DB:               db,
		AdminRepo:        adminRepo,
		UserRepo:         userRepo,
		AdminSessionRepo: adminSessionRepo,
		AdminService:     adminService,
		UserService:      userService,
		AuthService:      authService,
		App:              app,
		SessionRepo:      sessionRepo,
	}

	server.registerHelloRoutes()
	server.registerAuthRoutes()

	return server
}

type Server struct {
	DB               *sqlx.DB
	App              *fiber.App
	AdminRepo        core.PlatformAdminRepository
	UserRepo         core.UserRepository
	AdminSessionRepo core.AdminSessionRepo
	SessionRepo      core.SessionRepo
	AdminService     core.PlatformAdminService
	UserService      core.UserService
	AuthService      core.AuthService
}

func (s *Server) Run(addr string) error {
	return s.App.Listen(addr)
}

func (s *Server) Shutdown() error {
	s.DB.Close()
	return s.App.Shutdown()
}

func (s *Server) registerHelloRoutes() {
	s.App.Get("/", s.helloWorldHandler)
}

func (s *Server) registerAuthRoutes() {
	adminRoutes := s.App.Group("/auth")

	adminRoutes.Post("/login", s.loginUserHandler)
	adminRoutes.Post("/login/admin", s.loginAdminHandler)
}
