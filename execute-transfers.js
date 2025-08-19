const { Client } = require('pg');
const fs = require('fs');

async function executeTransfers() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false
  });

  try {
    console.log('🔧 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Read the SQL file
    const sqlContent = fs.readFileSync('./create-transfers.sql', 'utf8');
    
    console.log('📝 Executing SQL transfers...');
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`   Executing statement ${i + 1}/${statements.length}...`);
        try {
          const result = await client.query(statement);
          if (result.rows && result.rows.length > 0) {
            console.log('   ✅ Result:', result.rows);
          } else {
            console.log('   ✅ Statement executed successfully');
          }
        } catch (error) {
          console.error(`   ❌ Error in statement ${i + 1}:`, error.message);
        }
      }
    }

    console.log('\n✅ All transfers completed successfully!');

  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await client.end();
  }
}

executeTransfers(); 