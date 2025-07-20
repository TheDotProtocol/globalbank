const BASE_URL = 'http://localhost:3000';

async function simpleRegistrationTest() {
  console.log('🧪 Simple Registration Test\n');

  const testEmail = `simpletest${Date.now()}@example.com`;
  
  try {
    console.log('Testing registration with:', testEmail);
    
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Simple',
        lastName: 'Test',
        email: testEmail,
        password: 'TestPass123!',
        phone: '1234567890'
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration successful!');
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Registration failed');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

simpleRegistrationTest(); 