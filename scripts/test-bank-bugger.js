const axios = require('axios');

async function testBankBuggerAI() {
  console.log('🤖 Testing Bank Bugger AI for both investor accounts...\n');

  const testMessages = [
    'What is my account balance?',
    'How do I transfer money?',
    'Tell me about my debit card',
    'What are the fixed deposit rates?',
    'Is my account secure?',
    'I need help with my account'
  ];

  // Test for Saleena's account
  console.log('👤 Testing for Saleena Sweet (njmsweettie@gmail.com):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  for (const message of testMessages) {
    try {
      const response = await axios.post('http://localhost:3000/api/ai/chat', {
        message,
        userId: 'saleena-user-id' // This would be the actual user ID
      });
      
      console.log(`❓ Question: ${message}`);
      console.log(`🤖 Response: ${response.data.response}`);
      console.log('─'.repeat(60));
    } catch (error) {
      console.log(`❌ Error testing message "${message}":`, error.message);
    }
  }

  console.log('\n👶 Testing for Baby Tau (babyaccount@globaldotbank.org):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  for (const message of testMessages) {
    try {
      const response = await axios.post('http://localhost:3000/api/ai/chat', {
        message,
        userId: 'baby-user-id' // This would be the actual user ID
      });
      
      console.log(`❓ Question: ${message}`);
      console.log(`🤖 Response: ${response.data.response}`);
      console.log('─'.repeat(60));
    } catch (error) {
      console.log(`❌ Error testing message "${message}":`, error.message);
    }
  }

  console.log('\n✅ Bank Bugger AI testing completed!');
  console.log('\n📋 Expected Features:');
  console.log('• Account balance inquiries');
  console.log('• Transfer assistance');
  console.log('• Card information');
  console.log('• Fixed deposit details');
  console.log('• Security information');
  console.log('• General help and support');
}

// Run the test
if (require.main === module) {
  testBankBuggerAI()
    .then(() => {
      console.log('\n🎉 All tests completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testBankBuggerAI }; 