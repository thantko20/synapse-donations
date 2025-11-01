package http

import "github.com/gofiber/fiber/v2"

func (s *Server) helloWorldHandler(c *fiber.Ctx) error {
	return OK(c, "Hello World!", "")
}
