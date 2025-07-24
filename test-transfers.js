const fetch = require('node-fetch');

async function createTransfers() {
  try {
    console.log('🔍 Testing transfer creation via API...');

    // First, let's test the admin authentication
    const testResponse = await fetch('http://localhost:3000/api/admin/test-auth', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-secret-token-2024'
      }
    });

    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('✅ Admin auth test successful:', testData);
    } else {
      console.error('❌ Admin auth test failed:', await testResponse.text());
    }

    // Now create the transfers
    const transferResponse = await fetch('http://localhost:3000/api/admin/test-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-secret-token-2024'
      }
    });

    if (transferResponse.ok) {
      const transferData = await transferResponse.json();
      console.log('✅ Transfers created successfully:', transferData);
    } else {
      console.error('❌ Transfer creation failed:', await transferResponse.text());
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTransfers(); 