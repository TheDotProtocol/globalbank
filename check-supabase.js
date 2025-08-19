const https = require('https');

async function checkSupabaseStatus() {
  const projectRef = 'rbmpeyjaoitdvafxntao';
  
  console.log('🔍 Checking Supabase project status...');
  console.log('Project reference:', projectRef);
  
  // Test basic connectivity
  const testUrls = [
    `https://${projectRef}.supabase.co`,
    `https://${projectRef}.supabase.co/rest/v1/`,
    `https://api.supabase.com/v1/projects/${projectRef}`
  ];
  
  for (const url of testUrls) {
    try {
      console.log(`\nTesting: ${url}`);
      const response = await new Promise((resolve, reject) => {
        https.get(url, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({ statusCode: res.statusCode, data }));
        }).on('error', reject);
      });
      
      console.log(`Status: ${response.statusCode}`);
      if (response.statusCode === 200) {
        console.log('✅ Connection successful');
      } else {
        console.log('⚠️  Connection returned non-200 status');
      }
    } catch (error) {
      console.log(`❌ Connection failed: ${error.message}`);
    }
  }
  
  console.log('\n📋 Next steps:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Check if your project is active (not paused)');
  console.log('3. Go to Settings > Database');
  console.log('4. Copy the connection string from there');
  console.log('5. Make sure the password is URL-encoded');
}

checkSupabaseStatus(); 