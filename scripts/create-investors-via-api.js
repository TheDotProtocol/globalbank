const axios = require('axios');

async function createInvestorsViaAPI() {
  console.log('🚀 Creating investor accounts via API...\n');

  const baseURL = 'https://globalbank.vercel.app';

  try {
    // Create Saleena Sweet account
    console.log('👤 Creating Saleena Sweet account...');
    const saleenaResponse = await axios.post(`${baseURL}/api/admin/create-user`, {
      email: 'njmsweettie@gmail.com',
      password: 'Saleena@132',
      firstName: 'Saleena',
      lastName: 'Sweet',
      phone: '+1 555-0123',
      balance: 150001,
      transactions: [
        {
          type: 'CREDIT',
          amount: 150000,
          description: 'Deposit from AR Holdings Group Corporation, Singapore',
          reference: 'AR-HOLDINGS-DEPOSIT'
        }
      ]
    }, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (saleenaResponse.data.success) {
      console.log('✅ Saleena Sweet account created successfully!');
      console.log(`   Account: ${saleenaResponse.data.account.accountNumber}`);
      console.log(`   Balance: $${saleenaResponse.data.account.balance.toLocaleString()}`);
      console.log(`   Card: ${saleenaResponse.data.card.cardNumber}`);
    }

    // Create Baby Tau account
    console.log('\n👶 Creating Baby Tau account...');
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
      fixedDeposits: [
        {
          amount: 100000,
          interestRate: 5.5,
          duration: 216, // 18 years * 12 months
          maturityDate: new Date(Date.now() + 18 * 365 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    }, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (babyResponse.data.success) {
      console.log('✅ Baby Tau account created successfully!');
      console.log(`   Account: ${babyResponse.data.account.accountNumber}`);
      console.log(`   Balance: $${babyResponse.data.account.balance.toLocaleString()}`);
      console.log(`   Card: ${babyResponse.data.card.cardNumber}`);
      if (babyResponse.data.fixedDeposits.length > 0) {
        console.log(`   Fixed Deposit: $${babyResponse.data.fixedDeposits[0].amount.toLocaleString()} (18 years)`);
      }
    }

    console.log('\n🎉 All investor accounts created successfully!');
    console.log('\n📱 Ready for investor demos:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Saleena Sweet: njmsweettie@gmail.com / Saleena@132');
    console.log('👶 Baby Tau: babyaccount@globaldotbank.org / Babytau@132');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔗 Dashboard: https://globalbank.vercel.app/dashboard');
    console.log('🔗 Cards: https://globalbank.vercel.app/dashboard/cards');

  } catch (error) {
    console.error('❌ Error creating investor accounts:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    
    console.log('\n💡 Troubleshooting:');
    console.log('1. Check if deployment is complete');
    console.log('2. Verify API endpoints are accessible');
    console.log('3. Check database connection');
  }
}

// Run the script
if (require.main === module) {
  createInvestorsViaAPI()
    .then(() => {
      console.log('\n✅ Script completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { createInvestorsViaAPI }; 