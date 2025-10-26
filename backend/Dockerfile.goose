FROM golang:1.24.5-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go install github.com/pressly/goose/v3/cmd/goose@latest

ENV GOOSE_DRIVER="postgres" GOOSE_DBSTRING="postgresql://postgres:password@database:5432/synapse_donations_db" GOOSE_MIGRATION_DIR=./internal/migrations

CMD ["goose up"]
