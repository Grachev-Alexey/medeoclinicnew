import { db } from "./db";
import { eq, asc, desc } from "drizzle-orm";
import {
  users,
  mediaAssets,
  doctors,
  directions,
  services,
  priceCategories,
  priceItems,
  myths,
  reviews,
  promotions,
  benefits,
  stats,
  navLinks,
  siteSettings,
  bookings,
  type User,
  type InsertUser,
  type MediaAsset,
  type InsertMediaAsset,
  type Doctor,
  type InsertDoctor,
  type Direction,
  type InsertDirection,
  type Service,
  type InsertService,
  type PriceCategory,
  type InsertPriceCategory,
  type PriceItem,
  type InsertPriceItem,
  type Myth,
  type InsertMyth,
  type Review,
  type InsertReview,
  type Promotion,
  type InsertPromotion,
  type Benefit,
  type InsertBenefit,
  type Stat,
  type InsertStat,
  type NavLink,
  type InsertNavLink,
  type SiteSetting,
  type Booking,
  type InsertBooking,
} from "@shared/schema";

const TRANSLIT: Record<string, string> = {
  а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"e",ж:"zh",з:"z",и:"i",й:"y",к:"k",л:"l",
  м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"h",ц:"c",ч:"ch",ш:"sh",
  щ:"sch",ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya",
};
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .split("")
    .map((ch) => (ch in TRANSLIT ? TRANSLIT[ch] : ch))
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

export interface IStorage {
  // Users / admin
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(id: string, password: string): Promise<void>;

  // Media
  listMedia(): Promise<MediaAsset[]>;
  createMedia(asset: InsertMediaAsset): Promise<MediaAsset>;
  updateMedia(id: string, data: Partial<InsertMediaAsset>): Promise<MediaAsset | undefined>;
  deleteMedia(id: string): Promise<void>;

  // Doctors
  listDoctors(onlyActive?: boolean): Promise<Doctor[]>;
  getDoctor(id: string): Promise<Doctor | undefined>;
  getDoctorBySlug(slug: string): Promise<Doctor | undefined>;
  createDoctor(data: InsertDoctor): Promise<Doctor>;
  updateDoctor(id: string, data: Partial<InsertDoctor>): Promise<Doctor | undefined>;
  deleteDoctor(id: string): Promise<void>;

  // Directions + services
  listDirections(onlyActive?: boolean): Promise<Direction[]>;
  getDirection(id: string): Promise<Direction | undefined>;
  getDirectionBySlug(slug: string): Promise<Direction | undefined>;
  createDirection(data: InsertDirection): Promise<Direction>;
  updateDirection(id: string, data: Partial<InsertDirection>): Promise<Direction | undefined>;
  deleteDirection(id: string): Promise<void>;
  listServices(directionId?: string): Promise<Service[]>;
  getServiceBySlug(slug: string): Promise<Service | undefined>;
  createService(data: InsertService): Promise<Service>;
  updateService(id: string, data: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: string): Promise<void>;

  // Prices
  listPriceCategories(): Promise<PriceCategory[]>;
  createPriceCategory(data: InsertPriceCategory): Promise<PriceCategory>;
  updatePriceCategory(id: string, data: Partial<InsertPriceCategory>): Promise<PriceCategory | undefined>;
  deletePriceCategory(id: string): Promise<void>;
  listPriceItems(categoryId?: string): Promise<PriceItem[]>;
  createPriceItem(data: InsertPriceItem): Promise<PriceItem>;
  updatePriceItem(id: string, data: Partial<InsertPriceItem>): Promise<PriceItem | undefined>;
  deletePriceItem(id: string): Promise<void>;

  // Myths
  listMyths(onlyActive?: boolean): Promise<Myth[]>;
  createMyth(data: InsertMyth): Promise<Myth>;
  updateMyth(id: string, data: Partial<InsertMyth>): Promise<Myth | undefined>;
  deleteMyth(id: string): Promise<void>;

  // Reviews
  listReviews(onlyActive?: boolean): Promise<Review[]>;
  createReview(data: InsertReview): Promise<Review>;
  updateReview(id: string, data: Partial<InsertReview>): Promise<Review | undefined>;
  deleteReview(id: string): Promise<void>;

  // Promotions
  listPromotions(onlyActive?: boolean): Promise<Promotion[]>;
  getPromotionBySlug(slug: string): Promise<Promotion | undefined>;
  createPromotion(data: InsertPromotion): Promise<Promotion>;
  updatePromotion(id: string, data: Partial<InsertPromotion>): Promise<Promotion | undefined>;
  deletePromotion(id: string): Promise<void>;

  // Benefits
  listBenefits(onlyActive?: boolean): Promise<Benefit[]>;
  createBenefit(data: InsertBenefit): Promise<Benefit>;
  updateBenefit(id: string, data: Partial<InsertBenefit>): Promise<Benefit | undefined>;
  deleteBenefit(id: string): Promise<void>;

  // Stats
  listStats(): Promise<Stat[]>;
  createStat(data: InsertStat): Promise<Stat>;
  updateStat(id: string, data: Partial<InsertStat>): Promise<Stat | undefined>;
  deleteStat(id: string): Promise<void>;

  // Nav links
  listNavLinks(onlyActive?: boolean): Promise<NavLink[]>;
  createNavLink(data: InsertNavLink): Promise<NavLink>;
  updateNavLink(id: string, data: Partial<InsertNavLink>): Promise<NavLink | undefined>;
  deleteNavLink(id: string): Promise<void>;

  // Bookings (online lead requests)
  listBookings(): Promise<Booking[]>;
  createBooking(data: InsertBooking): Promise<Booking>;
  updateBooking(id: string, data: Partial<Booking>): Promise<Booking | undefined>;
  deleteBooking(id: string): Promise<void>;

  // Site settings
  getAllSettings(): Promise<Record<string, unknown>>;
  getSetting(key: string): Promise<unknown>;
  setSetting(key: string, value: unknown): Promise<void>;
}

export class DbStorage implements IStorage {
  // ---- Users ----
  async getUser(id: string) {
    const [row] = await db.select().from(users).where(eq(users.id, id));
    return row;
  }
  async getUserByUsername(username: string) {
    const [row] = await db.select().from(users).where(eq(users.username, username));
    return row;
  }
  async createUser(user: InsertUser) {
    const [row] = await db.insert(users).values(user).returning();
    return row;
  }
  async updateUserPassword(id: string, password: string) {
    await db.update(users).set({ password }).where(eq(users.id, id));
  }

  // ---- Media ----
  async listMedia() {
    return db.select().from(mediaAssets).orderBy(asc(mediaAssets.createdAt));
  }
  async createMedia(asset: InsertMediaAsset) {
    const [row] = await db.insert(mediaAssets).values(asset).returning();
    return row;
  }
  async updateMedia(id: string, data: Partial<InsertMediaAsset>) {
    const [row] = await db.update(mediaAssets).set(data).where(eq(mediaAssets.id, id)).returning();
    return row;
  }
  async deleteMedia(id: string) {
    await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
  }

  // ---- Doctors ----
  async listDoctors(onlyActive = false) {
    const rows = await db.select().from(doctors).orderBy(asc(doctors.sortOrder));
    return onlyActive ? rows.filter((r) => r.active) : rows;
  }
  async getDoctor(id: string) {
    const [row] = await db.select().from(doctors).where(eq(doctors.id, id));
    return row;
  }
  async getDoctorBySlug(slug: string) {
    const [row] = await db.select().from(doctors).where(eq(doctors.slug, slug));
    return row;
  }
  async createDoctor(data: InsertDoctor) {
    const desired = data.slug && data.slug.trim() ? data.slug : data.name;
    const slug = await this.uniqueDoctorSlug(desired);
    const [row] = await db.insert(doctors).values({ ...data, slug }).returning();
    return row;
  }
  // Normalize + guarantee a unique doctor slug (manual input is slugified too).
  private async uniqueDoctorSlug(input: string, excludeId?: string) {
    const base = slugify(input) || "vrach";
    const existing = new Set(
      (await db.select({ id: doctors.id, slug: doctors.slug }).from(doctors))
        .filter((r) => r.id !== excludeId)
        .map((r) => r.slug),
    );
    let slug = base;
    let i = 1;
    while (existing.has(slug)) slug = `${base}-${++i}`;
    return slug;
  }
  async updateDoctor(id: string, data: Partial<InsertDoctor>) {
    const patch: Record<string, unknown> = { ...data };
    if (!patch.slug || !String(patch.slug).trim()) {
      delete patch.slug;
    } else {
      patch.slug = await this.uniqueDoctorSlug(String(patch.slug), id);
    }
    const [row] = await db.update(doctors).set(patch).where(eq(doctors.id, id)).returning();
    return row;
  }
  async deleteDoctor(id: string) {
    await db.delete(doctors).where(eq(doctors.id, id));
  }

  // ---- Directions + Services ----
  async listDirections(onlyActive = false) {
    const rows = await db.select().from(directions).orderBy(asc(directions.sortOrder));
    return onlyActive ? rows.filter((r) => r.active) : rows;
  }
  async getDirection(id: string) {
    const [row] = await db.select().from(directions).where(eq(directions.id, id));
    return row;
  }
  async getDirectionBySlug(slug: string) {
    const [row] = await db.select().from(directions).where(eq(directions.slug, slug));
    return row;
  }
  async createDirection(data: InsertDirection) {
    const [row] = await db.insert(directions).values(data).returning();
    return row;
  }
  async updateDirection(id: string, data: Partial<InsertDirection>) {
    const [row] = await db.update(directions).set(data).where(eq(directions.id, id)).returning();
    return row;
  }
  async deleteDirection(id: string) {
    await db.delete(directions).where(eq(directions.id, id));
  }
  async listServices(directionId?: string) {
    const rows = await db.select().from(services).orderBy(asc(services.sortOrder));
    return directionId ? rows.filter((r) => r.directionId === directionId) : rows;
  }
  async getServiceBySlug(slug: string) {
    const [row] = await db.select().from(services).where(eq(services.slug, slug));
    return row;
  }
  async createService(data: InsertService) {
    const slug = data.slug && data.slug.trim() ? data.slug.trim() : await this.uniqueServiceSlug(data.name);
    const [row] = await db.insert(services).values({ ...data, slug }).returning();
    return row;
  }
  private async uniqueServiceSlug(name: string) {
    const base = slugify(name) || "usluga";
    const existing = new Set((await db.select({ slug: services.slug }).from(services)).map((r) => r.slug));
    let slug = base;
    let i = 1;
    while (existing.has(slug)) slug = `${base}-${++i}`;
    return slug;
  }
  async updateService(id: string, data: Partial<InsertService>) {
    const [row] = await db.update(services).set(data).where(eq(services.id, id)).returning();
    return row;
  }
  async deleteService(id: string) {
    await db.delete(services).where(eq(services.id, id));
  }

  // ---- Prices ----
  async listPriceCategories() {
    return db.select().from(priceCategories).orderBy(asc(priceCategories.sortOrder));
  }
  async createPriceCategory(data: InsertPriceCategory) {
    const [row] = await db.insert(priceCategories).values(data).returning();
    return row;
  }
  async updatePriceCategory(id: string, data: Partial<InsertPriceCategory>) {
    const [row] = await db.update(priceCategories).set(data).where(eq(priceCategories.id, id)).returning();
    return row;
  }
  async deletePriceCategory(id: string) {
    await db.delete(priceCategories).where(eq(priceCategories.id, id));
  }
  async listPriceItems(categoryId?: string) {
    const rows = await db.select().from(priceItems).orderBy(asc(priceItems.sortOrder));
    return categoryId ? rows.filter((r) => r.categoryId === categoryId) : rows;
  }
  async createPriceItem(data: InsertPriceItem) {
    const [row] = await db.insert(priceItems).values(data).returning();
    return row;
  }
  async updatePriceItem(id: string, data: Partial<InsertPriceItem>) {
    const [row] = await db.update(priceItems).set(data).where(eq(priceItems.id, id)).returning();
    return row;
  }
  async deletePriceItem(id: string) {
    await db.delete(priceItems).where(eq(priceItems.id, id));
  }

  // ---- Myths ----
  async listMyths(onlyActive = false) {
    const rows = await db.select().from(myths).orderBy(asc(myths.sortOrder));
    return onlyActive ? rows.filter((r) => r.active) : rows;
  }
  async createMyth(data: InsertMyth) {
    const [row] = await db.insert(myths).values(data).returning();
    return row;
  }
  async updateMyth(id: string, data: Partial<InsertMyth>) {
    const [row] = await db.update(myths).set(data).where(eq(myths.id, id)).returning();
    return row;
  }
  async deleteMyth(id: string) {
    await db.delete(myths).where(eq(myths.id, id));
  }

  // ---- Reviews ----
  async listReviews(onlyActive = false) {
    const rows = await db.select().from(reviews).orderBy(asc(reviews.sortOrder));
    return onlyActive ? rows.filter((r) => r.active) : rows;
  }
  async createReview(data: InsertReview) {
    const [row] = await db.insert(reviews).values(data).returning();
    return row;
  }
  async updateReview(id: string, data: Partial<InsertReview>) {
    const [row] = await db.update(reviews).set(data).where(eq(reviews.id, id)).returning();
    return row;
  }
  async deleteReview(id: string) {
    await db.delete(reviews).where(eq(reviews.id, id));
  }

  // ---- Promotions ----
  async listPromotions(onlyActive = false) {
    const rows = await db.select().from(promotions).orderBy(asc(promotions.sortOrder));
    return onlyActive ? rows.filter((r) => r.active) : rows;
  }
  async getPromotionBySlug(slug: string) {
    const [row] = await db.select().from(promotions).where(eq(promotions.slug, slug));
    return row;
  }
  async createPromotion(data: InsertPromotion) {
    const slug = data.slug && data.slug.trim() ? data.slug.trim() : await this.uniquePromotionSlug(data.title);
    const [row] = await db.insert(promotions).values({ ...data, slug }).returning();
    return row;
  }
  private async uniquePromotionSlug(title: string) {
    const base = slugify(title) || "akciya";
    const existing = new Set(
      (await db.select({ slug: promotions.slug }).from(promotions)).map((r) => r.slug),
    );
    let slug = base;
    let i = 1;
    while (existing.has(slug)) slug = `${base}-${++i}`;
    return slug;
  }
  async updatePromotion(id: string, data: Partial<InsertPromotion>) {
    const patch: Record<string, unknown> = { ...data };
    if (!patch.slug || !String(patch.slug).trim()) delete patch.slug;
    const [row] = await db.update(promotions).set(patch).where(eq(promotions.id, id)).returning();
    return row;
  }
  async deletePromotion(id: string) {
    await db.delete(promotions).where(eq(promotions.id, id));
  }

  // ---- Benefits ----
  async listBenefits(onlyActive = false) {
    const rows = await db.select().from(benefits).orderBy(asc(benefits.sortOrder));
    return onlyActive ? rows.filter((r) => r.active) : rows;
  }
  async createBenefit(data: InsertBenefit) {
    const [row] = await db.insert(benefits).values(data).returning();
    return row;
  }
  async updateBenefit(id: string, data: Partial<InsertBenefit>) {
    const [row] = await db.update(benefits).set(data).where(eq(benefits.id, id)).returning();
    return row;
  }
  async deleteBenefit(id: string) {
    await db.delete(benefits).where(eq(benefits.id, id));
  }

  // ---- Stats ----
  async listStats() {
    return db.select().from(stats).orderBy(asc(stats.sortOrder));
  }
  async createStat(data: InsertStat) {
    const [row] = await db.insert(stats).values(data).returning();
    return row;
  }
  async updateStat(id: string, data: Partial<InsertStat>) {
    const [row] = await db.update(stats).set(data).where(eq(stats.id, id)).returning();
    return row;
  }
  async deleteStat(id: string) {
    await db.delete(stats).where(eq(stats.id, id));
  }

  // ---- Nav links ----
  async listNavLinks(onlyActive = false) {
    const rows = await db.select().from(navLinks).orderBy(asc(navLinks.sortOrder));
    return onlyActive ? rows.filter((r) => r.active) : rows;
  }
  async createNavLink(data: InsertNavLink) {
    const [row] = await db.insert(navLinks).values(data).returning();
    return row;
  }
  async updateNavLink(id: string, data: Partial<InsertNavLink>) {
    const [row] = await db.update(navLinks).set(data).where(eq(navLinks.id, id)).returning();
    return row;
  }
  async deleteNavLink(id: string) {
    await db.delete(navLinks).where(eq(navLinks.id, id));
  }

  // ---- Bookings ----
  async listBookings() {
    return db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }
  async createBooking(data: InsertBooking) {
    const [row] = await db.insert(bookings).values(data).returning();
    return row;
  }
  async updateBooking(id: string, data: Partial<Booking>) {
    const [row] = await db.update(bookings).set(data).where(eq(bookings.id, id)).returning();
    return row;
  }
  async deleteBooking(id: string) {
    await db.delete(bookings).where(eq(bookings.id, id));
  }

  // ---- Site settings ----
  async getAllSettings() {
    const rows = await db.select().from(siteSettings);
    const out: Record<string, unknown> = {};
    for (const row of rows) out[row.key] = row.value;
    return out;
  }
  async getSetting(key: string) {
    const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return row?.value;
  }
  async setSetting(key: string, value: unknown) {
    await db
      .insert(siteSettings)
      .values({ key, value: value as any })
      .onConflictDoUpdate({ target: siteSettings.key, set: { value: value as any } });
  }
}

export const storage = new DbStorage();
