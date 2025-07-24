import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertSurveySchema, insertStorySchema, insertNotificationSchema, insertMapTaskSchema, users } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { login, updateProfile, register } from "./auth";

declare module 'express-session' {
  interface SessionData {
    user: any;
  }
}

declare global {
  namespace Express {
    interface Request {
      session: any;
    }
  }
}
import * as XLSX from "xlsx";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard Analytics
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "İstatistikler alınırken hata oluştu" });
    }
  });

  app.get("/api/analytics", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const analytics = await storage.getAnalytics(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Analitik verileri alınırken hata oluştu" });
    }
  });

  // Survey Management
  app.get("/api/surveys", async (req, res) => {
    try {
      const { offset = 0, limit = 50 } = req.query;
      const surveys = await storage.getSurveys(Number(offset), Number(limit));
      const totalCount = await storage.getSurveysCount();
      res.json({ surveys, totalCount });
    } catch (error) {
      console.error("Error fetching surveys:", error);
      res.status(500).json({ message: "Anketler alınırken hata oluştu" });
    }
  });

  app.get("/api/surveys/:id", async (req, res) => {
    try {
      const survey = await storage.getSurvey(Number(req.params.id));
      if (!survey) {
        return res.status(404).json({ message: "Anket bulunamadı" });
      }
      res.json(survey);
    } catch (error) {
      console.error("Error fetching survey:", error);
      res.status(500).json({ message: "Anket alınırken hata oluştu" });
    }
  });

  app.post("/api/surveys", async (req, res) => {
    try {
      // Convert string values to numbers if needed
      const data = { ...req.body };
      if (data.reward && typeof data.reward === 'string') {
        data.reward = parseFloat(data.reward);
      }
      if (data.latitude && typeof data.latitude === 'string') {
        data.latitude = parseFloat(data.latitude);
      }
      if (data.longitude && typeof data.longitude === 'string') {
        data.longitude = parseFloat(data.longitude);
      }
      
      const surveyData = insertSurveySchema.parse(data);
      const survey = await storage.createSurvey(surveyData);
      res.status(201).json(survey);
    } catch (error) {
      console.error("Error creating survey:", error);
      res.status(500).json({ message: "Anket oluşturulurken hata oluştu" });
    }
  });

  app.put("/api/surveys/:id", async (req, res) => {
    try {
      const survey = await storage.updateSurvey(Number(req.params.id), req.body);
      res.json(survey);
    } catch (error) {
      console.error("Error updating survey:", error);
      res.status(500).json({ message: "Anket güncellenirken hata oluştu" });
    }
  });

  app.delete("/api/surveys/:id", async (req, res) => {
    try {
      await storage.deleteSurvey(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting survey:", error);
      res.status(500).json({ message: "Anket silinirken hata oluştu" });
    }
  });

  // Auth
  app.post("/api/auth/login", login);
  app.post("/api/auth/register", register);

  // User Management
  app.get("/api/users", async (req, res) => {
    try {
      const { offset = 0, limit = 50 } = req.query;
      const users = await storage.getUsers(Number(offset), Number(limit));
      const totalCount = await storage.getUsersCount();
      res.json({ users, totalCount });
    } catch (error) {
      console.error(error.stack || error);
      res.status(500).json({ message: "Kullanıcılar alınırken hata oluştu" });
      throw error;
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(Number(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Kullanıcı alınırken hata oluştu" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const userId = Number(req.params.id);
      const updateData = req.body;
      if (updateData.username) {
        // Kullanıcı adı başka bir kullanıcıda var mı kontrol et
        const allUsers = await storage.getUsers(0, 10000);
        const exists = allUsers.find(u => u.username === updateData.username && u.id !== userId);
        if (exists) {
          return res.status(409).json({ success: false, message: "Bu kullanıcı adı başka bir kullanıcıda var" });
        }
      }
      const user = await storage.updateUser(userId, updateData);
      res.json({ success: true, user });
    } catch (error) {
      console.error("Profil güncelleme hatası:", error);
      res.status(500).json({ success: false, message: "Profil güncellenirken hata oluştu" });
    }
  });

  app.get("/api/users/:id/history", async (req, res) => {
    try {
      const userId = Number(req.params.id);
      // Gerçek veri: tamamladığı anketler, arkadaş aktiviteleri, yarım kalanlar
      const earned = await storage.getUserCompletedSurveys(userId);
      const friends = await storage.getFriendsActivities(userId);
      const incomplete = await storage.getUserIncompleteSurveys(userId);
      res.json({ earned, friends, incomplete });
    } catch (error) {
      res.status(500).json({ message: "Kullanıcı geçmişi alınırken hata oluştu" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      await storage.deleteUser(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Kullanıcı silinirken hata oluştu" });
    }
  });

  // Story Management
  app.get("/api/stories", async (req, res) => {
    try {
      const stories = await storage.getActiveStories();
      res.json(stories);
    } catch (error) {
      console.error("Error fetching stories:", error);
      res.status(500).json({ message: "Hikayeler alınırken hata oluştu" });
    }
  });

  app.get("/api/admin/stories", async (req, res) => {
    try {
      const stories = await storage.getActiveStories();
      res.json({ stories });
    } catch (error) {
      console.error("Error fetching stories:", error);
      res.status(500).json({ message: "Hikayeler alınırken hata oluştu" });
    }
  });

  app.post("/api/stories", async (req, res) => {
    try {
      const storyData = insertStorySchema.parse(req.body);
      const story = await storage.createStory(storyData);
      res.status(201).json(story);
    } catch (error) {
      console.error("Error creating story:", error);
      res.status(500).json({ message: "Hikaye oluşturulurken hata oluştu" });
    }
  });

  app.post("/api/admin/stories", async (req, res) => {
    try {
      const storyData = insertStorySchema.parse(req.body);
      const story = await storage.createStory(storyData);
      res.status(201).json(story);
    } catch (error) {
      console.error("Error creating story:", error);
      res.status(500).json({ message: "Hikaye oluşturulurken hata oluştu" });
    }
  });

  app.put("/api/admin/stories/:id", async (req, res) => {
    try {
      const story = await storage.updateStory(Number(req.params.id), req.body);
      res.json(story);
    } catch (error) {
      console.error("Error updating story:", error);
      res.status(500).json({ message: "Hikaye güncellenirken hata oluştu" });
    }
  });

  app.delete("/api/stories/:id", async (req, res) => {
    try {
      await storage.deleteStory(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting story:", error);
      res.status(500).json({ message: "Hikaye silinirken hata oluştu" });
    }
  });

  app.delete("/api/admin/stories/:id", async (req, res) => {
    try {
      await storage.deleteStory(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting story:", error);
      res.status(500).json({ message: "Hikaye silinirken hata oluştu" });
    }
  });

  // Product Management
  app.get("/api/products", async (req, res) => {
    try {
      const { offset = 0, limit = 50 } = req.query;
      const products = await storage.getProducts(Number(offset), Number(limit));
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Ürünler alınırken hata oluştu" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const product = await storage.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Ürün oluşturulurken hata oluştu" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.updateProduct(Number(req.params.id), req.body);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Ürün güncellenirken hata oluştu" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      await storage.deleteProduct(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Ürün silinirken hata oluştu" });
    }
  });

  // Ürün satın alma endpointi
  app.post("/api/products/:id/purchase", async (req, res) => {
    try {
      const productId = Number(req.params.id);
      const { userId, size, color, quantity = 1 } = req.body;
      if (!userId || !size || !color) {
        return res.status(400).json({ message: "Kullanıcı, beden ve renk zorunlu" });
      }
      // Ürünü getir
      const product = await storage.getProduct(productId);
      if (!product) return res.status(404).json({ message: "Ürün bulunamadı" });
      // Varyantı bul
      const variants = product.variants || [];
      const variantIndex = variants.findIndex(v => v.size === size && v.color === color);
      if (variantIndex === -1) return res.status(400).json({ message: "Varyant bulunamadı" });
      if (variants[variantIndex].stock < quantity) return res.status(400).json({ message: "Yeterli stok yok" });
      // Kullanıcıyı getir
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      // Kullanıcı puanı yeterli mi?
      if ((user.total_earnings || 0) < (product.rewardPoints * quantity)) {
        return res.status(400).json({ message: "Yetersiz puan" });
      }
      // Stok ve kullanıcı puanını güncelle
      variants[variantIndex].stock -= quantity;
      await storage.updateProduct(productId, { variants });
      await storage.updateUser(userId, { total_earnings: (user.total_earnings || 0) - (product.rewardPoints * quantity) });
      // Son güncel ürünü ve kullanıcıyı döndür
      const updatedProduct = await storage.getProduct(productId);
      const updatedUser = await storage.getUser(userId);
      res.json({ success: true, product: updatedProduct, user: updatedUser });
    } catch (error) {
      console.error("Satın alma hatası:", error);
      res.status(500).json({ message: "Satın alma işlemi sırasında hata oluştu" });
    }
  });

  // Settings Management
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Ayarlar alınırken hata oluştu" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const settings = await storage.updateSettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Ayarlar güncellenirken hata oluştu" });
    }
  });

  // Stores Management
  app.get("/api/stores", async (req, res) => {
    try {
      const stores = await storage.getStores();
      res.json(stores);
    } catch (error) {
      console.error("Error fetching stores:", error);
      res.status(500).json({ message: "Mağazalar alınırken hata oluştu" });
    }
  });

  app.post("/api/stores", async (req, res) => {
    try {
      const store = await storage.createStore(req.body);
      res.status(201).json(store);
    } catch (error) {
      console.error("Error creating store:", error);
      res.status(500).json({ message: "Mağaza oluşturulurken hata oluştu" });
    }
  });

  app.put("/api/stores/:id", async (req, res) => {
    try {
      const store = await storage.updateStore(Number(req.params.id), req.body);
      res.json(store);
    } catch (error) {
      console.error("Error updating store:", error);
      res.status(500).json({ message: "Mağaza güncellenirken hata oluştu" });
    }
  });

  app.delete("/api/stores/:id", async (req, res) => {
    try {
      await storage.deleteStore(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting store:", error);
      res.status(500).json({ message: "Mağaza silinirken hata oluştu" });
    }
  });

  // Map Task Management enhancements
  app.get("/api/map-tasks", async (req, res) => {
    try {
      const tasks = await storage.getMapTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching map tasks:", error);
      res.status(500).json({ message: "Harita görevleri alınırken hata oluştu" });
    }
  });

  app.post("/api/map-tasks", async (req, res) => {
    try {
      const taskData = insertMapTaskSchema.parse(req.body);
      const task = await storage.createMapTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating map task:", error);
      res.status(500).json({ message: "Harita görevi oluşturulurken hata oluştu" });
    }
  });

  app.put("/api/map-tasks/:id", async (req, res) => {
    try {
      const task = await storage.updateMapTask(Number(req.params.id), req.body);
      res.json(task);
    } catch (error) {
      console.error("Error updating map task:", error);
      res.status(500).json({ message: "Harita görevi güncellenirken hata oluştu" });
    }
  });

  app.delete("/api/map-tasks/:id", async (req, res) => {
    try {
      await storage.deleteMapTask(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting map task:", error);
      res.status(500).json({ message: "Harita görevi silinirken hata oluştu" });
    }
  });

  // Notifications Management
  app.get("/api/notifications", async (req, res) => {
    try {
      const { offset = 0, limit = 50 } = req.query;
      const notifications = await storage.getNotifications(Number(offset), Number(limit));
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Bildirimler alınırken hata oluştu" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const notificationData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Bildirim oluşturulurken hata oluştu" });
    }
  });

  app.post("/api/notifications/send/:id", async (req, res) => {
    try {
      const notification = await storage.updateNotification(Number(req.params.id), {
        isSent: true,
        sentAt: new Date(),
      });
      res.json(notification);
    } catch (error) {
      console.error("Error sending notification:", error);
      res.status(500).json({ message: "Bildirim gönderilirken hata oluştu" });
    }
  });

  // Media Upload Routes
  app.post("/api/upload/media", async (req, res) => {
    try {
      // In a real implementation, you would:
      // 1. Use multer middleware to handle file upload
      // 2. Validate file type and size
      // 3. Upload to cloud storage (AWS S3, Cloudinary, etc.)
      // 4. Return the public URL
      
      // For demo purposes, we'll return a placeholder URL
      const fileName = `media_${Date.now()}.jpg`;
      const url = `/uploads/${fileName}`;
      
      res.json({ url, fileName });
    } catch (error) {
      console.error("Error uploading media:", error);
      res.status(500).json({ message: "Medya yüklenirken hata oluştu" });
    }
  });

  app.post("/api/upload/product-image", async (req, res) => {
    try {
      // For demo purposes, we'll return a placeholder URL
      const fileName = `product_${Date.now()}.jpg`;
      const url = `/uploads/products/${fileName}`;
      
      res.json({ url, fileName });
    } catch (error) {
      console.error("Error uploading product image:", error);
      res.status(500).json({ message: "Ürün görseli yüklenirken hata oluştu" });
    }
  });

  // User Authentication Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = req.body;
      
      // Gerekli alanların kontrolü
      if (!userData.email || !userData.password || !userData.username) {
        return res.status(400).json({ 
          success: false,
          message: "E-posta, şifre ve kullanıcı adı zorunludur" 
        });
      }

      // Kullanıcı oluştur
      const user = await storage.createUser(userData);
      
      // Şifreyi response'tan çıkar
      const { password, ...userWithoutPassword } = user;
      
      // Kullanıcı bilgilerini session'a kaydet
      req.session.user = userWithoutPassword;
      
      res.status(201).json({
        success: true,
        message: "Kullanıcı başarıyla oluşturuldu",
        user: userWithoutPassword
      });
    } catch (error) {
      console.error("Kayıt hatası:", error);
      
      let errorMessage = "Kayıt sırasında bir hata oluştu";
      if (error.code === 'SQLITE_CONSTRAINT') {
        errorMessage = "Bu e-posta adresi veya kullanıcı adı zaten kullanımda";
      }
      
      res.status(500).json({ 
        success: false,
        message: errorMessage 
      });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          success: false,
          message: "E-posta ve şifre zorunludur" 
        });
      }
      
      // Kullanıcıyı e-posta ile bul
      const [user] = await db.select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: "Geçersiz e-posta veya şifre" 
        });
      }
      
      // Şifre kontrolü (basit bir karşılaştırma, gerçekte hash karşılaştırması yapılmalı)
      if (user.password !== password) {
        return res.status(401).json({ 
          success: false,
          message: "Geçersiz e-posta veya şifre" 
        });
      }
      
      // Şifreyi response'tan çıkar
      const { password: _, ...userWithoutPassword } = user;
      
      // Kullanıcı bilgilerini session'a kaydet
      req.session.user = userWithoutPassword;
      
      res.json({
        success: true,
        message: "Giriş başarılı",
        user: userWithoutPassword
      });
    } catch (error) {
      console.error("Giriş hatası:", error);
      res.status(500).json({ 
        success: false,
        message: "Giriş sırasında bir hata oluştu" 
      });
    }
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.session.user) {
      res.json({ 
        success: true, 
        user: req.session.user 
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: "Oturum bulunamadı" 
      });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    // Session'ı yok et
    req.session.destroy((err) => {
      if (err) {
        console.error("Çıkış hatası:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Çıkış yapılırken bir hata oluştu" 
        });
      }
      
      // Çerezleri temizle
      res.clearCookie("connect.sid");
      
      res.json({ 
        success: true, 
        message: "Başarıyla çıkış yapıldı" 
      });
    });
  });

  // Auth routes
  app.post("/api/auth/login", login);
  app.put("/api/users/:id", updateProfile);

  // Product Export Route
  app.get("/api/export/products", async (req, res) => {
    try {
      const products = await storage.getProducts(0, 10000);
      
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(products.map(product => ({
        'Ürün Adı': product.name,
        'Açıklama': product.description,
        'Kategori': product.category,
        'Fiyat': product.price,
        'Ödül Puanı': product.rewardPoints,
        'Stok': product.stock,
        'Durum': product.isActive ? 'Aktif' : 'Pasif',
        'Oluşturulma Tarihi': product.createdAt,
      })));

      XLSX.utils.book_append_sheet(workbook, worksheet, "Ürünler");
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Disposition', 'attachment; filename=urunler.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } catch (error) {
      console.error("Error exporting products:", error);
      res.status(500).json({ message: "Ürünler dışa aktarılırken hata oluştu" });
    }
  });

  // Excel Export Routes
  app.get("/api/export/surveys", async (req, res) => {
    try {
      const surveys = await storage.getSurveys(0, 1000);
      
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(surveys.map(survey => ({
        'Anket Adı': survey.title,
        'Tür': survey.type,
        'Kategori': survey.category,
        'Durum': survey.status,
        'Hedef Katılımcı': survey.targetParticipants,
        'Mevcut Katılımcı': survey.currentParticipants,
        'Tamamlanan': survey.completedCount,
        'Ödeme': survey.reward,
        'Oluşturulma Tarihi': survey.createdAt,
      })));

      XLSX.utils.book_append_sheet(workbook, worksheet, "Anketler");
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Disposition', 'attachment; filename=anketler.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } catch (error) {
      console.error("Error exporting surveys:", error);
      res.status(500).json({ message: "Anketler dışa aktarılırken hata oluştu" });
    }
  });

  app.get("/api/export/users", async (req, res) => {
    try {
      const users = await storage.getUsers(0, 10000);
      
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(users.map(user => ({
        'Ad': user.name,
        'E-posta': user.email,
        'Yaş': user.age,
        'Cinsiyet': user.gender,
        'Şehir': user.city,
        'Enlem': user.latitude,
        'Boylam': user.longitude,
        'IP Adresi': user.ipAddress,
        'Aktif': user.isActive ? 'Evet' : 'Hayır',
        'Toplam Kazanç': user.totalEarnings,
        'Tamamlanan Anket': user.completedSurveys,
        'Son Giriş': user.lastLoginAt,
        'Kayıt Tarihi': user.createdAt,
      })));

      XLSX.utils.book_append_sheet(workbook, worksheet, "Kullanıcılar");
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Disposition', 'attachment; filename=kullanicilar.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } catch (error) {
      console.error("Error exporting users:", error);
      res.status(500).json({ message: "Kullanıcılar dışa aktarılırken hata oluştu" });
    }
  });

  // Admin Users Routes
  app.get("/api/admin-users", async (req, res) => {
    try {
      const { offset = 0, limit = 50 } = req.query;
      const adminUsers = await storage.getAdminUsers(Number(offset), Number(limit));
      res.json(adminUsers);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Admin kullanıcıları alınırken hata oluştu" });
    }
  });

  app.post("/api/admin-users", async (req, res) => {
    try {
      const adminUser = await storage.createAdminUser(req.body);
      res.json(adminUser);
    } catch (error) {
      console.error("Error creating admin user:", error);
      res.status(500).json({ message: "Admin kullanıcı oluşturulurken hata oluştu" });
    }
  });

  app.put("/api/admin-users/:id", async (req, res) => {
    try {
      const adminUser = await storage.updateAdminUser(Number(req.params.id), req.body);
      res.json(adminUser);
    } catch (error) {
      console.error("Error updating admin user:", error);
      res.status(500).json({ message: "Admin kullanıcı güncellenirken hata oluştu" });
    }
  });

  app.delete("/api/admin-users/:id", async (req, res) => {
    try {
      await storage.deleteAdminUser(Number(req.params.id));
      res.json({ message: "Admin kullanıcı silindi" });
    } catch (error) {
      console.error("Error deleting admin user:", error);
      res.status(500).json({ message: "Admin kullanıcı silinirken hata oluştu" });
    }
  });

  // Survey Analytics Routes
  app.get("/api/survey-analytics/:surveyId", async (req, res) => {
    try {
      const analytics = await storage.getSurveyAnalytics(Number(req.params.surveyId));
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching survey analytics:", error);
      res.status(500).json({ message: "Anket istatistikleri alınırken hata oluştu" });
    }
  });

  // AUTH ENDPOINTS
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, username, password, name, age, gender, city, latitude, longitude } = req.body;
      // Hangi alanlar eksik, tek tek kontrol et
      const eksikAlanlar = [];
      if (!email) eksikAlanlar.push('email');
      if (!username) eksikAlanlar.push('username');
      if (!password) eksikAlanlar.push('password');
      if (!name) eksikAlanlar.push('name');
      if (eksikAlanlar.length > 0) {
        return res.status(400).json({ success: false, message: `Eksik alanlar: ${eksikAlanlar.join(', ')}` });
      }
      // E-posta veya kullanıcı adı benzersiz mi kontrol et
      const existingEmail = await storage.getUserByEmail(email);
      const existingUsername = await storage.getUsers(0, 10000).then(users => users.find(u => u.username === username));
      if (existingEmail) {
        return res.status(409).json({ success: false, message: "Bu e-posta ile kayıtlı kullanıcı var" });
      }
      if (existingUsername) {
        return res.status(409).json({ success: false, message: "Bu kullanıcı adı ile kayıtlı kullanıcı var" });
      }
      // Kullanıcı oluşturmayı denerken hata olursa detaylı logla
      try {
        const user = await storage.createUser({
          email,
          username,
          password, // TODO: bcrypt ile hashle
          name,
          age,
          gender,
          city,
          latitude,
          longitude,
          created_at: Math.floor(Date.now() / 1000),
          last_login_at: Math.floor(Date.now() / 1000),
          is_active: true
        });
        res.status(201).json({ success: true, user, message: "Kayıt başarılı" });
      } catch (dbError) {
        console.error("Kullanıcı oluşturulurken DB hatası:", dbError);
        res.status(500).json({ success: false, message: `Kullanıcı oluşturulurken hata oluştu: ${dbError.message || dbError}` });
      }
    } catch (error) {
      console.error("Kayıt endpointi genel hata:", error);
      res.status(500).json({ success: false, message: `Kayıt endpointinde genel hata: ${error.message || error}` });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: "E-posta veya kullanıcı adı ve şifre zorunludur." });
      }
      // Hem email hem username ile giriş desteği
      let user = await storage.getUserByEmail(email);
      if (!user) {
        // Eğer email ile bulunamazsa username ile dene
        const allUsers = await storage.getUsers(0, 10000);
        user = allUsers.find(u => u.username === email);
      }
      if (!user) {
        return res.status(401).json({ success: false, message: "Kullanıcı bulunamadı veya şifre hatalı." });
      }
      // Şifre kontrolü (demo! Gerçekte hash kullanın)
      if (user.password !== password) {
        return res.status(401).json({ success: false, message: "Kullanıcı bulunamadı veya şifre hatalı." });
      }
      await storage.updateUser(user.id, { last_login_at: Math.floor(Date.now() / 1000) });
      res.json({ success: true, user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name
      }, message: "Giriş başarılı!" });
    } catch (error) {
      console.error("Giriş hatası:", error);
      res.status(500).json({ success: false, message: "Giriş işlemi sırasında bir hata oluştu." });
    }
  });

  // MOBILE ENDPOINTS
  app.get("/api/mobile/surveys", async (req, res) => {
    try {
      const surveys = await storage.getSurveys(0, 100);
      res.json({ success: true, surveys });
    } catch (error) {
      console.error("Error fetching surveys:", error);
      res.status(500).json({ success: false, message: "Anketler alınırken hata oluştu" });
    }
  });

  app.get("/api/mobile/user/profile/:userId", async (req, res) => {
    try {
      const user = await storage.getUser(Number(req.params.userId));
      if (!user) {
        return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" });
      }
      res.json({ success: true, user });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ success: false, message: "Kullanıcı profili alınırken hata oluştu" });
    }
  });

  app.post("/api/mobile/surveys/:surveyId/complete", async (req, res) => {
    try {
      const { userId, answers } = req.body;
      // TODO: Anket tamamlama lojiği
      res.json({ success: true, message: "Anket tamamlandı" });
    } catch (error) {
      console.error("Error completing survey:", error);
      res.status(500).json({ success: false, message: "Anket tamamlanırken hata oluştu" });
    }
  });

  app.get("/api/mobile/stories", async (req, res) => {
    try {
      const stories = await storage.getActiveStories();
      res.json({ success: true, stories });
    } catch (error) {
      console.error("Error fetching stories:", error);
      res.status(500).json({ success: false, message: "Hikayeler alınırken hata oluştu" });
    }
  });

  app.post("/api/mobile/stories/:storyId/view", async (req, res) => {
    try {
      const { userId } = req.body;
      // TODO: Hikaye görüntüleme kaydı
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking story as viewed:", error);
      res.status(500).json({ success: false, message: "Hikaye görüntüleme kaydedilirken hata oluştu" });
    }
  });

  // Leaderboard (Sıralama) endpointi
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const users = await storage.getTopUsers(20);
      // Rozet ata: 1. gold, 2. silver, 3. bronze, diğerleri none
      const leaderboard = users.map((u, i) => ({
        ...u,
        badge: i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : null
      }));
      res.json({ leaderboard });
    } catch (error) {
      console.error("Leaderboard hatası:", error);
      res.status(500).json({ message: "Sıralama alınırken hata oluştu" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket ve broadcast ile ilgili tüm kodlar kaldırıldı. Sadece REST API endpointleri aktif.

  return httpServer;
}
