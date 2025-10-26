package main

import (
	"errors"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/thantko20/synapse-donations/backend/internal/application"
	"github.com/thantko20/synapse-donations/backend/internal/core"
	"github.com/thantko20/synapse-donations/backend/internal/repo"
)

const (
	CodeInvalidCredentials = "auth/invalid_credentials"
)

func loginUserHandler(ctx *appCtx) handler {
	return func(c *fiber.Ctx) error {
		var dto core.LoginUserDto
		if err := c.BodyParser(&dto); err != nil {
			return c.Status(fiber.StatusBadRequest).SendString("Bad Request")
		}
		authService := application.NewAuthService(repo.NewUserRepo(ctx.db), repo.NewAdminSessionRepo(ctx.db),
			repo.NewAdminRepo(ctx.db))
		err := authService.Login(c.Context(), dto)
		if err != nil {
			if errors.Is(err, core.ErrInvalidCredentials) {
				return Unauthorized(c, CodeInvalidCredentials, "Invalid email or password")
			} else {
				return InternalError(c, err)
			}
		}
		return OK(c, nil, "Logged in successfully!")
	}
}

func loginAdminHandler(ctx *appCtx) handler {
	return func(c *fiber.Ctx) error {
		var dto core.LoginUserDto
		if err := c.BodyParser(&dto); err != nil {
			return c.Status(fiber.StatusBadRequest).SendString("Bad Request")
		}
		authService := application.NewAuthService(repo.NewUserRepo(ctx.db), repo.NewAdminSessionRepo(ctx.db),
			repo.NewAdminRepo(ctx.db))
		session, err := authService.LoginAdmin(c.Context(), dto)
		if err != nil {
			if errors.Is(err, core.ErrInvalidCredentials) {
				return Unauthorized(c, CodeInvalidCredentials, "Invalid email or password")
			} else {
				return InternalError(c, err)
			}
		}

		setAdminSessionCookie(c, *session)

		return OK(c, nil, "Logged in successfully!")
	}
}

func setAdminSessionCookie(c *fiber.Ctx, session core.AdminSession) {
	cookie := new(fiber.Cookie)
	cookie.Name = "admin_session_token"
	cookie.Value = session.Token
	cookie.Expires = time.Now().Add(24 * time.Hour)

	c.Cookie(cookie)
}
