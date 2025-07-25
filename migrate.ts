import { db } from './server/db';
import * as schema from './shared/schema';

async function migrate() {
  console.log('Running migrations...');
  // Tabloları oluştur
  await db.insert(schema.users).values({
    email: 'admin@example.com',
    password: 'temp123',
    consent_version: '1.0'
  });
  console.log('Migration completed');
}

migrate().catch(console.error);
