import { NextRequest, NextResponse } from 'next/server';
import { inquiryOperations } from '@/lib/db/products';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid inquiry ID' },
        { status: 400 }
      );
    }

    const inquiry = await inquiryOperations.getInquiryById(id);

    if (!inquiry) {
      return NextResponse.json(
        { success: false, error: 'Inquiry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      inquiry: inquiry
    });
  } catch (error: any) {
    console.error('Inquiry GET error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const updates = await request.json();
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid inquiry ID' },
        { status: 400 }
      );
    }

    const inquiry = await inquiryOperations.updateInquiry(id, updates);

    if (!inquiry) {
      return NextResponse.json(
        { success: false, error: 'Inquiry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      inquiry: inquiry,
      message: 'Inquiry updated successfully'
    });
  } catch (error: any) {
    console.error('Inquiry UPDATE error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update inquiry',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid inquiry ID' },
        { status: 400 }
      );
    }

    const deleted = await inquiryOperations.deleteInquiry(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Inquiry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Inquiry deleted successfully'
    });
  } catch (error: any) {
    console.error('Inquiry DELETE error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete inquiry',
        details: error.message
      },
      { status: 500 }
    );
  }
}
