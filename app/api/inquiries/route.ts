import { NextRequest, NextResponse } from 'next/server';
import { inquiryOperations } from '@/lib/db/products';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

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

    return NextResponse.json({
      success: true,
      inquiries: inquiries,
      pagination: {
        page,
        limit,
        total: inquiries.length
      }
    });
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
