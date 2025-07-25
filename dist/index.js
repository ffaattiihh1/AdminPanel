var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  admin_users: () => admin_users,
  analytics: () => analytics,
  insertAdminUserSchema: () => insertAdminUserSchema,
  insertMapTaskSchema: () => insertMapTaskSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertProductSchema: () => insertProductSchema,
  insertSettingsSchema: () => insertSettingsSchema,
  insertStoreSchema: () => insertStoreSchema,
  insertStorySchema: () => insertStorySchema,
  insertSurveyAnalyticsSchema: () => insertSurveyAnalyticsSchema,
  insertSurveyResponseSchema: () => insertSurveyResponseSchema,
  insertSurveySchema: () => insertSurveySchema,
  insertUserSchema: () => insertUserSchema,
  map_tasks: () => map_tasks,
  notificationTypeEnum: () => notificationTypeEnum,
  notifications: () => notifications,
  notificationsRelations: () => notificationsRelations,
  products: () => products,
  productsRelations: () => productsRelations,
  settings: () => settings,
  stores: () => stores,
  storesRelations: () => storesRelations,
  stories: () => stories,
  surveyStatusEnum: () => surveyStatusEnum,
  survey_analytics: () => survey_analytics,
  survey_responses: () => survey_responses,
  survey_responsesRelations: () => survey_responsesRelations,
  surveys: () => surveys,
  surveysRelations: () => surveysRelations,
  taskStatusEnum: () => taskStatusEnum,
  transactionStatusEnum: () => transactionStatusEnum,
  transactionTypeEnum: () => transactionTypeEnum,
  userRoleEnum: () => userRoleEnum,
  userStatusEnum: () => userStatusEnum,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, serial, text, varchar, timestamp, boolean, integer, pgEnum, real, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var userRoleEnum = pgEnum("user_role", ["user", "admin", "moderator"]);
var notificationTypeEnum = pgEnum("notification_type", ["info", "success", "warning", "error", "promotion", "system"]);
var userStatusEnum = pgEnum("user_status", ["active", "inactive", "suspended"]);
var surveyStatusEnum = pgEnum("survey_status", ["draft", "active", "paused", "completed"]);
var transactionTypeEnum = pgEnum("transaction_type", ["credit", "debit"]);
var transactionStatusEnum = pgEnum("transaction_status", ["pending", "completed", "failed"]);
var taskStatusEnum = pgEnum("task_status", ["active", "inactive", "completed", "cancelled"]);
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").unique(),
  password: text("password").notNull(),
  name: text("name"),
  age: integer("age"),
  gender: text("gender"),
  city: text("city"),
  ip_address: text("ip_address"),
  device_info: jsonb("device_info"),
  last_activity: timestamp("last_activity", { mode: "date" }),
  activity_log: jsonb("activity_log").$type(),
  consent_version: text("consent_version").notNull(),
  is_active: boolean("is_active").default(true),
  status: text("status").$type().default("active"),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date" }).defaultNow()
});
var surveys = pgTable("surveys", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }),
  status: surveyStatusEnum("status").default("draft"),
  target_participants: integer("target_participants").default(1e3),
  current_participants: integer("current_participants").default(0),
  completed_count: integer("completed_count").default(0),
  reward: real("reward").default(0),
  duration: integer("duration"),
  url: text("url"),
  questions: text("questions"),
  // JSON string veya JSONB olarak saklanabilir
  latitude: real("latitude"),
  longitude: real("longitude"),
  radius: integer("radius"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().$onUpdate(() => /* @__PURE__ */ new Date()),
  completed_at: timestamp("completed_at")
});
var survey_responses = pgTable("survey_responses", {
  id: serial("id").primaryKey(),
  survey_id: integer("survey_id"),
  user_id: integer("user_id"),
  responses: text("responses"),
  // JSON string olarak saklanacak
  is_completed: boolean("is_completed").default(false),
  score: integer("score"),
  started_at: timestamp("started_at").defaultNow(),
  completed_at: timestamp("completed_at")
});
var stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  media_url: text("media_url"),
  media_file: text("media_file"),
  media_type: varchar("media_type", { length: 100 }),
  is_active: boolean("is_active").default(true),
  view_count: integer("view_count").default(0),
  created_at: timestamp("created_at").defaultNow(),
  expires_at: timestamp("expires_at")
});
var map_tasks = pgTable("map_tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  radius: integer("radius"),
  reward: real("reward"),
  status: text("status").default("active"),
  completed_count: integer("completed_count").default(0),
  created_at: timestamp("created_at").defaultNow()
});
var notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id"),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: notificationTypeEnum("type").default("info"),
  is_read: boolean("is_read").default(false),
  target_user_id: integer("target_user_id"),
  target_user_ids: text("target_user_ids"),
  // JSON string olarak saklanacak
  is_sent: boolean("is_sent").default(false),
  created_at: timestamp("created_at").defaultNow(),
  sent_at: timestamp("sent_at"),
  read_at: timestamp("read_at")
});
var analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  date: timestamp("date").defaultNow(),
  total_users: integer("total_users").default(0),
  active_users: integer("active_users").default(0),
  completed_surveys: integer("completed_surveys").default(0),
  total_earnings: real("total_earnings").default(0)
});
var stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow()
});
var products = pgTable("products", {
  id: serial("id").primaryKey(),
  store_id: integer("store_id"),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: real("price").notNull(),
  stock: integer("stock").default(0),
  images: text("images"),
  // JSON string olarak saklanacak
  category: varchar("category", { length: 100 }),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  variants: text("variants")
  // JSON string olarak varyantlar (beden, renk, stok)
});
var settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value"),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow()
});
var usersRelations = relations(users, ({ many }) => ({
  survey_responses: many(survey_responses),
  notifications: many(notifications)
}));
var surveysRelations = relations(surveys, ({ many }) => ({
  responses: many(survey_responses)
}));
var survey_responsesRelations = relations(survey_responses, ({ one }) => ({
  survey: one(surveys, {
    fields: [survey_responses.survey_id],
    references: [surveys.id]
  }),
  user: one(users, {
    fields: [survey_responses.user_id],
    references: [users.id]
  })
}));
var notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.target_user_id],
    references: [users.id]
  })
}));
var storesRelations = relations(stores, ({ many }) => ({
  products: many(products)
}));
var productsRelations = relations(products, ({ one }) => ({
  store: one(stores, {
    fields: [products.store_id],
    references: [stores.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true
});
var insertSurveySchema = createInsertSchema(surveys).omit({
  id: true,
  created_at: true,
  current_participants: true,
  completed_count: true
});
var insertSurveyResponseSchema = createInsertSchema(survey_responses).omit({
  id: true,
  started_at: true
});
var insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  created_at: true
});
var insertMapTaskSchema = createInsertSchema(map_tasks).omit({
  id: true,
  created_at: true
});
var insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  created_at: true
});
var insertStoreSchema = createInsertSchema(stores).omit({
  id: true,
  created_at: true
});
var insertProductSchema = createInsertSchema(products).omit({
  id: true,
  created_at: true
});
var insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  updated_at: true
});
var admin_users = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: varchar("role", { length: 100 }).default("admin"),
  is_active: boolean("is_active").default(true),
  last_login: timestamp("last_login"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().$onUpdate(() => /* @__PURE__ */ new Date())
});
var insertAdminUserSchema = createInsertSchema(admin_users).omit({
  id: true,
  created_at: true,
  updated_at: true,
  last_login: true
});
var survey_analytics = pgTable("survey_analytics", {
  id: serial("id").primaryKey(),
  survey_id: integer("survey_id").notNull(),
  question_id: text("question_id").notNull(),
  question_text: text("question_text").notNull(),
  question_type: text("question_type").notNull(),
  // "multiple_choice", "text", "rating", etc.
  response_data: text("response_data").notNull(),
  // Cevap verileri ve istatistikler
  demographics: text("demographics").default("{}").notNull(),
  // Yaş, cinsiyet, şehir dağılımları
  total_responses: integer("total_responses").default(0).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().$onUpdate(() => /* @__PURE__ */ new Date())
});
var insertSurveyAnalyticsSchema = createInsertSchema(survey_analytics).omit({
  id: true,
  created_at: true,
  updated_at: true
});

// server/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
var sql = postgres(process.env.DATABASE_URL);
var db = drizzle(sql, { schema: schema_exports });
async function testConnection() {
  try {
    const result = await db.select().from(users).limit(1);
    console.log("\u2705 PostgreSQL ba\u011Flant\u0131s\u0131 ba\u015Far\u0131l\u0131");
  } catch (error) {
    console.error("\u274C PostgreSQL ba\u011Flant\u0131 hatas\u0131:", error);
  }
}
testConnection();

// server/storage.ts
import { desc, eq } from "drizzle-orm";
var DatabaseStorage = class {
  async getUsers(offset = 0, limit = 50) {
    return await db.select().from(users).offset(offset).limit(limit).orderBy(desc(users.created_at));
  }
  async createUser(userData) {
    console.log("=== YEN\u0130 KAYIT \u0130STE\u011E\u0130 BA\u015ELADI ===");
    console.log("Gelen ham veri (userData):", JSON.stringify(userData, null, 2));
    try {
      const cleanUserData = {
        email: userData.email,
        username: userData.username,
        password: userData.password,
        name: userData.name,
        gender: userData.gender,
        city: userData.city
      };
      if (userData.age && typeof userData.age === "string") {
        try {
          const parts = userData.age.split("/");
          if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            console.log(`Do\u011Fum tarihi par\xE7alar\u0131 - G\xFCn: ${day}, Ay: ${month + 1}, Y\u0131l: ${year}`);
            const birthDate = new Date(year, month, day);
            if (isNaN(birthDate.getTime())) {
              console.error("Ge\xE7ersiz do\u011Fum tarihi:", userData.age);
            } else {
              const today = /* @__PURE__ */ new Date();
              let age = today.getFullYear() - birthDate.getFullYear();
              const m = today.getMonth() - birthDate.getMonth();
              if (m < 0 || m === 0 && today.getDate() < birthDate.getDate()) {
                age--;
              }
              cleanUserData.age = age;
              console.log(`Hesaplanan ya\u015F: ${age}`);
            }
          }
        } catch (e) {
          console.error("Ya\u015F hesaplama hatas\u0131:", e);
        }
      }
      if (userData.latitude) cleanUserData.latitude = parseFloat(userData.latitude) || null;
      if (userData.longitude) cleanUserData.longitude = parseFloat(userData.longitude) || null;
      if (userData.ip_address) cleanUserData.ip_address = userData.ip_address;
      console.log("Veritaban\u0131na eklenecek son veri:", JSON.stringify(cleanUserData, null, 2));
      console.log("Veritaban\u0131na kay\u0131t i\u015Flemi ba\u015Fl\u0131yor...");
      const [user] = await db.insert(users).values(cleanUserData).returning();
      console.log("Kullan\u0131c\u0131 ba\u015Far\u0131yla olu\u015Fturuldu:", user);
      return user;
    } catch (error) {
      console.error("=== KULLANICI OLU\u015ETURMA HATASI ===");
      console.error("Hata detay\u0131:", error);
      if (error instanceof Error) {
        console.error("Hata mesaj\u0131:", error.message);
        console.error("Stack trace:", error.stack);
      }
      if (error && typeof error === "object" && "code" in error) {
        console.error("Veritaban\u0131 hata kodu:", error.code);
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
          console.error("Hata: Bu email veya kullan\u0131c\u0131 ad\u0131 zaten kullan\u0131mda.");
        }
      }
      console.error("G\xF6nderilen veri:", JSON.stringify(userData, null, 2));
      console.error("======================");
      throw error;
    } finally {
      console.log("=== KAYIT \u0130STE\u011E\u0130 TAMAMLANDI ===\n");
    }
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async updateUser(id, userData) {
    const [user] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return user;
  }
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUsersCount() {
    const result = await db.select({ count: users.id }).from(users);
    return result.length;
  }
  async deleteUser(id) {
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
  async getAnalytics(startDate, endDate) {
    return await db.select().from(analytics);
  }
  // Survey methods
  async getSurveys(offset = 0, limit = 50) {
    return await db.select().from(surveys).offset(offset).limit(limit).orderBy(desc(surveys.created_at));
  }
  async getSurvey(id) {
    const [survey] = await db.select().from(surveys).where(eq(surveys.id, id));
    return survey;
  }
  async getSurveysCount() {
    const result = await db.select({ count: surveys.id }).from(surveys);
    return result.length;
  }
  async createSurvey(surveyData) {
    const [survey] = await db.insert(surveys).values(surveyData).returning();
    return survey;
  }
  async updateSurvey(id, surveyData) {
    const [survey] = await db.update(surveys).set(surveyData).where(eq(surveys.id, id)).returning();
    return survey;
  }
  async deleteSurvey(id) {
    await db.delete(surveys).where(eq(surveys.id, id));
  }
  // Story methods
  async getActiveStories() {
    return await db.select().from(stories).where(eq(stories.is_active, true)).orderBy(desc(stories.created_at));
  }
  async createStory(storyData) {
    const [story] = await db.insert(stories).values(storyData).returning();
    return story;
  }
  async deleteStory(id) {
    await db.delete(stories).where(eq(stories.id, id));
  }
  // Map Tasks
  async getMapTasks() {
    return await db.select().from(map_tasks).orderBy(desc(map_tasks.created_at));
  }
  async createMapTask(taskData) {
    const [task] = await db.insert(map_tasks).values(taskData).returning();
    return task;
  }
  async updateMapTask(id, taskData) {
    const [task] = await db.update(map_tasks).set(taskData).where(eq(map_tasks.id, id)).returning();
    return task;
  }
  async deleteMapTask(id) {
    return await db.delete(map_tasks).where(eq(map_tasks.id, id));
  }
  // Products
  async getProducts(offset = 0, limit = 50) {
    const result = await db.select().from(products).offset(offset).limit(limit).orderBy(desc(products.created_at));
    return result.map((product) => ({
      ...product,
      variants: product.variants ? JSON.parse(product.variants) : []
    }));
  }
  async createProduct(productData) {
    const data = { ...productData };
    if (data.variants && Array.isArray(data.variants)) {
      data.variants = JSON.stringify(data.variants);
    }
    const [product] = await db.insert(products).values(data).returning();
    if (product.variants) {
      product.variants = JSON.parse(product.variants);
    }
    return product;
  }
  async updateProduct(id, productData) {
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
  async deleteProduct(id) {
    return await db.delete(products).where(eq(products.id, id));
  }
  async getProduct(id) {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    if (!product) return null;
    return {
      ...product,
      variants: product.variants ? JSON.parse(product.variants) : []
    };
  }
  // Stores
  async getStores() {
    return await db.select().from(stores).orderBy(desc(stores.created_at));
  }
  async createStore(storeData) {
    const [store] = await db.insert(stores).values(storeData).returning();
    return store;
  }
  async updateStore(id, storeData) {
    const [store] = await db.update(stores).set(storeData).where(eq(stores.id, id)).returning();
    return store;
  }
  async deleteStore(id) {
    return await db.delete(stores).where(eq(stores.id, id));
  }
  // Settings
  async getSettings() {
    return await db.select().from(settings);
  }
  async updateSettings(settingsData) {
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
  async updateStory(id, storyData) {
    const [story] = await db.update(stories).set(storyData).where(eq(stories.id, id)).returning();
    return story;
  }
  // Notifications
  async getNotifications(offset = 0, limit = 50) {
    return await db.select().from(notifications).offset(offset).limit(limit).orderBy(desc(notifications.created_at));
  }
  async createNotification(notificationData) {
    const [notification] = await db.insert(notifications).values(notificationData).returning();
    return notification;
  }
  async updateNotification(id, notificationData) {
    const [notification] = await db.update(notifications).set(notificationData).where(eq(notifications.id, id)).returning();
    return notification;
  }
  // Admin Users
  async getAdminUsers(offset = 0, limit = 50) {
    return await db.select().from(admin_users).offset(offset).limit(limit);
  }
  async createAdminUser(adminUserData) {
    const [adminUser] = await db.insert(admin_users).values(adminUserData).returning();
    return adminUser;
  }
  async updateAdminUser(id, adminUserData) {
    const [adminUser] = await db.update(admin_users).set(adminUserData).where(eq(admin_users.id, id)).returning();
    return adminUser;
  }
  async deleteAdminUser(id) {
    await db.delete(admin_users).where(eq(admin_users.id, id));
  }
  // Survey Analytics
  async getSurveyAnalytics(surveyId) {
    return await db.select().from(survey_analytics).where(eq(survey_analytics.survey_id, surveyId));
  }
  async getTopUsers(limit = 20) {
    const result = await db.select().from(users).orderBy(desc(users.total_earnings), desc(users.created_at)).limit(limit);
    return result;
  }
  async getUserCompletedSurveys(userId) {
    return [
      { id: 1, title: "\u0130stanbul Anketi", date: "2024-07-23", points: 50 },
      { id: 2, title: "Market Ara\u015Ft\u0131rmas\u0131", date: "2024-07-20", points: 30 }
    ];
  }
  async getFriendsActivities(userId) {
    return [
      { id: 3, friend: "Ahmet Y\u0131lmaz", action: "Anket tamamlad\u0131", date: "2024-07-22" },
      { id: 4, friend: "Zeynep Kaya", action: "Hikaye izledi", date: "2024-07-21" }
    ];
  }
  async getUserIncompleteSurveys(userId) {
    return [
      { id: 5, title: "Teknoloji Anketi", startedAt: "2024-07-24" }
    ];
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { eq as eq3 } from "drizzle-orm";

// server/auth.ts
import { eq as eq2, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "E-posta ve \u015Fifre zorunludur"
      });
    }
    const user = await db.query.users.findFirst({
      where: or(
        eq2(users.email, email),
        eq2(users.username, email)
      )
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Kullan\u0131c\u0131 bulunamad\u0131"
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Ge\xE7ersiz \u015Fifre"
      });
    }
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
    const { password: _, ...userWithoutPassword } = user;
    return res.json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Sunucu hatas\u0131"
    });
  }
}
async function register(req, res) {
  try {
    const { email, username, password, name, gender, city, age } = req.body;
    const consent_version = "1.0";
    const existingUser = await db.query.users.findFirst({
      where: or(eq2(users.email, email), eq2(users.username, username))
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Bu email/username zaten kullan\u0131l\u0131yor"
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [newUser] = await db.insert(users).values({
      email,
      username,
      password: hashedPassword,
      name,
      gender,
      city,
      age,
      consent_version,
      ip_address: req.ip,
      device_info: {
        browser: req.useragent?.browser,
        os: req.useragent?.os,
        platform: req.useragent?.platform
      }
    }).returning();
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.status(201).json({
      success: true,
      token,
      user: newUser
    });
  } catch (error) {
    console.error("Kay\u0131t hatas\u0131:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatas\u0131"
    });
  }
}
async function updateProfile(req, res) {
  try {
    const { id } = req.params;
    const { name, email, username } = req.body;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Kullan\u0131c\u0131 ID zorunludur"
      });
    }
    const updatedUser = await db.update(users).set({ name, email, username }).where(eq2(users.id, parseInt(id))).returning();
    if (!updatedUser || updatedUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Kullan\u0131c\u0131 bulunamad\u0131"
      });
    }
    const { password: _, ...userWithoutPassword } = updatedUser[0];
    return res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({
      success: false,
      message: "Profil g\xFCncellenirken hata olu\u015Ftu"
    });
  }
}

// server/routes.ts
import * as XLSX from "xlsx";
async function registerRoutes(app2) {
  app2.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "\u0130statistikler al\u0131n\u0131rken hata olu\u015Ftu" });
    }
  });
  app2.get("/api/analytics", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const analytics2 = await storage.getAnalytics(
        startDate ? new Date(startDate) : void 0,
        endDate ? new Date(endDate) : void 0
      );
      res.json(analytics2);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Analitik verileri al\u0131n\u0131rken hata olu\u015Ftu" });
    }
  });
  app2.get("/api/surveys", async (req, res) => {
    try {
      const { offset = 0, limit = 50 } = req.query;
      const surveys2 = await storage.getSurveys(Number(offset), Number(limit));
      const totalCount = await storage.getSurveysCount();
      res.json({ surveys: surveys2, totalCount });
    } catch (error) {
      console.error("Error fetching surveys:", error);
      res.status(500).json({ message: "Anketler al\u0131n\u0131rken hata olu\u015Ftu" });
    }
  });
  app2.get("/api/surveys/:id", async (req, res) => {
    try {
      const survey = await storage.getSurvey(Number(req.params.id));
      if (!survey) {
        return res.status(404).json({ message: "Anket bulunamad\u0131" });
      }
      res.json(survey);
    } catch (error) {
      console.error("Error fetching survey:", error);
      res.status(500).json({ message: "Anket al\u0131n\u0131rken hata olu\u015Ftu" });
    }
  });
  app2.post("/api/surveys", async (req, res) => {
    try {
      const data = { ...req.body };
      if (data.reward && typeof data.reward === "string") {
        data.reward = parseFloat(data.reward);
      }
      if (data.latitude && typeof data.latitude === "string") {
        data.latitude = parseFloat(data.latitude);
      }
      if (data.longitude && typeof data.longitude === "string") {
        data.longitude = parseFloat(data.longitude);
      }
      const surveyData = insertSurveySchema.parse(data);
      const survey = await storage.createSurvey(surveyData);
      res.status(201).json(survey);
    } catch (error) {
      console.error("Error creating survey:", error);
      res.status(500).json({ message: "Anket olu\u015Fturulurken hata olu\u015Ftu" });
    }
  });
  app2.put("/api/surveys/:id", async (req, res) => {
    try {
      const survey = await storage.updateSurvey(Number(req.params.id), req.body);
      res.json(survey);
    } catch (error) {
      console.error("Error updating survey:", error);
      res.status(500).json({ message: "Anket g\xFCncellenirken hata olu\u015Ftu" });
    }
  });
  app2.delete("/api/surveys/:id", async (req, res) => {
    try {
      await storage.deleteSurvey(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting survey:", error);
      res.status(500).json({ message: "Anket silinirken hata olu\u015Ftu" });
    }
  });
  app2.post("/api/auth/login", login);
  app2.post("/api/auth/register", register);
  app2.get("/api/users", async (req, res) => {
    try {
      const { offset = 0, limit = 50 } = req.query;
      const users2 = await storage.getUsers(Number(offset), Number(limit));
      const totalCount = await storage.getUsersCount();
      res.json({ users: users2, totalCount });
    } catch (error) {
      console.error(error.stack || error);
      res.status(500).json({ message: "Kullan\u0131c\u0131lar al\u0131n\u0131rken hata olu\u015Ftu" });
      throw error;
    }
  });
  app2.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(Number(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "Kullan\u0131c\u0131 bulunamad\u0131" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Kullan\u0131c\u0131 al\u0131n\u0131rken hata olu\u015Ftu" });
    }
  });
  app2.put("/api/users/:id", async (req, res) => {
    try {
      const userId = Number(req.params.id);
      const updateData = req.body;
      if (updateData.username) {
        const allUsers = await storage.getUsers(0, 1e4);
        const exists = allUsers.find((u) => u.username === updateData.username && u.id !== userId);
        if (exists) {
          return res.status(409).json({ success: false, message: "Bu kullan\u0131c\u0131 ad\u0131 ba\u015Fka bir kullan\u0131c\u0131da var" });
        }
      }
      const user = await storage.updateUser(userId, updateData);
      res.json({ success: true, user });
    } catch (error) {
      console.error("Profil g\xFCncelleme hatas\u0131:", error);
      res.status(500).json({ success: false, message: "Profil g\xFCncellenirken hata olu\u015Ftu" });
    }
  });
  app2.get("/api/users/:id/history", async (req, res) => {
    try {
      const userId = Number(req.params.id);
      const earned = await storage.getUserCompletedSurveys(userId);
      const friends = await storage.getFriendsActivities(userId);
      const incomplete = await storage.getUserIncompleteSurveys(userId);
      res.json({ earned, friends, incomplete });
    } catch (error) {
      res.status(500).json({ message: "Kullan\u0131c\u0131 ge\xE7mi\u015Fi al\u0131n\u0131rken hata olu\u015Ftu" });
    }
  });
  app2.delete("/api/users/:id", async (req, res) => {
    try {
      await storage.deleteUser(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Kullan\u0131c\u0131 silinirken hata olu\u015Ftu" });
    }
  });
  app2.get("/api/stories", async (req, res) => {
    try {
      const stories2 = await storage.getActiveStories();
      res.json(stories2);
    } catch (error) {
      console.error("Error fetching stories:", error);
      res.status(500).json({ message: "Hikayeler al\u0131n\u0131rken hata olu\u015Ftu" });
    }
  });
  app2.get("/api/admin/stories", async (req, res) => {
    try {
      const stories2 = await storage.getActiveStories();
      res.json({ stories: stories2 });
    } catch (error) {
      console.error("Error fetching stories:", error);
      res.status(500).json({ message: "Hikayeler al\u0131n\u0131rken hata olu\u015Ftu" });
    }
  });
  app2.post("/api/stories", async (req, res) => {
    try {
      const storyData = insertStorySchema.parse(req.body);
      const story = await storage.createStory(storyData);
      res.status(201).json(story);
    } catch (error) {
      console.error("Error creating story:", error);
      res.status(500).json({ message: "Hikaye olu\u015Fturulurken hata olu\u015Ftu" });
    }
  });
  app2.post("/api/admin/stories", async (req, res) => {
    try {
      const storyData = insertStorySchema.parse(req.body);
      const story = await storage.createStory(storyData);
      res.status(201).json(story);
    } catch (error) {
      console.error("Error creating story:", error);
      res.status(500).json({ message: "Hikaye olu\u015Fturulurken hata olu\u015Ftu" });
    }
  });
  app2.put("/api/admin/stories/:id", async (req, res) => {
    try {
      const story = await storage.updateStory(Number(req.params.id), req.body);
      res.json(story);
    } catch (error) {
      console.error("Error updating story:", error);
      res.status(500).json({ message: "Hikaye g\xFCncellenirken hata olu\u015Ftu" });
    }
  });
  app2.delete("/api/stories/:id", async (req, res) => {
    try {
      await storage.deleteStory(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting story:", error);
      res.status(500).json({ message: "Hikaye silinirken hata olu\u015Ftu" });
    }
  });
  app2.delete("/api/admin/stories/:id", async (req, res) => {
    try {
      await storage.deleteStory(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting story:", error);
      res.status(500).json({ message: "Hikaye silinirken hata olu\u015Ftu" });
    }
  });
  app2.get("/api/products", async (req, res) => {
    try {
      const { offset = 0, limit = 50 } = req.query;
      const products2 = await storage.getProducts(Number(offset), Number(limit));
      res.json(products2);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "\xDCr\xFCnler al\u0131n\u0131rken hata olu\u015Ftu" });
    }
  });
  app2.post("/api/products", async (req, res) => {
    try {
      const product = await storage.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "\xDCr\xFCn olu\u015Fturulurken hata olu\u015Ftu" });
    }
  });
  app2.put("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.updateProduct(Number(req.params.id), req.body);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "\xDCr\xFCn g\xFCncellenirken hata olu\u015Ftu" });
    }
  });
  app2.delete("/api/products/:id", async (req, res) => {
    try {
      await storage.deleteProduct(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "\xDCr\xFCn silinirken hata olu\u015Ftu" });
    }
  });
  app2.post("/api/products/:id/purchase", async (req, res) => {
    try {
      const productId = Number(req.params.id);
      const { userId, size, color, quantity = 1 } = req.body;
      if (!userId || !size || !color) {
        return res.status(400).json({ message: "Kullan\u0131c\u0131, beden ve renk zorunlu" });
      }
      const product = await storage.getProduct(productId);
      if (!product) return res.status(404).json({ message: "\xDCr\xFCn bulunamad\u0131" });
      const variants = product.variants || [];
      const variantIndex = variants.findIndex((v) => v.size === size && v.color === color);
      if (variantIndex === -1) return res.status(400).json({ message: "Varyant bulunamad\u0131" });
      if (variants[variantIndex].stock < quantity) return res.status(400).json({ message: "Yeterli stok yok" });
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "Kullan\u0131c\u0131 bulunamad\u0131" });
      if ((user.total_earnings || 0) < product.rewardPoints * quantity) {
        return res.status(400).json({ message: "Yetersiz puan" });
      }
      variants[variantIndex].stock -= quantity;
      await storage.updateProduct(productId, { variants });
      await storage.updateUser(userId, { total_earnings: (user.total_earnings || 0) - product.rewardPoints * quantity });
      const updatedProduct = await storage.getProduct(productId);
      const updatedUser = await storage.getUser(userId);
      res.json({ success: true, product: updatedProduct, user: updatedUser });
    } catch (error) {
      console.error("Sat\u0131n alma hatas\u0131:", error);
      res.status(500).json({ message: "Sat\u0131n alma i\u015Flemi s\u0131ras\u0131nda hata olu\u015Ftu" });
    }
  });
  app2.get("/api/settings", async (req, res) => {
    try {
      const settings2 = await storage.getSettings();
      res.json(settings2);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Ayarlar al\u0131n\u0131rken hata olu\u015Ftu" });
    }
  });
  app2.put("/api/settings", async (req, res) => {
    try {
      const settings2 = await storage.updateSettings(req.body);
      res.json(settings2);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Ayarlar g\xFCncellenirken hata olu\u015Ftu" });
    }
  });
  app2.get("/api/stores", async (req, res) => {
    try {
      const stores2 = await storage.getStores();
      res.json(stores2);
    } catch (error) {
      console.error("Error fetching stores:", error);
      res.status(500).json({ message: "Ma\u011Fazalar al\u0131n\u0131rken hata olu\u015Ftu" });
    }
  });
  app2.post("/api/stores", async (req, res) => {
    try {
      const store = await storage.createStore(req.body);
      res.status(201).json(store);
    } catch (error) {
      console.error("Error creating store:", error);
      res.status(500).json({ message: "Ma\u011Faza olu\u015Fturulurken hata olu\u015Ftu" });
    }
  });
  app2.put("/api/stores/:id", async (req, res) => {
    try {
      const store = await storage.updateStore(Number(req.params.id), req.body);
      res.json(store);
    } catch (error) {
      console.error("Error updating store:", error);
      res.status(500).json({ message: "Ma\u011Faza g\xFCncellenirken hata olu\u015Ftu" });
    }
  });
  app2.delete("/api/stores/:id", async (req, res) => {
    try {
      await storage.deleteStore(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting store:", error);
      res.status(500).json({ message: "Ma\u011Faza silinirken hata olu\u015Ftu" });
    }
  });
  app2.get("/api/map-tasks", async (req, res) => {
    try {
      const tasks = await storage.getMapTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching map tasks:", error);
      res.status(500).json({ message: "Harita g\xF6revleri al\u0131n\u0131rken hata olu\u015Ftu" });
    }
  });
  app2.post("/api/map-tasks", async (req, res) => {
    try {
      const taskData = insertMapTaskSchema.parse(req.body);
      const task = await storage.createMapTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating map task:", error);
      res.status(500).json({ message: "Harita g\xF6revi olu\u015Fturulurken hata olu\u015Ftu" });
    }
  });
  app2.put("/api/map-tasks/:id", async (req, res) => {
    try {
      const task = await storage.updateMapTask(Number(req.params.id), req.body);
      res.json(task);
    } catch (error) {
      console.error("Error updating map task:", error);
      res.status(500).json({ message: "Harita g\xF6revi g\xFCncellenirken hata olu\u015Ftu" });
    }
  });
  app2.delete("/api/map-tasks/:id", async (req, res) => {
    try {
      await storage.deleteMapTask(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting map task:", error);
      res.status(500).json({ message: "Harita g\xF6revi silinirken hata olu\u015Ftu" });
    }
  });
  app2.get("/api/notifications", async (req, res) => {
    try {
      const { offset = 0, limit = 50 } = req.query;
      const notifications2 = await storage.getNotifications(Number(offset), Number(limit));
      res.json(notifications2);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Bildirimler al\u0131n\u0131rken hata olu\u015Ftu" });
    }
  });
  app2.post("/api/notifications", async (req, res) => {
    try {
      const notificationData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Bildirim olu\u015Fturulurken hata olu\u015Ftu" });
    }
  });
  app2.post("/api/notifications/send/:id", async (req, res) => {
    try {
      const notification = await storage.updateNotification(Number(req.params.id), {
        isSent: true,
        sentAt: /* @__PURE__ */ new Date()
      });
      res.json(notification);
    } catch (error) {
      console.error("Error sending notification:", error);
      res.status(500).json({ message: "Bildirim g\xF6nderilirken hata olu\u015Ftu" });
    }
  });
  app2.post("/api/upload/media", async (req, res) => {
    try {
      const fileName = `media_${Date.now()}.jpg`;
      const url = `/uploads/${fileName}`;
      res.json({ url, fileName });
    } catch (error) {
      console.error("Error uploading media:", error);
      res.status(500).json({ message: "Medya y\xFCklenirken hata olu\u015Ftu" });
    }
  });
  app2.post("/api/upload/product-image", async (req, res) => {
    try {
      const fileName = `product_${Date.now()}.jpg`;
      const url = `/uploads/products/${fileName}`;
      res.json({ url, fileName });
    } catch (error) {
      console.error("Error uploading product image:", error);
      res.status(500).json({ message: "\xDCr\xFCn g\xF6rseli y\xFCklenirken hata olu\u015Ftu" });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const userData = req.body;
      if (!userData.email || !userData.password || !userData.username) {
        return res.status(400).json({
          success: false,
          message: "E-posta, \u015Fifre ve kullan\u0131c\u0131 ad\u0131 zorunludur"
        });
      }
      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      req.session.user = userWithoutPassword;
      res.status(201).json({
        success: true,
        message: "Kullan\u0131c\u0131 ba\u015Far\u0131yla olu\u015Fturuldu",
        user: userWithoutPassword
      });
    } catch (error) {
      console.error("Kay\u0131t hatas\u0131:", error);
      let errorMessage = "Kay\u0131t s\u0131ras\u0131nda bir hata olu\u015Ftu";
      if (error.code === "SQLITE_CONSTRAINT") {
        errorMessage = "Bu e-posta adresi veya kullan\u0131c\u0131 ad\u0131 zaten kullan\u0131mda";
      }
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "E-posta ve \u015Fifre zorunludur"
        });
      }
      const [user] = await db.select().from(users).where(eq3(users.email, email)).limit(1);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Ge\xE7ersiz e-posta veya \u015Fifre"
        });
      }
      if (user.password !== password) {
        return res.status(401).json({
          success: false,
          message: "Ge\xE7ersiz e-posta veya \u015Fifre"
        });
      }
      const { password: _, ...userWithoutPassword } = user;
      req.session.user = userWithoutPassword;
      res.json({
        success: true,
        message: "Giri\u015F ba\u015Far\u0131l\u0131",
        user: userWithoutPassword
      });
    } catch (error) {
      console.error("Giri\u015F hatas\u0131:", error);
      res.status(500).json({
        success: false,
        message: "Giri\u015F s\u0131ras\u0131nda bir hata olu\u015Ftu"
      });
    }
  });
  app2.get("/api/auth/me", (req, res) => {
    if (req.session.user) {
      res.json({
        success: true,
        user: req.session.user
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Oturum bulunamad\u0131"
      });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("\xC7\u0131k\u0131\u015F hatas\u0131:", err);
        return res.status(500).json({
          success: false,
          message: "\xC7\u0131k\u0131\u015F yap\u0131l\u0131rken bir hata olu\u015Ftu"
        });
      }
      res.clearCookie("connect.sid");
      res.json({
        success: true,
        message: "Ba\u015Far\u0131yla \xE7\u0131k\u0131\u015F yap\u0131ld\u0131"
      });
    });
  });
  app2.post("/api/auth/login", login);
  app2.put("/api/users/:id", updateProfile);
  app2.get("/api/export/products", async (req, res) => {
    try {
      const products2 = await storage.getProducts(0, 1e4);
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(products2.map((product) => ({
        "\xDCr\xFCn Ad\u0131": product.name,
        "A\xE7\u0131klama": product.description,
        "Kategori": product.category,
        "Fiyat": product.price,
        "\xD6d\xFCl Puan\u0131": product.rewardPoints,
        "Stok": product.stock,
        "Durum": product.isActive ? "Aktif" : "Pasif",
        "Olu\u015Fturulma Tarihi": product.createdAt
      })));
      XLSX.utils.book_append_sheet(workbook, worksheet, "\xDCr\xFCnler");
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
      res.setHeader("Content-Disposition", "attachment; filename=urunler.xlsx");
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.send(buffer);
    } catch (error) {
      console.error("Error exporting products:", error);
      res.status(500).json({ message: "\xDCr\xFCnler d\u0131\u015Fa aktar\u0131l\u0131rken hata olu\u015Ftu" });
    }
  });
  app2.get("/api/export/surveys", async (req, res) => {
    try {
      const surveys2 = await storage.getSurveys(0, 1e3);
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(surveys2.map((survey) => ({
        "Anket Ad\u0131": survey.title,
        "T\xFCr": survey.type,
        "Kategori": survey.category,
        "Durum": survey.status,
        "Hedef Kat\u0131l\u0131mc\u0131": survey.targetParticipants,
        "Mevcut Kat\u0131l\u0131mc\u0131": survey.currentParticipants,
        "Tamamlanan": survey.completedCount,
        "\xD6deme": survey.reward,
        "Olu\u015Fturulma Tarihi": survey.createdAt
      })));
      XLSX.utils.book_append_sheet(workbook, worksheet, "Anketler");
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
      res.setHeader("Content-Disposition", "attachment; filename=anketler.xlsx");
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.send(buffer);
    } catch (error) {
      console.error("Error exporting surveys:", error);
      res.status(500).json({ message: "Anketler d\u0131\u015Fa aktar\u0131l\u0131rken hata olu\u015Ftu" });
    }
  });
  app2.get("/api/export/users", async (req, res) => {
    try {
      const users2 = await storage.getUsers(0, 1e4);
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(users2.map((user) => ({
        "Ad": user.name,
        "E-posta": user.email,
        "Ya\u015F": user.age,
        "Cinsiyet": user.gender,
        "\u015Eehir": user.city,
        "Enlem": user.latitude,
        "Boylam": user.longitude,
        "IP Adresi": user.ipAddress,
        "Aktif": user.isActive ? "Evet" : "Hay\u0131r",
        "Toplam Kazan\xE7": user.totalEarnings,
        "Tamamlanan Anket": user.completedSurveys,
        "Son Giri\u015F": user.lastLoginAt,
        "Kay\u0131t Tarihi": user.createdAt
      })));
      XLSX.utils.book_append_sheet(workbook, worksheet, "Kullan\u0131c\u0131lar");
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
      res.setHeader("Content-Disposition", "attachment; filename=kullanicilar.xlsx");
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.send(buffer);
    } catch (error) {
      console.error("Error exporting users:", error);
      res.status(500).json({ message: "Kullan\u0131c\u0131lar d\u0131\u015Fa aktar\u0131l\u0131rken hata olu\u015Ftu" });
    }
  });
  app2.get("/api/admin-users", async (req, res) => {
    try {
      const { offset = 0, limit = 50 } = req.query;
      const adminUsers = await storage.getAdminUsers(Number(offset), Number(limit));
      res.json(adminUsers);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Admin kullan\u0131c\u0131lar\u0131 al\u0131n\u0131rken hata olu\u015Ftu" });
    }
  });
  app2.post("/api/admin-users", async (req, res) => {
    try {
      const adminUser = await storage.createAdminUser(req.body);
      res.json(adminUser);
    } catch (error) {
      console.error("Error creating admin user:", error);
      res.status(500).json({ message: "Admin kullan\u0131c\u0131 olu\u015Fturulurken hata olu\u015Ftu" });
    }
  });
  app2.put("/api/admin-users/:id", async (req, res) => {
    try {
      const adminUser = await storage.updateAdminUser(Number(req.params.id), req.body);
      res.json(adminUser);
    } catch (error) {
      console.error("Error updating admin user:", error);
      res.status(500).json({ message: "Admin kullan\u0131c\u0131 g\xFCncellenirken hata olu\u015Ftu" });
    }
  });
  app2.delete("/api/admin-users/:id", async (req, res) => {
    try {
      await storage.deleteAdminUser(Number(req.params.id));
      res.json({ message: "Admin kullan\u0131c\u0131 silindi" });
    } catch (error) {
      console.error("Error deleting admin user:", error);
      res.status(500).json({ message: "Admin kullan\u0131c\u0131 silinirken hata olu\u015Ftu" });
    }
  });
  app2.get("/api/survey-analytics/:surveyId", async (req, res) => {
    try {
      const analytics2 = await storage.getSurveyAnalytics(Number(req.params.surveyId));
      res.json(analytics2);
    } catch (error) {
      console.error("Error fetching survey analytics:", error);
      res.status(500).json({ message: "Anket istatistikleri al\u0131n\u0131rken hata olu\u015Ftu" });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { email, username, password, name, age, gender, city, latitude, longitude } = req.body;
      const eksikAlanlar = [];
      if (!email) eksikAlanlar.push("email");
      if (!username) eksikAlanlar.push("username");
      if (!password) eksikAlanlar.push("password");
      if (!name) eksikAlanlar.push("name");
      if (eksikAlanlar.length > 0) {
        return res.status(400).json({ success: false, message: `Eksik alanlar: ${eksikAlanlar.join(", ")}` });
      }
      const existingEmail = await storage.getUserByEmail(email);
      const existingUsername = await storage.getUsers(0, 1e4).then((users2) => users2.find((u) => u.username === username));
      if (existingEmail) {
        return res.status(409).json({ success: false, message: "Bu e-posta ile kay\u0131tl\u0131 kullan\u0131c\u0131 var" });
      }
      if (existingUsername) {
        return res.status(409).json({ success: false, message: "Bu kullan\u0131c\u0131 ad\u0131 ile kay\u0131tl\u0131 kullan\u0131c\u0131 var" });
      }
      try {
        const user = await storage.createUser({
          email,
          username,
          password,
          // TODO: bcrypt ile hashle
          name,
          age,
          gender,
          city,
          latitude,
          longitude,
          created_at: Math.floor(Date.now() / 1e3),
          last_login_at: Math.floor(Date.now() / 1e3),
          is_active: true
        });
        res.status(201).json({ success: true, user, message: "Kay\u0131t ba\u015Far\u0131l\u0131" });
      } catch (dbError) {
        console.error("Kullan\u0131c\u0131 olu\u015Fturulurken DB hatas\u0131:", dbError);
        res.status(500).json({ success: false, message: `Kullan\u0131c\u0131 olu\u015Fturulurken hata olu\u015Ftu: ${dbError.message || dbError}` });
      }
    } catch (error) {
      console.error("Kay\u0131t endpointi genel hata:", error);
      res.status(500).json({ success: false, message: `Kay\u0131t endpointinde genel hata: ${error.message || error}` });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: "E-posta veya kullan\u0131c\u0131 ad\u0131 ve \u015Fifre zorunludur." });
      }
      let user = await storage.getUserByEmail(email);
      if (!user) {
        const allUsers = await storage.getUsers(0, 1e4);
        user = allUsers.find((u) => u.username === email);
      }
      if (!user) {
        return res.status(401).json({ success: false, message: "Kullan\u0131c\u0131 bulunamad\u0131 veya \u015Fifre hatal\u0131." });
      }
      if (user.password !== password) {
        return res.status(401).json({ success: false, message: "Kullan\u0131c\u0131 bulunamad\u0131 veya \u015Fifre hatal\u0131." });
      }
      await storage.updateUser(user.id, { last_login_at: Math.floor(Date.now() / 1e3) });
      res.json({ success: true, user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name
      }, message: "Giri\u015F ba\u015Far\u0131l\u0131!" });
    } catch (error) {
      console.error("Giri\u015F hatas\u0131:", error);
      res.status(500).json({ success: false, message: "Giri\u015F i\u015Flemi s\u0131ras\u0131nda bir hata olu\u015Ftu." });
    }
  });
  app2.get("/api/mobile/surveys", async (req, res) => {
    try {
      const surveys2 = await storage.getSurveys(0, 100);
      res.json({ success: true, surveys: surveys2 });
    } catch (error) {
      console.error("Error fetching surveys:", error);
      res.status(500).json({ success: false, message: "Anketler al\u0131n\u0131rken hata olu\u015Ftu" });
    }
  });
  app2.get("/api/mobile/user/profile/:userId", async (req, res) => {
    try {
      const user = await storage.getUser(Number(req.params.userId));
      if (!user) {
        return res.status(404).json({ success: false, message: "Kullan\u0131c\u0131 bulunamad\u0131" });
      }
      res.json({ success: true, user });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ success: false, message: "Kullan\u0131c\u0131 profili al\u0131n\u0131rken hata olu\u015Ftu" });
    }
  });
  app2.post("/api/mobile/surveys/:surveyId/complete", async (req, res) => {
    try {
      const { userId, answers } = req.body;
      res.json({ success: true, message: "Anket tamamland\u0131" });
    } catch (error) {
      console.error("Error completing survey:", error);
      res.status(500).json({ success: false, message: "Anket tamamlan\u0131rken hata olu\u015Ftu" });
    }
  });
  app2.get("/api/mobile/stories", async (req, res) => {
    try {
      const stories2 = await storage.getActiveStories();
      res.json({ success: true, stories: stories2 });
    } catch (error) {
      console.error("Error fetching stories:", error);
      res.status(500).json({ success: false, message: "Hikayeler al\u0131n\u0131rken hata olu\u015Ftu" });
    }
  });
  app2.post("/api/mobile/stories/:storyId/view", async (req, res) => {
    try {
      const { userId } = req.body;
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking story as viewed:", error);
      res.status(500).json({ success: false, message: "Hikaye g\xF6r\xFCnt\xFCleme kaydedilirken hata olu\u015Ftu" });
    }
  });
  app2.get("/api/leaderboard", async (req, res) => {
    try {
      const users2 = await storage.getTopUsers(20);
      const leaderboard = users2.map((u, i) => ({
        ...u,
        badge: i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : null
      }));
      res.json({ leaderboard });
    } catch (error) {
      console.error("Leaderboard hatas\u0131:", error);
      res.status(500).json({ message: "S\u0131ralama al\u0131n\u0131rken hata olu\u015Ftu" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { cartographer } from "@replit/vite-plugin-cartographer";
import { fileURLToPath } from "url";
import { dirname } from "path";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      cartographer()
    ] : []
  ],
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      external: ["react-router-dom"]
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: path.resolve(__dirname, "client"),
  server: {
    proxy: {
      "/api": "http://localhost:4000"
    },
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
var viteLogger = createLogger();
var viteServer = null;
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupViteMiddleware(app2) {
  if (!viteServer) {
    viteServer = await createViteServer({
      ...vite_config_default,
      configFile: false,
      customLogger: viteLogger,
      server: { middlewareMode: true },
      appType: "spa"
    });
  }
  app2.use(viteServer.middlewares);
  return viteServer;
}
async function serveViteIndexHtml(req, res) {
  try {
    if (!viteServer) {
      throw new Error("Vite server not initialized");
    }
    const url = req.originalUrl;
    const clientTemplate = path2.resolve(
      import.meta.dirname,
      "..",
      "client",
      "index.html"
    );
    let template = await fs.promises.readFile(clientTemplate, "utf-8");
    const page = await viteServer.transformIndexHtml(url, template);
    res.status(200).set({ "Content-Type": "text/html" }).end(page);
  } catch (error) {
    console.error("Vite transform error:", error);
    res.status(500).send("Internal Server Error");
  }
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import path3 from "path";
import cors from "cors";
import session from "express-session";
import { fileURLToPath as fileURLToPath2 } from "url";
import { env } from "process";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path3.dirname(__filename2);
var app = express2();
app.use(cors({
  origin: ["http://localhost:3003", "http://localhost:4000", "http://127.0.0.1:3003", "http://127.0.0.1:4000"],
  credentials: true
}));
app.use(session({
  secret: env.SESSION_SECRET || "gizli-anahtar-buraya",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1e3,
    // 7 gün
    sameSite: "lax"
  }
}));
app.use((req, res, next) => {
  console.log("Session:", req.sessionID);
  next();
});
app.use(express2.json({ limit: "50mb" }));
app.use(express2.urlencoded({ limit: "50mb", extended: true }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use("/api", (err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupViteMiddleware(app);
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      serveViteIndexHtml(req, res);
    });
  } else {
    app.use((req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      serveStatic(app);
      next();
    });
  }
  const clientBuildPath = path3.resolve(__dirname2, "../dist");
  app.use(express2.static(clientBuildPath));
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ message: "API endpointi bulunamad\u0131" });
    }
    res.sendFile(path3.join(clientBuildPath, "index.html"));
  });
  const port = parseInt(process.env.PORT || "4000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
