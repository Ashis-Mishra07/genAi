import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../lib/utils/jwt';
import { getCartItemsWithProducts, addToCart, updateCartItemQuantity, removeFromCart, clearCart } from '../../../lib/db/cart';
import { sendCartAdditionEmail } from '../../../lib/email-service';
import { getProductById } from '../../../lib/db/products-neon';

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

    // Get cart items for user from database
    const cartItems = await getCartItemsWithProducts(user.id);
    
    return NextResponse.json({
      success: true,
      cartItems,
      count: cartItems.length
    });
  } catch (error: any) {
    console.error('Cart GET error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch cart',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Add item to cart in database
    const cartItem = await addToCart(user.id, productId, quantity);

    // Get updated cart items
    const cartItems = await getCartItemsWithProducts(user.id);

    // Send cart addition email notification (don't fail cart addition if email fails)
    try {
      // Get product details
      const product = await getProductById(productId);
      
      if (product && user.email) {
        // Calculate cart totals
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

        const cartEmailData = {
          customerName: user.name || 'Customer',
          customerEmail: user.email,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            artisanName: (product as any).artisanName || 'Artisan'
          },
          quantity: quantity,
          cartStats: {
            totalItems: totalItems,
            totalAmount: totalAmount
          },
          cartUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/customer/cart`,
          continueShoppingUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/products`
        };

        await sendCartAdditionEmail(cartEmailData);
        console.log('Cart addition email sent successfully');
      }
    } catch (emailError) {
      console.error('Error sending cart addition email (continuing without failing cart operation):', emailError);
      // Don't fail the cart addition if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Item added to cart',
      cartItem,
      cartItems,
      count: cartItems.length
    });
  } catch (error: any) {
    console.error('Cart POST error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to add to cart',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { itemId, quantity } = await request.json();

    if (!itemId || quantity < 0) {
      return NextResponse.json(
        { error: 'Valid item ID and quantity are required' },
        { status: 400 }
      );
    }

    // Update cart item quantity in database
    const updatedItem = await updateCartItemQuantity(user.id, itemId, quantity);

    // Get updated cart items
    const cartItems = await getCartItemsWithProducts(user.id);

    return NextResponse.json({
      success: true,
      message: quantity === 0 ? 'Item removed from cart' : 'Cart updated',
      updatedItem,
      cartItems,
      count: cartItems.length
    });
  } catch (error: any) {
    console.error('Cart PUT error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update cart',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      // Clear entire cart
      await clearCart(user.id);
      return NextResponse.json({
        success: true,
        message: 'Cart cleared',
        cartItems: [],
        count: 0
      });
    }

    // Remove specific item
    const removed = await removeFromCart(user.id, itemId);
    
    if (!removed) {
      return NextResponse.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    // Get updated cart items
    const cartItems = await getCartItemsWithProducts(user.id);

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart',
      cartItems,
      count: cartItems.length
    });
  } catch (error: any) {
    console.error('Cart DELETE error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to remove from cart',
        details: error.message
      },
      { status: 500 }
    );
  }
}