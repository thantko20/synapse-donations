package main

import "github.com/gofiber/fiber/v2"

func helloWorldHandler(_ *appCtx) handler {
	return func(c *fiber.Ctx) error {
		return OK(c, "Hello World!", "")
	}
}
