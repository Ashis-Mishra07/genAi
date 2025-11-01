const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function addMissingColumns() {
  console.log("🚀 Adding missing columns to existing tables...\n");

  try {
    // Add artisan documentation columns to users table
    console.log("📦 Adding artisan documentation columns to users table...");
    
    const alterCommands = [
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS photograph TEXT",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20)",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS origin_place VARCHAR(255)",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS artisan_story TEXT",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS artistry_description TEXT",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS work_process TEXT",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS expertise_areas TEXT",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS documentation_video_url TEXT",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS documentation_video_status VARCHAR(20) DEFAULT 'NOT_GENERATED'"
    ];

    for (const command of alterCommands) {
      try {
        await sql.unsafe(command);
        const columnName = command.match(/ADD COLUMN IF NOT EXISTS (\w+)/)[1];
        console.log(`  ✅ Added column: ${columnName}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`  ⏭️  Column already exists`);
        } else {
          console.error(`  ❌ Error:`, error.message);
        }
      }
    }

    // Create admin_messages table if not exists
    console.log("\n📦 Creating admin_messages table...");
    await sql`
      CREATE TABLE IF NOT EXISTS admin_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        artisan_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        message_type VARCHAR(20) DEFAULT 'TEXT',
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log("✅ admin_messages table created");

    // Create indexes for new columns
    console.log("\n📦 Creating indexes for new columns...");
    
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_users_documentation_video_status ON users(documentation_video_status) WHERE documentation_video_status IS NOT NULL`;
      await sql`CREATE INDEX IF NOT EXISTS idx_users_photograph ON users(photograph) WHERE photograph IS NOT NULL`;
      console.log("✅ Indexes for users table created");
    } catch (error) {
      console.error("❌ Error creating users indexes:", error.message);
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_admin_messages_artisan ON admin_messages(artisan_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_admin_messages_sender ON admin_messages(sender_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_admin_messages_created ON admin_messages(created_at DESC)`;
      console.log("✅ Indexes for admin_messages table created");
    } catch (error) {
      console.log("⏭️  Skipping admin_messages indexes (table may not exist yet)");
    }

    // Verify the changes
    console.log("\n📊 Verifying users table structure...");
    const tableInfo = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position
    `;

    console.log("\n✅ Users table columns:");
    tableInfo.forEach((col) => {
      console.log(`   ${col.column_name} (${col.data_type})`);
    });

    console.log("\n🎉 All missing columns added successfully!");

  } catch (error) {
    console.error("❌ Error adding columns:", error);
    process.exit(1);
  }
}

addMissingColumns();
