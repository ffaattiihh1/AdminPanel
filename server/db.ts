import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// PostgreSQL istemcisini oluştur
export const sql = postgres({
  host: 'localhost',
  database: 'admin_panel',
  username: 'admin_panel_user',
  password: 'password123',
  port: 5432
});

// Drizzle ORM'yi PostgreSQL istemcisi ile başlat
export const db = drizzle(sql, { schema });

// Test bağlantısı yapalım
async function testConnection() {
  try {
    const result = await db.select().from(schema.users).limit(1);
    console.log('✅ PostgreSQL bağlantısı başarılı');
  } catch (error) {
    console.error('❌ PostgreSQL bağlantı hatası:', error);
  }
}

testConnection();