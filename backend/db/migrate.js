const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
  });
  
  try {
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schemaSQL);
    console.log('Schema applied successfully');
    
    // Check if we need to seed data
    const result = await pool.query('SELECT COUNT(*) FROM products');
    const productCount = parseInt(result.rows[0].count);
    
    if (productCount === 0) {
      // Seed sample data
      const seedPath = path.join(__dirname, 'seed', 'sample_data.sql');
      const seedSQL = fs.readFileSync(seedPath, 'utf8');
      
      await pool.query(seedSQL);
      console.log('Sample data seeded successfully');
    }
    
  } catch (error) {
    console.error('Error running migrations:', error);
  } finally {
    await pool.end();
  }
}

// Run if this script is executed directly
if (require.main === module) {
  require('dotenv').config({ path: '../.env' });
  runMigrations();
}

module.exports = runMigrations;