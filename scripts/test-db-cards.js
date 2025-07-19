const axios = require('axios');

async function testDBCards() {
  console.log('🔍 Testing database cards...\n');

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
      
      // Test cards API with detailed error handling
      try {
        console.log('🔍 Testing cards API...');
        const cardsResponse = await axios.get(`${baseURL}/api/cards`, {
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 10000
        });
        
        console.log('✅ Cards API response:', cardsResponse.data);
      } catch (cardsError) {
        console.error('❌ Cards API error:', cardsError.response?.data || cardsError.message);
        console.error('❌ Cards API status:', cardsError.response?.status);
        console.error('❌ Cards API headers:', cardsError.response?.headers);
      }

      // Test account details API
      try {
        console.log('\n🔍 Testing account details API...');
        const accountResponse = await axios.get(`${baseURL}/api/user/accounts`, {
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 10000
        });
        
        console.log('✅ Account details response:', accountResponse.data);
      } catch (accountError) {
        console.error('❌ Account details error:', accountError.response?.data || accountError.message);
      }

      // Test user profile API
      try {
        console.log('\n🔍 Testing user profile API...');
        const profileResponse = await axios.get(`${baseURL}/api/user/profile`, {
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 10000
        });
        
        console.log('✅ User profile response:', profileResponse.data);
      } catch (profileError) {
        console.error('❌ User profile error:', profileError.response?.data || profileError.message);
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
testDBCards(); 