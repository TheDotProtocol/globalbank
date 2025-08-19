const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admingdb@globaldotbank.org' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('📧 Email: admingdb@globaldotbank.org');
      console.log('🔑 Password: GlobalBank2024!@#$%^&*()_+SecureAdmin');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('GlobalBank2024!@#$%^&*()_+SecureAdmin', 12);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admingdb@globaldotbank.org',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'GDB',
        kycStatus: 'VERIFIED',
        emailVerified: true,
        emailVerifiedAt: new Date()
      }
    });

    console.log('✅ Admin user created successfully:', adminUser.email);
    console.log('📧 Email: admingdb@globaldotbank.org');
    console.log('🔑 Password: GlobalBank2024!@#$%^&*()_+SecureAdmin');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 