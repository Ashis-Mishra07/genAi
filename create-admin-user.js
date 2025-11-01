/**
 * Script to create an admin user in the database
 * Run with: node create-admin-user.js
 */

const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

async function createAdminUser() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log("Creating admin user...");

    // Check if admin already exists
    const existing = await sql`
      SELECT id, email, name, role FROM users WHERE role = 'ADMIN' LIMIT 1
    `;

    if (existing.length > 0) {
      console.log("✓ Admin user already exists:");
      console.log("  ID:", existing[0].id);
      console.log("  Email:", existing[0].email);
      console.log("  Name:", existing[0].name);
      return;
    }

    // Create admin user with the same ID used in admin_messages table
    const result = await sql`
      INSERT INTO users (
        id,
        email, 
        name, 
        role, 
        status,
        specialty,
        location,
        is_active
      ) VALUES (
        '00000000-0000-0000-0000-000000000001',
        'admin@system.local',
        'System Administrator',
        'ADMIN',
        'ONLINE',
        'Platform Management',
        'Headquarters',
        true
      )
      ON CONFLICT (id) DO UPDATE SET
        role = 'ADMIN',
        is_active = true,
        status = 'ONLINE'
      RETURNING id, email, name, role
    `;

    console.log("✓ Admin user created successfully:");
    console.log("  ID:", result[0].id);
    console.log("  Email:", result[0].email);
    console.log("  Name:", result[0].name);
    console.log("  Role:", result[0].role);
    console.log("\nYou can now use the /api/chat/users endpoint!");
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
}

createAdminUser();
