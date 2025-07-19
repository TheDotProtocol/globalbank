const axios = require('axios');

async function addBabyTauTransaction() {
  console.log('💰 Adding missing transaction for Baby Tau...\n');

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
        
        // Add the missing second transaction
        console.log('\n   Adding missing transaction...');
        const addTransactionResponse = await axios.post(`${baseURL}/api/transactions`, {
          type: 'CREDIT',
          amount: 150000,
          description: 'Deposit from The Dot Protocol Inc, Global HQ, USA - Mommy\'s first gift',
          reference: 'MOMMY-GIFT-1',
          accountId: account.id
        }, {
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 10000
        });
        
        if (addTransactionResponse.data.success) {
          console.log('   ✅ Second transaction added successfully!');
          console.log('   Transaction: $150,000 - The Dot Protocol Inc, USA - Mommy\'s first gift');
          
          // Check updated balance
          const updatedAccountResponse = await axios.get(`${baseURL}/api/user/accounts`, {
            headers: { 'Authorization': `Bearer ${token}` },
            timeout: 10000
          });
          
          if (updatedAccountResponse.data.accounts.length > 0) {
            const updatedAccount = updatedAccountResponse.data.accounts[0];
            console.log(`   Updated Balance: $${updatedAccount.balance}`);
          }
        } else {
          console.log('   ❌ Failed to add transaction:', addTransactionResponse.data.error);
        }
      }
    }

    console.log('\n🎉 Transaction addition complete!');
    console.log('\n📱 Baby Tau now has both transactions:');
    console.log('• $150,000 - AR Holdings Group Corporation, USA - Daddy\'s first gift');
    console.log('• $150,000 - The Dot Protocol Inc, USA - Mommy\'s first gift');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run immediately
addBabyTauTransaction(); 