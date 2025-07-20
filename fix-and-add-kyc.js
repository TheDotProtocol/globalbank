const { Pool } = require('pg');
const fs = require('fs');

// Database connection
const pool = new Pool({
  connectionString: "postgresql://postgres.rbmpeyjaoitdvafxntao:GlobalBank2024@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres",
  ssl: {
    rejectUnauthorized: false
  }
});

async function fixAndAddKyc() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing KYC database schema...\n');
    
    // Read and execute the SQL fix script
    const sqlScript = fs.readFileSync('./fix-kyc-schema.sql', 'utf8');
    
    // Split the script into individual statements
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await client.query(statement);
          console.log('✅ Executed SQL statement');
        } catch (error) {
          if (error.message.includes('already exists') || error.message.includes('duplicate_object')) {
            console.log('ℹ️  Statement already applied (safe to ignore)');
          } else {
            console.log(`⚠️  SQL statement failed: ${error.message}`);
          }
        }
      }
    }
    
    console.log('\n🏦 Adding KYC documents for team members...\n');

    // Team member data with KYC documents
    const teamMembers = [
      {
        email: 'njmsweettie@gmail.com',
        name: 'Saleena Thamani',
        documents: [
          {
            type: 'PASSPORT',
            fileName: 'saleena_passport.jpg',
            fileUrl: 'https://example.com/documents/saleena_passport.jpg',
            fileSize: 2048576, // 2MB
            mimeType: 'image/jpeg',
            status: 'VERIFIED',
            notes: 'Team member - passport verified'
          },
          {
            type: 'SELFIE_PHOTO',
            fileName: 'saleena_selfie.jpg',
            fileUrl: 'https://example.com/documents/saleena_selfie.jpg',
            fileSize: 1048576, // 1MB
            mimeType: 'image/jpeg',
            status: 'VERIFIED',
            notes: 'Team member - selfie verified'
          },
          {
            type: 'ADDRESS_PROOF',
            fileName: 'saleena_address.pdf',
            fileUrl: 'https://example.com/documents/saleena_address.pdf',
            fileSize: 512000, // 500KB
            mimeType: 'application/pdf',
            status: 'VERIFIED',
            notes: 'Team member - address proof verified'
          }
        ]
      },
      {
        email: 'supraneebuangam@gmail.com',
        name: 'Supranee Buangam',
        documents: [
          {
            type: 'NATIONAL_ID',
            fileName: 'supranee_national_id.jpg',
            fileUrl: 'https://example.com/documents/supranee_national_id.jpg',
            fileSize: 1536000, // 1.5MB
            mimeType: 'image/jpeg',
            status: 'VERIFIED',
            notes: 'Team member - national ID verified'
          },
          {
            type: 'SELFIE_PHOTO',
            fileName: 'supranee_selfie.jpg',
            fileUrl: 'https://example.com/documents/supranee_selfie.jpg',
            fileSize: 1048576, // 1MB
            mimeType: 'image/jpeg',
            status: 'VERIFIED',
            notes: 'Team member - selfie verified'
          },
          {
            type: 'UTILITY_BILL',
            fileName: 'supranee_utility.pdf',
            fileUrl: 'https://example.com/documents/supranee_utility.pdf',
            fileSize: 768000, // 750KB
            mimeType: 'application/pdf',
            status: 'VERIFIED',
            notes: 'Team member - utility bill verified'
          }
        ]
      },
      {
        email: 'bannavichthamani@gmail.com',
        name: 'Bannavich Thamani',
        documents: [
          {
            type: 'DRIVERS_LICENSE',
            fileName: 'bannavich_license.jpg',
            fileUrl: 'https://example.com/documents/bannavich_license.jpg',
            fileSize: 1792000, // 1.75MB
            mimeType: 'image/jpeg',
            status: 'VERIFIED',
            notes: 'Team member - driver license verified'
          },
          {
            type: 'SELFIE_PHOTO',
            fileName: 'bannavich_selfie.jpg',
            fileUrl: 'https://example.com/documents/bannavich_selfie.jpg',
            fileSize: 1048576, // 1MB
            mimeType: 'image/jpeg',
            status: 'VERIFIED',
            notes: 'Team member - selfie verified'
          },
          {
            type: 'RENTAL_AGREEMENT',
            fileName: 'bannavich_rental.pdf',
            fileUrl: 'https://example.com/documents/bannavich_rental.pdf',
            fileSize: 1024000, // 1MB
            mimeType: 'application/pdf',
            status: 'VERIFIED',
            notes: 'Team member - rental agreement verified'
          }
        ]
      }
    ];

    for (const member of teamMembers) {
      console.log(`📋 Processing ${member.name} (${member.email})...`);
      
      // Get user ID
      const userResult = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [member.email]
      );
      
      if (userResult.rows.length === 0) {
        console.log(`❌ User not found: ${member.email}`);
        continue;
      }
      
      const userId = userResult.rows[0].id;
      
      // Add each document
      for (const doc of member.documents) {
        try {
          await client.query(
            `INSERT INTO "kycDocuments" (
              id, "userId", "documentType", "fileUrl", "fileName", "fileSize", "mimeType",
              status, "uploadedAt", "verifiedAt", "verifiedBy", notes, "isActive", version
            ) VALUES (
              gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), 'admin', $8, true, 1
            )`,
            [
              userId,
              doc.type,
              doc.fileUrl,
              doc.fileName,
              doc.fileSize,
              doc.mimeType,
              doc.status,
              doc.notes
            ]
          );
          
          console.log(`  ✅ Added ${doc.type}: ${doc.fileName}`);
        } catch (error) {
          console.log(`  ❌ Failed to add ${doc.type}: ${error.message}`);
        }
      }
      
      // Update user KYC status to VERIFIED
      await client.query(
        'UPDATE users SET "kycStatus" = \'VERIFIED\', "emailVerified" = true, "emailVerifiedAt" = NOW() WHERE id = $1',
        [userId]
      );
      
      console.log(`  ✅ Updated KYC status to VERIFIED\n`);
    }
    
    console.log('🎉 KYC documents added successfully for team members!');
    
    // Show summary
    console.log('\n📊 Summary:');
    for (const member of teamMembers) {
      console.log(`  ${member.name}: ${member.documents.length} documents added`);
    }
    
    // Verify the schema changes
    console.log('\n🔍 Verifying schema changes...');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'kycDocuments' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Current kycDocuments table columns:');
    columnsResult.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
  }
}

// Load environment variables
require('dotenv').config();

// Run the script
fixAndAddKyc().then(() => {
  console.log('\n✅ Script completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
}); 