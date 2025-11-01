-- Add artisan documentation fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS photograph TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS artistry_description TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS work_process TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS expertise_areas TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS origin_place VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS artisan_story TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS documentation_video_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS documentation_video_status VARCHAR(20) DEFAULT 'NOT_GENERATED';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_role_documentation ON users(role, documentation_video_status) WHERE role = 'ARTISAN';
