/**
 * Test script for email notification service
 * Run this to test n8n webhook integration without placing a real order
 * 
 * Usage: node test-email-service.js
 */

// Sample order data for testing
const testOrderData = {
  type: 'order_confirmation',
  timestamp: new Date().toISOString(),
  data: {
    customerEmail: 'mohanty.swastik7008@gmail.com', // CHANGE THIS to your email
    customerName: 'Test Customer',
    orderNumber: `ORD-TEST-${Date.now()}`,
    orderId: `test-${Date.now()}`,
    orderDate: new Date().toISOString(),
    items: [
      {
        name: 'Handcrafted Pottery Vase',
        quantity: 2,
        price: 1299,
        artisanName: 'Ravi Kumar'
      },
      {
        name: 'Woven Cotton Cushion Cover',
        quantity: 3,
        price: 599,
        artisanName: 'Meera Sharma'
      }
    ],
    shippingAddress: {
      fullName: 'Test Customer',
      address: '123 Test Street, Apartment 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: '+91 9876543210'
    },
    paymentMethod: 'cod',
    deliveryMethod: 'express',
    subtotal: 4395,
    shipping: 99,
    tax: 791.1,
    total: 5285.1,
    currency: 'INR'
  }
};

// n8n webhook URL - update this with your actual webhook URL
const WEBHOOK_URL = process.env.N8N_ORDER_EMAIL_WEBHOOK_URL || "https://mui-unsliding-brycen.ngrok-free.dev/webhook-test/order-confirmation";

async function testEmailService() {
  console.log('🧪 Testing Email Service...\n');
  console.log('📧 Sending test order to:', testOrderData.data.customerEmail);
  console.log('🔗 Webhook URL:', WEBHOOK_URL);
  console.log('📦 Order Number:', testOrderData.data.orderNumber);
  console.log('💰 Total Amount: ₹', testOrderData.data.total);
  console.log('\n⏳ Sending webhook...\n');

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrderData),
    });

    console.log('📊 Response Status:', response.status, response.statusText);
    console.log('📋 Response Headers:', Object.fromEntries(response.headers.entries()));

    // Get response text first
    const responseText = await response.text();
    console.log('📄 Raw Response:', responseText.substring(0, 500), responseText.length > 500 ? '...(truncated)' : '');

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}\nResponse: ${responseText}`);
    }

    // Try to parse as JSON
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.warn('⚠️ Response is not JSON, but request succeeded');
      result = { rawResponse: responseText };
    }
    
    console.log('\n✅ SUCCESS! Email sent successfully\n');
    console.log('📨 Response:', JSON.stringify(result, null, 2));
    console.log('\n📬 Check your email inbox:', testOrderData.data.customerEmail);
    console.log('📁 Also check spam/junk folder if not in inbox\n');
    console.log('🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ ERROR: Failed to send email\n');
    console.error('Error details:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('  1. Make sure n8n is running (http://localhost:5678)');
    console.error('  2. Verify the workflow is activated in n8n');
    console.error('  3. Check that the webhook URL is correct');
    console.error('  4. Ensure Gmail credentials are connected in n8n');
    console.error('\n📖 See N8N_EMAIL_SETUP.md for detailed setup instructions');
  }
}

// Run the test
console.log('═══════════════════════════════════════════════════════');
console.log('           EMAIL SERVICE TEST SCRIPT');
console.log('═══════════════════════════════════════════════════════\n');

testEmailService();
