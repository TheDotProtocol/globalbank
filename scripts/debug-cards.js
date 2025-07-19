const axios = require('axios');

async function debugCards() {
  console.log('🔍 Debugging cards issue...\n');

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
        const cardsResponse = await axios.get(`${baseURL}/api/cards`, {
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 10000
        });
        
        console.log('✅ Cards API response:', cardsResponse.data);
      } catch (cardsError) {
        console.error('❌ Cards API error:', cardsError.response?.data || cardsError.message);
        
        // Try to get user profile to see if user exists
        try {
          const profileResponse = await axios.get(`${baseURL}/api/user/profile`, {
            headers: { 'Authorization': `Bearer ${token}` },
            timeout: 10000
          });
          console.log('✅ User profile:', profileResponse.data);
        } catch (profileError) {
          console.error('❌ Profile API error:', profileError.response?.data || profileError.message);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run immediately
debugCards(); 