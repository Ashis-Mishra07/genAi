/**
 * Email Service - Integrates with n8n workflows to send beautiful HTML emails
 * Handles order confirmations, artisan notifications, and cart updates
 */

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
    artisanName?: string;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: string;
  createdAt: string;
  trackOrderUrl?: string;
}

interface ArtisanNotificationData {
  orderNumber: string;
  artisanName: string;
  artisanEmail: string;
  customerName: string;
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }>;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: string;
  createdAt: string;
  dashboardUrl?: string;
}

interface CartAdditionData {
  customerName: string;
  customerEmail: string;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    artisanName?: string;
  };
  quantity: number;
  cartStats: {
    totalItems: number;
    totalAmount: number;
  };
  cartUrl?: string;
  continueShoppingUrl?: string;
}

interface EmailResponse {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(
  orderData: OrderEmailData
): Promise<EmailResponse> {
  try {
    const webhookUrl = process.env.N8N_ORDER_CONFIRMATION_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.warn('⚠️ N8N_ORDER_CONFIRMATION_WEBHOOK_URL not configured, skipping customer email');
      return {
        success: false,
        message: 'Email webhook not configured',
        error: 'Missing N8N_ORDER_CONFIRMATION_WEBHOOK_URL environment variable'
      };
    }

    console.log(`📧 Sending order confirmation to ${orderData.customerEmail} for order ${orderData.orderNumber}`);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Failed to send order confirmation email (HTTP ${response.status}):`, errorText);
      console.error(`Webhook URL: ${webhookUrl}`);
      console.error(`Customer: ${orderData.customerName} <${orderData.customerEmail}>`);
      console.error(`Order: ${orderData.orderNumber} | Total: ₹${orderData.total}`);
      
      return {
        success: false,
        message: `Failed to send email (HTTP ${response.status})`,
        error: `Webhook error: ${errorText.substring(0, 200)}...`
      };
    }

    const result = await response.json();
    console.log(`✅ Order confirmation email sent successfully to ${orderData.customerEmail}`);
    console.log(`   Order: ${orderData.orderNumber} | Items: ${orderData.items.length} | Total: ₹${orderData.total}`);
    
    return {
      success: true,
      message: 'Order confirmation email sent successfully'
    };
  } catch (error: any) {
    console.error('❌ Error sending order confirmation email:', error);
    console.error(`   Customer: ${orderData.customerName} <${orderData.customerEmail}>`);
    console.error(`   Order: ${orderData.orderNumber}`);
    console.error(`   Error details: ${error.message}`);
    
    return {
      success: false,
      message: 'Error sending email',
      error: error.message
    };
  }
}

/**
 * Send order notification email to artisan
 */
export async function sendArtisanOrderNotification(
  notificationData: ArtisanNotificationData
): Promise<EmailResponse> {
  try {
    const webhookUrl = process.env.N8N_ARTISAN_NOTIFICATION_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.warn('⚠️ N8N_ARTISAN_NOTIFICATION_WEBHOOK_URL not configured, skipping artisan email notification');
      return {
        success: false,
        message: 'Email webhook not configured',
        error: 'Missing N8N_ARTISAN_NOTIFICATION_WEBHOOK_URL environment variable'
      };
    }

    console.log(`📧 Sending artisan notification to ${notificationData.artisanEmail} for order ${notificationData.orderNumber}`);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Failed to send artisan notification email (HTTP ${response.status}):`, errorText);
      console.error(`Webhook URL: ${webhookUrl}`);
      console.error(`Artisan: ${notificationData.artisanName} <${notificationData.artisanEmail}>`);
      console.error(`Order: ${notificationData.orderNumber} with ${notificationData.products.length} products`);
      
      return {
        success: false,
        message: `Failed to send email (HTTP ${response.status})`,
        error: `Webhook error: ${errorText.substring(0, 200)}...`
      };
    }

    const result = await response.json();
    console.log(`✅ Artisan notification email sent successfully to ${notificationData.artisanEmail}`);
    console.log(`   Order: ${notificationData.orderNumber} | Products: ${notificationData.products.length} | Total: ₹${notificationData.products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2)}`);
    
    return {
      success: true,
      message: 'Artisan notification email sent successfully'
    };
  } catch (error: any) {
    console.error('❌ Error sending artisan notification email:', error);
    console.error(`   Artisan: ${notificationData.artisanName} <${notificationData.artisanEmail}>`);
    console.error(`   Order: ${notificationData.orderNumber}`);
    console.error(`   Error details: ${error.message}`);
    
    return {
      success: false,
      message: 'Error sending email',
      error: error.message
    };
  }
}

/**
 * Send cart addition notification email to customer
 */
export async function sendCartAdditionEmail(
  cartData: CartAdditionData
): Promise<EmailResponse> {
  try {
    const webhookUrl = process.env.N8N_CART_ADDITION_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.warn('N8N_CART_ADDITION_WEBHOOK_URL not configured, skipping email');
      return {
        success: false,
        message: 'Email webhook not configured',
        error: 'Missing N8N_CART_ADDITION_WEBHOOK_URL environment variable'
      };
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cartData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send cart addition email:', errorText);
      return {
        success: false,
        message: 'Failed to send email',
        error: errorText
      };
    }

    const result = await response.json();
    console.log('Cart addition email sent successfully:', cartData.customerEmail);
    
    return {
      success: true,
      message: 'Cart addition email sent successfully'
    };
  } catch (error: any) {
    console.error('Error sending cart addition email:', error);
    return {
      success: false,
      message: 'Error sending email',
      error: error.message
    };
  }
}

/**
 * Send multiple artisan notifications for a single order
 * This groups products by artisan and sends individual emails
 */
export async function sendArtisanNotificationsForOrder(
  orderData: OrderEmailData,
  artisanProductsMap: Map<string, {
    artisanEmail: string;
    artisanName: string;
    products: Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
      imageUrl?: string;
    }>;
  }>
): Promise<EmailResponse[]> {
  const results: EmailResponse[] = [];

  for (const [artisanId, artisanData] of artisanProductsMap.entries()) {
    const notificationData: ArtisanNotificationData = {
      orderNumber: orderData.orderNumber,
      artisanName: artisanData.artisanName,
      artisanEmail: artisanData.artisanEmail,
      customerName: orderData.customerName,
      products: artisanData.products,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      createdAt: orderData.createdAt,
      dashboardUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/artisan/dashboard`
    };

    const result = await sendArtisanOrderNotification(notificationData);
    results.push(result);
  }

  return results;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Calculate shipping cost based on order total
 */
export function calculateShipping(subtotal: number): number {
  // Free shipping for orders over ₹500
  if (subtotal >= 500) {
    return 0;
  }
  // Flat rate shipping for smaller orders
  return 50;
}
