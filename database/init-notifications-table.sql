-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('order_placed', 'order_updated', 'product_sold', 'general')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Insert some sample notifications for testing
INSERT INTO notifications (user_id, type, title, message, data, is_read) VALUES 
(
  'fc1c522a-1294-481b-945a-d3780a06e2b9', 
  'order_updated', 
  'Order Status Updated', 
  'Your order #ORD-001 has been updated to Processing status.',
  '{"orderId": "ORD-001", "status": "processing"}',
  false
),
(
  'fc1c522a-1294-481b-945a-d3780a06e2b9', 
  'product_sold', 
  'Product Sold', 
  'Your product "Custom Art Piece" has been sold.',
  '{"productId": "PROD-123", "productName": "Custom Art Piece"}',
  false
),
(
  'fc1c522a-1294-481b-945a-d3780a06e2b9', 
  'general', 
  'Welcome to Artisan Studio', 
  'Thank you for joining our platform. Start exploring amazing artisan products!',
  '{}',
  true
);