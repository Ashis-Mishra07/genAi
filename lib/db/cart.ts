import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItemWithProduct extends CartItem {
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
    currency: string;
    imageUrl?: string;
    category?: string;
    isActive: boolean;
    artisanName: string;
    artisanLocation: string;
  };
}

// Get all cart items for a user with product details
export async function getCartItemsWithProducts(userId: string): Promise<CartItemWithProduct[]> {
  const result = await sql`
    SELECT 
      ci.id,
      ci.user_id as "userId",
      ci.product_id as "productId",
      ci.quantity,
      ci.created_at as "createdAt",
      ci.updated_at as "updatedAt",
      p.id as "product_id",
      p.name as "product_name",
      p.description as "product_description",
      p.price as "product_price",
      p.currency as "product_currency",
      p.image_url as "product_imageUrl",
      p.category as "product_category",
      p.is_active as "product_isActive",
      COALESCE(u.name, 'Unknown Artisan') as "artisan_name",
      COALESCE(u.location, 'Unknown Location') as "artisan_location"
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    LEFT JOIN users u ON p.user_id = u.id
    WHERE ci.user_id = ${userId}
    ORDER BY ci.created_at DESC
  `;

  return result.map((row: any) => ({
    id: row.id,
    userId: row.userId,
    productId: row.productId,
    quantity: row.quantity,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    product: {
      id: row.product_id,
      name: row.product_name,
      description: row.product_description,
      price: Number(row.product_price),
      currency: row.product_currency,
      imageUrl: row.product_imageUrl,
      category: row.product_category,
      isActive: row.product_isActive,
      artisanName: row.artisan_name,
      artisanLocation: row.artisan_location,
    }
  })) as CartItemWithProduct[];
}

// Add item to cart (or update quantity if exists)
export async function addToCart(userId: string, productId: string, quantity: number = 1): Promise<CartItem> {
  // Check if item already exists in cart
  const existingItem = await sql`
    SELECT id, quantity FROM cart_items 
    WHERE user_id = ${userId} AND product_id = ${productId}
    LIMIT 1
  `;

  if (existingItem.length > 0) {
    // Update existing item quantity
    const result = await sql`
      UPDATE cart_items 
      SET quantity = quantity + ${quantity}, updated_at = NOW()
      WHERE user_id = ${userId} AND product_id = ${productId}
      RETURNING 
        id,
        user_id as "userId",
        product_id as "productId",
        quantity,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
    return result[0] as CartItem;
  } else {
    // Create new cart item
    const result = await sql`
      INSERT INTO cart_items (user_id, product_id, quantity, created_at, updated_at)
      VALUES (${userId}, ${productId}, ${quantity}, NOW(), NOW())
      RETURNING 
        id,
        user_id as "userId",
        product_id as "productId",
        quantity,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
    return result[0] as CartItem;
  }
}

// Update cart item quantity
export async function updateCartItemQuantity(userId: string, cartItemId: string, quantity: number): Promise<CartItem | null> {
  if (quantity <= 0) {
    // Remove item if quantity is 0 or less
    await sql`
      DELETE FROM cart_items 
      WHERE id = ${cartItemId} AND user_id = ${userId}
    `;
    return null;
  }

  const result = await sql`
    UPDATE cart_items 
    SET quantity = ${quantity}, updated_at = NOW()
    WHERE id = ${cartItemId} AND user_id = ${userId}
    RETURNING 
      id,
      user_id as "userId",
      product_id as "productId",
      quantity,
      created_at as "createdAt",
      updated_at as "updatedAt"
  `;

  return result.length > 0 ? result[0] as CartItem : null;
}

// Remove item from cart
export async function removeFromCart(userId: string, cartItemId: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM cart_items 
    WHERE id = ${cartItemId} AND user_id = ${userId}
  `;
  return result.length > 0;
}

// Clear entire cart for user
export async function clearCart(userId: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM cart_items 
    WHERE user_id = ${userId}
  `;
  return true; // Always return true as clearing empty cart is still successful
}

// Get cart item count for user
export async function getCartItemCount(userId: string): Promise<number> {
  const result = await sql`
    SELECT COALESCE(SUM(quantity), 0) as count
    FROM cart_items 
    WHERE user_id = ${userId}
  `;
  return Number(result[0]?.count || 0);
}

// Calculate cart totals
export async function calculateCartTotals(userId: string): Promise<{
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
}> {
  const cartItems = await getCartItemsWithProducts(userId);
  
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity);
  }, 0);
  
  const shipping = subtotal > 5000 ? 0 : 299; // Free shipping above ₹5000
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const total = subtotal + shipping + tax;
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    subtotal,
    shipping,
    tax,
    total,
    itemCount
  };
}