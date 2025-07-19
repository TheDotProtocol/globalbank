const axios = require('axios');

async function finalDeployCheck() {
  console.log('🚀 Final deployment check and investor setup...\n');

  const baseURL = 'https://globalbank.vercel.app';
  let deploymentReady = false;

  // Check deployment status
  try {
    console.log('📡 Checking deployment status...');
    const response = await axios.get(baseURL, { timeout: 10000 });
    if (response.status === 200) {
      console.log('✅ Deployment is ready!');
      deploymentReady = true;
    }
  } catch (error) {
    console.log('⏳ Deployment still in progress...');
    console.log('💡 Please wait 2-3 minutes for deployment to complete');
    return;
  }

  if (!deploymentReady) return;

  // Test Bank Bugger AI
  try {
    console.log('\n🤖 Testing Bank Bugger AI...');
    const aiResponse = await axios.post(`${baseURL}/api/ai/chat`, {
      message: 'What is my account balance?'
    }, { timeout: 10000 });

    if (aiResponse.data.success) {
      console.log('✅ Bank Bugger AI is working!');
      console.log(`🤖 AI Response: ${aiResponse.data.response}`);
    }
  } catch (error) {
    console.log('⚠️  Bank Bugger AI test failed:', error.message);
  }

  // Create investor accounts
  try {
    console.log('\n👥 Creating investor accounts...');
    
    // Create Saleena Sweet
    console.log('👤 Creating Saleena Sweet...');
    const saleenaResponse = await axios.post(`${baseURL}/api/admin/create-user`, {
      email: 'njmsweettie@gmail.com',
      password: 'Saleena@132',
      firstName: 'Saleena',
      lastName: 'Sweet',
      phone: '+1 555-0123',
      balance: 150001,
      transactions: [{
        type: 'CREDIT',
        amount: 150000,
        description: 'Deposit from AR Holdings Group Corporation, Singapore',
        reference: 'AR-HOLDINGS-DEPOSIT'
      }]
    }, { timeout: 15000 });

    if (saleenaResponse.data.success) {
      console.log('✅ Saleena Sweet created!');
      console.log(`   Account: ${saleenaResponse.data.account.accountNumber}`);
      console.log(`   Balance: $${saleenaResponse.data.account.balance.toLocaleString()}`);
      console.log(`   Card: ${saleenaResponse.data.card.cardNumber}`);
    }

    // Create Baby Tau
    console.log('\n👶 Creating Baby Tau...');
    const babyResponse = await axios.post(`${baseURL}/api/admin/create-user`, {
      email: 'babyaccount@globaldotbank.org',
      password: 'Babytau@132',
      firstName: 'Baby',
      lastName: 'Tau',
      phone: '+66 821763146',
      balance: 300000,
      transactions: [
        {
          type: 'CREDIT',
          amount: 150000,
          description: 'Deposit from AR Holdings Group Corporation, Global HQ, USA - Daddy\'s first gift',
          reference: 'DADDY-GIFT-1',
          date: '2025-07-19T12:45:00Z'
        },
        {
          type: 'CREDIT',
          amount: 150000,
          description: 'Deposit from The Dot Protocol Inc, Global HQ, USA - Mommy\'s first gift',
          reference: 'MOMMY-GIFT-1',
          date: '2025-07-19T12:45:00Z'
        }
      ],
      fixedDeposits: [{
        amount: 100000,
        interestRate: 5.5,
        duration: 216,
        maturityDate: new Date(Date.now() + 18 * 365 * 24 * 60 * 60 * 1000).toISOString()
      }]
    }, { timeout: 15000 });

    if (babyResponse.data.success) {
      console.log('✅ Baby Tau created!');
      console.log(`   Account: ${babyResponse.data.account.accountNumber}`);
      console.log(`   Balance: $${babyResponse.data.account.balance.toLocaleString()}`);
      console.log(`   Card: ${babyResponse.data.card.cardNumber}`);
      if (babyResponse.data.fixedDeposits.length > 0) {
        console.log(`   Fixed Deposit: $${babyResponse.data.fixedDeposits[0].amount.toLocaleString()} (18 years)`);
      }
    }

    console.log('\n🎉 SUCCESS! Your investors are ready!');
    console.log('\n📱 Investor Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Saleena Sweet: njmsweettie@gmail.com / Saleena@132');
    console.log('👶 Baby Tau: babyaccount@globaldotbank.org / Babytau@132');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔗 Demo Links:');
    console.log('• Login: https://globalbank.vercel.app/login');
    console.log('• Dashboard: https://globalbank.vercel.app/dashboard');
    console.log('• Cards: https://globalbank.vercel.app/dashboard/cards');
    console.log('\n🤖 Bank Bugger AI is ready for both accounts!');
    console.log('\n✨ Features Available:');
    console.log('• Beautiful 3D card display with flip animation');
    console.log('• Account balance and transaction history');
    console.log('• Fixed deposit management');
    console.log('• Intelligent AI assistant');
    console.log('• Secure authentication');

  } catch (error) {
    console.error('❌ Error creating accounts:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    
    console.log('\n💡 Troubleshooting:');
    console.log('1. Check if deployment is complete');
    console.log('2. Verify API endpoints are accessible');
    console.log('3. Check database connection');
  }
}

// Run immediately
finalDeployCheck(); 