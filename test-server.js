const net = require('net');

console.log('Testing if Neon server is reachable...');

const host = 'ep-solitary-cell-adum4uw9-pooler.c-2.us-east-1.aws.neon.tech';
const port = 5432;

const socket = new net.Socket();

socket.setTimeout(10000); // 10 second timeout

socket.on('connect', () => {
  console.log('✅ Server is reachable! The server is running.');
  socket.destroy();
});

socket.on('timeout', () => {
  console.log('❌ Connection timed out - server might be sleeping or unreachable');
  socket.destroy();
});

socket.on('error', (err) => {
  if (err.code === 'ECONNREFUSED') {
    console.log('❌ Connection refused - server is down or port is closed');
  } else if (err.code === 'ENOTFOUND') {
    console.log('❌ Host not found - DNS resolution failed');
  } else {
    console.log('❌ Connection error:', err.message);
  }
  socket.destroy();
});

socket.connect(port, host);
