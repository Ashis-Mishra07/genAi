import { NextRequest, NextResponse } from 'next/server';
import { getRoomMessages, sendMessage, markMessagesAsRead, getAdminUser } from '@/lib/db/chat';

// GET messages for a specific room
export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const { roomId } = await params;
    const messages = await getRoomMessages(roomId);
    
    return NextResponse.json({
      success: true,
      messages: messages.map(msg => ({
        id: msg.id,
        senderId: msg.sender_id,
        senderName: msg.sender_name,
        messageType: msg.message_type,
        content: msg.content,
        imageUrl: msg.image_url,
        status: msg.status,
        metadata: msg.metadata,
        timestamp: msg.timestamp
      }))
    });
    
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST new message to room
export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const { roomId } = await params;
    const body = await request.json();
    const { senderId, messageType = 'TEXT', content, imageUrl, metadata } = body;
    
    if (!senderId) {
      return NextResponse.json(
        { error: 'Sender ID is required' },
        { status: 400 }
      );
    }
    
    if (!content && !imageUrl) {
      return NextResponse.json(
        { error: 'Either content or imageUrl is required' },
        { status: 400 }
      );
    }
    
    const newMessage = await sendMessage(
      roomId,
      senderId,
      content,
      messageType
    );

    return NextResponse.json({
      success: true,
      message: {
        id: newMessage.id,
        timestamp: newMessage.timestamp
      }
    });  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// PUT to mark messages as read
export async function PUT(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const { roomId } = await params;
    const body = await request.json();
    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const readCount = await markMessagesAsRead(userId, roomId);
    
    return NextResponse.json({
      success: true,
      markedAsRead: readCount
    });
    
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}