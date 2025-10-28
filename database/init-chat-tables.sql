-- Chat system tables for Neon DB

-- Users table (enhanced for chat functionality)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(50),
    specialty VARCHAR(255), -- Artisan specialty (pottery, wood carving, etc.)
    location VARCHAR(255), -- Location (state, country)
    avatar TEXT, -- Profile picture URL
    status VARCHAR(20) DEFAULT 'OFFLINE', -- ONLINE, OFFLINE, AWAY
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    type VARCHAR(20) DEFAULT 'DIRECT', -- DIRECT, GROUP
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat room participants
CREATE TABLE IF NOT EXISTS chat_room_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'MEMBER', -- ADMIN, MEMBER
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message_type VARCHAR(20) DEFAULT 'TEXT', -- TEXT, IMAGE, SYSTEM
    content TEXT,
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'SENT', -- SENT, DELIVERED, READ, PROCESSING, ENHANCED, POSTED
    metadata JSONB, -- Additional data for system messages, image processing status
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message read status
CREATE TABLE IF NOT EXISTS message_read_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- Image processing queue
CREATE TABLE IF NOT EXISTS image_processing_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    original_image_url TEXT NOT NULL,
    enhanced_image_url TEXT,
    poster_url TEXT,
    instagram_post_id TEXT,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PROCESSING, ENHANCED, POSTED, FAILED
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert admin user if not exists
INSERT INTO users (email, name, specialty, location, status)
SELECT 'admin@artisan-marketplace.com', 'Admin', 'Platform Management', 'India', 'ONLINE'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@artisan-marketplace.com'
);

-- Insert sample artisan users
INSERT INTO users (email, name, specialty, location, status, avatar) VALUES
('rajanikant@example.com', 'Rajanikant', 'Pottery & Ceramics', 'Rajasthan, India', 'ONLINE', NULL),
('ashis@example.com', 'Ashis', 'Wood Carving', 'Karnataka, India', 'AWAY', NULL),
('priya.sharma@example.com', 'Priya Sharma', 'Textile & Weaving', 'Gujarat, India', 'ONLINE', NULL),
('vikram.singh@example.com', 'Vikram Singh', 'Metal Crafts', 'Punjab, India', 'OFFLINE', NULL),
('kavya.nair@example.com', 'Kavya Nair', 'Jewelry Making', 'Kerala, India', 'ONLINE', NULL),
('arjun.patel@example.com', 'Arjun Patel', 'Traditional Painting', 'Madhya Pradesh, India', 'AWAY', NULL)
ON CONFLICT (email) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_message_read_status_user_id ON message_read_status(user_id);
CREATE INDEX IF NOT EXISTS idx_image_processing_status ON image_processing_queue(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON chat_rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();