/**
 * Test Order Confirmation Email Only
 * Run with: node test-order-email.js
 */

const https = require('https');

const WEBHOOK_URL = 'https://n8n-quq4.onrender.com/webhook/order-confirmation';

// ⚠️ CHANGE THIS TO YOUR TEST EMAIL!
const TEST_EMAIL = 'mohanty.swasthik7@gmail.com';

const orderData = {
  orderNumber: `ORD-2025-${Date.now().toString().slice(-6)}`,
  customerName: 'Test Customer',
  customerEmail: TEST_EMAIL,
  items: [
    {
      id: 'prod-001',
      name: 'Handwoven Silk Saree - Blue',
      quantity: 1,
      price: 2500,
      imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&h=300&fit=crop',
      artisanName: 'Lakshmi Textiles'
    },
    {
      id: 'prod-002',
      name: 'Brass Diya Set (Pack of 4)',
      quantity: 2,
      price: 450,
      imageUrl: 'https://images.unsplash.com/photo-1589216532372-f2e9d682d2f1?w=300&h=300&fit=crop',
      artisanName: 'Kumar Metalworks'
    },
    {
      id: 'prod-003',
      name: 'Wooden Carved Elephant',
      quantity: 1,
      price: 1200,
      imageUrl: 'https://images.unsplash.com/photo-1580982324626-8e4d3c0c475e?w=300&h=300&fit=crop',
      artisanName: 'Rajesh Wood Crafts'
    }
  ],
  subtotal: 4600,
  shipping: 0, // Free shipping over ₹500
  total: 4600,
  shippingAddress: {
    fullName: 'Test Customer',
    addressLine1: '123 MG Road',
    addressLine2: 'Near City Mall, 2nd Floor',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400001',
    country: 'India',
    phone: '+91 98765 43210'
  },
  paymentMethod: 'cod',
  createdAt: new Date().toISOString(),
  trackOrderUrl: 'http://localhost:3000/customer/orders'
};

console.log('\n🧪 Testing Order Confirmation Email\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📧 Recipient: ${orderData.customerEmail}`);
console.log(`📦 Order Number: ${orderData.orderNumber}`);
console.log(`💰 Total: ₹${orderData.total}`);
console.log(`📋 Items: ${orderData.items.length}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (TEST_EMAIL === 'your-test-email@gmail.com') {
  console.log('⚠️  WARNING: Please update TEST_EMAIL at the top of this file!');
  console.log('   Change it to your actual email address.\n');
  process.exit(1);
}

const data = JSON.stringify(orderData);

const urlObj = new URL(WEBHOOK_URL);
const options = {
  hostname: urlObj.hostname,
  port: 443,
  path: urlObj.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

console.log('📤 Sending request to n8n webhook...\n');

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✅ SUCCESS! Email sent.\n');
      console.log('Response:', responseData);
      console.log('\n📧 Check your inbox for the order confirmation email!');
      console.log('   (Check spam folder if you don\'t see it)\n');
    } else {
      console.log('❌ FAILED! Status code:', res.statusCode);
      console.log('Response:', responseData, '\n');
    }
  });
});

req.on('error', (error) => {
  console.log('❌ ERROR:', error.message, '\n');
  console.log('Possible issues:');
  console.log('  - n8n workflow is not active');
  console.log('  - Webhook URL is incorrect');
  console.log('  - Network connectivity issues');
  console.log('  - Gmail credentials not configured in n8n\n');
});

req.write(data);
req.end();
