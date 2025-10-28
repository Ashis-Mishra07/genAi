import { NextRequest, NextResponse } from 'next/server';

interface CustomerRating {
  id: string;
  ticketId?: string;
  refundId?: string;
  customerEmail: string;
  rating: number; // 1-5 stars
  feedback?: string;
  createdAt: string;
}

// In-memory storage for demo purposes
let ratings: CustomerRating[] = [
  {
    id: 'R001',
    ticketId: 'T001',
    customerEmail: 'john@example.com',
    rating: 5,
    feedback: 'Excellent support! Very helpful and quick response.',
    createdAt: '2024-01-15T10:30:00.000Z'
  },
  {
    id: 'R002',
    ticketId: 'T002',
    customerEmail: 'jane@example.com',
    rating: 4,
    feedback: 'Good service, resolved my issue quickly.',
    createdAt: '2024-01-10T09:15:00.000Z'
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketId, refundId, customerEmail, rating, feedback } = body;
    
    // Validate required fields
    if (!customerEmail || !rating || (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { success: false, error: 'Customer email and valid rating (1-5) are required' },
        { status: 400 }
      );
    }

    if (!ticketId && !refundId) {
      return NextResponse.json(
        { success: false, error: 'Either ticketId or refundId is required' },
        { status: 400 }
      );
    }

    // Generate rating ID
    const ratingId = `R${String(Date.now()).slice(-6).padStart(3, '0')}`;
    
    // Create new rating
    const newRating: CustomerRating = {
      id: ratingId,
      ticketId,
      refundId,
      customerEmail,
      rating,
      feedback,
      createdAt: new Date().toISOString()
    };

    // Add to storage (in real app, save to database)
    ratings.push(newRating);

    console.log('Customer rating submitted:', newRating);

    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback!',
      ratingId: ratingId,
      rating: newRating
    });

  } catch (error) {
    console.error('Error submitting rating:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit rating' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('ticketId');
    const refundId = searchParams.get('refundId');
    const customerEmail = searchParams.get('customerEmail');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Filter ratings based on query parameters
    let filteredRatings = ratings;
    
    if (ticketId) {
      filteredRatings = filteredRatings.filter(rating => rating.ticketId === ticketId);
    }
    
    if (refundId) {
      filteredRatings = filteredRatings.filter(rating => rating.refundId === refundId);
    }
    
    if (customerEmail) {
      filteredRatings = filteredRatings.filter(rating => rating.customerEmail === customerEmail);
    }

    // Sort by creation date (newest first)
    filteredRatings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Limit results
    const limitedRatings = filteredRatings.slice(0, limit);

    // Calculate average rating
    const averageRating = filteredRatings.length > 0 
      ? filteredRatings.reduce((sum, rating) => sum + rating.rating, 0) / filteredRatings.length
      : 0;

    return NextResponse.json({
      success: true,
      ratings: limitedRatings,
      total: filteredRatings.length,
      averageRating: Math.round(averageRating * 10) / 10
    });

  } catch (error) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ratings' },
      { status: 500 }
    );
  }
}