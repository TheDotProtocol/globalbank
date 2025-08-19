const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
<<<<<<< HEAD
      where: { email: 'admingdb@globaldotbank.org' }
=======
      where: { email: 'admin@globaldotbank.org' }
>>>>>>> c9f0d131989ca8263d75933f5d1df2dff3e786a3
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
<<<<<<< HEAD
      console.log('📧 Email: admingdb@globaldotbank.org');
      console.log('🔑 Password: GlobalBank2024!@#$%^&*()_+SecureAdmin');
=======
>>>>>>> c9f0d131989ca8263d75933f5d1df2dff3e786a3
      return;
    }

    // Hash password
<<<<<<< HEAD
    const hashedPassword = await bcrypt.hash('GlobalBank2024!@#$%^&*()_+SecureAdmin', 12);
=======
    const hashedPassword = await bcrypt.hash('Admin@2024', 12);
>>>>>>> c9f0d131989ca8263d75933f5d1df2dff3e786a3

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
<<<<<<< HEAD
        email: 'admingdb@globaldotbank.org',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'GDB',
=======
        email: 'admin@globaldotbank.org',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
>>>>>>> c9f0d131989ca8263d75933f5d1df2dff3e786a3
        kycStatus: 'VERIFIED',
        emailVerified: true,
        emailVerifiedAt: new Date()
      }
    });

    console.log('✅ Admin user created successfully:', adminUser.email);
<<<<<<< HEAD
    console.log('📧 Email: admingdb@globaldotbank.org');
    console.log('🔑 Password: GlobalBank2024!@#$%^&*()_+SecureAdmin');
=======
    console.log('📧 Email: admin@globaldotbank.org');
    console.log('🔑 Password: Admin@2024');
>>>>>>> c9f0d131989ca8263d75933f5d1df2dff3e786a3

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

<<<<<<< HEAD
createAdminUser(); 
=======
createAdminUser();
>>>>>>> c9f0d131989ca8263d75933f5d1df2dff3e786a3
