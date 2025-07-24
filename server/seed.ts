import { db } from './db';
import { users } from '@shared/schema';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  await db.insert(users).values({
    email: 'admin@example.com',
    username: 'admin',
    password: hashedPassword,
    name: 'Admin',
    is_active: true,
    role: 'admin'
  });
  
  console.log('Test kullanıcısı başarıyla oluşturuldu');
}

seedDatabase().catch(console.error);
