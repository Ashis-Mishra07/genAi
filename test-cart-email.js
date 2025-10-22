/**
 * Test Cart Addition Email Only
 * Run with: node test-cart-email.js
 */

const https = require('https');

const WEBHOOK_URL = 'https://n8n-quq4.onrender.com/webhook/cart-addition-notification';

// ⚠️ CHANGE THIS TO YOUR TEST EMAIL!
const TEST_EMAIL = 'mohanty.swasthik7@gmail.com';

const cartData = {
  customerName: 'Priya Sharma',
  customerEmail: TEST_EMAIL,
  product: {
    id: 'prod-123',
    name: 'Handcrafted Terracotta Flower Vase',
    price: 899,
    imageUrl: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=300&h=300&fit=crop',
    artisanName: 'Pottery Studio By Ravi'
  },
  quantity: 2,
  cartStats: {
    totalItems: 5,
    totalAmount: 4299
  },
  cartUrl: 'http://localhost:3000/customer/cart',
  continueShoppingUrl: 'http://localhost:3000/products'
};

console.log('\n🧪 Testing Cart Addition Email\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📧 Customer: ${cartData.customerName}`);
console.log(`📧 Email: ${cartData.customerEmail}`);
console.log(`🛍️  Product: ${cartData.product.name}`);
console.log(`💰 Price: ₹${cartData.product.price} × ${cartData.quantity}`);
console.log(`🛒 Cart Total Items: ${cartData.cartStats.totalItems}`);
console.log(`💵 Cart Total Amount: ₹${cartData.cartStats.totalAmount}`);
console.log(`👨‍🎨 Artisan: ${cartData.product.artisanName}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (TEST_EMAIL === 'your-test-email@gmail.com') {
  console.log('⚠️  WARNING: Please update TEST_EMAIL at the top of this file!');
  console.log('   Change it to your actual email address.\n');
  process.exit(1);
}

const data = JSON.stringify(cartData);

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
      console.log('✅ SUCCESS! Cart addition email sent.\n');
      console.log('Response:', responseData);
      console.log('\n📧 Check your inbox for the cart addition email!');
      console.log('   It should show:');
      console.log(`   - Product: ${cartData.product.name}`);
      console.log(`   - Price: ₹${cartData.product.price}`);
      console.log(`   - Cart summary with ${cartData.cartStats.totalItems} items`);
      console.log(`   - Buttons to view cart and continue shopping`);
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
