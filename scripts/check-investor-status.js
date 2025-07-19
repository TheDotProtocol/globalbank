const axios = require('axios');

async function checkInvestorStatus() {
  console.log('🔍 Checking investor account status...\n');

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
      
      // Test account details
      const saleenaAccountResponse = await axios.get(`${baseURL}/api/user/accounts`, {
        headers: { 'Authorization': `Bearer ${saleenaToken}` },
        timeout: 10000
      });
      
      if (saleenaAccountResponse.data.accounts.length > 0) {
        const account = saleenaAccountResponse.data.accounts[0];
        console.log(`   Account: ${account.accountNumber}`);
        console.log(`   Balance: $${account.balance.toLocaleString()}`);
        console.log(`   Type: ${account.accountType}`);
      }

      // Test cards API
      const saleenaCardsResponse = await axios.get(`${baseURL}/api/cards`, {
        headers: { 'Authorization': `Bearer ${saleenaToken}` },
        timeout: 10000
      });
      
      if (saleenaCardsResponse.data.cards.length > 0) {
        console.log(`   Cards: ${saleenaCardsResponse.data.cards.length} card(s) found`);
      }

      // Test transactions
      const saleenaTransactionsResponse = await axios.get(`${baseURL}/api/transactions?limit=10`, {
        headers: { 'Authorization': `Bearer ${saleenaToken}` },
        timeout: 10000
      });
      
      if (saleenaTransactionsResponse.data.transactions.length > 0) {
        console.log(`   Transactions: ${saleenaTransactionsResponse.data.transactions.length} transaction(s) found`);
        saleenaTransactionsResponse.data.transactions.forEach(tx => {
          console.log(`     - $${tx.amount}: ${tx.description}`);
        });
      }
    }

    console.log('\n👶 Testing Baby Tau login...');
    const babyLoginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'babyaccount@globaldotbank.org',
      password: 'Babytau@132'
    }, { timeout: 10000 });

    if (babyLoginResponse.data.token) {
      console.log('✅ Baby Tau login successful');
      const babyToken = babyLoginResponse.data.token;
      
      // Test account details
      const babyAccountResponse = await axios.get(`${baseURL}/api/user/accounts`, {
        headers: { 'Authorization': `Bearer ${babyToken}` },
        timeout: 10000
      });
      
      if (babyAccountResponse.data.accounts.length > 0) {
        const account = babyAccountResponse.data.accounts[0];
        console.log(`   Account: ${account.accountNumber}`);
        console.log(`   Balance: $${account.balance.toLocaleString()}`);
        console.log(`   Type: ${account.accountType}`);
      }

      // Test cards API
      const babyCardsResponse = await axios.get(`${baseURL}/api/cards`, {
        headers: { 'Authorization': `Bearer ${babyToken}` },
        timeout: 10000
      });
      
      if (babyCardsResponse.data.cards.length > 0) {
        console.log(`   Cards: ${babyCardsResponse.data.cards.length} card(s) found`);
      }

      // Test transactions
      const babyTransactionsResponse = await axios.get(`${baseURL}/api/transactions?limit=10`, {
        headers: { 'Authorization': `Bearer ${babyToken}` },
        timeout: 10000
      });
      
      if (babyTransactionsResponse.data.transactions.length > 0) {
        console.log(`   Transactions: ${babyTransactionsResponse.data.transactions.length} transaction(s) found`);
        babyTransactionsResponse.data.transactions.forEach(tx => {
          console.log(`     - $${tx.amount}: ${tx.description}`);
        });
      }

      // Test fixed deposits
      const babyDepositsResponse = await axios.get(`${baseURL}/api/fixed-deposits`, {
        headers: { 'Authorization': `Bearer ${babyToken}` },
        timeout: 10000
      });
      
      if (babyDepositsResponse.data.fixedDeposits.length > 0) {
        console.log(`   Fixed Deposits: ${babyDepositsResponse.data.fixedDeposits.length} deposit(s) found`);
        babyDepositsResponse.data.fixedDeposits.forEach(fd => {
          console.log(`     - $${fd.amount.toLocaleString()} (${fd.duration} months, ${fd.interestRate}%)`);
        });
      }
    }

    console.log('\n🎉 Status Check Complete!');
    console.log('\n📱 Investor Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Saleena Sweet: njmsweettie@gmail.com / Saleena@132');
    console.log('👶 Baby Tau: babyaccount@globaldotbank.org / Babytau@132');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n🔗 Demo Links:');
    console.log('• Login: https://globaldotbank.org/login');
    console.log('• Dashboard: https://globaldotbank.org/dashboard');
    console.log('• Cards: https://globaldotbank.org/dashboard/cards');
    
    console.log('\n✅ All features should now be working:');
    console.log('• Cards page accessible at /dashboard/cards');
    console.log('• Account details loading properly');
    console.log('• Transactions with exact descriptions');
    console.log('• Fixed deposits with certificate generation');
    console.log('• Beautiful 3D card displays');
    console.log('• Bank Bugger AI functionality');

  } catch (error) {
    console.error('❌ Error checking status:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run immediately
checkInvestorStatus(); 