package http

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/thantko20/synapse-donations/backend/internal/core"
)

const (
	CodeInvalidCredentials = "auth/invalid_credentials"
)

func (s *Server) loginUserHandler(c *fiber.Ctx) error {
	var dto core.LoginUserDto
	if err := c.BodyParser(&dto); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString("Bad Request")
	}
	session, err := s.AuthService.Login(c.Context(), dto)
	if err != nil {
		if errors.Is(err, core.ErrInvalidCredentials) {
			return Unauthorized(c, CodeInvalidCredentials, "Invalid email or password")
		}
		return InternalError(c, err)
	}

	setSessionCookie(c, *session)

	return OK(c, nil, "Logged in successfully!")
}

func (s *Server) loginAdminHandler(c *fiber.Ctx) error {
	var dto core.LoginUserDto
	if err := c.BodyParser(&dto); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString("Bad Request")
	}
	session, err := s.AuthService.LoginAdmin(c.Context(), dto)
	if err != nil {
		if errors.Is(err, core.ErrInvalidCredentials) {
			return Unauthorized(c, CodeInvalidCredentials, "Invalid email or password")
		}
		return InternalError(c, err)
	}

	setAdminSessionCookie(c, *session)

	return OK(c, nil, "Logged in successfully!")
}

func setAdminSessionCookie(c *fiber.Ctx, session core.AdminSession) {
	cookie := new(fiber.Cookie)
	cookie.Name = "admin_session_token"
	cookie.Value = session.Token
	cookie.Expires = session.ExpiresAt

	c.Cookie(cookie)
}

func setSessionCookie(c *fiber.Ctx, session core.Session) {
	cookie := new(fiber.Cookie)
	cookie.Name = "session_token"
	cookie.Value = session.Token
	cookie.Expires = session.ExpiresAt

	c.Cookie(cookie)
}
