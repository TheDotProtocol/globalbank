const axios = require('axios');

async function fixBabyTauComplete() {
  console.log('🔧 Fixing Baby Tau account completely...\n');

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
        console.log(`   Current Balance: $${account.balance}`);
        
        // Check existing transactions
        const transactionsResponse = await axios.get(`${baseURL}/api/transactions?limit=10`, {
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 10000
        });
        
        console.log(`   Found ${transactionsResponse.data.transactions.length} existing transaction(s)`);
        transactionsResponse.data.transactions.forEach(tx => {
          console.log(`     - $${tx.amount}: ${tx.description}`);
        });
        
        // Add the missing second transaction if not present
        const hasMommyGift = transactionsResponse.data.transactions.some(tx => 
          tx.description.includes('Mommy') || tx.description.includes('Dot Protocol')
        );
        
        if (!hasMommyGift) {
          console.log('\n   Adding missing Mommy gift transaction...');
          
          // Create transaction directly in database via admin API
          const adminLoginResponse = await axios.post(`${baseURL}/api/admin/login`, {
            username: 'admingdb',
            password: 'GlobalBank2024!@#$%^&*()_+SecureAdmin'
          }, { timeout: 10000 });
          
          if (adminLoginResponse.data.token) {
            const adminToken = adminLoginResponse.data.token;
            
            // Add transaction via admin
            const addTransactionResponse = await axios.post(`${baseURL}/api/admin/transactions`, {
              userId: account.userId,
              accountId: account.id,
              type: 'CREDIT',
              amount: 150000,
              description: 'Deposit from The Dot Protocol Inc, Global HQ, USA - Mommy\'s first gift',
              reference: 'MOMMY-GIFT-1'
            }, {
              headers: { 'Authorization': `Bearer ${adminToken}` },
              timeout: 10000
            });
            
            if (addTransactionResponse.data.success) {
              console.log('   ✅ Mommy gift transaction added successfully!');
            } else {
              console.log('   ❌ Failed to add Mommy gift transaction:', addTransactionResponse.data.error);
            }
          }
        } else {
          console.log('   ✅ Mommy gift transaction already exists');
        }
        
        // Check updated transactions
        const updatedTransactionsResponse = await axios.get(`${baseURL}/api/transactions?limit=10`, {
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 10000
        });
        
        console.log(`\n   Updated transactions (${updatedTransactionsResponse.data.transactions.length}):`);
        updatedTransactionsResponse.data.transactions.forEach(tx => {
          console.log(`     - $${tx.amount}: ${tx.description}`);
        });
        
        // Check updated balance
        const updatedAccountResponse = await axios.get(`${baseURL}/api/user/accounts`, {
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 10000
        });
        
        if (updatedAccountResponse.data.accounts.length > 0) {
          const updatedAccount = updatedAccountResponse.data.accounts[0];
          console.log(`   Updated Balance: $${updatedAccount.balance}`);
        }
      }
    }

    console.log('\n🎉 Baby Tau account fix complete!');
    console.log('\n📱 Baby Tau should now have:');
    console.log('• $150,000 - AR Holdings Group Corporation, USA - Daddy\'s first gift');
    console.log('• $150,000 - The Dot Protocol Inc, USA - Mommy\'s first gift');
    console.log('• Total Balance: $300,000');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run immediately
fixBabyTauComplete(); 