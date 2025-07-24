import { pgTable, serial, text, varchar, timestamp, boolean, integer, pgEnum, real, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// PostgreSQL ENUM types
export const userRoleEnum = pgEnum('user_role', ['user', 'admin', 'moderator']);
export const notificationTypeEnum = pgEnum('notification_type', ['info', 'success', 'warning', 'error', 'promotion', 'system']);
export const userStatusEnum = pgEnum('user_status', ['active', 'inactive', 'suspended']);
export const surveyStatusEnum = pgEnum('survey_status', ['draft', 'active', 'paused', 'completed']);
export const transactionTypeEnum = pgEnum('transaction_type', ['credit', 'debit']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'completed', 'failed']);
export const taskStatusEnum = pgEnum('task_status', ['active', 'inactive', 'completed', 'cancelled']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').unique(),
  password: text('password').notNull(),
  name: text('name'),
  age: integer('age'),
  gender: text('gender'),
  city: text('city'),
  ip_address: text('ip_address'),
  device_info: jsonb('device_info'),
  last_activity: timestamp('last_activity', { mode: 'date' }),
  activity_log: jsonb('activity_log').$type<ActivityLog>(),
  consent_version: text('consent_version').notNull(),
  is_active: boolean('is_active').default(true),
  status: text('status').$type<'active'|'suspended'|'deleted'>().default('active'),
  created_at: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updated_at: timestamp('updated_at', { mode: 'date' }).defaultNow()
});

export type ActivityLog = Array<{
  timestamp: Date;
  action: string;
  ip?: string | string[];
  device?: {
    browser?: string;
    version?: string;
    os?: string;
    platform?: string;
    isMobile?: boolean;
  };
}>;

export const surveys = pgTable("surveys", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }),
  status: surveyStatusEnum("status").default('draft'),
  target_participants: integer("target_participants").default(1000),
  current_participants: integer("current_participants").default(0),
  completed_count: integer("completed_count").default(0),
  reward: real("reward").default(0),
  duration: integer("duration"),
  url: text("url"),
  questions: text("questions"), // JSON string veya JSONB olarak saklanabilir
  latitude: real("latitude"),
  longitude: real("longitude"),
  radius: integer("radius"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
  completed_at: timestamp("completed_at"),
});

export const survey_responses = pgTable("survey_responses", {
  id: serial("id").primaryKey(),
  survey_id: integer("survey_id"),
  user_id: integer("user_id"),
  responses: text("responses"), // JSON string olarak saklanacak
  is_completed: boolean("is_completed").default(false),
  score: integer("score"),
  started_at: timestamp("started_at").defaultNow(),
  completed_at: timestamp("completed_at"),
});

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  media_url: text("media_url"),
  media_file: text("media_file"),
  media_type: varchar("media_type", { length: 100 }),
  is_active: boolean("is_active").default(true),
  view_count: integer("view_count").default(0),
  created_at: timestamp("created_at").defaultNow(),
  expires_at: timestamp("expires_at"),
});

export const map_tasks = pgTable("map_tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  radius: integer("radius"),
  reward: real("reward"),
  status: text("status").default("active"),
  completed_count: integer("completed_count").default(0),
  created_at: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id"),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: notificationTypeEnum("type").default("info"),
  is_read: boolean("is_read").default(false),
  target_user_id: integer("target_user_id"),
  target_user_ids: text("target_user_ids"), // JSON string olarak saklanacak
  is_sent: boolean("is_sent").default(false),
  created_at: timestamp("created_at").defaultNow(),
  sent_at: timestamp("sent_at"),
  read_at: timestamp("read_at"),
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  date: timestamp("date").defaultNow(),
  total_users: integer("total_users").default(0),
  active_users: integer("active_users").default(0),
  completed_surveys: integer("completed_surveys").default(0),
  total_earnings: real("total_earnings").default(0),
});

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  store_id: integer("store_id"),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: real("price").notNull(),
  stock: integer("stock").default(0),
  images: text("images"), // JSON string olarak saklanacak
  category: varchar("category", { length: 100 }),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  variants: text("variants"), // JSON string olarak varyantlar (beden, renk, stok)
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value"),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  survey_responses: many(survey_responses),
  notifications: many(notifications),
}));

export const surveysRelations = relations(surveys, ({ many }) => ({
  responses: many(survey_responses),
}));

export const survey_responsesRelations = relations(survey_responses, ({ one }) => ({
  survey: one(surveys, {
    fields: [survey_responses.survey_id],
    references: [surveys.id],
  }),
  user: one(users, {
    fields: [survey_responses.user_id],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.target_user_id],
    references: [users.id],
  }),
}));

export const storesRelations = relations(stores, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  store: one(stores, {
    fields: [products.store_id],
    references: [stores.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
});

export const insertSurveySchema = createInsertSchema(surveys).omit({
  id: true,
  created_at: true,
  current_participants: true,
  completed_count: true,
});

export const insertSurveyResponseSchema = createInsertSchema(survey_responses).omit({
  id: true,
  started_at: true,
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  created_at: true,
});

export const insertMapTaskSchema = createInsertSchema(map_tasks).omit({
  id: true,
  created_at: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  created_at: true,
});

export const insertStoreSchema = createInsertSchema(stores).omit({
  id: true,
  created_at: true
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  created_at: true
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  updated_at: true,
});

// Types
export type User = typeof users.$inferSelect & {
  activity_log?: ActivityLog;
  device_info?: {
    browser?: string;
    os?: string;
    platform?: string;
    isMobile?: boolean;
  };
};

export type InsertUser = z.infer<typeof insertUserSchema>;

export type Survey = typeof surveys.$inferSelect;
export type InsertSurvey = z.infer<typeof insertSurveySchema>;

export type SurveyResponse = typeof survey_responses.$inferSelect;
export type InsertSurveyResponse = z.infer<typeof insertSurveyResponseSchema>;

export type Story = typeof stories.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;

export type MapTask = typeof map_tasks.$inferSelect;
export type InsertMapTask = z.infer<typeof insertMapTaskSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Analytics = typeof analytics.$inferSelect;

export type Store = typeof stores.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

// Admin Users Table - Panel yöneticileri için
export const admin_users = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: varchar("role", { length: 100 }).default("admin"),
  is_active: boolean("is_active").default(true),
  last_login: timestamp("last_login"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const insertAdminUserSchema = createInsertSchema(admin_users).omit({
  id: true,
  created_at: true,
  updated_at: true,
  last_login: true,
});

export type AdminUser = typeof admin_users.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;

// Survey Analytics Table - Anket istatistikleri için
export const survey_analytics = pgTable("survey_analytics", {
  id: serial("id").primaryKey(),
  survey_id: integer("survey_id").notNull(),
  question_id: text("question_id").notNull(),
  question_text: text("question_text").notNull(),
  question_type: text("question_type").notNull(), // "multiple_choice", "text", "rating", etc.
  response_data: text("response_data").notNull(), // Cevap verileri ve istatistikler
  demographics: text("demographics").default("{}").notNull(), // Yaş, cinsiyet, şehir dağılımları
  total_responses: integer("total_responses").default(0).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const insertSurveyAnalyticsSchema = createInsertSchema(survey_analytics).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type SurveyAnalytics = typeof survey_analytics.$inferSelect;
export type InsertSurveyAnalytics = z.infer<typeof insertSurveyAnalyticsSchema>;
