// Test script to create a customer account and sign in
// Run this in browser console or as a standalone script

const API_BASE = 'http://localhost:3000';

async function createTestCustomer() {
  console.log('Creating test customer account...');
  
  const signupData = {
    email: 'test@customer.com',
    password: 'TestPass123!',
    name: 'Test Customer',
    phone: '+91 9876543210',
    role: 'CUSTOMER'
  };

  try {
    const response = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Customer account created successfully!');
      console.log('Account details:', {
        email: signupData.email,
        password: signupData.password
      });
      return data;
    } else {
      console.log('❌ Failed to create account:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error creating account:', error);
    return null;
  }
}

async function signInCustomer() {
  console.log('Signing in customer...');
  
  const signinData = {
    email: 'test@customer.com',
    password: 'TestPass123!'
  };

  try {
    const response = await fetch(`${API_BASE}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify(signinData)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Signed in successfully!');
      console.log('User:', data.user);
      return data;
    } else {
      console.log('❌ Failed to sign in:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error signing in:', error);
    return null;
  }
}

async function testAuthentication() {
  console.log('Testing authentication...');
  
  try {
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ User is authenticated:', data.user);
      return data;
    } else {
      console.log('❌ User not authenticated:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error checking auth:', error);
    return null;
  }
}

async function fetchOrders() {
  console.log('Fetching orders...');
  
  try {
    const response = await fetch(`${API_BASE}/api/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Orders fetched successfully:');
      console.log('Orders:', data.orders);
      console.log('Stats:', data.stats);
      return data;
    } else {
      console.log('❌ Failed to fetch orders:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return null;
  }
}

// Main function to run the complete test
async function runCompleteTest() {
  console.log('🚀 Starting complete authentication test...\n');
  
  // Step 1: Create customer account
  await createTestCustomer();
  console.log('\n');
  
  // Step 2: Sign in
  await signInCustomer();
  console.log('\n');
  
  // Step 3: Test authentication
  await testAuthentication();
  console.log('\n');
  
  // Step 4: Fetch orders
  await fetchOrders();
  console.log('\n');
  
  console.log('✅ Test complete! You should now be able to access the orders page.');
}

// Export functions for manual use
if (typeof window !== 'undefined') {
  window.testAuth = {
    createTestCustomer,
    signInCustomer,
    testAuthentication,
    fetchOrders,
    runCompleteTest
  };
  
  console.log('🔧 Authentication test functions loaded!');
  console.log('Run: testAuth.runCompleteTest() to create account and sign in');
}

// Auto-run if in Node.js environment
if (typeof window === 'undefined') {
  runCompleteTest();
}
