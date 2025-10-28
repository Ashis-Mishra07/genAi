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
      console.warn('N8N_ORDER_CONFIRMATION_WEBHOOK_URL not configured, skipping email');
      return {
        success: false,
        message: 'Email webhook not configured',
        error: 'Missing N8N_ORDER_CONFIRMATION_WEBHOOK_URL environment variable'
      };
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send order confirmation email:', errorText);
      return {
        success: false,
        message: 'Failed to send email',
        error: errorText
      };
    }

    const result = await response.json();
    console.log('Order confirmation email sent successfully:', orderData.orderNumber);
    
    return {
      success: true,
      message: 'Order confirmation email sent successfully'
    };
  } catch (error: any) {
    console.error('Error sending order confirmation email:', error);
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
      console.warn('N8N_ARTISAN_NOTIFICATION_WEBHOOK_URL not configured, skipping email');
      return {
        success: false,
        message: 'Email webhook not configured',
        error: 'Missing N8N_ARTISAN_NOTIFICATION_WEBHOOK_URL environment variable'
      };
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send artisan notification email:', errorText);
      return {
        success: false,
        message: 'Failed to send email',
        error: errorText
      };
    }

    const result = await response.json();
    console.log('Artisan notification email sent successfully:', notificationData.artisanEmail);
    
    return {
      success: true,
      message: 'Artisan notification email sent successfully'
    };
  } catch (error: any) {
    console.error('Error sending artisan notification email:', error);
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
