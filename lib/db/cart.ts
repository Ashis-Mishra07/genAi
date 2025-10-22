import { neon } from '@neondatabase/serverless';

// Create a function to get a fresh SQL connection
function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not configured');
  }
  return neon(process.env.DATABASE_URL);
}

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
  const sql = getSql();
  
  // Query 1: Get cart items
  const cartItems = await sql`
    SELECT 
      id,
      user_id,
      product_id,
      quantity,
      created_at,
      updated_at
    FROM cart_items
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;

  if (cartItems.length === 0) {
    return [];
  }

  // Get product IDs
  const productIds = cartItems.map((item: any) => item.product_id);

  // Query 2: Get products
  const products = await sql`
    SELECT id, name, price, currency, image_url, category, is_active, user_id
    FROM products
    WHERE id = ANY(${productIds})
  `;

  // Query 3: Get unique user IDs from products
  const userIds = [...new Set(products.map((p: any) => p.user_id))];
  const users = await sql`
    SELECT id, name, location
    FROM users
    WHERE id = ANY(${userIds})
  `;

  // Create maps
  const productMap = new Map(products.map((p: any) => [p.id, p]));
  const userMap = new Map(users.map((u: any) => [u.id, u]));

  // Combine in JavaScript
  return cartItems.map((row: any) => {
    const product: any = productMap.get(row.product_id);
    const user: any = product ? userMap.get(product.user_id) : null;
    
    return {
      id: row.id,
      userId: row.user_id,
      productId: row.product_id,
      quantity: row.quantity,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      product: {
        id: product?.id || '',
        name: product?.name || 'Unknown Product',
        price: Number(product?.price || 0),
        currency: product?.currency || 'INR',
        imageUrl: product?.image_url,
        category: product?.category,
        isActive: product?.is_active || false,
        artisanName: user?.name || 'Unknown Artisan',
        artisanLocation: user?.location || 'Unknown Location',
      }
    };
  }) as CartItemWithProduct[];
}

// Add item to cart (or update quantity if exists)
export async function addToCart(userId: string, productId: string, quantity: number = 1): Promise<CartItem> {
  const sql = getSql();
  
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
  const sql = getSql();
  
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
  const sql = getSql();
  const result = await sql`
    DELETE FROM cart_items 
    WHERE id = ${cartItemId} AND user_id = ${userId}
  `;
  return result.length > 0;
}

// Clear entire cart for user
export async function clearCart(userId: string): Promise<boolean> {
  const sql = getSql();
  const result = await sql`
    DELETE FROM cart_items 
    WHERE user_id = ${userId}
  `;
  return true; // Always return true as clearing empty cart is still successful
}

// Get cart item count for user
export async function getCartItemCount(userId: string): Promise<number> {
  const sql = getSql();
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