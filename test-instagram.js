require('dotenv').config({ path: '.env.local' });
const InstagramPoster = require('./lib/instagram-poster.js');

async function testInstagramConnection() {
  try {
    console.log('🔍 Testing Instagram connection...');
    
    const poster = new InstagramPoster();
    const connectionOk = await poster.testConnection();
    
    if (connectionOk) {
      console.log('✅ Instagram API connection successful!');
      console.log('🎉 Ready to post generated images to Instagram!');
    } else {
      console.log('❌ Instagram API connection failed.');
      console.log('💡 Please check your Instagram credentials in .env.local');
    }
    
    return connectionOk;
  } catch (error) {
    console.error('❌ Error testing Instagram connection:', error.message);
    return false;
  }
}

if (require.main === module) {
  testInstagramConnection();
}

module.exports = testInstagramConnection;
