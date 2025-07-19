const axios = require('axios');

async function testCompleteSystem() {
  console.log('🧪 Testing Complete System...\n');

  const baseURL = 'https://globaldotbank.org';

  try {
    // Test Saleena Sweet
    console.log('👤 Testing Saleena Sweet...');
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

      // Test cards
      const saleenaCardsResponse = await axios.get(`${baseURL}/api/cards`, {
        headers: { 'Authorization': `Bearer ${saleenaToken}` },
        timeout: 10000
      });
      
      console.log(`   Cards: ${saleenaCardsResponse.data.cards.length} card(s)`);

      // Test transactions
      const saleenaTransactionsResponse = await axios.get(`${baseURL}/api/transactions?limit=10`, {
        headers: { 'Authorization': `Bearer ${saleenaToken}` },
        timeout: 10000
      });
      
      console.log(`   Transactions: ${saleenaTransactionsResponse.data.transactions.length} transaction(s)`);
      saleenaTransactionsResponse.data.transactions.forEach(tx => {
        console.log(`     - $${tx.amount.toLocaleString()}: ${tx.description}`);
      });
    }

    console.log('\n👶 Testing Baby Tau...');
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

      // Test cards
      const babyCardsResponse = await axios.get(`${baseURL}/api/cards`, {
        headers: { 'Authorization': `Bearer ${babyToken}` },
        timeout: 10000
      });
      
      console.log(`   Cards: ${babyCardsResponse.data.cards.length} card(s)`);

      // Test transactions
      const babyTransactionsResponse = await axios.get(`${baseURL}/api/transactions?limit=10`, {
        headers: { 'Authorization': `Bearer ${babyToken}` },
        timeout: 10000
      });
      
      console.log(`   Transactions: ${babyTransactionsResponse.data.transactions.length} transaction(s)`);
      babyTransactionsResponse.data.transactions.forEach(tx => {
        console.log(`     - $${tx.amount.toLocaleString()}: ${tx.description}`);
      });

      // Test fixed deposits
      const babyDepositsResponse = await axios.get(`${baseURL}/api/fixed-deposits`, {
        headers: { 'Authorization': `Bearer ${babyToken}` },
        timeout: 10000
      });
      
      console.log(`   Fixed Deposits: ${babyDepositsResponse.data.fixedDeposits.length} deposit(s)`);
      babyDepositsResponse.data.fixedDeposits.forEach(fd => {
        console.log(`     - $${fd.amount.toLocaleString()} (${fd.duration} months, ${fd.interestRate}%)`);
      });
    }

    // Test public pages
    console.log('\n🌐 Testing Public Pages...');
    
    try {
      const homeResponse = await axios.get(baseURL, { timeout: 10000 });
      console.log('✅ Home page accessible');
    } catch (error) {
      console.log('❌ Home page error:', error.message);
    }

    try {
      const loginResponse = await axios.get(`${baseURL}/login`, { timeout: 10000 });
      console.log('✅ Login page accessible');
    } catch (error) {
      console.log('❌ Login page error:', error.message);
    }

    console.log('\n🎉 System Test Complete!');
    console.log('\n📱 Demo Links:');
    console.log('• Home: https://globaldotbank.org');
    console.log('• Login: https://globaldotbank.org/login');
    console.log('• Dashboard: https://globaldotbank.org/dashboard');
    console.log('• Cards: https://globaldotbank.org/dashboard/cards');
    
    console.log('\n👥 Investor Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Saleena Sweet: njmsweettie@gmail.com / Saleena@132');
    console.log('👶 Baby Tau: babyaccount@globaldotbank.org / Babytau@132');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run immediately
testCompleteSystem(); 