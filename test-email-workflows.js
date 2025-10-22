/**
 * Test Email Workflows - Tests all 3 email notification workflows
 * Run with: node test-email-workflows.js
 */

const https = require('https');
const http = require('http');

// Load environment variables (you can hardcode for testing)
const WEBHOOK_URLS = {
  orderConfirmation: 'https://n8n-quq4.onrender.com/webhook/order-confirmation',
  artisanNotification: 'https://n8n-quq4.onrender.com/webhook/artisan-order-notification',
  cartAddition: 'https://n8n-quq4.onrender.com/webhook/cart-addition-notification'
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Helper function to make POST requests
 */
function postToWebhook(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(data))
      }
    };

    const client = urlObj.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({
            success: true,
            statusCode: res.statusCode,
            data: responseData
          });
        } else {
          reject({
            success: false,
            statusCode: res.statusCode,
            error: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject({
        success: false,
        error: error.message
      });
    });

    req.write(JSON.stringify(data));
    req.end();
  });
}

/**
 * Test 1: Order Confirmation Email
 */
async function testOrderConfirmation() {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}📧 Test 1: Order Confirmation Email${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  const orderData = {
    orderNumber: 'ORD-2025-TEST001',
    customerName: 'John Doe',
    customerEmail: 'mohanty.swasthik7@gmail.com', // Change this to your test email
    items: [
      {
        id: 'prod-001',
        name: 'Handwoven Silk Saree',
        quantity: 1,
        price: 2500,
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300',
        artisanName: 'Lakshmi Textiles'
      },
      {
        id: 'prod-002',
        name: 'Brass Diya Set',
        quantity: 2,
        price: 450,
        imageUrl: 'https://images.unsplash.com/photo-1589216532372-f2e9d682d2f1?w=300',
        artisanName: 'Kumar Metalworks'
      }
    ],
    subtotal: 3400,
    shipping: 0,
    total: 3400,
    shippingAddress: {
      fullName: 'John Doe',
      addressLine1: '123 MG Road',
      addressLine2: 'Near City Mall',
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

  try {
    console.log(`${colors.yellow}Sending request to:${colors.reset} ${WEBHOOK_URLS.orderConfirmation}`);
    console.log(`${colors.yellow}Customer Email:${colors.reset} ${orderData.customerEmail}`);
    console.log(`${colors.yellow}Order Number:${colors.reset} ${orderData.orderNumber}`);
    console.log(`${colors.yellow}Total Items:${colors.reset} ${orderData.items.length}`);
    console.log(`${colors.yellow}Total Amount:${colors.reset} ₹${orderData.total}\n`);

    const result = await postToWebhook(WEBHOOK_URLS.orderConfirmation, orderData);
    
    console.log(`${colors.green}✓ SUCCESS!${colors.reset}`);
    console.log(`Status Code: ${result.statusCode}`);
    console.log(`Response: ${result.data}`);
  } catch (error) {
    console.log(`${colors.red}✗ FAILED!${colors.reset}`);
    console.log(`Error: ${error.error || error.message}`);
    if (error.statusCode) {
      console.log(`Status Code: ${error.statusCode}`);
    }
  }
}

/**
 * Test 2: Artisan Order Notification
 */
async function testArtisanNotification() {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}📧 Test 2: Artisan Order Notification${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  const artisanData = {
    orderNumber: 'ORD-2025-TEST001',
    artisanName: 'Lakshmi',
    artisanEmail: 'mohanty.swasthik7@gmail.com', // Change this to your test email
    customerName: 'John Doe',
    products: [
      {
        id: 'prod-001',
        name: 'Handwoven Silk Saree',
        quantity: 1,
        price: 2500,
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300'
      },
      {
        id: 'prod-003',
        name: 'Cotton Kurta Set',
        quantity: 2,
        price: 800,
        imageUrl: 'https://images.unsplash.com/photo-1583391733981-48a23ef40b8b?w=300'
      }
    ],
    shippingAddress: {
      fullName: 'John Doe',
      addressLine1: '123 MG Road',
      addressLine2: 'Near City Mall',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India',
      phone: '+91 98765 43210'
    },
    paymentMethod: 'cod',
    createdAt: new Date().toISOString(),
    dashboardUrl: 'http://localhost:3000/artisan/dashboard'
  };

  // Calculate total earnings
  const totalEarnings = artisanData.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

  try {
    console.log(`${colors.yellow}Sending request to:${colors.reset} ${WEBHOOK_URLS.artisanNotification}`);
    console.log(`${colors.yellow}Artisan Email:${colors.reset} ${artisanData.artisanEmail}`);
    console.log(`${colors.yellow}Artisan Name:${colors.reset} ${artisanData.artisanName}`);
    console.log(`${colors.yellow}Order Number:${colors.reset} ${artisanData.orderNumber}`);
    console.log(`${colors.yellow}Products Sold:${colors.reset} ${artisanData.products.length}`);
    console.log(`${colors.yellow}Total Earnings:${colors.reset} ₹${totalEarnings}\n`);

    const result = await postToWebhook(WEBHOOK_URLS.artisanNotification, artisanData);
    
    console.log(`${colors.green}✓ SUCCESS!${colors.reset}`);
    console.log(`Status Code: ${result.statusCode}`);
    console.log(`Response: ${result.data}`);
  } catch (error) {
    console.log(`${colors.red}✗ FAILED!${colors.reset}`);
    console.log(`Error: ${error.error || error.message}`);
    if (error.statusCode) {
      console.log(`Status Code: ${error.statusCode}`);
    }
  }
}

/**
 * Test 3: Cart Addition Email
 */
async function testCartAddition() {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}📧 Test 3: Cart Addition Email${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  const cartData = {
    customerName: 'Jane Smith',
    customerEmail: 'mohanty.swasthik7@gmail.com', // Change this to your test email
    product: {
      id: 'prod-004',
      name: 'Terracotta Flower Vase',
      price: 899,
      imageUrl: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=300',
      artisanName: 'Pottery Studio'
    },
    quantity: 1,
    cartStats: {
      totalItems: 3,
      totalAmount: 2599
    },
    cartUrl: 'http://localhost:3000/customer/cart',
    continueShoppingUrl: 'http://localhost:3000/products'
  };

  try {
    console.log(`${colors.yellow}Sending request to:${colors.reset} ${WEBHOOK_URLS.cartAddition}`);
    console.log(`${colors.yellow}Customer Email:${colors.reset} ${cartData.customerEmail}`);
    console.log(`${colors.yellow}Product:${colors.reset} ${cartData.product.name}`);
    console.log(`${colors.yellow}Price:${colors.reset} ₹${cartData.product.price}`);
    console.log(`${colors.yellow}Cart Total Items:${colors.reset} ${cartData.cartStats.totalItems}`);
    console.log(`${colors.yellow}Cart Total Amount:${colors.reset} ₹${cartData.cartStats.totalAmount}\n`);

    const result = await postToWebhook(WEBHOOK_URLS.cartAddition, cartData);
    
    console.log(`${colors.green}✓ SUCCESS!${colors.reset}`);
    console.log(`Status Code: ${result.statusCode}`);
    console.log(`Response: ${result.data}`);
  } catch (error) {
    console.log(`${colors.red}✗ FAILED!${colors.reset}`);
    console.log(`Error: ${error.error || error.message}`);
    if (error.statusCode) {
      console.log(`Status Code: ${error.statusCode}`);
    }
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log(`\n${colors.green}╔════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.green}║   Email Workflow Testing Suite                        ║${colors.reset}`);
  console.log(`${colors.green}║   Testing all 3 n8n email notification workflows      ║${colors.reset}`);
  console.log(`${colors.green}╚════════════════════════════════════════════════════════╝${colors.reset}`);
  
  console.log(`\n${colors.yellow}⚠️  IMPORTANT: Update test emails before running!${colors.reset}`);
  console.log(`${colors.yellow}   Edit this file and change:${colors.reset}`);
  console.log(`${colors.yellow}   - mohanty.swasthik7@gmail.com${colors.reset}`);
  console.log(`${colors.yellow}   - mohanty.swasthik7@gmail.com${colors.reset}`);
  console.log(`${colors.yellow}   To your actual test email addresses.${colors.reset}\n`);

  console.log(`${colors.cyan}Testing against n8n instance:${colors.reset}`);
  console.log(`${colors.cyan}https://n8n-quq4.onrender.com${colors.reset}\n`);

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  try {
    // Test 1: Order Confirmation
    await testOrderConfirmation();
    await delay(2000); // Wait 2 seconds between tests

    // Test 2: Artisan Notification
    await testArtisanNotification();
    await delay(2000);

    // Test 3: Cart Addition
    await testCartAddition();

    // Summary
    console.log(`\n${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.green}✓ All tests completed!${colors.reset}`);
    console.log(`${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`\n${colors.yellow}Next steps:${colors.reset}`);
    console.log(`${colors.cyan}1. Check your email inbox for test emails${colors.reset}`);
    console.log(`${colors.cyan}2. Verify email formatting looks correct${colors.reset}`);
    console.log(`${colors.cyan}3. Check n8n execution logs for any errors${colors.reset}`);
    console.log(`${colors.cyan}4. Test with real orders in your application${colors.reset}\n`);

  } catch (error) {
    console.error(`\n${colors.red}Fatal error running tests:${colors.reset}`, error);
  }
}

// Run the tests
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testOrderConfirmation,
  testArtisanNotification,
  testCartAddition,
  runAllTests
};
