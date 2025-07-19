const axios = require('axios');

async function quickDeployCheck() {
  console.log('🚀 Quick deployment check and investor setup...\n');

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
    }

    // Create Baby Tau
    console.log('👶 Creating Baby Tau...');
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

  } catch (error) {
    console.error('❌ Error creating accounts:', error.message);
    console.log('\n💡 Try running: node scripts/create-investors-via-api.js');
  }
}

// Run immediately
quickDeployCheck(); 