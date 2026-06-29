import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*  Admin users                                                               */
/* -------------------------------------------------------------------------- */

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

/* -------------------------------------------------------------------------- */
/*  Media library (all uploaded images, auto-optimized)                       */
/* -------------------------------------------------------------------------- */

export const mediaAssets = pgTable("media_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  width: integer("width"),
  height: integer("height"),
  size: integer("size").notNull(),
  alt: text("alt").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMediaAssetSchema = createInsertSchema(mediaAssets).omit({
  id: true,
  createdAt: true,
});
export type InsertMediaAsset = z.infer<typeof insertMediaAssetSchema>;
export type MediaAsset = typeof mediaAssets.$inferSelect;

/* -------------------------------------------------------------------------- */
/*  Doctors                                                                   */
/* -------------------------------------------------------------------------- */

export const doctors = pgTable("doctors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").default("").notNull().unique(),
  specialty: text("specialty").notNull(),
  experience: text("experience").default("").notNull(),
  price: text("price").default("").notNull(),
  imageUrl: text("image_url").default("").notNull(),
  quote: text("quote").default("").notNull(),
  about: text("about").default("").notNull(),
  credentials: text("credentials").array().default(sql`'{}'::text[]`).notNull(),
  prodoctorovUrl: text("prodoctorov_url").default("").notNull(),
  prodoctorovRating: text("prodoctorov_rating").default("").notNull(),
  prodoctorovReviews: text("prodoctorov_reviews").default("").notNull(),
  yandexUrl: text("yandex_url").default("").notNull(),
  yandexRating: text("yandex_rating").default("").notNull(),
  yandexReviews: text("yandex_reviews").default("").notNull(),
  available: boolean("available").default(true).notNull(),
  availableDate: text("available_date").default("").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
});

export const insertDoctorSchema = createInsertSchema(doctors).omit({
  id: true,
}).extend({
  // slug is auto-generated server-side from the name when omitted
  slug: z.string().optional(),
});
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type Doctor = typeof doctors.$inferSelect;

/* -------------------------------------------------------------------------- */
/*  Directions (service categories) + their services                          */
/* -------------------------------------------------------------------------- */

export const directions = pgTable("directions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  label: text("label").notNull(),
  description: text("description").default("").notNull(),
  stat: text("stat").default("").notNull(),
  statLabel: text("stat_label").default("").notNull(),
  imageUrl: text("image_url").default("").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  // Themed direction-page content (compact page at /napravleniya/[slug])
  accent: text("accent").default("").notNull(),
  heroTitle: text("hero_title").default("").notNull(),
  intro: text("intro").default("").notNull(),
  heroImageUrl: text("hero_image_url").default("").notNull(),
  body: text("body").default("").notNull(),
  metaTitle: text("meta_title").default("").notNull(),
  metaDescription: text("meta_description").default("").notNull(),
  // 'audience' (Для женщин/мужчин/детей, Стоматология, Косметология) vs
  // 'specialty' (ЛОР, Дерматология, …) — specialty sections map directly to a
  // price-catalog category and are hidden from the home showcase.
  kind: text("kind").default("audience").notNull(),
  // Optional direct link to a price-catalog category. Used by specialty sections
  // so the section page lists that category's procedures. Audience sections
  // aggregate procedures from their services' linked categories instead.
  priceCategoryId: varchar("price_category_id").references(
    (): any => priceCategories.id,
    { onDelete: "set null" },
  ),
});

export const insertDirectionSchema = createInsertSchema(directions).omit({
  id: true,
});
export type InsertDirection = z.infer<typeof insertDirectionSchema>;
export type Direction = typeof directions.$inferSelect;

export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  // Service-page content (shared template at /uslugi/[slug])
  slug: text("slug").notNull().unique(),
  shortDescription: text("short_description").default("").notNull(),
  description: text("description").default("").notNull(),
  price: text("price").default("").notNull(),
  duration: text("duration").default("").notNull(),
  imageUrl: text("image_url").default("").notNull(),
  metaTitle: text("meta_title").default("").notNull(),
  metaDescription: text("meta_description").default("").notNull(),
  active: boolean("active").default(true).notNull(),
});

export const insertServiceSchema = createInsertSchema(services)
  .omit({ id: true })
  .extend({
    // slug is auto-generated server-side from the name when omitted
    slug: z.string().optional(),
  });
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

/* -------------------------------------------------------------------------- */
/*  Service ↔ Direction (many-to-many)                                        */
/*  One service can be shown in several directions; edited in one place. The  */
/*  direction page renders it in that direction's accent colour.              */
/* -------------------------------------------------------------------------- */

export const serviceDirections = pgTable(
  "service_directions",
  {
    serviceId: varchar("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    directionId: varchar("direction_id")
      .notNull()
      .references(() => directions.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.serviceId, t.directionId] }) }),
);

export const insertServiceDirectionSchema = createInsertSchema(serviceDirections);
export type InsertServiceDirection = z.infer<typeof insertServiceDirectionSchema>;
export type ServiceDirection = typeof serviceDirections.$inferSelect;

/* -------------------------------------------------------------------------- */
/*  Prices (categories + items)                                               */
/* -------------------------------------------------------------------------- */

export const priceCategories = pgTable("price_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const insertPriceCategorySchema = createInsertSchema(priceCategories).omit({
  id: true,
});
export type InsertPriceCategory = z.infer<typeof insertPriceCategorySchema>;
export type PriceCategory = typeof priceCategories.$inferSelect;

export const priceItems = pgTable("price_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id")
    .notNull()
    .references(() => priceCategories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  price: text("price").notNull(),
  note: text("note").default("").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const insertPriceItemSchema = createInsertSchema(priceItems).omit({
  id: true,
});
export type InsertPriceItem = z.infer<typeof insertPriceItemSchema>;
export type PriceItem = typeof priceItems.$inferSelect;

/* -------------------------------------------------------------------------- */
/*  Service ↔ Price item (many-to-many)                                       */
/*  The procedures (price items) hand-picked for a service via checkboxes —   */
/*  shown as the "сопутствующие услуги" block on the service page.            */
/* -------------------------------------------------------------------------- */

export const servicePriceItems = pgTable(
  "service_price_items",
  {
    serviceId: varchar("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    priceItemId: varchar("price_item_id")
      .notNull()
      .references(() => priceItems.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.serviceId, t.priceItemId] }) }),
);

export const insertServicePriceItemSchema = createInsertSchema(servicePriceItems);
export type InsertServicePriceItem = z.infer<typeof insertServicePriceItemSchema>;
export type ServicePriceItem = typeof servicePriceItems.$inferSelect;

/* -------------------------------------------------------------------------- */
/*  Myths (MythBuster section)                                                 */
/* -------------------------------------------------------------------------- */

export const myths = pgTable("myths", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tag: text("tag").default("").notNull(),
  question: text("question").notNull(),
  verdictType: text("verdict_type").default("myth").notNull(),
  answer: text("answer").default("").notNull(),
  source: text("source").default("").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
});

export const insertMythSchema = createInsertSchema(myths).omit({
  id: true,
});
export type InsertMyth = z.infer<typeof insertMythSchema>;
export type Myth = typeof myths.$inferSelect;

/* -------------------------------------------------------------------------- */
/*  Promotions                                                                 */
/* -------------------------------------------------------------------------- */

export const promotions = pgTable("promotions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").default("").notNull(),
  badge: text("badge").default("").notNull(),
  date: text("date").default("").notNull(),
  description: text("description").default("").notNull(),
  intro: text("intro").default("").notNull(),
  body: text("body").default("").notNull(),
  imageUrl: text("image_url").default("").notNull(),
  heroImageUrl: text("hero_image_url").default("").notNull(),
  serviceIds: text("service_ids").array().default(sql`'{}'::text[]`).notNull(),
  metaTitle: text("meta_title").default("").notNull(),
  metaDescription: text("meta_description").default("").notNull(),
  featured: boolean("featured").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
});

export const insertPromotionSchema = createInsertSchema(promotions).omit({
  id: true,
});
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type Promotion = typeof promotions.$inferSelect;

/* -------------------------------------------------------------------------- */
/*  Stories (real clinic patient stories)                                      */
/* -------------------------------------------------------------------------- */

export const stories = pgTable("stories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tag: text("tag").default("").notNull(),
  title: text("title").notNull(),
  imageUrl: text("image_url").default("").notNull(),
  body: text("body").default("").notNull(),
  noteKind: text("note_kind").default("quote").notNull(),
  noteLabel: text("note_label").default("").notNull(),
  noteText: text("note_text").default("").notNull(),
  author: text("author").default("").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
});
export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof stories.$inferSelect;

/* -------------------------------------------------------------------------- */
/*  Benefits                                                                   */
/* -------------------------------------------------------------------------- */

export const benefits = pgTable("benefits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  text: text("text").default("").notNull(),
  icon: text("icon").default("").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
});

export const insertBenefitSchema = createInsertSchema(benefits).omit({
  id: true,
});
export type InsertBenefit = z.infer<typeof insertBenefitSchema>;
export type Benefit = typeof benefits.$inferSelect;

/* -------------------------------------------------------------------------- */
/*  Navigation links                                                          */
/* -------------------------------------------------------------------------- */

export const navLinks = pgTable("nav_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  label: text("label").notNull(),
  href: text("href").notNull(),
  group: text("group").default("main").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
});

export const insertNavLinkSchema = createInsertSchema(navLinks).omit({
  id: true,
});
export type InsertNavLink = z.infer<typeof insertNavLinkSchema>;
export type NavLink = typeof navLinks.$inferSelect;

/* -------------------------------------------------------------------------- */
/*  Site settings (global key/value)                                          */
/* -------------------------------------------------------------------------- */

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
});

export const insertSiteSettingSchema = createInsertSchema(siteSettings);
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type SiteSetting = typeof siteSettings.$inferSelect;
