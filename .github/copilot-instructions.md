# AI Artisan Marketplace - Copilot Instructions

## Project Overview
E-commerce platform connecting local artisans with customers, featuring AI-powered product videos, multilingual chatbot, and real-time notifications. Built with Next.js 15, PostgreSQL (Neon), and n8n automation workflows.

## Architecture Fundamentals

### Core Stack
- **Framework**: Next.js 15 (App Router) with Turbopack
- **Database**: PostgreSQL (Neon) with **raw SQL queries** (NOT Prisma Client)
- **Auth**: JWT-based with role-based access (ADMIN, ARTISAN, CUSTOMER)
- **AI Integration**: n8n webhooks → Google Vertex AI (Veo 3, Gemini)
- **File Storage**: Cloudinary (images/videos)
- **Real-time**: Socket.io for chat and notifications

### Critical Pattern: Database Access
**Always use raw SQL via Neon SQL client, NOT Prisma Client:**
```typescript
// ✅ CORRECT - Use this pattern
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);
const users = await sql`SELECT * FROM users WHERE role = 'ARTISAN'`;

// ❌ WRONG - Don't use Prisma Client
import { prisma } from '@/lib/db/prisma'; // Avoid this
```

**Why**: Schema is managed by Prisma for introspection only. All queries use `@neondatabase/serverless` for edge compatibility and performance.

### Authentication Flow
1. Sign in/up at `/auth/{artisan|customer|admin}`
2. API returns `accessToken` (24h) + `refreshToken` (7d)
3. Store tokens in `localStorage` AND httpOnly cookies
4. Include `Authorization: Bearer ${token}` in API calls
5. Role-based redirects: ARTISAN → `/artisan/dashboard`, CUSTOMER → `/customer/dashboard`, ADMIN → `/dashboard`

**Admin Access**: Use passcode `123456` at `/auth/admin` (hardcoded admin UUID: `00000000-0000-0000-0000-000000000001`)

## Key Workflows

### Video Generation (Vertex AI Veo 3)
**Product Videos**:
1. Admin/Artisan triggers at `/video-generation` or `/artisan/admin-approval`
2. API: `POST /api/products/generate-video` → Sets `video_status = 'PROCESSING'`
3. n8n webhook: `N8N_VIDEO_WEBHOOK_URL` (see `n8n-workflows/product-video-generation-workflow.json`)
4. Workflow: Gemini analyzes product image → Veo 3 generates 7s video → Cloudinary upload
5. Callback: `POST /api/products/video-callback` → Updates `video_url` and `video_status = 'COMPLETED'`
6. Frontend polls `/api/products/video-status` every 10s

**Artisan Documentation Videos** (new feature):
- Similar flow but uses artisan profile data (gender, bio, photograph, artistry description)
- Generates storytelling video with voiceover about the artisan's craft and journey

### n8n Integration Points
All workflows are in `n8n-workflows/` directory:
- **Email Notifications**: Order confirmation, artisan notifications, cart reminders (Gmail via OAuth)
- **Instagram Posting**: Auto-posts enhanced product images
- **Telegram Bot**: Artisan order management and AI chat
- **Video Generation**: Product demos and artisan documentaries

Environment variables for webhooks:
```env
N8N_VIDEO_WEBHOOK_URL=https://n8n-quq4.onrender.com/webhook/generate-product-video
N8N_ORDER_CONFIRMATION_WEBHOOK_URL=...
N8N_ARTISAN_NOTIFICATION_WEBHOOK_URL=...
N8N_INSTAGRAM_WEBHOOK_URL=...
```

### Multilingual Support (English/Hindi)
Uses Google Cloud Translate API:
- Frontend: `useTranslateContent()` hook from `lib/hooks/useTranslateContent`
- Backend: `translateText()` from `lib/language/translate-service`
- User preference stored in `users.language` column
- Chatbot automatically detects and responds in user's language

## Database Schema Essentials

### Users Table
```sql
-- Roles: 'ADMIN' | 'ARTISAN' | 'CUSTOMER'
-- Artisans have: specialty, location, bio, avatar
-- Status: 'ONLINE' | 'OFFLINE' | 'BUSY'
```

### Products Table
```sql
-- video_url, video_status ('NOT_GENERATED' | 'PROCESSING' | 'COMPLETED' | 'FAILED')
-- Owned by artisan (user_id), has image_url, poster_url (Instagram)
```

### Orders Table
```sql
-- shipping_latitude, shipping_longitude (for Google Maps integration)
-- shipment_status, tracking_number, carrier (DHL integration)
```

### Chat System
- `chat_rooms`: Direct or group conversations
- `chat_messages`: Supports TEXT and IMAGE message types
- `admin_messages`: Special table for admin-artisan direct messaging

## File Organization

### API Routes (`app/api/`)
- `auth/`: Sign in, sign up, refresh, profile management
- `products/`: CRUD, video generation, video callbacks
- `orders/`: Create, track, geocode shipping addresses
- `artisan/chatbot/`: AI assistant for artisans (Gemini)
- `admin-chat/`: Real-time admin-artisan messaging
- `upload/`: Cloudinary image uploads

### Dashboards
- `/artisan/`: Products, orders, profile, AI chatbot
- `/customer/`: Browse products, cart, orders, wishlist
- `/dashboard/`: Admin panel (video generation, analytics, messaging)

### Component Patterns
- UI components in `components/ui/` (shadcn/ui)
- Dashboard widgets in `components/dashboard/`
- Use Tailwind CSS with dark theme (`slate-900`, `slate-800`, `orange-500` accents)

## Development Commands

```bash
# Run dev server with Turbopack
npm run dev

# Database operations
npm run db:push      # Push schema to DB (development)
npm run db:studio    # Open Prisma Studio
npm run db:generate  # Regenerate Prisma Client (for introspection only)

# After schema changes
npx prisma generate && Remove-Item -Recurse -Force .next
```

## Common Pitfalls

1. **Don't use Prisma Client queries** - Use raw SQL with Neon
2. **Token storage**: Store in BOTH localStorage AND cookies for flexibility
3. **Role checks**: Use helper functions from `lib/utils/jwt` (`isArtisan()`, `isAdmin()`, etc.)
4. **Video status polling**: Always implement 10s polling when triggering video generation
5. **n8n workflows**: Must be ACTIVE in n8n dashboard for webhooks to work
6. **Environment variables**: Different for local (.env.local) vs production (.env)

## Testing Credentials
- **Admin**: Passcode `123456` at `/auth/admin`
- **Artisan**: `swas@gmail.com` / (check DATABASE_MIGRATION_SUMMARY.md)
- **Customer**: `tejash@gmail.com` / `Tejash@1234`

## Key Files to Reference
- `prisma/schema.prisma`: Database schema (for reference only)
- `lib/db/auth.ts`: User authentication helpers
- `lib/utils/jwt.ts`: Token management and role checks
- `DATABASE_MIGRATION_SUMMARY.md`: Database setup guide
- `EMAIL_NOTIFICATION_SETUP.md`: n8n email workflow setup
- `GOOGLE_MAPS_SETUP.md`: Shipping geocoding setup

## When Adding Features
1. Database changes → Update `schema.prisma` → Run `npx prisma db push`
2. Use raw SQL in API routes, not Prisma Client
3. Role-based access: Check JWT role in API routes
4. File uploads: Use Cloudinary API or n8n workflows
5. AI features: Create n8n workflow → Add webhook URL to env → Trigger from API
6. Always handle multilingual content if user-facing
