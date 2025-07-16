const { PrismaClient } = require('@prisma/client');

async function testConnectionOptions() {
  const baseUrl = 'postgresql://postgres:';
  const host = '@db.rbmpeyjaoitdvafxntao.supabase.co:5432/postgres';
  
  // Different password encoding options
  const passwordOptions = [
    'Globalbank2024',                    // Original
    'Globalbank2024%40',                 // URL encoded @
    encodeURIComponent('Globalbank2024'), // Full URL encoding
    'Globalbank2024%21',                 // URL encoded !
    'Globalbank2024%23',                 // URL encoded #
    'Globalbank2024%24',                 // URL encoded $
    'Globalbank2024%25',                 // URL encoded %
    'Globalbank2024%26',                 // URL encoded &
    'Globalbank2024%27',                 // URL encoded '
    'Globalbank2024%28',                 // URL encoded (
    'Globalbank2024%29',                 // URL encoded )
    'Globalbank2024%2A',                 // URL encoded *
    'Globalbank2024%2B',                 // URL encoded +
    'Globalbank2024%2C',                 // URL encoded ,
    'Globalbank2024%2F',                 // URL encoded /
    'Globalbank2024%3A',                 // URL encoded :
    'Globalbank2024%3B',                 // URL encoded ;
    'Globalbank2024%3D',                 // URL encoded =
    'Globalbank2024%3F',                 // URL encoded ?
    'Globalbank2024%40',                 // URL encoded @
    'Globalbank2024%5B',                 // URL encoded [
    'Globalbank2024%5D',                 // URL encoded ]
  ];

  console.log('🔍 Testing different connection string formats...\n');

  for (let i = 0; i < passwordOptions.length; i++) {
    const password = passwordOptions[i];
    const connectionString = baseUrl + password + host;
    
    console.log(`Test ${i + 1}: ${password}`);
    console.log(`Connection: ${connectionString.substring(0, 50)}...`);
    
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: connectionString,
        },
      },
    });

    try {
      await prisma.$connect();
      console.log('✅ SUCCESS! Use this connection string:');
      console.log(connectionString);
      console.log('\n🎉 Found working connection!');
      await prisma.$disconnect();
      return;
    } catch (error) {
      console.log(`❌ Failed: ${error.message.substring(0, 100)}...`);
      await prisma.$disconnect();
    }
    
    console.log('---\n');
  }
  
  console.log('❌ All connection attempts failed.');
  console.log('\n📋 Manual steps to try:');
  console.log('1. Go to Supabase Dashboard → Settings → Database');
  console.log('2. Copy the exact connection string shown there');
  console.log('3. Make sure your project is not paused');
  console.log('4. Check if there are any IP restrictions');
}

testConnectionOptions(); 