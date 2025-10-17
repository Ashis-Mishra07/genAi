import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/utils/jwt';
import { getCartItemsWithProducts, calculateCartTotals } from '../../../../lib/db/cart';

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get cart items with product details from database
    const cartItemsWithProducts = await getCartItemsWithProducts(user.id);
    
    // Calculate totals
    const totals = await calculateCartTotals(user.id);

    // Transform data for frontend
    const cartItems = cartItemsWithProducts.map(item => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      addedAt: item.createdAt.toISOString(),
      // Product details
      name: item.product.name,
      description: item.product.description,
      price: item.product.price,
      currency: item.product.currency,
      imageUrl: item.product.imageUrl,
      category: item.product.category,
      // Artisan details
      artisanName: item.product.artisanName,
      artisanLocation: item.product.artisanLocation,
      // Stock status
      inStock: item.product.isActive
    }));

    return NextResponse.json({
      success: true,
      cartItems,
      count: cartItems.length,
      totals: {
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total
      }
    });
  } catch (error: any) {
    console.error('Cart details GET error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch cart details',
        details: error.message
      },
      { status: 500 }
    );
  }
}