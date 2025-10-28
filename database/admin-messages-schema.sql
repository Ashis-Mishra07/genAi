-- Create admin messages table for real-time communication
CREATE TABLE IF NOT EXISTS admin_messages (
  id SERIAL PRIMARY KEY,
  sender_id VARCHAR(255) NOT NULL,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('admin', 'artisan')),
  recipient_id VARCHAR(255) NOT NULL,
  recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('admin', 'artisan')),
  message TEXT NOT NULL,
  attachment_url TEXT,
  attachment_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_messages_sender ON admin_messages(sender_id, sender_type);
CREATE INDEX IF NOT EXISTS idx_admin_messages_recipient ON admin_messages(recipient_id, recipient_type);
CREATE INDEX IF NOT EXISTS idx_admin_messages_created_at ON admin_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_messages_is_read ON admin_messages(is_read);

-- Create a composite index for efficient querying of conversations
CREATE INDEX IF NOT EXISTS idx_admin_messages_conversation ON admin_messages(
  (CASE 
    WHEN sender_type = 'artisan' THEN sender_id 
    ELSE recipient_id 
  END),
  created_at
);

-- Insert some sample admin responses
INSERT INTO admin_messages (sender_id, sender_type, recipient_id, recipient_type, message, created_at) VALUES
('admin-1', 'admin', '1', 'artisan', 'Hello! Welcome to ArtisanCraft! I''m here to help you succeed on our platform. How can I assist you today?', NOW() - INTERVAL '1 hour'),
('admin-1', 'admin', '1', 'artisan', 'I see you''re new here. Would you like me to walk you through optimizing your product listings for better visibility?', NOW() - INTERVAL '50 minutes');
