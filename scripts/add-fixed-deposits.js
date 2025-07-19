const axios = require('axios');

async function addFixedDeposits() {
  console.log('💰 Adding fixed deposits for Baby Tau...\n');

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
        
        // Check existing fixed deposits
        const depositsResponse = await axios.get(`${baseURL}/api/fixed-deposits`, {
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 10000
        });
        
        if (depositsResponse.data.fixedDeposits.length === 0) {
          console.log('   No fixed deposits found, creating one...');
          
          // Create fixed deposit with valid duration (24 months)
          const createDepositResponse = await axios.post(`${baseURL}/api/fixed-deposits`, {
            amount: 100000,
            interestRate: 5.5,
            duration: 24, // 24 months (2 years) - valid duration
            accountId: account.id
          }, {
            headers: { 'Authorization': `Bearer ${token}` },
            timeout: 10000
          });
          
          if (createDepositResponse.data.success) {
            console.log('   ✅ Fixed deposit created successfully!');
            console.log(`   Amount: $${createDepositResponse.data.fixedDeposit.amount.toLocaleString()}`);
            console.log(`   Duration: ${createDepositResponse.data.fixedDeposit.duration} months`);
            console.log(`   Interest Rate: ${createDepositResponse.data.fixedDeposit.interestRate}%`);
          } else {
            console.log('   ❌ Failed to create fixed deposit:', createDepositResponse.data.error);
          }
        } else {
          console.log(`   Found ${depositsResponse.data.fixedDeposits.length} existing fixed deposit(s)`);
          depositsResponse.data.fixedDeposits.forEach(fd => {
            console.log(`     - $${fd.amount.toLocaleString()} (${fd.duration} months, ${fd.interestRate}%)`);
          });
        }
      }
    }

    console.log('\n🎉 Fixed deposits check complete!');
    console.log('\n📱 Test the dashboard now:');
    console.log('• https://globaldotbank.org/dashboard');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run immediately
addFixedDeposits(); 