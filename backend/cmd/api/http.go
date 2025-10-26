package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
)

const (
	CodeInternal         = "internal"
	CodeValidationFailed = "validation_failed"
)

type Meta struct {
	Page       int    `json:"page,omitempty"`
	NextPage   int    `json:"nextPage,omitempty"`
	Size       int    `json:"size,omitempty"`
	TotalPages int    `json:"totalPages,omitempty"`
	TotalItems int    `json:"totalItems,omitempty"`
	RequestId  string `json:"requestId"`
}

type ErrorDetail struct {
	Code    string            `json:"code"`
	Message string            `json:"message"`
	Fields  map[string]string `json:"fields,omitempty"`
}

type Response struct {
	Success bool         `json:"success"`
	Data    any          `json:"data"`
	Meta    *Meta        `json:"meta"`
	Message string       `json:"message"`
	Error   *ErrorDetail `json:"error"`
}

func writeJson(c *fiber.Ctx, status int, body Response) error {
	return c.Status(status).JSON(body)
}

func OK(c *fiber.Ctx, data any, message string) error {
	return writeJson(c, fiber.StatusOK, Response{
		Success: true,
		Data:    data,
		Message: message,
	})
}

func Created(c *fiber.Ctx, data any, message string) error {
	return writeJson(c, fiber.StatusCreated, Response{
		Success: true,
		Data:    data,
		Message: message,
	})
}

func ValidationError(c *fiber.Ctx, fields map[string]string) error {
	return writeJson(c, fiber.StatusBadRequest, Response{
		Success: false,
		Error: &ErrorDetail{
			Code:    CodeValidationFailed,
			Message: "Validation Failed",
			Fields:  fields,
		},
	})
}

func Unauthorized(c *fiber.Ctx, code, message string) error {
	return writeJson(c, fiber.StatusUnauthorized, Response{
		Success: false,
		Error: &ErrorDetail{
			Code:    code,
			Message: message,
		},
	})
}

func InternalError(c *fiber.Ctx, err error) error {
	log.Println("unknown error", err)
	return writeJson(c, fiber.StatusInternalServerError, Response{
		Success: false,
		Error: &ErrorDetail{
			Code:    CodeInternal,
			Message: "Internal Server Error",
		},
	})
}
