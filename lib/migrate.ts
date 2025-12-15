import { getPool } from './db';
import fs from 'fs';
import path from 'path';

export async function runMigration() {
  const pool = getPool();
  
  try {
    // Read schema file
    const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema
    await pool.query(schema);
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}
