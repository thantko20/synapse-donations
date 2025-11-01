package http_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	_ "github.com/jackc/pgx/v5/stdlib"
	myHttp "github.com/thantko20/synapse-donations/backend/http"
	"github.com/thantko20/synapse-donations/backend/internal/core"
)

func TestAdminLogin(t *testing.T) {
	truncateTables(t)
	ensureBootstrapAdminExists(context.Background(), testDb)

	testCases := []struct {
		description  string
		body         any
		expectStatus int
	}{
		{
			description: "valid admin login",
			body: core.LoginUserDto{
				Email:    bootstrapAdminEmail,
				Password: bootstrapAdminPassword,
			},
			expectStatus: http.StatusOK,
		},
		{
			description: "invalid email login",
			body: core.LoginUserDto{
				Email:    "invalidemail@example.com",
				Password: bootstrapAdminPassword,
			},
			expectStatus: http.StatusUnauthorized,
		},
		{
			description: "invalid password login",
			body: core.LoginUserDto{
				Email:    bootstrapAdminEmail,
				Password: "wrongpassword",
			},
			expectStatus: http.StatusUnauthorized,
		},
	}

	server := myHttp.NewServer(testDb)
	app := server.App

	for _, tc := range testCases {
		jsonBody, err := json.Marshal(tc.body)
		if err != nil {
			t.Fatalf("failed to marshal body: %v", err)
		}
		req := httptest.NewRequest(http.MethodPost, "/auth/login/admin", bytes.NewReader(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		if err != nil {
			t.Fatalf("failed to perform request: %v", err)
		}

		if resp.StatusCode != tc.expectStatus {
			t.Fatalf("expected status %d, got %d", tc.expectStatus, resp.StatusCode)
		}
	}
}

func TestUserLogin(t *testing.T) {
	truncateTables(t)
	ensureBootstrapUserExists(context.Background(), testDb)

	testCases := []struct {
		description  string
		body         any
		expectStatus int
	}{
		{
			description: "valid user login",
			body: core.LoginUserDto{
				Email:    boostrapUserEmail,
				Password: bootstrapUserPassword,
			},
			expectStatus: http.StatusOK,
		},
		{
			description: "invalid email login",
			body: core.LoginUserDto{
				Email:    "invalidemail@example.com",
				Password: bootstrapUserPassword,
			},
			expectStatus: http.StatusUnauthorized,
		},
		{
			description: "invalid password login",
			body: core.LoginUserDto{
				Email:    boostrapUserEmail,
				Password: "wrongpassword",
			},
			expectStatus: http.StatusUnauthorized,
		},
	}

	server := myHttp.NewServer(testDb)
	app := server.App

	for _, tc := range testCases {
		jsonBody, err := json.Marshal(tc.body)
		if err != nil {
			t.Fatalf("failed to marshal body: %v", err)
		}
		req := httptest.NewRequest(http.MethodPost, "/auth/login", bytes.NewReader(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		if err != nil {
			t.Fatalf("failed to perform request: %v", err)
		}

		if resp.StatusCode != tc.expectStatus {
			t.Fatalf("expected status %d, got %d", tc.expectStatus, resp.StatusCode)
		}
	}
}
