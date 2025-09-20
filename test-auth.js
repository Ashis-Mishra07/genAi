// Simple test to check authentication status
console.log('Testing authentication...');

// Test if user is authenticated by checking the /api/orders endpoint
fetch('http://localhost:3000/api/orders', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Include cookies
})
.then(response => {
  console.log('Response status:', response.status);
  if (response.status === 401) {
    console.log('❌ User is not authenticated - need to log in');
  } else if (response.ok) {
    console.log('✅ User is authenticated');
    return response.json();
  } else {
    console.log('❓ Other error:', response.status);
  }
  return response.text();
})
.then(data => {
  console.log('Response data:', data);
})
.catch(error => {
  console.error('Error:', error);
});
