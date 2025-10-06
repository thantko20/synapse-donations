# Testing Setup

This document describes how to run integration tests for the API.

## Prerequisites

- Docker and Docker Compose installed
- pnpm installed

## Test Database Setup

The tests use a separate PostgreSQL database running in Docker to avoid conflicts with your development database.

### Quick Start

1. **Start the test database:**

   ```bash
   pnpm test:db:up
   ```

2. **Run database migrations:**

   ```bash
   pnpm db:migrate:test
   ```

3. **Run tests:**

   ```bash
   pnpm test
   ```

4. **Stop the test database when done:**
   ```bash
   pnpm test:db:down
   ```

### Available Scripts

- `pnpm test` - Run tests in watch mode
- `pnpm test:run` - Run tests once and exit
- `pnpm test:db:up` - Start the test database container
- `pnpm test:db:down` - Stop the test database container
- `pnpm test:db:reset` - Reset the test database (stop, start, migrate)
- `pnpm db:migrate:test` - Run Prisma migrations on test database

### Test Database Configuration

The test database runs on:

- **Host:** localhost
- **Port:** 5433 (different from dev database port 5432)
- **Database:** synapse_donations_test
- **Username:** test_user
- **Password:** test_password

### Environment Variables

Test environment variables are defined in `.env.test`:

```
DATABASE_URL="postgresql://test_user:test_password@localhost:5433/synapse_donations_test"
NODE_ENV="test"
```

## Running Specific Tests

```bash
# Run a specific test file
pnpm test auth.test.ts

# Run tests matching a pattern
pnpm test --grep "login"

# Run tests in a specific directory
pnpm test __tests__/
```

## Test Structure

Integration tests are located in the `__tests__/` directory and follow the naming convention `*.test.ts`.

Each test:

1. Uses a real Prisma client connected to the test database
2. Sets up test data before each test
3. Cleans up test data after each test
4. Tests actual database operations without mocking

## Troubleshooting

### Port Conflicts

If port 5433 is already in use, you can change it in `docker-compose.test.yml` and update the `DATABASE_URL` in `.env.test`.

### Database Connection Issues

Make sure the test database is running:

```bash
docker ps | grep synapse-donations-test-db
```

### Migration Issues

If migrations fail, try resetting the test database:

```bash
pnpm test:db:reset
```

### Docker Issues

If Docker containers aren't starting properly:

```bash
# Check logs
docker compose -f ../../docker-compose.test.yml logs

# Force recreate containers
docker compose -f ../../docker-compose.test.yml up -d --force-recreate
```
