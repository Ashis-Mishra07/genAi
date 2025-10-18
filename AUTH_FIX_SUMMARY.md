# Authentication Issue Fix Summary

## Problem
After signup, the JWT token was always showing the admin user (`00000000-0000-0000-0000-000000000001`) instead of the newly created user.

## Root Causes
1. **Old Admin Token in Cookies**: There was likely an old admin token stored in browser cookies that wasn't being cleared before signup/signin.
2. **Missing Admin User in Database**: The cart foreign key constraint was failing because the admin UUID didn't exist in the database.

## Fixes Applied

### 1. Database Fix
Created the admin user in the database:
- **File**: `database/insert-admin-user.js`
- **Action**: Run `node database/insert-admin-user.js` to insert the system admin user
- **Status**: ✅ Script created and ready to run

### 2. Authentication Routes Updates

#### Signup Route (`app/api/auth/signup/route.ts`)
- Added explicit cookie deletion before setting new cookies
- Added detailed logging to track user ID and role
- Ensures old admin tokens are cleared

#### Signin Route (`app/api/auth/signin/route.ts`)
- Added explicit cookie deletion before setting new cookies
- Added detailed logging to track user ID and role
- Ensures old tokens are cleared

#### Customer Auth Page (`app/auth/customer/page.tsx`)
- Added `credentials: 'include'` to ensure cookies are sent/received
- Clear all localStorage tokens before new login/signup
- Added console logging for debugging

## How to Test the Fix

### Step 1: Clear Existing Tokens
1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Delete all cookies for your domain
4. Go to Local Storage and clear it
5. Or simply open an Incognito/Private window

### Step 2: Test Signup
1. Go to customer signup page
2. Create a new account
3. Check the console logs - you should see:
   ```
   Signup: Set auth cookies for new user: [email] ID: [uuid]
   Auth success - User ID: [uuid] Role: CUSTOMER
   ```

### Step 3: Test Cart
1. After signup, try adding a product to cart
2. The user ID in logs should match your new user ID, not the admin ID
3. You should see:
   ```
   JWT: Getting user by ID: [your-new-uuid]
   JWT: User from database: { id: '[your-new-uuid]', email: '[your-email]', role: 'CUSTOMER' }
   ```

## Verification Commands

Run these in your browser console after signup:
```javascript
// Check localStorage
console.log('User ID:', localStorage.getItem('user_id'));
console.log('Access Token:', localStorage.getItem('accessToken')?.substring(0, 20) + '...');

// Check cookies (this won't show httpOnly cookies, which is correct for security)
console.log('Cookies:', document.cookie);
```

## Important Notes

1. **Cookies vs localStorage**: 
   - The server sets httpOnly cookies (secure, can't be accessed by JavaScript)
   - The client also stores tokens in localStorage as backup
   - API requests use cookies automatically when `credentials: 'include'` is set

2. **Token Priority**:
   - Server first checks Authorization header
   - Then checks auth_token cookie
   - This is handled in `lib/utils/jwt.ts` extractTokenFromRequest()

3. **If Issue Persists**:
   - Completely clear browser data for localhost
   - Use Incognito mode
   - Check that cookies are being set (Network tab > Response Headers)
   - Verify JWT payload using jwt.io

## Files Modified
- ✅ `database/insert-admin-user.js` (created)
- ✅ `database/insert-admin-user.sql` (created)
- ✅ `app/api/auth/signup/route.ts` (updated)
- ✅ `app/api/auth/signin/route.ts` (updated)
- ✅ `app/auth/customer/page.tsx` (updated)

## Next Steps
1. Test signup in Incognito window
2. Verify cart operations work with new user
3. Test signin with existing user
4. Verify logout clears cookies properly
