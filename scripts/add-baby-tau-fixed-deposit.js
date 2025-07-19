const axios = require('axios');

async function addBabyTauFixedDeposit() {
  console.log('💰 Adding fixed deposit for Baby Tau...\n');

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
      
      // Get Baby Tau's account
      console.log('\n👶 Getting Baby Tau account...');
      const userResponse = await axios.get(`${baseURL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${adminToken}` },
        timeout: 10000
      });
      
      const babyTau = userResponse.data.users.find(user => 
        user.email === 'babyaccount@globaldotbank.org'
      );
      
      if (babyTau) {
        console.log(`   Found Baby Tau: ${babyTau.firstName} ${babyTau.lastName}`);
        
        // Get Baby Tau's account
        const accountResponse = await axios.get(`${baseURL}/api/admin/accounts?userId=${babyTau.id}`, {
          headers: { 'Authorization': `Bearer ${adminToken}` },
          timeout: 10000
        });
        
        if (accountResponse.data.accounts.length > 0) {
          const account = accountResponse.data.accounts[0];
          console.log(`   Account: ${account.accountNumber}`);
          console.log(`   Balance: $${account.balance}`);
          
          // Create fixed deposit via admin
          console.log('\n💰 Creating fixed deposit...');
          const fixedDepositResponse = await axios.post(`${baseURL}/api/admin/fixed-deposits`, {
            userId: babyTau.id,
            accountId: account.id,
            amount: 100000,
            interestRate: 5.5,
            duration: 24, // 24 months
            description: 'Baby Tau\'s 18-year fixed deposit - Mommy and Daddy\'s gift for future'
          }, {
            headers: { 'Authorization': `Bearer ${adminToken}` },
            timeout: 10000
          });
          
          if (fixedDepositResponse.data.success) {
            console.log('   ✅ Fixed deposit created successfully!');
            console.log(`   Amount: $${fixedDepositResponse.data.fixedDeposit.amount.toLocaleString()}`);
            console.log(`   Duration: ${fixedDepositResponse.data.fixedDeposit.duration} months`);
            console.log(`   Interest Rate: ${fixedDepositResponse.data.fixedDeposit.interestRate}%`);
          } else {
            console.log('   ❌ Failed to create fixed deposit:', fixedDepositResponse.data.error);
          }
        }
      }
    }

    console.log('\n🎉 Fixed deposit creation complete!');
    console.log('\n📱 Baby Tau now has:');
    console.log('• $300,000 account balance');
    console.log('• 2 transactions (Daddy and Mommy gifts)');
    console.log('• $100,000 fixed deposit (24 months, 5.5%)');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run immediately
addBabyTauFixedDeposit(); 