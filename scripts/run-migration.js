require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'mqtt_dashboard',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
});

console.log('Running database migration...');

const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

pool.query(schema)
  .then(() => {
    console.log('✓ Migration completed successfully');
    return pool.end();
  })
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('✗ Migration failed:', error);
    pool.end();
    process.exit(1);
  });
