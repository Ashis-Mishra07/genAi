-- Insert the system admin user with the specific UUID used in the application
-- This user is referenced throughout the codebase as a virtual admin user

INSERT INTO users (
    id,
    email,
    password,
    name,
    phone,
    role,
    specialty,
    location,
    bio,
    avatar,
    status,
    is_active,
    last_login_at,
    last_seen,
    language,
    created_at,
    updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'admin@system.local',
    NULL, -- No password hash needed for system admin
    'System Administrator',
    NULL,
    'ADMIN',
    'Platform Management',
    'System',
    'System administrator account for platform management',
    NULL,
    'ONLINE',
    true,
    NOW(),
    NOW(),
    'en',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    is_active = EXCLUDED.is_active,
    last_seen = NOW(),
    updated_at = NOW();

-- Verify the admin user was created
SELECT id, email, name, role, is_active 
FROM users 
WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
