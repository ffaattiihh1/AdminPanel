CREATE TYPE "public"."notification_type" AS ENUM('info', 'success', 'warning', 'error', 'promotion', 'system');--> statement-breakpoint
CREATE TYPE "public"."survey_status" AS ENUM('draft', 'active', 'paused', 'completed');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('active', 'inactive', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('credit', 'debit');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin', 'moderator');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive', 'suspended');--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"username" varchar(100) NOT NULL,
	"password" text NOT NULL,
	"name" text,
	"role" varchar(100) DEFAULT 'admin',
	"is_active" boolean DEFAULT true,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_users_email_unique" UNIQUE("email"),
	CONSTRAINT "admin_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" timestamp DEFAULT now(),
	"total_users" integer DEFAULT 0,
	"active_users" integer DEFAULT 0,
	"completed_surveys" integer DEFAULT 0,
	"total_earnings" real DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "map_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"latitude" real NOT NULL,
	"longitude" real NOT NULL,
	"radius" integer,
	"reward" real,
	"status" text DEFAULT 'active',
	"completed_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"type" "notification_type" DEFAULT 'info',
	"is_read" boolean DEFAULT false,
	"target_user_id" integer,
	"target_user_ids" text,
	"is_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"sent_at" timestamp,
	"read_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"store_id" integer,
	"name" varchar(255) NOT NULL,
	"description" text,
	"price" real NOT NULL,
	"stock" integer DEFAULT 0,
	"images" text,
	"category" varchar(100),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"variants" text
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(255) NOT NULL,
	"value" text,
	"description" text,
	"created_at" integer DEFAULT (strftime('%s', 'now')),
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stories" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"media_url" text,
	"media_file" text,
	"media_type" varchar(100),
	"is_active" boolean DEFAULT true,
	"view_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "survey_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"survey_id" integer NOT NULL,
	"question_id" text,
	"question_text" text,
	"question_type" text,
	"response_data" text,
	"demographics" text DEFAULT '{}',
	"total_responses" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "survey_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"survey_id" integer,
	"user_id" integer,
	"responses" text,
	"is_completed" boolean DEFAULT false,
	"score" integer,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "surveys" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"type" varchar(100) NOT NULL,
	"category" varchar(100),
	"status" "survey_status" DEFAULT 'draft',
	"target_participants" integer DEFAULT 1000,
	"current_participants" integer DEFAULT 0,
	"completed_count" integer DEFAULT 0,
	"reward" real DEFAULT 0,
	"duration" integer,
	"url" text,
	"questions" text,
	"latitude" real,
	"longitude" real,
	"radius" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"survey_id" integer,
	"amount" real NOT NULL,
	"type" "transaction_type" NOT NULL,
	"status" "transaction_status" NOT NULL,
	"description" text,
	"reference" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"username" varchar(100) NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"age" integer,
	"gender" text,
	"city" text,
	"latitude" real,
	"longitude" real,
	"ip_address" text,
	"is_active" boolean DEFAULT true,
	"status" "user_status" DEFAULT 'active',
	"total_earnings" real DEFAULT 0,
	"completed_surveys" integer DEFAULT 0,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
