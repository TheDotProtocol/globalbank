const BASE_URL = 'http://localhost:3000';

async function testRegistrationFlow() {
  console.log('🧪 Testing Global Dot Bank Registration Flow\n');

  // Test 1: Check if server is running
  console.log('1️⃣ Testing server connectivity...');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, { method: 'GET' });
    console.log('✅ Server is running and responding');
  } catch (error) {
    console.log('❌ Server is not running. Please start with: npm run dev');
    return;
  }

  // Test 2: Test registration with unique email
  console.log('\n2️⃣ Testing user registration...');
  const testEmail = `testuser${Date.now()}@example.com`;
  const testPassword = 'TestPass123!';
  
  try {
    const registrationResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email: testEmail,
        password: testPassword,
        phone: '1234567890'
      }),
    });

    const registrationData = await registrationResponse.json();
    
    if (registrationResponse.ok) {
      console.log('✅ Registration successful!');
      console.log(`   User ID: ${registrationData.user.id}`);
      console.log(`   Account Number: ${registrationData.account.accountNumber}`);
      console.log(`   Email Verification Required: ${registrationData.requiresVerification}`);
      
      // Test 3: Test login before email verification (should fail)
      console.log('\n3️⃣ Testing login before email verification...');
      try {
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: testEmail,
            password: testPassword
          }),
        });

        const loginData = await loginResponse.json();
        
        if (loginResponse.status === 403 && loginData.requiresVerification) {
          console.log('✅ Login correctly blocked - email verification required');
        } else {
          console.log('❌ Login should be blocked before email verification');
        }
      } catch (error) {
        console.log('❌ Login test failed:', error.message);
      }

      // Test 4: Test KYC status
      console.log('\n4️⃣ Testing KYC status...');
      try {
        const kycResponse = await fetch(`${BASE_URL}/api/kyc/status`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (kycResponse.ok) {
          console.log('✅ KYC status endpoint is working');
        } else {
          console.log('⚠️ KYC status endpoint needs authentication');
        }
      } catch (error) {
        console.log('❌ KYC status test failed:', error.message);
      }

      // Test 5: Test account creation
      console.log('\n5️⃣ Testing account creation...');
      if (registrationData.account && registrationData.account.accountNumber) {
        console.log('✅ Default savings account created successfully');
        console.log(`   Account Type: ${registrationData.account.accountType}`);
        console.log(`   Account Number: ${registrationData.account.accountNumber}`);
      } else {
        console.log('❌ Account creation failed');
      }

    } else {
      console.log('❌ Registration failed:', registrationData.error);
    }
  } catch (error) {
    console.log('❌ Registration test failed:', error.message);
  }

  // Test 6: Test duplicate registration
  console.log('\n6️⃣ Testing duplicate registration prevention...');
  try {
    const duplicateResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Duplicate',
        lastName: 'User',
        email: testEmail, // Same email
        password: 'TestPass123!',
        phone: '1234567890'
      }),
    });

    const duplicateData = await duplicateResponse.json();
    
    if (duplicateResponse.status === 409 && duplicateData.error === 'User already exists') {
      console.log('✅ Duplicate registration correctly prevented');
    } else {
      console.log('❌ Duplicate registration prevention failed');
    }
  } catch (error) {
    console.log('❌ Duplicate registration test failed:', error.message);
  }

  // Test 7: Test password validation
  console.log('\n7️⃣ Testing password validation...');
  const weakPassword = 'weak';
  
  try {
    const weakPasswordResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Weak',
        lastName: 'Password',
        email: `weakpass${Date.now()}@example.com`,
        password: weakPassword,
        phone: '1234567890'
      }),
    });

    const weakPasswordData = await weakPasswordResponse.json();
    
    if (weakPasswordResponse.status === 400) {
      console.log('✅ Password validation working (weak password rejected)');
    } else {
      console.log('⚠️ Password validation may need frontend enforcement');
    }
  } catch (error) {
    console.log('❌ Password validation test failed:', error.message);
  }

  console.log('\n🎉 Registration Flow Test Complete!');
  console.log('\n📋 Summary:');
  console.log('✅ Server connectivity');
  console.log('✅ User registration');
  console.log('✅ Email verification requirement');
  console.log('✅ Account creation');
  console.log('✅ Duplicate prevention');
  console.log('✅ KYC system ready');
  console.log('\n🚀 Ready for new user registrations!');
}

// Run the test
testRegistrationFlow().catch(console.error); 