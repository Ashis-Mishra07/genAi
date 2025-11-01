const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// Old database connection
const OLD_DB_URL = 'postgresql://neondb_owner:npg_1ciSWIPJFz4x@ep-hidden-silence-adt1vpgf-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// New database connection (from .env)
const NEW_DB_URL = "postgresql://neondb_owner:npg_5hADVX3ZEziP@ep-small-firefly-ahuvp52g-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const oldDb = neon(OLD_DB_URL);
const newDb = neon(NEW_DB_URL);

async function migrateData() {
  console.log('🚀 Starting data migration...\n');

  try {
    // 1. Migrate Users
    console.log('📦 Migrating users...');
    const users = await oldDb`SELECT * FROM users ORDER BY created_at`;
    console.log(`Found ${users.length} users`);
    
    for (const user of users) {
      await newDb`
        INSERT INTO users (
          id, email, name, phone, specialty, location, avatar, status, 
          last_seen, language, created_at, updated_at, password, role, 
          is_active, last_login_at, bio
        ) VALUES (
          ${user.id}, ${user.email}, ${user.name}, ${user.phone}, 
          ${user.specialty}, ${user.location}, ${user.avatar}, ${user.status},
          ${user.last_seen}, ${user.language}, ${user.created_at}, ${user.updated_at},
          ${user.password}, ${user.role}, ${user.is_active}, ${user.last_login_at}, ${user.bio}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }
    console.log('✅ Users migrated\n');

    // 2. Migrate Products
    console.log('📦 Migrating products...');
    const products = await oldDb`SELECT * FROM products ORDER BY created_at`;
    console.log(`Found ${products.length} products`);
    
    for (const product of products) {
      await newDb`
        INSERT INTO products (
          id, name, description, story, price, currency, image_url, poster_url,
          video_url, video_status, video_generation_id, category, tags, 
          is_active, user_id, created_at, updated_at
        ) VALUES (
          ${product.id}, ${product.name}, ${product.description}, ${product.story},
          ${product.price}, ${product.currency}, ${product.image_url}, ${product.poster_url},
          ${product.video_url}, ${product.video_status}, ${product.video_generation_id},
          ${product.category}, ${product.tags}, ${product.is_active}, ${product.user_id},
          ${product.created_at}, ${product.updated_at}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }
    console.log('✅ Products migrated\n');

    // 3. Migrate Orders
    console.log('📦 Migrating orders...');
    const orders = await oldDb`SELECT * FROM orders ORDER BY created_at`;
    console.log(`Found ${orders.length} orders`);
    
    for (const order of orders) {
      await newDb`
        INSERT INTO orders (
          id, order_number, status, total, currency, user_id, 
          created_at, updated_at, customer_id, shipping_address, payment_method
        ) VALUES (
          ${order.id}, ${order.order_number}, ${order.status}, ${order.total},
          ${order.currency}, ${order.user_id}, ${order.created_at}, ${order.updated_at},
          ${order.customer_id}, ${order.shipping_address}, ${order.payment_method}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }
    console.log('✅ Orders migrated\n');

    // 4. Migrate Order Items
    console.log('📦 Migrating order items...');
    const orderItems = await oldDb`SELECT * FROM order_items ORDER BY created_at`;
    console.log(`Found ${orderItems.length} order items`);
    
    for (const item of orderItems) {
      await newDb`
        INSERT INTO order_items (
          id, order_id, product_id, quantity, price, created_at, name, artisan_name
        ) VALUES (
          ${item.id}, ${item.order_id}, ${item.product_id}, ${item.quantity},
          ${item.price}, ${item.created_at}, ${item.name}, ${item.artisan_name}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }
    console.log('✅ Order items migrated\n');

    // 5. Migrate Cart Items
    console.log('📦 Migrating cart items...');
    const cartItems = await oldDb`SELECT * FROM cart_items ORDER BY created_at`;
    console.log(`Found ${cartItems.length} cart items`);
    
    for (const item of cartItems) {
      await newDb`
        INSERT INTO cart_items (
          id, user_id, product_id, quantity, created_at, updated_at
        ) VALUES (
          ${item.id}, ${item.user_id}, ${item.product_id}, ${item.quantity},
          ${item.created_at}, ${item.updated_at}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }
    console.log('✅ Cart items migrated\n');

    // 6. Migrate Chat Rooms
    console.log('📦 Migrating chat rooms...');
    const chatRooms = await oldDb`SELECT * FROM chat_rooms ORDER BY created_at`;
    console.log(`Found ${chatRooms.length} chat rooms`);
    
    for (const room of chatRooms) {
      await newDb`
        INSERT INTO chat_rooms (
          id, name, type, created_at, updated_at
        ) VALUES (
          ${room.id}, ${room.name}, ${room.type}, ${room.created_at}, ${room.updated_at}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }
    console.log('✅ Chat rooms migrated\n');

    // 7. Migrate Chat Messages
    console.log('📦 Migrating chat messages...');
    const chatMessages = await oldDb`SELECT * FROM chat_messages ORDER BY created_at`;
    console.log(`Found ${chatMessages.length} chat messages`);
    
    for (const message of chatMessages) {
      await newDb`
        INSERT INTO chat_messages (
          id, room_id, sender_id, message_type, content, image_url, 
          status, metadata, created_at, updated_at
        ) VALUES (
          ${message.id}, ${message.room_id}, ${message.sender_id}, ${message.message_type},
          ${message.content}, ${message.image_url}, ${message.status}, ${message.metadata},
          ${message.created_at}, ${message.updated_at}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }
    console.log('✅ Chat messages migrated\n');

    // 8. Migrate Notifications
    console.log('📦 Migrating notifications...');
    const notifications = await oldDb`SELECT * FROM notifications ORDER BY created_at`;
    console.log(`Found ${notifications.length} notifications`);
    
    for (const notification of notifications) {
      await newDb`
        INSERT INTO notifications (
          id, user_id, type, title, message, data, is_read, created_at
        ) VALUES (
          ${notification.id}, ${notification.user_id}, ${notification.type}, 
          ${notification.title}, ${notification.message}, ${notification.data},
          ${notification.is_read}, ${notification.created_at}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }
    console.log('✅ Notifications migrated\n');

    // 9. Migrate Admin Passcodes
    console.log('📦 Migrating admin passcodes...');
    const passcodes = await oldDb`SELECT * FROM admin_passcodes ORDER BY created_at`;
    console.log(`Found ${passcodes.length} admin passcodes`);
    
    for (const passcode of passcodes) {
      await newDb`
        INSERT INTO admin_passcodes (
          id, passcode, is_active, created_at, expires_at, used_count, max_uses
        ) VALUES (
          ${passcode.id}, ${passcode.passcode}, ${passcode.is_active}, 
          ${passcode.created_at}, ${passcode.expires_at}, ${passcode.used_count}, ${passcode.max_uses}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }
    console.log('✅ Admin passcodes migrated\n');

    // 10. Migrate Product Inquiries
    console.log('📦 Migrating product inquiries...');
    const inquiries = await oldDb`SELECT * FROM product_inquiries ORDER BY created_at`;
    console.log(`Found ${inquiries.length} product inquiries`);
    
    for (const inquiry of inquiries) {
      await newDb`
        INSERT INTO product_inquiries (
          id, product_id, customer_id, buyer_name, buyer_email, buyer_phone,
          message, source, status, created_at, updated_at
        ) VALUES (
          ${inquiry.id}, ${inquiry.product_id}, ${inquiry.customer_id}, 
          ${inquiry.buyer_name}, ${inquiry.buyer_email}, ${inquiry.buyer_phone},
          ${inquiry.message}, ${inquiry.source}, ${inquiry.status}, 
          ${inquiry.created_at}, ${inquiry.updated_at}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }
    console.log('✅ Product inquiries migrated\n');

    console.log('🎉 Data migration completed successfully!\n');
    
    // Print summary
    const newProductCount = await newDb`SELECT COUNT(*) as count FROM products`;
    const newUserCount = await newDb`SELECT COUNT(*) as count FROM users`;
    const newOrderCount = await newDb`SELECT COUNT(*) as count FROM orders`;
    
    console.log('📊 Summary:');
    console.log(`   Users: ${newUserCount[0].count}`);
    console.log(`   Products: ${newProductCount[0].count}`);
    console.log(`   Orders: ${newOrderCount[0].count}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateData();
