-- New installs
CREATE TABLE IF NOT EXISTS user_credentials (
                                                id BIGSERIAL PRIMARY KEY,
                                                name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(64) NOT NULL DEFAULT 'USER',
    enabled BOOLEAN NOT NULL DEFAULT TRUE
    );

-- Existing databases: add missing columns (idempotent)
ALTER TABLE user_credentials ADD COLUMN IF NOT EXISTS name VARCHAR(255);
UPDATE user_credentials
SET name = COALESCE(NULLIF(TRIM(name), ''), SPLIT_PART(email, '@', 1))
WHERE name IS NULL OR TRIM(name) = '';
ALTER TABLE user_credentials ALTER COLUMN name SET NOT NULL;

ALTER TABLE user_credentials ADD COLUMN IF NOT EXISTS role VARCHAR(64) NOT NULL DEFAULT 'USER';
ALTER TABLE user_credentials ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT TRUE;