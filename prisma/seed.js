const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin passcode
  console.log('🔐 Creating admin passcode...');
  const hashedPasscode = await bcrypt.hash('123456', 10);
  
  const adminPasscode = await prisma.adminPasscode.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      passcode: hashedPasscode,
      isActive: true,
      maxUses: 1000,
      usedCount: 0,
    },
  });

  // Create sample users
  console.log('👥 Creating sample users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@artisan-marketplace.com' },
    update: {},
    create: {
      email: 'admin@artisan-marketplace.com',
      name: 'Admin',
      role: 'ADMIN',
      specialty: 'Platform Management',
      location: 'India',
      status: 'ONLINE',
      isActive: true,
    },
  });

  // Create sample customer
  const customerUser = await prisma.user.upsert({
    where: { email: 'tejash@gmail.com' },
    update: {},
    create: {
      email: 'tejash@gmail.com',
      passwordHash: await bcrypt.hash('Tejash@1234', 10),
      name: 'Tejash Kumar',
      role: 'CUSTOMER',
      isActive: true,
    },
  });

  // Create sample artisans
  const artisans = [
    {
      email: 'priya.sharma@example.com',
      name: 'Priya Sharma',
      specialty: 'Textile & Weaving',
      location: 'Gujarat, India',
      bio: 'Master weaver specializing in traditional Patola silk sarees with over 15 years of experience.',
    },
    {
      email: 'rajanikant@example.com',
      name: 'Rajanikant',
      specialty: 'Pottery & Ceramics',
      location: 'Rajasthan, India',
      bio: 'Traditional potter creating beautiful ceramic pieces using ancient techniques passed down through generations.',
    },
    {
      email: 'ashis@example.com',
      name: 'Ashis',
      specialty: 'Wood Carving',
      location: 'Karnataka, India',
      bio: 'Skilled wood carver specializing in intricate temple art and decorative wooden sculptures.',
    },
    {
      email: 'vikram.singh@example.com',
      name: 'Vikram Singh',
      specialty: 'Metal Crafts',
      location: 'Punjab, India',
      bio: 'Expert metalsmith creating traditional brass and copper artifacts with contemporary designs.',
    },
    {
      email: 'kavya.nair@example.com',
      name: 'Kavya Nair',
      specialty: 'Jewelry Making',
      location: 'Kerala, India',
      bio: 'Traditional jewelry designer specializing in temple jewelry and contemporary fusion pieces.',
    },
    {
      email: 'arjun.patel@example.com',
      name: 'Arjun Patel',
      specialty: 'Traditional Painting',
      location: 'Madhya Pradesh, India',
      bio: 'Master artist practicing Madhubani and Warli painting techniques with modern interpretations.',
    },
  ];

  for (const artisan of artisans) {
    await prisma.user.upsert({
      where: { email: artisan.email },
      update: {},
      create: {
        ...artisan,
        passwordHash: hashedPassword,
        role: 'ARTISAN',
        status: 'ONLINE',
        isActive: true,
      },
    });
  }

  // Create sample products for first artisan
  console.log('🎨 Creating sample products...');
  const priyaArtisan = await prisma.user.findUnique({
    where: { email: 'priya.sharma@example.com' },
  });

  if (priyaArtisan) {
    const sampleProducts = [
      {
        name: 'Hand-woven Patola Silk Saree',
        description: 'Exquisite double ikat silk saree with traditional geometric patterns.',
        story: 'This saree represents centuries of weaving tradition, taking 6 months to complete each piece.',
        price: 25000.00,
        category: 'Textiles',
        tags: ['silk', 'saree', 'patola', 'handwoven', 'traditional'],
        materials: '100% Pure Silk',
        culturalOrigin: 'Gujarat, India',
        dimensions: '6.5 meters length',
        weight: '500 grams',
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop',
        isActive: true,
      },
      {
        name: 'Traditional Bandhani Dupatta',
        description: 'Vibrant tie-dye dupatta with intricate mirror work.',
        story: 'Each dot is individually tied by hand, representing the ancient art of Bandhani.',
        price: 3500.00,
        category: 'Textiles',
        tags: ['bandhani', 'dupatta', 'tie-dye', 'mirror-work'],
        materials: 'Cotton with mirror work',
        culturalOrigin: 'Rajasthan, India',
        dimensions: '2.5 meters length',
        weight: '150 grams',
        imageUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=400&fit=crop',
        isActive: true,
      },
    ];

    for (const product of sampleProducts) {
      await prisma.product.create({
        data: {
          ...product,
          artisanId: priyaArtisan.id,
          artistName: priyaArtisan.name,
        },
      });
    }
  }

  // Create sample admin messages
  console.log('💬 Creating sample admin messages...');
  if (adminUser && priyaArtisan) {
    await prisma.adminMessage.create({
      data: {
        senderId: adminUser.id,
        senderType: 'ADMIN',
        recipientId: priyaArtisan.id,
        recipientType: 'ARTISAN',
        message: 'Hello! Welcome to ArtisanCraft! I\'m here to help you succeed on our platform. How can I assist you today?',
        isRead: false,
      },
    });

    await prisma.adminMessage.create({
      data: {
        senderId: adminUser.id,
        senderType: 'ADMIN',
        recipientId: priyaArtisan.id,
        recipientType: 'ARTISAN',
        message: 'I see you\'re new here. Would you like me to walk you through optimizing your product listings for better visibility?',
        isRead: false,
      },
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('\n🔐 Login Credentials:');
  console.log('📧 Customer: tejash@gmail.com / Tejash@1234');
  console.log('🎨 Artisan: priya.sharma@example.com / password123');
  console.log('👨‍💼 Admin: Use passcode 123456');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });