// Mock user data for offline authentication
export const MOCK_USERS = [
  {
    id: '5a1ce90c-a272-4009-948e-097a82010bba',
    email: 'tejash@gmail.com',
    password: 'Tejash@1234', // Plain text for demo - would be hashed in production
    name: 'tejash kumar',
    role: 'CUSTOMER' as const,
    isActive: true
  },
  {
    id: 'artisan-1',
    email: 'priya@example.com',
    password: 'password123',
    name: 'Priya Sharma',
    role: 'ARTISAN' as const,
    specialty: 'Textile & Embroidery',
    isActive: true
  },
  {
    id: 'admin-1',
    email: 'admin@system.com',
    password: 'admin123',
    name: 'System Administrator',
    role: 'ADMIN' as const,
    isActive: true
  }
];

export function findMockUser(email: string): typeof MOCK_USERS[0] | null {
  return MOCK_USERS.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
}

export function validateMockPassword(plainPassword: string, userPassword: string): boolean {
  return plainPassword === userPassword;
}