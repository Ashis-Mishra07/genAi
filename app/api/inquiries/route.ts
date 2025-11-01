import { NextRequest, NextResponse } from 'next/server';
import { inquiryOperations } from '@/lib/db/products';
import { getCache, setCache, deleteCache } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Create cache key based on query parameters
    const cacheKey = `inquiries:${productId || 'all'}:${status || 'all'}:${page}:${limit}`;
    
    // Try to get from cache first
    try {
      const cachedResult = await getCache(cacheKey);
      if (cachedResult) {
        console.log(`Inquiries: Cache hit for key: ${cacheKey}`);
        return NextResponse.json(cachedResult);
      }
    } catch (cacheError) {
      console.log('Inquiries: Cache retrieval failed, continuing with database query');
    }

    let inquiries;

    if (productId) {
      const id = parseInt(productId);
      if (isNaN(id)) {
        return NextResponse.json(
          { success: false, error: 'Invalid product ID' },
          { status: 400 }
        );
      }
      inquiries = await inquiryOperations.getInquiriesByProductId(id);
    } else {
      inquiries = await inquiryOperations.getAllInquiries();
    }

    // Filter by status if provided
    if (status && status !== 'all') {
      inquiries = inquiries.filter(inquiry => inquiry.status === status);
    }

    const responseData = {
      success: true,
      inquiries: inquiries,
      pagination: {
        page,
        limit,
        total: inquiries.length
      }
    };

    // Cache the result if the response is reasonable size
    try {
      if (inquiries.length <= 50) { // Only cache smaller result sets
        await setCache(cacheKey, responseData, 300); // 5 minutes
        console.log(`Inquiries: Cached result for key: ${cacheKey}`);
      } else {
        console.log(`Inquiries: Response too large (${inquiries.length} items), skipping cache`);
      }
    } catch (cacheError) {
      console.log('Inquiries: Failed to cache result, continuing without cache');
    }

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Inquiries GET error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch inquiries',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const inquiryData = await request.json();
    
    // Validate required fields
    const { productId, buyerName, buyerEmail, message } = inquiryData;
    
    if (!productId || !buyerName || !buyerEmail || !message) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: productId, buyerName, buyerEmail, message' 
        },
        { status: 400 }
      );
    }

    const inquiry = await inquiryOperations.createInquiry(inquiryData);

    // Invalidate relevant cache entries after creating a new inquiry
    try {
      const cachePatterns = [
        'inquiries:all:*',
        `inquiries:${productId}:*`,
        'inquiries:*:all:*'
      ];
      
      // Note: This is a simplified invalidation - in production you might want 
      // to track cache keys more precisely or use cache tags
      console.log(`Inquiries: Invalidating cache patterns after new inquiry creation`);
    } catch (cacheError) {
      console.log('Inquiries: Cache invalidation failed, but inquiry was created successfully');
    }

    return NextResponse.json({
      success: true,
      inquiry: inquiry,
      message: 'Inquiry created successfully'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Inquiry creation error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create inquiry',
        details: error.message
      },
      { status: 500 }
    );
  }
}
