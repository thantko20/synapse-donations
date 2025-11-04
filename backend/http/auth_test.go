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
		t.Log("testing scenario: " + tc.description)
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

func TestGetAuthAdmin_MissingCookie(t *testing.T) {
	truncateTables(t)
	ensureBootstrapAdminExists(context.Background(), testDb)

	server := myHttp.NewServer(testDb)
	app := server.App

	req := httptest.NewRequest(http.MethodGet, "/auth/admin/me", nil)

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("failed to perform request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", http.StatusUnauthorized, resp.StatusCode)
	}
}

func TestGetAuthAdmin_InvalidCookie(t *testing.T) {
	truncateTables(t)
	ensureBootstrapAdminExists(context.Background(), testDb)

	server := myHttp.NewServer(testDb)
	app := server.App

	req := httptest.NewRequest(http.MethodGet, "/auth/admin/me", nil)
	req.AddCookie(&http.Cookie{
		Name:  "admin_session_token",
		Value: "invalid-token",
	})

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("failed to perform request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", http.StatusUnauthorized, resp.StatusCode)
	}
}

func TestGetAuthAdmin_Success(t *testing.T) {
	truncateTables(t)
	ensureBootstrapAdminExists(context.Background(), testDb)

	server := myHttp.NewServer(testDb)
	app := server.App

	loginBody, err := json.Marshal(core.LoginUserDto{
		Email:    bootstrapAdminEmail,
		Password: bootstrapAdminPassword,
	})
	if err != nil {
		t.Fatalf("failed to marshal login body: %v", err)
	}

	loginReq := httptest.NewRequest(http.MethodPost, "/auth/login/admin", bytes.NewReader(loginBody))
	loginReq.Header.Set("Content-Type", "application/json")

	loginResp, err := app.Test(loginReq)
	if err != nil {
		t.Fatalf("failed to perform login request: %v", err)
	}
	defer loginResp.Body.Close()

	if loginResp.StatusCode != http.StatusOK {
		t.Fatalf("expected login status %d, got %d", http.StatusOK, loginResp.StatusCode)
	}

	var adminSessionCookie *http.Cookie
	for _, cookie := range loginResp.Cookies() {
		if cookie.Name == "admin_session_token" {
			adminSessionCookie = cookie
			break
		}
	}

	if adminSessionCookie == nil {
		t.Fatal("expected admin session cookie to be set")
	}

	getReq := httptest.NewRequest(http.MethodGet, "/auth/admin/me", nil)
	getReq.AddCookie(adminSessionCookie)

	getResp, err := app.Test(getReq)
	if err != nil {
		t.Fatalf("failed to perform get admin request: %v", err)
	}
	defer getResp.Body.Close()

	if getResp.StatusCode != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, getResp.StatusCode)
	}

	var payload map[string]any
	if err := json.NewDecoder(getResp.Body).Decode(&payload); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	success, ok := payload["success"].(bool)
	if !ok || !success {
		t.Fatalf("expected response success to be true, got: %v", payload["success"])
	}

	data, ok := payload["data"].(map[string]any)
	if !ok {
		t.Fatalf("expected data to be an object, got: %T", payload["data"])
	}

	email, ok := data["Email"].(string)
	if !ok || email != bootstrapAdminEmail {
		t.Fatalf("expected email %s, got %v", bootstrapAdminEmail, data["Email"])
	}

	name, ok := data["Name"].(string)
	if !ok || name != bootstrapAdminName {
		t.Fatalf("expected name %s, got %v", bootstrapAdminName, data["Name"])
	}

	if _, ok := data["ID"].(string); !ok {
		t.Fatalf("expected ID to be a string, got %v", data["ID"])
	}
}
