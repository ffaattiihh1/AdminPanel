import { 
  users, surveys, survey_responses, stories, map_tasks, notifications, analytics, stores, products, settings, admin_users, survey_analytics, type InsertUserModel
} from "@shared/schema";
import { db } from "./db";
import { desc, eq } from "drizzle-orm";

function generateUserCode() {
  // 6 haneli benzersiz random sayı üret
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export class DatabaseStorage {
  async getUsers(offset = 0, limit = 50) {
    return await db.select().from(users).offset(offset).limit(limit).orderBy(desc(users.created_at));
  }

  async createUser(userData: any): Promise<any> {
    console.log('=== YENİ KAYIT İSTEĞİ BAŞLADI ===');
    console.log('Gelen ham veri (userData):', JSON.stringify(userData, null, 2));

    try {
      // 1. Temel kullanıcı bilgilerini al
      const cleanUserData: any = {
        email: userData.email,
        username: userData.username,
        password: userData.password,
        name: userData.name,
        gender: userData.gender,
        city: userData.city,
      };

      // 2. Yaş hesaplaması yap
      if (userData.age && typeof userData.age === 'string') {
        try {
          const parts = userData.age.split('/'); // Format: GG/AA/YYYY
          if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // JS'de aylar 0'dan başlar
            const year = parseInt(parts[2], 10);
            
            console.log(`Doğum tarihi parçaları - Gün: ${day}, Ay: ${month + 1}, Yıl: ${year}`);
            
            const birthDate = new Date(year, month, day);
            // Geçerli tarih kontrolü
            if (isNaN(birthDate.getTime())) {
              console.error('Geçersiz doğum tarihi:', userData.age);
            } else {
              const today = new Date();
              let age = today.getFullYear() - birthDate.getFullYear();
              const m = today.getMonth() - birthDate.getMonth();
              
              if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
              }
              
              cleanUserData.age = age;
              console.log(`Hesaplanan yaş: ${age}`);
            }
          }
        } catch (e) {
          console.error("Yaş hesaplama hatası:", e);
        }
      }

      // 3. İsteğe bağlı alanları ekle
      if (userData.latitude) cleanUserData.latitude = parseFloat(userData.latitude) || null;
      if (userData.longitude) cleanUserData.longitude = parseFloat(userData.longitude) || null;
      if (userData.ip_address) cleanUserData.ip_address = userData.ip_address;

      console.log('Veritabanına eklenecek son veri:', JSON.stringify(cleanUserData, null, 2));

      // 4. Veritabanına kaydet
      console.log('Veritabanına kayıt işlemi başlıyor...');
      const [user] = await db.insert(users).values(cleanUserData).returning();
      console.log('Kullanıcı başarıyla oluşturuldu:', user);
      
      return user;
    } catch (error) {
      console.error('=== KULLANICI OLUŞTURMA HATASI ===');
      console.error('Hata detayı:', error);
      
      // Hatanın daha detaylı bilgilerini logla
      if (error instanceof Error) {
        console.error('Hata mesajı:', error.message);
        console.error('Stack trace:', error.stack);
      }
      
      // Hata tipine göre özel mesajlar
      if (error && typeof error === 'object' && 'code' in error) {
        console.error('Veritabanı hata kodu:', (error as any).code);
        
        // Benzersiz kısıtlama ihlali (email veya username zaten var)
        if ((error as any).code === 'SQLITE_CONSTRAINT_UNIQUE') {
          console.error('Hata: Bu email veya kullanıcı adı zaten kullanımda.');
        }
      }
      
      console.error('Gönderilen veri:', JSON.stringify(userData, null, 2));
      console.error('======================');
      
      throw error;
    } finally {
      console.log('=== KAYIT İSTEĞİ TAMAMLANDI ===\n');
    }
  }

  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async updateUser(id: number, userData: any) {
    const [user] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return user;
  }

  async getUser(id: number) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUsersCount() {
    const result = await db.select({ count: users.id }).from(users);
    return result.length;
  }

  async deleteUser(id: number) {
    await db.delete(users).where(eq(users.id, id));
  }

  // Dashboard & Analytics
  async getDashboardStats() {
    const userCount = await this.getUsersCount();
    const surveyCount = await this.getSurveysCount();
    const activeUsers = await db.select({ count: users.id }).from(users).where(eq(users.is_active, true));
    
    return {
      totalUsers: userCount,
      totalSurveys: surveyCount,
      activeUsers: activeUsers.length,
      totalEarnings: 0
    };
  }

  async getAnalytics(startDate?: Date, endDate?: Date) {
    return await db.select().from(analytics);
  }

  // Survey methods
  async getSurveys(offset = 0, limit = 50) {
    return await db.select().from(surveys).offset(offset).limit(limit).orderBy(desc(surveys.created_at));
  }

  async getSurvey(id: number) {
    const [survey] = await db.select().from(surveys).where(eq(surveys.id, id));
    return survey;
  }

  async getSurveysCount() {
    const result = await db.select({ count: surveys.id }).from(surveys);
    return result.length;
  }

  async createSurvey(surveyData: any) {
    const [survey] = await db.insert(surveys).values(surveyData).returning();
    return survey;
  }

  async updateSurvey(id: number, surveyData: any) {
    const [survey] = await db.update(surveys).set(surveyData).where(eq(surveys.id, id)).returning();
    return survey;
  }

  async deleteSurvey(id: number) {
    await db.delete(surveys).where(eq(surveys.id, id));
  }

  // Story methods
  async getActiveStories() {
    return await db.select().from(stories).where(eq(stories.is_active, true)).orderBy(desc(stories.created_at));
  }

  async createStory(storyData: any) {
    const [story] = await db.insert(stories).values(storyData).returning();
    return story;
  }

  async deleteStory(id: number) {
    await db.delete(stories).where(eq(stories.id, id));
  }

  // Map Tasks
  async getMapTasks() {
    return await db.select().from(map_tasks).orderBy(desc(map_tasks.created_at));
  }

  async createMapTask(taskData: any) {
    const [task] = await db.insert(map_tasks).values(taskData).returning();
    return task;
  }

  async updateMapTask(id: number, taskData: any) {
    const [task] = await db.update(map_tasks).set(taskData).where(eq(map_tasks.id, id)).returning();
    return task;
  }

  async deleteMapTask(id: number) {
    return await db.delete(map_tasks).where(eq(map_tasks.id, id));
  }

  // Products
  async getProducts(offset = 0, limit = 50) {
    const result = await db.select().from(products).offset(offset).limit(limit).orderBy(desc(products.created_at));
    // Her ürünün varyantını parse et
    return result.map(product => ({
      ...product,
      variants: product.variants ? JSON.parse(product.variants) : [],
    }));
  }

  async createProduct(productData: any) {
    // Varyantlar varsa JSON'a çevir
    const data = { ...productData };
    if (data.variants && Array.isArray(data.variants)) {
      data.variants = JSON.stringify(data.variants);
    }
    const [product] = await db.insert(products).values(data).returning();
    // Okurken parse et
    if (product.variants) {
      product.variants = JSON.parse(product.variants);
    }
    return product;
  }

  async updateProduct(id: number, productData: any) {
    const data = { ...productData };
    if (data.variants && Array.isArray(data.variants)) {
      data.variants = JSON.stringify(data.variants);
    }
    const [product] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    if (product.variants) {
      product.variants = JSON.parse(product.variants);
    }
    return product;
  }

  async deleteProduct(id: number) {
    return await db.delete(products).where(eq(products.id, id));
  }

  async getProduct(id: number) {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    if (!product) return null;
    return {
      ...product,
      variants: product.variants ? JSON.parse(product.variants) : [],
    };
  }

  // Stores
  async getStores() {
    return await db.select().from(stores).orderBy(desc(stores.created_at));
  }

  async createStore(storeData: any) {
    const [store] = await db.insert(stores).values(storeData).returning();
    return store;
  }

  async updateStore(id: number, storeData: any) {
    const [store] = await db.update(stores).set(storeData).where(eq(stores.id, id)).returning();
    return store;
  }

  async deleteStore(id: number) {
    return await db.delete(stores).where(eq(stores.id, id));
  }

  // Settings
  async getSettings() {
    return await db.select().from(settings);
  }

  async updateSettings(settingsData: any) {
    // Settings tablosu genellikle tek satır, upsert pattern kullan
    const existingSettings = await db.select().from(settings).limit(1);
    if (existingSettings.length > 0) {
      const [updated] = await db.update(settings).set(settingsData).where(eq(settings.id, existingSettings[0].id)).returning();
      return updated;
    } else {
      const [created] = await db.insert(settings).values(settingsData).returning();
      return created;
  }
  }

  // Stories
  async updateStory(id: number, storyData: any) {
    const [story] = await db.update(stories).set(storyData).where(eq(stories.id, id)).returning();
    return story;
  }

  // Notifications
  async getNotifications(offset = 0, limit = 50) {
    return await db.select().from(notifications).offset(offset).limit(limit).orderBy(desc(notifications.created_at));
  }

  async createNotification(notificationData: any) {
    const [notification] = await db.insert(notifications).values(notificationData).returning();
    return notification;
  }

  async updateNotification(id: number, notificationData: any) {
    const [notification] = await db.update(notifications).set(notificationData).where(eq(notifications.id, id)).returning();
    return notification;
  }

  // Admin Users
  async getAdminUsers(offset = 0, limit = 50) {
    return await db.select().from(admin_users).offset(offset).limit(limit);
  }

  async createAdminUser(adminUserData: any) {
    const [adminUser] = await db.insert(admin_users).values(adminUserData).returning();
    return adminUser;
  }

  async updateAdminUser(id: number, adminUserData: any) {
    const [adminUser] = await db.update(admin_users).set(adminUserData).where(eq(admin_users.id, id)).returning();
    return adminUser;
  }

  async deleteAdminUser(id: number) {
    await db.delete(admin_users).where(eq(admin_users.id, id));
  }

  // Survey Analytics
  async getSurveyAnalytics(surveyId: number) {
    return await db.select().from(survey_analytics).where(eq(survey_analytics.survey_id, surveyId));
  }

  async getTopUsers(limit = 20) {
    // Sıfır puanlı ve null puanlı kullanıcılar da dahil, azalan sırala
    const result = await db.select().from(users).orderBy(desc(users.total_earnings), desc(users.created_at)).limit(limit);
    return result;
  }

  async getUserCompletedSurveys(userId: number) {
    // Gerçek uygulamada survey_responses tablosundan completed olanlar çekilir
    // Demo: örnek veri
    return [
      { id: 1, title: "İstanbul Anketi", date: "2024-07-23", points: 50 },
      { id: 2, title: "Market Araştırması", date: "2024-07-20", points: 30 },
    ];
  }

  async getFriendsActivities(userId: number) {
    // Gerçek uygulamada user's friends ve onların aktiviteleri çekilir
    // Demo: örnek veri
    return [
      { id: 3, friend: "Ahmet Yılmaz", action: "Anket tamamladı", date: "2024-07-22" },
      { id: 4, friend: "Zeynep Kaya", action: "Hikaye izledi", date: "2024-07-21" },
    ];
  }

  async getUserIncompleteSurveys(userId: number) {
    // Gerçek uygulamada survey_responses tablosundan tamamlanmamışlar çekilir
    // Demo: örnek veri
    return [
      { id: 5, title: "Teknoloji Anketi", startedAt: "2024-07-24" },
    ];
  }
}

export const storage = new DatabaseStorage();