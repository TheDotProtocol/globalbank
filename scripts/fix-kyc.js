const axios = require('axios');

async function fixKYC() {
  console.log('🔧 Fixing KYC status for users...\n');

  const baseURL = 'https://globaldotbank.org';

  try {
    // Admin login
    console.log('🔐 Admin login...');
    const adminLoginResponse = await axios.post(`${baseURL}/api/admin/login`, {
      username: 'admingdb',
      password: 'GlobalBank2024!@#$%^&*()_+SecureAdmin'
    }, { timeout: 10000 });

    if (adminLoginResponse.data.token) {
      console.log('✅ Admin login successful');
      const adminToken = adminLoginResponse.data.token;
      
      // Update KYC status for Saleena Sweet
      console.log('\n👤 Updating KYC for Saleena Sweet...');
      const saleenaKYCResponse = await axios.put(`${baseURL}/api/admin/users`, {
        userId: 'cmd5is0pg0003kz04mjsuo3x0', // Saleena's user ID from debug output
        kycStatus: 'VERIFIED'
      }, {
        headers: { 'Authorization': `Bearer ${adminToken}` },
        timeout: 10000
      });
      
      if (saleenaKYCResponse.data.success) {
        console.log('✅ Saleena Sweet KYC updated to VERIFIED');
      } else {
        console.log('❌ Failed to update Saleena KYC:', saleenaKYCResponse.data.error);
      }

      // Update KYC status for Baby Tau
      console.log('\n👶 Updating KYC for Baby Tau...');
      const babyKYCResponse = await axios.put(`${baseURL}/api/admin/users`, {
        userId: 'cmdacaf460002wto29vkneq5g', // Baby Tau's user ID from debug output
        kycStatus: 'VERIFIED'
      }, {
        headers: { 'Authorization': `Bearer ${adminToken}` },
        timeout: 10000
      });
      
      if (babyKYCResponse.data.success) {
        console.log('✅ Baby Tau KYC updated to VERIFIED');
      } else {
        console.log('❌ Failed to update Baby Tau KYC:', babyKYCResponse.data.error);
      }
    }

    console.log('\n🎉 KYC status update complete!');
    console.log('\n📱 Now try creating cards again:');
    console.log('• Run: node scripts/fix-cards.js');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run immediately
fixKYC(); 