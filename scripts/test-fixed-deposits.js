const axios = require('axios');

async function testFixedDeposits() {
  console.log('🔍 Testing fixed deposits API...\n');

  const baseURL = 'https://globaldotbank.org';

  try {
    // Login as Baby Tau
    console.log('👶 Logging in as Baby Tau...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'babyaccount@globaldotbank.org',
      password: 'Babytau@132'
    }, { timeout: 10000 });

    if (loginResponse.data.token) {
      console.log('✅ Baby Tau login successful');
      const token = loginResponse.data.token;
      
      // Get account details
      const accountResponse = await axios.get(`${baseURL}/api/user/accounts`, {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 10000
      });
      
      if (accountResponse.data.accounts.length > 0) {
        const account = accountResponse.data.accounts[0];
        console.log(`   Account: ${account.accountNumber}`);
        console.log(`   Type: ${account.accountType}`);
        console.log(`   Balance: $${account.balance}`);
        
        // Test GET fixed deposits
        try {
          console.log('\n🔍 Testing GET fixed deposits...');
          const getDepositsResponse = await axios.get(`${baseURL}/api/fixed-deposits`, {
            headers: { 'Authorization': `Bearer ${token}` },
            timeout: 10000
          });
          
          console.log('✅ GET fixed deposits response:', getDepositsResponse.data);
        } catch (getError) {
          console.error('❌ GET fixed deposits error:', getError.response?.data || getError.message);
        }
        
        // Test POST fixed deposits with minimal data
        try {
          console.log('\n🔍 Testing POST fixed deposits...');
          const postDepositsResponse = await axios.post(`${baseURL}/api/fixed-deposits`, {
            amount: 1000,
            duration: 12
          }, {
            headers: { 'Authorization': `Bearer ${token}` },
            timeout: 10000
          });
          
          console.log('✅ POST fixed deposits response:', postDepositsResponse.data);
        } catch (postError) {
          console.error('❌ POST fixed deposits error:', postError.response?.data || postError.message);
          console.error('❌ POST fixed deposits status:', postError.response?.status);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Run immediately
testFixedDeposits(); 