# Artisan Documentation Feature - Implementation Guide

## ✅ Completed Features

### 1. Database Schema Updates
**Migration Script**: `run-artisan-migration.js`
**SQL File**: `database/add-artisan-documentation-fields.sql`

**New Fields Added to `users` table:**
- `gender` (VARCHAR(20)) - Artisan's gender for video generation
- `photograph` (TEXT) - URL to artisan's photograph
- `artistry_description` (TEXT) - Detailed description of their craft
- `work_process` (TEXT) - How they create their products
- `expertise_areas` (TEXT) - Comma-separated areas of expertise
- `origin_place` (VARCHAR(255)) - Where the artisan is from
- `artisan_story` (TEXT) - Their personal story and journey
- `documentation_video_url` (TEXT) - URL to generated documentation video
- `documentation_video_status` (VARCHAR(20)) - Video generation status (NOT_GENERATED, PROCESSING, COMPLETED, FAILED)

**Run Migration:**
```bash
node run-artisan-migration.js
```

### 2. Customer Documentation Page
**Location**: `app/customer/artisan-stories/page.tsx`

**Features:**
- Grid view of all artisan cards with photographs
- Play button overlay for artisans with completed videos
- Video status badges (Processing, Coming Soon)
- Click to open fullscreen video modal
- Artisan details display (specialty, location, story, expertise)
- Link to view artisan's products
- Responsive design with hover effects

**Navigation:**
- Added "Artisan Stories" link in customer sidebar (2nd item)
- Icon: Users icon
- Route: `/customer/artisan-stories`

### 3. API Endpoints

#### `/api/artisans` (GET)
Fetches all artisans with documentation details:
- Returns artisans sorted by video status (COMPLETED first)
- Includes all documentation fields
- Only shows active artisans

#### `/api/artisan/generate-documentation-video` (POST)
Triggers video generation for an artisan:
```json
{
  "artisanId": "uuid"
}
```
- Requires authentication (Admin or artisan themselves)
- Updates status to PROCESSING
- Triggers n8n workflow
- Returns workflow response

#### `/api/artisan/video-callback` (POST)
Callback endpoint for n8n workflow:
```json
{
  "artisanId": "uuid",
  "videoUrl": "cloudinary-url",
  "status": "COMPLETED"
}
```
- Updates database with video URL
- Sets status to COMPLETED or FAILED

### 4. n8n Workflow
**File**: `n8n-workflows/artisan-documentation-video-workflow.json`

**Workflow Steps:**
1. **Webhook** - Receives artisan data
2. **Extract Artisan Data** - Parses input payload
3. **Download Photograph** - Fetches artisan photo (if available)
4. **Process Photograph** - Converts to base64
5. **Analyze with Gemini** - AI analyzes photo and creates detailed video prompt
6. **Build Video Prompt** - Constructs context-aware prompt based on artisan data
7. **Vertex AI Veo 3 - Generate** - Generates 7-second video with audio
8. **Wait** - 2-minute wait for video generation
9. **Vertex AI Veo 3 - Fetch** - Retrieves generated video
10. **Convert to File** - Converts base64 to video file
11. **Upload to Cloudinary** - Stores video permanently
12. **Update Database** - Updates artisan record with video URL

**Environment Variable Needed:**
```env
N8N_ARTISAN_VIDEO_WEBHOOK_URL=https://n8n-quq4.onrender.com/webhook/generate-artisan-video
GEMINI_API_KEY=your_gemini_api_key
```

**Video Features:**
- Analyzes artisan photograph for accurate representation
- Falls back to faceless craft-focused video if no photo
- Includes audio narration
- Shows craft process, tools, and artisan at work
- 7-second duration, 9:16 aspect ratio
- Cinematic documentary style

### 5. Prisma Schema Updates
**File**: `prisma/schema.prisma`

Updated `users` model with all documentation fields. Run after schema changes:
```bash
npx prisma generate
Remove-Item -Recurse -Force .next
```

## 🔧 Setup Instructions

### Step 1: Run Database Migration
```bash
node run-artisan-migration.js
```

### Step 2: Import n8n Workflow
1. Open n8n: https://n8n-quq4.onrender.com
2. Import `n8n-workflows/artisan-documentation-video-workflow.json`
3. Configure credentials:
   - Google Service Account (for Vertex AI)
   - Cloudinary API
   - PostgreSQL (Neon)
4. Set Gemini API key in environment
5. Activate the workflow
6. Copy webhook URL

### Step 3: Update Environment Variables
Add to `.env.local`:
```env
N8N_ARTISAN_VIDEO_WEBHOOK_URL=https://your-n8n-instance/webhook/generate-artisan-video
```

### Step 4: Test the Feature
1. Start dev server: `npm run dev`
2. Sign in as a customer
3. Navigate to "Artisan Stories" in sidebar
4. View artisan cards

## 📋 TODO: Enhance Artisan Signup Form

### Update Required Files:

#### 1. `app/auth/artisan/page.tsx`
Add form fields for signup:
- Gender (radio buttons: Male/Female/Other)
- Photograph upload (Cloudinary)
- Origin Place (text input)
- Artistry Description (textarea)
- Work Process (textarea)
- Expertise Areas (comma-separated input)
- Artisan Story (textarea)

#### 2. `app/api/auth/signup/route.ts`
Update to handle new fields:
- Accept photograph as file upload OR URL
- Store all new artisan fields
- Set `documentation_video_status` to 'NOT_GENERATED'

#### 3. Artisan Profile Page Enhancement
Add "Generate Documentation Video" button:
- Located in `/app/artisan/profile/page.tsx`
- Calls `/api/artisan/generate-documentation-video`
- Shows video status and preview when completed
- Polls for video completion

## 🎯 User Flow

### For Customers:
1. Navigate to "Artisan Stories" in sidebar
2. Browse artisan cards with photos and details
3. Click on artisan card (if video is ready)
4. Watch fullscreen documentary video
5. View artisan's story, expertise, and details
6. Click "View Products" to see their work

### For Artisans (Future):
1. Sign up with detailed information
2. Upload photograph (optional but recommended)
3. Fill in craft story, process, expertise
4. Navigate to profile
5. Click "Generate My Story Video"
6. Wait 2-5 minutes for AI video generation
7. Video appears on profile and customer page

### For Admins (Future):
1. View all artisans
2. Generate documentation videos for artisans
3. Manage video status
4. Review and approve content

## 🎨 Design Highlights

- **Dark Theme**: Slate-900 background with orange-500 accents
- **Card Grid**: Responsive 1/2/3 column layout
- **Video Modal**: Fullscreen with artisan details below
- **Play Button Overlay**: Prominent call-to-action
- **Status Badges**: Clear visual indicators
- **Hover Effects**: Smooth transitions and scale effects

## 🚀 Next Steps

1. **Update Artisan Signup Form** - Add all documentation fields
2. **Artisan Profile Enhancement** - Add video generation button
3. **Admin Dashboard Integration** - Bulk video generation
4. **Analytics** - Track video views and engagement
5. **Multilingual Support** - Translate artisan stories
6. **Social Sharing** - Share artisan videos on social media

## 📞 Testing

### Test Data Required:
- At least one artisan with photograph
- Artisan with specialty, location, story filled
- n8n workflow active and configured

### Test Endpoints:
```bash
# Get all artisans
curl -X GET http://localhost:3000/api/artisans \
  -H "Authorization: Bearer YOUR_TOKEN"

# Generate video
curl -X POST http://localhost:3000/api/artisan/generate-documentation-video \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"artisanId":"ARTISAN_UUID"}'
```

## 🔐 Security

- Authentication required for video generation
- Only admin or artisan themselves can generate documentation
- Customer page is publicly accessible
- Video URLs are stored in Cloudinary (CDN)

## 📊 Database Queries

```sql
-- View all artisans with documentation
SELECT name, specialty, documentation_video_status, documentation_video_url
FROM users
WHERE role = 'ARTISAN';

-- Count videos by status
SELECT documentation_video_status, COUNT(*)
FROM users
WHERE role = 'ARTISAN'
GROUP BY documentation_video_status;

-- Find artisans ready for video generation
SELECT id, name, specialty, photograph, artisan_story
FROM users
WHERE role = 'ARTISAN'
AND documentation_video_status = 'NOT_GENERATED'
AND photograph IS NOT NULL
AND artisan_story IS NOT NULL;
```

---

**Implementation Date**: October 28, 2025
**Status**: Core feature complete, signup form enhancement pending
**Documentation**: Updated in `.github/copilot-instructions.md`
