import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL!);

export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: 'ADMIN' | 'ARTISAN' | 'CUSTOMER';
  specialty: string | null;
  location: string | null;
  bio: string | null;
  avatar: string | null;
  status: 'ONLINE' | 'OFFLINE' | 'AWAY';
  isActive: boolean;
  password: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Export AuthUser type for JWT usage
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'ARTISAN' | 'CUSTOMER';
}

interface CreateUserData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  role: 'ADMIN' | 'ARTISAN' | 'CUSTOMER';
  specialty?: string;
  location?: string;
  bio?: string;
  gender?: string;
  photograph?: string;
  origin_place?: string;
  artisan_story?: string;
  work_process?: string;
  expertise_areas?: string;
  artistry_description?: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await sql`
    SELECT 
      id, 
      email, 
      password, 
      name, 
      phone, 
      role, 
      specialty, 
      location, 
      bio, 
      avatar, 
      status, 
      is_active as "isActive",
      last_login_at as "lastLoginAt",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM users 
    WHERE email = ${email} 
    LIMIT 1;
  `;
  return result.length > 0 ? result[0] as User : null;
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  // Handle special admin UUID case and legacy "admin" ID
  const ADMIN_UUID = '00000000-0000-0000-0000-000000000001';
  if (id === ADMIN_UUID || id === 'admin') {
    return {
      id: ADMIN_UUID, // Always return the proper UUID
      email: 'admin@system.local',
      password: null, // Not needed for admin
      name: 'System Administrator',
      phone: null,
      role: 'ADMIN',
      specialty: null,
      location: null,
      bio: null,
      avatar: null,
      status: 'ONLINE',
      isActive: true,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
  }

  const result = await sql`
    SELECT 
      id, 
      email, 
      password, 
      name, 
      phone, 
      role, 
      specialty, 
      location, 
      bio, 
      avatar, 
      status, 
      is_active as "isActive",
      last_login_at as "lastLoginAt",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM users 
    WHERE id = ${id} 
    LIMIT 1;
  `;
  return result.length > 0 ? result[0] as User : null;
}

// Create user
export async function createUser(userData: CreateUserData): Promise<User> {
  const { 
    email, 
    password, 
    name, 
    phone, 
    role, 
    specialty, 
    location, 
    bio,
    gender,
    photograph,
    origin_place,
    artisan_story,
    work_process,
    expertise_areas,
    artistry_description
  } = userData;
  
  let hashedPassword = null;
  if (password) {
    hashedPassword = await hashPassword(password);
  }

  const result = await sql`
    INSERT INTO users (
      email, 
      password, 
      name, 
      phone, 
      role, 
      specialty, 
      location, 
      bio, 
      gender,
      photograph,
      origin_place,
      artisan_story,
      work_process,
      expertise_areas,
      artistry_description,
      is_active, 
      created_at, 
      updated_at
    )
    VALUES (
      ${email}, 
      ${hashedPassword}, 
      ${name}, 
      ${phone}, 
      ${role}, 
      ${specialty}, 
      ${location}, 
      ${bio}, 
      ${gender},
      ${photograph},
      ${origin_place},
      ${artisan_story},
      ${work_process},
      ${expertise_areas},
      ${artistry_description},
      true, 
      NOW(), 
      NOW()
    )
    RETURNING 
      id, 
      email, 
      password, 
      name, 
      phone, 
      role, 
      specialty, 
      location, 
      bio, 
      avatar, 
      status, 
      is_active as "isActive",
      last_login_at as "lastLoginAt",
      created_at as "createdAt",
      updated_at as "updatedAt";
  `;
  
  return result[0] as User;
}

// Update user last login
export async function updateUserLastLogin(userId: string): Promise<void> {
  await sql`
    UPDATE users 
    SET last_login_at = NOW(), updated_at = NOW()
    WHERE id = ${userId};
  `;
}

// Check admin passcode
export async function verifyAdminPasscode(passcode: string): Promise<boolean> {
  const result = await sql`
    SELECT passcode FROM admin_passcodes WHERE is_active = true LIMIT 1;
  `;
  
  if (result.length === 0) return false;
  
  return bcrypt.compare(passcode, result[0].passcode);
}

// Store refresh token
export async function storeRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void> {
  await sql`
    INSERT INTO refresh_tokens (user_id, token_hash, expires_at, created_at)
    VALUES (${userId}, ${token}, ${expiresAt}, NOW());
  `;
}

// Verify refresh token
export async function verifyRefreshToken(token: string): Promise<User | null> {
  const result = await sql`
    SELECT 
      u.id, 
      u.email, 
      u.password, 
      u.name, 
      u.phone, 
      u.role, 
      u.specialty, 
      u.location, 
      u.bio, 
      u.avatar, 
      u.status, 
      u.is_active as "isActive",
      u.last_login_at as "lastLoginAt",
      u.created_at as "createdAt",
      u.updated_at as "updatedAt"
    FROM users u
    JOIN refresh_tokens rt ON u.id = rt.user_id
    WHERE rt.token_hash = ${token} AND rt.expires_at > NOW() AND rt.revoked_at IS NULL
    LIMIT 1;
  `;
  
  return result.length > 0 ? result[0] as User : null;
}

// Revoke refresh token
export async function revokeRefreshToken(token: string): Promise<void> {
  await sql`
    UPDATE refresh_tokens 
    SET revoked_at = NOW()
    WHERE token_hash = ${token};
  `;
}

// Revoke all refresh tokens for a user
export async function revokeAllUserTokens(userId: string): Promise<void> {
  await sql`
    UPDATE refresh_tokens 
    SET is_revoked = true, updated_at = NOW()
    WHERE user_id = ${userId} AND is_revoked = false;
  `;
}

// Update user login status
export async function updateUserLoginStatus(userId: string, status: 'ONLINE' | 'OFFLINE' | 'AWAY'): Promise<void> {
  await sql`
    UPDATE users 
    SET status = ${status}, updated_at = NOW()
    WHERE id = ${userId};
  `;
}

// Create sample users with different roles
export async function createSampleUsersWithRoles(): Promise<void> {
  const hashedPassword = await hashPassword('password123');

  const artisans = [
    { email: 'priya@example.com', name: 'Priya Sharma', specialty: 'Textile & Embroidery', location: 'Rajasthan', bio: 'Traditional textile artisan specializing in block printing and embroidery' },
    { email: 'rajesh@example.com', name: 'Rajesh Kumar', specialty: 'Wood Carving', location: 'Kerala', bio: 'Master wood carver creating traditional Kerala sculptures' },
    { email: 'meera@example.com', name: 'Meera Devi', specialty: 'Pottery', location: 'Gujarat', bio: 'Skilled potter creating beautiful terracotta and ceramic pieces' }
  ];

  const customers = [
    { email: 'john@example.com', name: 'John Smith' },
    { email: 'sarah@example.com', name: 'Sarah Johnson' },
    { email: 'mike@example.com', name: 'Mike Chen' }
  ];

  try {
    // Create artisan users
    for (const artisan of artisans) {
      await sql`
        INSERT INTO users (email, password, name, role, specialty, location, bio, status, is_active)
        VALUES (${artisan.email}, ${hashedPassword}, ${artisan.name}, 'ARTISAN', ${artisan.specialty}, ${artisan.location}, ${artisan.bio}, 'OFFLINE', true)
        ON CONFLICT (email) DO NOTHING;
      `;
    }

    // Create customer users
    for (const customer of customers) {
      await sql`
        INSERT INTO users (email, password, name, role, status, is_active)
        VALUES (${customer.email}, ${hashedPassword}, ${customer.name}, 'CUSTOMER', 'OFFLINE', true)
        ON CONFLICT (email) DO NOTHING;
      `;
    }

    console.log('Sample users created successfully');
  } catch (error) {
    console.error('Error creating sample users:', error);
    throw error;
  }
}