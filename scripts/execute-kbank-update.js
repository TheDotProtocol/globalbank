const { Client } = require('pg');
const fs = require('fs');

async function updateKBankDetails() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('🏦 Connected to database, updating K Bank details...');

    // Read and execute the SQL file
    const sqlContent = fs.readFileSync('./scripts/fix-kbank-details.sql', 'utf8');
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.trim().substring(0, 50) + '...');
        const result = await client.query(statement);
        
        if (result.rows && result.rows.length > 0) {
          console.log('✅ Query result:', result.rows);
        } else {
          console.log('✅ Query executed successfully');
        }
      }
    }

    console.log('\n✅ K Bank account details updated successfully!');

  } catch (error) {
    console.error('❌ Error updating K Bank details:', error);
  } finally {
    await client.end();
  }
}

updateKBankDetails(); 