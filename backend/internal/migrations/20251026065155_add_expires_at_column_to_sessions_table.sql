-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';

ALTER TABLE sessions
ADD COLUMN expires_at TIMESTAMPTZ NOT NULL;

ALTER TABLE admin_sessions
ADD COLUMN expires_at TIMESTAMPTZ NOT NULL;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';

ALTER TABLE admin_sessions
DROP COLUMN expires_at;

ALTER TABLE sessions
DROP COLUMN expires_at;

-- +goose StatementEnd
