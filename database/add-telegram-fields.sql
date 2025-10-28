-- Add Telegram integration fields to users table
-- This allows artisans to authenticate and use the Telegram bot

ALTER TABLE users 
ADD COLUMN telegram_chat_id VARCHAR(50) UNIQUE,
ADD COLUMN telegram_username VARCHAR(100),
ADD COLUMN telegram_authorized BOOLEAN DEFAULT FALSE,
ADD COLUMN telegram_authorized_at TIMESTAMPTZ;

-- Create index for fast telegram lookups
CREATE INDEX idx_users_telegram_chat_id ON users(telegram_chat_id);
CREATE INDEX idx_users_telegram_authorized ON users(telegram_authorized) WHERE telegram_authorized = TRUE;

-- Add a table to track telegram authorization requests
CREATE TABLE telegram_auth_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_chat_id VARCHAR(50) NOT NULL,
    telegram_username VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    verification_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_telegram_auth_requests_chat_id ON telegram_auth_requests(telegram_chat_id);
CREATE INDEX idx_telegram_auth_requests_code ON telegram_auth_requests(verification_code);
CREATE INDEX idx_telegram_auth_requests_expires ON telegram_auth_requests(expires_at);