/**
 * Test Artisan Order Notification Email Only
 * Run with: node test-artisan-email.js
 */

const https = require('https');

const WEBHOOK_URL = 'https://n8n-quq4.onrender.com/webhook/artisan-order-notification';

// ⚠️ CHANGE THIS TO YOUR TEST EMAIL!
const TEST_EMAIL = 'mohanty.swasthik7@gmail.com';

const artisanData = {
  orderNumber: `ORD-2025-${Date.now().toString().slice(-6)}`,
  artisanName: 'Lakshmi Devi',
  artisanEmail: TEST_EMAIL,
  customerName: 'Rajesh Kumar',
  products: [
    {
      id: 'prod-001',
      name: 'Handwoven Banarasi Silk Saree',
      quantity: 2,
      price: 3500,
      imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&h=300&fit=crop'
    },
    {
      id: 'prod-002',
      name: 'Embroidered Cotton Dupatta',
      quantity: 3,
      price: 850,
      imageUrl: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=300&h=300&fit=crop'
    },
    {
      id: 'prod-003',
      name: 'Traditional Bandhani Stole',
      quantity: 1,
      price: 1200,
      imageUrl: 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=300&h=300&fit=crop'
    }
  ],
  shippingAddress: {
    fullName: 'Rajesh Kumar',
    addressLine1: '456 Park Street',
    addressLine2: 'Apartment 3B',
    city: 'Kolkata',
    state: 'West Bengal',
    postalCode: '700016',
    country: 'India',
    phone: '+91 98765 43210'
  },
  paymentMethod: 'online',
  createdAt: new Date().toISOString(),
  dashboardUrl: 'http://localhost:3000/artisan/dashboard'
};

// Calculate total earnings
const totalEarnings = artisanData.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
const totalItems = artisanData.products.reduce((sum, p) => sum + p.quantity, 0);

console.log('\n🧪 Testing Artisan Order Notification Email\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`👨‍🎨 Artisan: ${artisanData.artisanName}`);
console.log(`📧 Email: ${artisanData.artisanEmail}`);
console.log(`📦 Order Number: ${artisanData.orderNumber}`);
console.log(`🛍️  Products Sold: ${artisanData.products.length} types`);
console.log(`📊 Total Items: ${totalItems}`);
console.log(`💰 Total Earnings: ₹${totalEarnings}`);
console.log(`👤 Customer: ${artisanData.customerName}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (TEST_EMAIL === 'your-test-email@gmail.com') {
  console.log('⚠️  WARNING: Please update TEST_EMAIL at the top of this file!');
  console.log('   Change it to your actual email address.\n');
  process.exit(1);
}

const data = JSON.stringify(artisanData);

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
      console.log('✅ SUCCESS! Artisan notification email sent.\n');
      console.log('Response:', responseData);
      console.log('\n📧 Check your inbox for the artisan notification email!');
      console.log('   It should show:');
      console.log(`   - Products sold: ${artisanData.products.length}`);
      console.log(`   - Earnings: ₹${totalEarnings}`);
      console.log(`   - Customer details: ${artisanData.customerName}`);
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
