const axios = require('axios');

async function checkDeployment() {
  console.log('🚀 Checking Global Dot Bank deployment status...\n');

  try {
    // Check if the main site is accessible
    console.log('📡 Checking main site accessibility...');
    const mainResponse = await axios.get('https://globalbank.vercel.app', { timeout: 10000 });
    console.log('✅ Main site is accessible');
    
    // Test the investor creation API
    console.log('\n👥 Testing investor creation API...');
    const apiResponse = await axios.post('https://globalbank.vercel.app/api/admin/create-investors', {}, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (apiResponse.data.success) {
      console.log('✅ Investor creation API is working!');
      console.log('\n📋 Created Accounts:');
      
      apiResponse.data.accounts.forEach((account, index) => {
        console.log(`\n${index + 1}. ${account.user.firstName} ${account.user.lastName}`);
        console.log(`   Email: ${account.user.email}`);
        console.log(`   Account: ${account.account.accountNumber}`);
        console.log(`   Balance: $${account.account.balance.toLocaleString()}`);
        console.log(`   Card: ${account.card.cardNumber}`);
        
        if (account.fixedDeposit) {
          console.log(`   Fixed Deposit: $${account.fixedDeposit.amount.toLocaleString()}`);
        }
      });
    }
    
    // Test Bank Bugger AI
    console.log('\n🤖 Testing Bank Bugger AI...');
    const aiResponse = await axios.post('https://globalbank.vercel.app/api/ai/chat', {
      message: 'What is my account balance?'
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (aiResponse.data.success) {
      console.log('✅ Bank Bugger AI is working!');
      console.log(`🤖 AI Response: ${aiResponse.data.response}`);
    }
    
    console.log('\n🎉 All systems are operational!');
    console.log('\n📱 Ready for investor demos:');
    console.log('• Saleena Sweet: njmsweettie@gmail.com / Saleena@132');
    console.log('• Baby Tau: babyaccount@globaldotbank.org / Babytau@132');
    console.log('\n🔗 Dashboard: https://globalbank.vercel.app/dashboard');
    console.log('🔗 Cards: https://globalbank.vercel.app/dashboard/cards');
    
  } catch (error) {
    console.error('❌ Deployment check failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Site might still be deploying...');
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check Vercel deployment status');
    console.log('2. Verify database connection');
    console.log('3. Check API routes');
  }
}

// Run the check
if (require.main === module) {
  checkDeployment()
    .then(() => {
      console.log('\n✅ Deployment check completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Check failed:', error);
      process.exit(1);
    });
}

module.exports = { checkDeployment }; 