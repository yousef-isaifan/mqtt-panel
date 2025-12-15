const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const config = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  database: 'postgres', // Connect to default database first
};

const POSTGRES_DB = process.env.POSTGRES_DB || 'mqtt_dashboard';

console.log('='.repeat(50));
console.log('PostgreSQL Database Setup');
console.log('='.repeat(50));
console.log(`\nHost: ${config.host}:${config.port}`);
console.log(`User: ${config.user}`);
console.log(`Database: ${POSTGRES_DB}\n`);

async function setup() {
  let pool;
  
  try {
    // Connect to PostgreSQL
    console.log('1. Connecting to PostgreSQL...');
    pool = new Pool(config);
    await pool.query('SELECT NOW()');
    console.log('✓ Connected to PostgreSQL\n');

    // Create database
    console.log(`2. Creating database '${POSTGRES_DB}'...`);
    try {
      await pool.query(`CREATE DATABASE ${POSTGRES_DB}`);
      console.log(`✓ Database '${POSTGRES_DB}' created\n`);
    } catch (error) {
      if (error.code === '42P04') {
        console.log(`⚠ Database '${POSTGRES_DB}' already exists\n`);
      } else {
        throw error;
      }
    }

    // Close connection to default database
    await pool.end();

    // Connect to the new database
    console.log('3. Connecting to new database...');
    pool = new Pool({ ...config, database: POSTGRES_DB });
    console.log('✓ Connected\n');

    // Run schema
    console.log('4. Running database schema...');
    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    console.log('✓ Schema applied\n');

    await pool.end();

    console.log('='.repeat(50));
    console.log('✓ Database setup complete!');
    console.log('='.repeat(50));
    console.log('\nYou can now run: npm run dev');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Setup failed:', error.message);
    console.error('\nPlease ensure:');
    console.error('1. PostgreSQL is installed and running');
    console.error('2. You have the correct credentials in .env.local');
    console.error('3. The PostgreSQL user has database creation privileges');
    
    if (pool) {
      await pool.end();
    }
    process.exit(1);
  }
}

setup();
