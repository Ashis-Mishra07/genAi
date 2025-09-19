# Instagram Token Setup Guide

## Current Issue
Your Instagram posting is failing with OAuth errors. This means your access tokens need to be refreshed with proper permissions.

## Required Instagram Permissions
For posting to Instagram Business accounts, you need:
- `instagram_basic`
- `instagram_content_publish`
- `pages_show_list`
- `pages_read_engagement`
- `business_management`

## Steps to Fix:

### 1. Get New Access Token from Facebook Developers
Visit: https://developers.facebook.com/tools/explorer/

1. Select your app: "AI Artisan Marketplace" (App ID: 25255824047353603)
2. Click "Get User Access Token"
3. Select these permissions:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_show_list`
   - `pages_read_engagement`
   - `business_management`
4. Generate token
5. Copy the new token

### 2. Exchange for Long-lived Token
```bash
curl -i -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=25255824047353603&client_secret=6a74a1f1daf8393119e7287f9dad84ee&fb_exchange_token=YOUR_SHORT_LIVED_TOKEN"
```

### 3. Update .env.local
Replace `USER_ACCESS_TOKEN` with your new long-lived token.

### 4. Verify Instagram Business Account Connection
Make sure your Instagram account (ashiskumarmishra1345) is:
- Connected to Facebook Page (714383878434434)
- Set as Instagram Business Account
- Has proper admin permissions

## Current Configuration
- Business Account ID: 17841477359386904
- Facebook Page ID: 714383878434434
- Username: ashiskumarmishra1345

## Quick Test
After updating tokens, test with:
```bash
curl -X GET "https://graph.facebook.com/v18.0/17841477359386904?fields=account_type,username&access_token=YOUR_NEW_TOKEN"
```
