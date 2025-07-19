const axios = require('axios');

async function fixCards() {
  console.log('🔧 Fixing cards for existing users...\n');

  const baseURL = 'https://globaldotbank.org';

  try {
    // Test login for Saleena Sweet
    console.log('👤 Testing Saleena Sweet login...');
    const saleenaLoginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'njmsweettie@gmail.com',
      password: 'Saleena@132'
    }, { timeout: 10000 });

    if (saleenaLoginResponse.data.token) {
      console.log('✅ Saleena Sweet login successful');
      const saleenaToken = saleenaLoginResponse.data.token;
      
      // Get account details
      const saleenaAccountResponse = await axios.get(`${baseURL}/api/user/accounts`, {
        headers: { 'Authorization': `Bearer ${saleenaToken}` },
        timeout: 10000
      });
      
      if (saleenaAccountResponse.data.accounts.length > 0) {
        const account = saleenaAccountResponse.data.accounts[0];
        console.log(`   Account: ${account.accountNumber}`);
        
        // Create card for Saleena
        console.log('   Creating card for Saleena...');
        const cardResponse = await axios.post(`${baseURL}/api/cards/create`, {
          cardType: 'DEBIT',
          accountId: account.id
        }, {
          headers: { 'Authorization': `Bearer ${saleenaToken}` },
          timeout: 10000
        });
        
        if (cardResponse.data.success) {
          console.log('   ✅ Card created successfully for Saleena');
        } else {
          console.log('   ❌ Failed to create card for Saleena:', cardResponse.data.error);
        }
      }
    }

    // Test login for Baby Tau
    console.log('\n👶 Testing Baby Tau login...');
    const babyLoginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'babyaccount@globaldotbank.org',
      password: 'Babytau@132'
    }, { timeout: 10000 });

    if (babyLoginResponse.data.token) {
      console.log('✅ Baby Tau login successful');
      const babyToken = babyLoginResponse.data.token;
      
      // Get account details
      const babyAccountResponse = await axios.get(`${baseURL}/api/user/accounts`, {
        headers: { 'Authorization': `Bearer ${babyToken}` },
        timeout: 10000
      });
      
      if (babyAccountResponse.data.accounts.length > 0) {
        const account = babyAccountResponse.data.accounts[0];
        console.log(`   Account: ${account.accountNumber}`);
        
        // Create card for Baby Tau
        console.log('   Creating card for Baby Tau...');
        const cardResponse = await axios.post(`${baseURL}/api/cards/create`, {
          cardType: 'DEBIT',
          accountId: account.id
        }, {
          headers: { 'Authorization': `Bearer ${babyToken}` },
          timeout: 10000
        });
        
        if (cardResponse.data.success) {
          console.log('   ✅ Card created successfully for Baby Tau');
        } else {
          console.log('   ❌ Failed to create card for Baby Tau:', cardResponse.data.error);
        }
      }
    }

    console.log('\n🎉 Card creation complete!');
    console.log('\n📱 Test the cards page now:');
    console.log('• https://globaldotbank.org/dashboard/cards');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run immediately
fixCards(); 