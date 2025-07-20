require('dotenv').config();
const { Client } = require('pg');

async function addBabyTauTransaction() {
  // Create a direct PostgreSQL client
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('💰 Adding transaction for Baby Tau account...');
    
    // Find Baby Tau user by email
    const userResult = await client.query(
      'SELECT id, "firstName", "lastName" FROM users WHERE email = $1',
      ['babyaccount@globaldotbank.org']
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ Baby Tau user not found');
      return;
    }
    
    const user = userResult.rows[0];
    console.log(`✅ Found user: ${user.firstName} ${user.lastName}`);
    
    // Find Baby Tau's account
    const accountResult = await client.query(
      'SELECT id, "accountNumber", balance FROM accounts WHERE "userId" = $1',
      [user.id]
    );
    
    if (accountResult.rows.length === 0) {
      console.log('❌ Baby Tau account not found');
      return;
    }
    
    const account = accountResult.rows[0];
    console.log(`✅ Found account: ${account.accountNumber}`);
    console.log(`   Current balance: $${account.balance}`);
    
    // Create yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(14, 30, 0, 0); // Set to 2:30 PM yesterday
    
    // Start transaction
    await client.query('BEGIN');
    
    try {
      // Create the transaction
      const transactionResult = await client.query(
        `INSERT INTO transactions (
          id, "userId", "accountId", type, amount, description, status, reference, 
          "createdAt", "updatedAt", "transferMode", "sourceAccountHolder", 
          "destinationAccountHolder", "transferFee", "netAmount"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
        ) RETURNING id`,
        [
          `txn-${Date.now()}`,
          user.id,
          account.id,
          'CREDIT',
          250000,
          'AR Holdings Group Corporation - Daddy\'s gift',
          'COMPLETED',
          `AR-HOLDINGS-GIFT-${Date.now()}`,
          yesterday,
          yesterday,
          'EXTERNAL_TRANSFER',
          'AR Holdings Group Corporation',
          `${user.firstName} ${user.lastName}`,
          0,
          250000
        ]
      );
      
      // Update account balance
      await client.query(
        'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
        [250000, account.id]
      );
      
      // Commit transaction
      await client.query('COMMIT');
      
      // Verify the update
      const updatedAccountResult = await client.query(
        'SELECT balance FROM accounts WHERE id = $1',
        [account.id]
      );
      
      console.log(`✅ Created transaction: ${transactionResult.rows[0].id}`);
      console.log(`✅ Updated balance: $${updatedAccountResult.rows[0].balance}`);
      console.log('🎉 Transaction added successfully!');
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Error adding transaction:', error);
  } finally {
    await client.end();
  }
}

addBabyTauTransaction(); 