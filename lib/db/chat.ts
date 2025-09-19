import { neon } from '@neondatabase/serverless';

// Direct query function for serverless environment
const sql = neon(process.env.DATABASE_URL!);

// Helper function to execute queries
export async function query(text: string, params?: any[]): Promise<{ rows: any[] }> {
  try {
    // Use sql.query() for parameterized queries with Neon serverless
    const result = await sql.query(text, params || []);
    return { rows: Array.isArray(result) ? result : [result] };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Helper function to get users
export async function getUsers() {
  const result = await query(`
    SELECT id, email, name, specialty, location, status, last_seen, avatar, created_at
    FROM users 
    WHERE email != 'admin@artisan-marketplace.com'
    ORDER BY last_seen DESC
  `);
  return result.rows;
}

// Helper function to get admin user
export async function getAdminUser() {
  const result = await query(`
    SELECT id, email, name, specialty, location, status, last_seen, avatar
    FROM users 
    WHERE email = 'admin@artisan-marketplace.com'
    LIMIT 1
  `);
  return result.rows[0];
}

// Helper function to get or create chat room between two users
export async function getOrCreateChatRoom(userId1: string, userId2: string): Promise<string> {
  try {
    // Check if room exists
    const existingRoom = await query(`
      SELECT cr.id 
      FROM chat_rooms cr
      JOIN chat_room_participants crp1 ON cr.id = crp1.room_id
      JOIN chat_room_participants crp2 ON cr.id = crp2.room_id
      WHERE crp1.user_id = $1 AND crp2.user_id = $2 AND cr.type = 'DIRECT'
    `, [userId1, userId2]);
    
    if (existingRoom.rows.length > 0) {
      return existingRoom.rows[0].id;
    }
    
    // Create new room
    const newRoom = await query(`
      INSERT INTO chat_rooms (type) VALUES ('DIRECT') RETURNING id
    `);
    const roomId = newRoom.rows[0].id;
    
    // Add participants
    await query(`
      INSERT INTO chat_room_participants (room_id, user_id) VALUES ($1, $2), ($1, $3)
    `, [roomId, userId1, userId2]);
    
    return roomId;
  } catch (error) {
    console.error('Error in getOrCreateChatRoom:', error);
    throw error;
  }
}

// Helper function to get room messages
export async function getRoomMessages(roomId: string) {
  const result = await query(`
    SELECT 
      cm.id,
      cm.room_id,
      cm.sender_id,
      u.name as sender_name,
      cm.content,
      cm.message_type,
      cm.created_at as timestamp,
      cm.status,
      cm.image_url
    FROM chat_messages cm
    JOIN users u ON cm.sender_id = u.id
    WHERE cm.room_id = $1
    ORDER BY cm.created_at ASC
  `, [roomId]);
  return result.rows;
}

// Helper function to send message
export async function sendMessage(roomId: string, senderId: string, content: string, messageType: string = 'TEXT') {
  const result = await query(`
    INSERT INTO chat_messages (room_id, sender_id, content, message_type, status)
    VALUES ($1, $2, $3, $4, 'SENT')
    RETURNING id, room_id, sender_id, content, message_type, created_at as timestamp, status
  `, [roomId, senderId, content, messageType]);
  return result.rows[0];
}

// Helper function to mark messages as read
export async function markMessagesAsRead(roomId: string, userId: string) {
  try {
    await query(`
      INSERT INTO chat_read_status (message_id, user_id, read_at)
      SELECT cm.id, $2, NOW()
      FROM chat_messages cm
      WHERE cm.room_id = $1 
      AND cm.sender_id != $2
      AND NOT EXISTS (
        SELECT 1 FROM chat_read_status crs 
        WHERE crs.message_id = cm.id AND crs.user_id = $2
      )
    `, [roomId, userId]);
  } catch (error: any) {
    // Silently handle missing read status table - don't show warnings to user
    console.debug('Read status tracking unavailable:', error.message);
  }
}

// Helper function to get unread message count for user
export async function getUnreadCount(userId: string, roomId?: string): Promise<number> {
  try {
    const whereClause = roomId ? 'AND cm.room_id = $2' : '';
    const params = roomId ? [userId, roomId] : [userId];
    
    // Try to use the read_status table if it exists
    const result = await query(`
      SELECT COUNT(*) as unread_count
      FROM chat_messages cm
      JOIN chat_room_participants crp ON cm.room_id = crp.room_id
      WHERE crp.user_id = $1
      AND cm.sender_id != $1
      AND NOT EXISTS (
        SELECT 1 FROM chat_read_status crs 
        WHERE crs.message_id = cm.id AND crs.user_id = $1
      )
      ${whereClause}
    `, params);
    
    return parseInt(result.rows[0]?.unread_count || '0');
  } catch (error: any) {
    console.debug('Read status table not available, using simple count:', error.message);
    
    // Fallback: Just count all messages in the room that aren't from the user
    try {
      const whereClause = roomId ? 'AND cm.room_id = $2' : '';
      const params = roomId ? [userId, roomId] : [userId];
      
      const result = await query(`
        SELECT COUNT(*) as unread_count
        FROM chat_messages cm
        JOIN chat_room_participants crp ON cm.room_id = crp.room_id
        WHERE crp.user_id = $1
        AND cm.sender_id != $1
        ${whereClause}
      `, params);
      
      return Math.min(parseInt(result.rows[0]?.unread_count || '0'), 5); // Cap at 5 for demo
    } catch (fallbackError) {
      console.error('Fallback unread count failed:', fallbackError);
      return 0; // Return 0 if everything fails
    }
  }
}

// Helper function to update user status
export async function updateUserStatus(userId: string, status: string) {
  await query(`
    UPDATE users 
    SET status = $1, last_seen = NOW()
    WHERE id = $2
  `, [status, userId]);
}

// Helper function to get last message for room
export async function getLastMessage(roomId: string) {
  const result = await query(`
    SELECT content, created_at as timestamp
    FROM chat_messages
    WHERE room_id = $1
    ORDER BY created_at DESC
    LIMIT 1
  `, [roomId]);
  return result.rows[0];
}

// Helper function to create sample data
export async function createSampleUsers() {
  const sampleUsers = [
    {
      email: 'admin@artisan-marketplace.com',
      name: 'Admin',
      specialty: 'Platform Management',
      location: 'India',
      status: 'ONLINE'
    },
    {
      email: 'rajanikant@example.com',
      name: 'Rajanikant',
      specialty: 'Pottery & Ceramics',
      location: 'Rajasthan, India',
      status: 'ONLINE'
    },
    {
      email: 'ashis@example.com',
      name: 'Ashis',
      specialty: 'Wood Carving',
      location: 'Karnataka, India',
      status: 'AWAY'
    },
    {
      email: 'priya@example.com',
      name: 'Priya Sharma',
      specialty: 'Textile & Weaving',
      location: 'Gujarat, India',
      status: 'ONLINE'
    }
  ];

  for (const user of sampleUsers) {
    await query(`
      INSERT INTO users (email, name, specialty, location, status)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        specialty = EXCLUDED.specialty,
        location = EXCLUDED.location,
        status = EXCLUDED.status
    `, [user.email, user.name, user.specialty, user.location, user.status]);
  }
}