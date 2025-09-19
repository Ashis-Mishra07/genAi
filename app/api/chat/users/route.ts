import { NextRequest, NextResponse } from 'next/server';
import { getUsers, getUnreadCount, getOrCreateChatRoom, getAdminUser } from '@/lib/db/chat';

// Mock data fallback
const mockUsers = [
  {
    id: "1",
    name: "Rajanikant Kumar",
    email: "raja@pottery.in",
    specialty: "Pottery & Ceramics",
    location: "Rajasthan, India",
    status: "ONLINE",
    lastMessage: "The pottery collection is ready for enhancement! 📷",
    lastSeen: new Date().toISOString(),
    unreadCount: 3,
    avatar: "",
    roomId: "room-1"
  },
  {
    id: "2",
    name: "Ashis Kumar",
    email: "ashis@woodcraft.in", 
    specialty: "Wood Carving",
    location: "Karnataka, India",
    status: "AWAY",
    lastMessage: "Here are the wooden sculptures you requested",
    lastSeen: new Date(Date.now() - 2*60*60*1000).toISOString(), // 2 hours ago
    unreadCount: 1,
    avatar: "",
    roomId: "room-2"
  },
  {
    id: "3",
    name: "Priya Sharma",
    email: "priya@textiles.in",
    specialty: "Textile & Weaving",
    location: "Gujarat, India",
    status: "ONLINE",
    lastMessage: "New textile patterns completed! Ready for posting?",
    lastSeen: new Date(Date.now() - 30*60*1000).toISOString(), // 30 min ago
    unreadCount: 2,
    avatar: "",
    roomId: "room-3"
  },
];

const mockAdmin = {
  id: "admin-1",
  name: "Admin",
  email: "admin@marketplace.com",
  specialty: "Administrator",
  location: "Headquarters",
  status: "ONLINE",
  lastMessage: "",
  lastSeen: new Date().toISOString(),
  unreadCount: 0,
  avatar: "",
};

export async function GET() {
  try {
    // Try to get real data from database
    const users = await getUsers();
    const adminUser = await getAdminUser();
    
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }
    
    // For each user, get the chat room with admin and unread count
    const usersWithChatInfo = await Promise.all(
      users.map(async (user) => {
        try {
          const roomId = await getOrCreateChatRoom(adminUser.id, user.id);
          const unreadCount = await getUnreadCount(adminUser.id, roomId);
          
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            specialty: user.specialty,
            location: user.location,
            status: user.status,
            lastSeen: user.last_seen,
            avatar: user.avatar,
            unreadCount,
            roomId,
            lastMessage: "Click to start conversation" // We can enhance this later
          };
        } catch (error) {
          console.error(`Error processing user ${user.id}:`, error);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            specialty: user.specialty,
            location: user.location,
            status: user.status,
            lastSeen: user.last_seen,
            avatar: user.avatar,
            unreadCount: 0,
            roomId: null,
            lastMessage: "Error loading chat"
          };
        }
      })
    );
    
    return NextResponse.json({
      success: true,
      users: usersWithChatInfo,
      admin: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email
      }
    });
    
  } catch (error) {
    console.error('Database connection failed, using mock data:', error);
    
    // Return mock data as fallback
    return NextResponse.json({
      success: true,
      users: mockUsers,
      admin: mockAdmin,
      fallback: true // Indicate this is fallback data
    });
  }
}