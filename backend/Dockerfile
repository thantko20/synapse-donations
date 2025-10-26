FROM golang:1.24.5-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Install goose for migrations
RUN go install github.com/pressly/goose/v3/cmd/goose@latest

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/api

FROM alpine:latest

WORKDIR /root/

COPY --from=builder /app/main .
# COPY goose bin into runner
COPY --from=builder /go/bin/goose /usr/local/bin/goose

EXPOSE 8080

ENTRYPOINT ["./main"]
