# 🗄️ Database Migration Guide with Prisma

This guide will help you migrate your database to a new provider or reset your current database using Prisma.

## 📦 Prerequisites

First, install the required Prisma dependencies:

```bash
npm install @prisma/client prisma --save-dev
```

## 🚀 Quick Setup Commands

### 1. Generate Prisma Client
```bash
npm run db:generate
```

### 2. Push Schema to Database (for development)
```bash
npm run db:push
```

### 3. Create and Apply Migration (for production)
```bash
npm run db:migrate
```

### 4. Seed Database with Sample Data
```bash
npm run db:seed
```

### 5. View Database in Prisma Studio
```bash
npm run db:studio
```

## 🔄 Migration Scenarios

### Scenario 1: Migrating to a New Database Provider

1. **Update your `.env.local`** with new database URL:
   ```bash
   DATABASE_URL="postgresql://new_user:password@new_host:5432/new_database?sslmode=require"
   DIRECT_URL="postgresql://new_user:password@new_host:5432/new_database?sslmode=require"
   ```

2. **Push schema to new database**:
   ```bash
   npm run db:push
   ```

3. **Seed with initial data**:
   ```bash
   npm run db:seed
   ```

### Scenario 2: Reset Current Database

1. **Reset database and recreate**:
   ```bash
   npm run db:reset
   ```
   This will:
   - Drop the database
   - Recreate it
   - Apply all migrations
   - Run the seed script

### Scenario 3: Production Deployment

1. **Apply migrations**:
   ```bash
   npm run db:deploy
   ```

2. **Generate client**:
   ```bash
   npm run db:generate
   ```

## 🛠️ Manual Migration Steps

If you prefer manual control:

### Step 1: Initialize Prisma (if not already done)
```bash
npx prisma init
```

### Step 2: Introspect Existing Database (Optional)
If you want to pull the current schema from your existing database:
```bash
npm run db:introspect
```

### Step 3: Generate Migration
```bash
npx prisma migrate dev --name initial_migration
```

### Step 4: Apply Migration to Production
```bash
npx prisma migrate deploy
```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema changes to database (dev) |
| `npm run db:migrate` | Create and apply migration (dev) |
| `npm run db:deploy` | Apply migrations (production) |
| `npm run db:reset` | Reset database and reseed |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:introspect` | Pull schema from existing database |
| `npm run db:format` | Format Prisma schema file |

## 🌱 Seeding Data

The seed file (`prisma/seed.js`) includes:
- Admin user with passcode authentication
- Sample customer account
- Multiple artisan users with different specialties
- Sample products for demonstration
- Initial admin messages

### Default Login Credentials:
- **Customer**: `tejash@gmail.com` / `Tejash@1234`
- **Artisan**: `priya.sharma@example.com` / `password123`
- **Admin**: Use passcode `123456`

## 🔍 Using Prisma in Your Code

### Import Prisma Client
```typescript
import { prisma } from '@/lib/prisma'
```

### Example Usage
```typescript
// Get all users
const users = await prisma.user.findMany()

// Create a new product
const product = await prisma.product.create({
  data: {
    name: "Beautiful Handcrafted Vase",
    price: 1500.00,
    artisanId: "user-uuid-here",
    category: "Pottery"
  }
})

// Get orders with items
const orders = await prisma.order.findMany({
  include: {
    orderItems: {
      include: {
        product: true
      }
    },
    customer: true
  }
})
```

## 🚨 Important Notes

1. **Always backup your database** before major migrations
2. **Test migrations** on a development database first
3. **Use environment variables** for database connections
4. **Never commit** database credentials to version control
5. **Run `db:generate`** after schema changes
6. **Use `db:push`** for development, `db:migrate`** for production

## 🆘 Troubleshooting

### Issue: "Cannot find module '@prisma/client'"
**Solution**: Run `npm run db:generate` to generate the client

### Issue: "Database does not exist"
**Solution**: Create the database manually or use `db:push` to create schema

### Issue: "Migration failed"
**Solution**: Check database permissions and connection string

### Issue: "Seed failed"
**Solution**: Ensure database schema exists, run `npm run db:push` first

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)