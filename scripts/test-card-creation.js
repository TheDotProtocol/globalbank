const axios = require('axios');

async function testCardCreation() {
  console.log('🔍 Testing card creation...\n');

  const baseURL = 'https://globaldotbank.org';

  try {
    // Test login for Saleena Sweet
    console.log('👤 Testing Saleena Sweet login...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'njmsweettie@gmail.com',
      password: 'Saleena@132'
    }, { timeout: 10000 });

    if (loginResponse.data.token) {
      console.log('✅ Login successful');
      const token = loginResponse.data.token;
      
      // Get account details
      const accountResponse = await axios.get(`${baseURL}/api/user/accounts`, {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 10000
      });
      
      if (accountResponse.data.accounts.length > 0) {
        const account = accountResponse.data.accounts[0];
        console.log(`   Account: ${account.accountNumber}`);
        console.log(`   Account ID: ${account.id}`);
        
        // Test card creation with detailed error handling
        try {
          console.log('\n🔍 Testing card creation...');
          const cardResponse = await axios.post(`${baseURL}/api/cards/create`, {
            cardType: 'DEBIT',
            accountId: account.id
          }, {
            headers: { 'Authorization': `Bearer ${token}` },
            timeout: 10000
          });
          
          console.log('✅ Card creation response:', cardResponse.data);
        } catch (cardError) {
          console.error('❌ Card creation error:', cardError.response?.data || cardError.message);
          console.error('❌ Card creation status:', cardError.response?.status);
          console.error('❌ Card creation headers:', cardError.response?.headers);
          
          // Try to get more details about the error
          if (cardError.response?.data?.error) {
            console.error('❌ Error details:', cardError.response.data.error);
          }
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
testCardCreation(); 