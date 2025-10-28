# Fix Prisma Client Initialization

## Quick Fix Steps

If you see the error: `@prisma/client did not initialize yet`

Run these commands in PowerShell:

```powershell
# 1. Generate Prisma Client
npx prisma generate

# 2. Clear Next.js cache
Remove-Item -Recurse -Force .next

# 3. Restart your development server
# Press Ctrl+C to stop the current server, then run:
npm run dev
```

## Why This Happens

1. **After schema changes** - Prisma client needs regeneration
2. **After adding new files** - Next.js cache needs clearing
3. **Module resolution** - Turbopack needs to rebuild with new client

## Verify It's Working

After restarting the dev server:

1. Open your browser and navigate to the artisan dashboard
2. Click the floating chatbot button (bottom-right)
3. Type a message like "How many products do I have?"
4. You should get a response without errors

## Troubleshooting

### If the error persists:

```powershell
# Full clean rebuild
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules/.prisma
Remove-Item -Recurse -Force node_modules/@prisma
npm install
npx prisma generate
npm run dev
```

### Check Prisma Client Installation

```powershell
# Verify Prisma client exists
Test-Path node_modules/@prisma/client

# Should return: True
```

### Check Environment Variables

Make sure `.env` file has:
```env
DATABASE_URL="your_database_url"
JWT_SECRET="your_jwt_secret"
GEMINI_API_KEY="your_gemini_key"
```

## Development Workflow

When you make changes to `prisma/schema.prisma`:

```powershell
# 1. Generate client
npx prisma generate

# 2. Push schema changes (if needed)
npx prisma db push

# 3. Clear cache and restart
Remove-Item -Recurse -Force .next
# Restart dev server
```

## Production Deployment

For production builds, ensure:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

This ensures Prisma client is always generated before building.
