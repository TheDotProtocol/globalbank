const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@globaldotbank.org' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin@2024', 12);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@globaldotbank.org',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        kycStatus: 'VERIFIED',
        emailVerified: true,
        emailVerifiedAt: new Date()
      }
    });

    console.log('✅ Admin user created successfully:', adminUser.email);
    console.log('📧 Email: admin@globaldotbank.org');
    console.log('🔑 Password: Admin@2024');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
