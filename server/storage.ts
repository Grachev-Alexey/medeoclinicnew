import { db } from "./db";
import { eq, asc, desc } from "drizzle-orm";
import {
  users,
  mediaAssets,
  doctors,
  directions,
  services,
  serviceDirections,
  servicePriceItems,
  doctorServices,
  priceCategories,
  priceItems,
  priceItemDirections,
  priceItemDoctors,
  myths,
  promotions,
  stories,
  benefits,
  navLinks,
  siteSettings,
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
  type ServiceDirection,
  type ServicePriceItem,
  type PriceCategory,
  type InsertPriceCategory,
  type PriceItem,
  type InsertPriceItem,
  type Myth,
  type InsertMyth,
  type Promotion,
  type InsertPromotion,
  type Story,
  type InsertStory,
  type Benefit,
  type InsertBenefit,
  type NavLink,
  type InsertNavLink,
  type SiteSetting,
} from "@shared/schema";

type DbExecutor = typeof db | Parameters<Parameters<(typeof db)["transaction"]>[0]>[0];

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
  // Doctor ↔ service links
  getDoctorServices(doctorId: string): Promise<Service[]>;
  setDoctorServices(doctorId: string, serviceIds: string[]): Promise<void>;
  listAllDoctorServiceLinks(): Promise<{ doctorId: string; serviceId: string }[]>;

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
  createServiceWithRelations(
    data: InsertService,
    directionIds: string[],
    priceItemIds: string[],
  ): Promise<Service>;
  updateServiceWithRelations(
    id: string,
    data: Partial<InsertService>,
    directionIds?: string[],
    priceItemIds?: string[],
  ): Promise<Service | undefined>;
  deleteService(id: string): Promise<void>;
  // Service ↔ direction / price-item links (many-to-many)
  listServiceDirections(): Promise<ServiceDirection[]>;
  setServiceDirections(serviceId: string, directionIds: string[]): Promise<void>;
  listServicePriceItems(): Promise<ServicePriceItem[]>;
  setServicePriceItems(serviceId: string, priceItemIds: string[]): Promise<void>;

  // Prices
  listPriceCategories(): Promise<PriceCategory[]>;
  createPriceCategory(data: InsertPriceCategory): Promise<PriceCategory>;
  updatePriceCategory(id: string, data: Partial<InsertPriceCategory>): Promise<PriceCategory | undefined>;
  deletePriceCategory(id: string): Promise<void>;
  listPriceItems(categoryId?: string): Promise<PriceItem[]>;
  listPriceItemsWithRelations(): Promise<(PriceItem & { directionIds: string[]; doctorIds: string[] })[]>;
  createPriceItem(data: InsertPriceItem): Promise<PriceItem>;
  updatePriceItem(id: string, data: Partial<InsertPriceItem>): Promise<PriceItem | undefined>;
  updatePriceItemWithRelations(id: string, data: Partial<InsertPriceItem>, directionIds: string[], doctorIds: string[]): Promise<PriceItem | undefined>;
  deletePriceItem(id: string): Promise<void>;
  setPriceItemDirections(priceItemId: string, directionIds: string[]): Promise<void>;
  setPriceItemDoctors(priceItemId: string, doctorIds: string[]): Promise<void>;

  // Myths
  listMyths(onlyActive?: boolean): Promise<Myth[]>;
  createMyth(data: InsertMyth): Promise<Myth>;
  updateMyth(id: string, data: Partial<InsertMyth>): Promise<Myth | undefined>;
  deleteMyth(id: string): Promise<void>;


  // Promotions
  listPromotions(onlyActive?: boolean): Promise<Promotion[]>;
  getPromotionBySlug(slug: string): Promise<Promotion | undefined>;
  createPromotion(data: InsertPromotion): Promise<Promotion>;
  updatePromotion(id: string, data: Partial<InsertPromotion>): Promise<Promotion | undefined>;
  deletePromotion(id: string): Promise<void>;

  // Stories
  listStories(onlyActive?: boolean): Promise<Story[]>;
  createStory(data: InsertStory): Promise<Story>;
  updateStory(id: string, data: Partial<InsertStory>): Promise<Story | undefined>;
  deleteStory(id: string): Promise<void>;

  // Benefits
  listBenefits(onlyActive?: boolean): Promise<Benefit[]>;
  createBenefit(data: InsertBenefit): Promise<Benefit>;
  updateBenefit(id: string, data: Partial<InsertBenefit>): Promise<Benefit | undefined>;
  deleteBenefit(id: string): Promise<void>;

  // Nav links
  listNavLinks(onlyActive?: boolean): Promise<NavLink[]>;
  createNavLink(data: InsertNavLink): Promise<NavLink>;
  updateNavLink(id: string, data: Partial<InsertNavLink>): Promise<NavLink | undefined>;
  deleteNavLink(id: string): Promise<void>;


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
  async getDoctorServices(doctorId: string): Promise<Service[]> {
    const links = await db
      .select()
      .from(doctorServices)
      .where(eq(doctorServices.doctorId, doctorId))
      .orderBy(asc(doctorServices.sortOrder));
    if (links.length === 0) return [];
    const ids = new Set(links.map((l) => l.serviceId));
    const all = await db.select().from(services).orderBy(asc(services.sortOrder));
    return all.filter((s) => ids.has(s.id));
  }
  async setDoctorServices(doctorId: string, serviceIds: string[]): Promise<void> {
    await db.delete(doctorServices).where(eq(doctorServices.doctorId, doctorId));
    const unique = Array.from(new Set(serviceIds.filter(Boolean)));
    if (unique.length === 0) return;
    await db.insert(doctorServices).values(
      unique.map((serviceId, i) => ({ doctorId, serviceId, sortOrder: i })),
    );
  }
  async listAllDoctorServiceLinks() {
    const rows = await db.select().from(doctorServices);
    return rows.map((r) => ({ doctorId: r.doctorId, serviceId: r.serviceId }));
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
    if (!directionId) return rows;
    const links = await db
      .select()
      .from(serviceDirections)
      .where(eq(serviceDirections.directionId, directionId));
    const ids = new Set(links.map((l) => l.serviceId));
    return rows.filter((r) => ids.has(r.id));
  }
  async listServiceDirections() {
    return db.select().from(serviceDirections).orderBy(asc(serviceDirections.sortOrder));
  }
  private async _setServiceDirections(exec: DbExecutor, serviceId: string, directionIds: string[]) {
    await exec.delete(serviceDirections).where(eq(serviceDirections.serviceId, serviceId));
    const unique = Array.from(new Set(directionIds.filter(Boolean)));
    if (unique.length === 0) return;
    await exec.insert(serviceDirections).values(
      unique.map((directionId, i) => ({ serviceId, directionId, sortOrder: i })),
    );
  }
  async setServiceDirections(serviceId: string, directionIds: string[]) {
    await this._setServiceDirections(db, serviceId, directionIds);
  }
  async listServicePriceItems() {
    return db.select().from(servicePriceItems).orderBy(asc(servicePriceItems.sortOrder));
  }
  private async _setServicePriceItems(exec: DbExecutor, serviceId: string, priceItemIds: string[]) {
    await exec.delete(servicePriceItems).where(eq(servicePriceItems.serviceId, serviceId));
    const unique = Array.from(new Set(priceItemIds.filter(Boolean)));
    if (unique.length === 0) return;
    await exec.insert(servicePriceItems).values(
      unique.map((priceItemId, i) => ({ serviceId, priceItemId, sortOrder: i })),
    );
  }
  async setServicePriceItems(serviceId: string, priceItemIds: string[]) {
    await this._setServicePriceItems(db, serviceId, priceItemIds);
  }
  async createServiceWithRelations(
    data: InsertService,
    directionIds: string[],
    priceItemIds: string[],
  ) {
    return db.transaction(async (tx) => {
      const slug = data.slug && data.slug.trim() ? data.slug.trim() : await this.uniqueServiceSlug(data.name);
      const [row] = await tx.insert(services).values({ ...data, slug }).returning();
      await this._setServiceDirections(tx, row.id, directionIds);
      await this._setServicePriceItems(tx, row.id, priceItemIds);
      return row;
    });
  }
  async updateServiceWithRelations(
    id: string,
    data: Partial<InsertService>,
    directionIds?: string[],
    priceItemIds?: string[],
  ) {
    return db.transaction(async (tx) => {
      const [row] = await tx.update(services).set(data).where(eq(services.id, id)).returning();
      if (!row) return undefined;
      if (directionIds) await this._setServiceDirections(tx, row.id, directionIds);
      if (priceItemIds) await this._setServicePriceItems(tx, row.id, priceItemIds);
      return row;
    });
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
  async listPriceItemsWithRelations() {
    const rows = await db.select().from(priceItems).orderBy(asc(priceItems.sortOrder));
    const dirs = await db.select().from(priceItemDirections);
    const docs = await db.select().from(priceItemDoctors);
    return rows.map((r) => ({
      ...r,
      directionIds: dirs.filter((d) => d.priceItemId === r.id).map((d) => d.directionId),
      doctorIds: docs.filter((d) => d.priceItemId === r.id).map((d) => d.doctorId),
    }));
  }
  async setPriceItemDirections(priceItemId: string, directionIds: string[]) {
    await db.delete(priceItemDirections).where(eq(priceItemDirections.priceItemId, priceItemId));
    const unique = Array.from(new Set(directionIds.filter(Boolean)));
    if (unique.length > 0) {
      await db.insert(priceItemDirections).values(unique.map((directionId) => ({ priceItemId, directionId })));
    }
  }
  async setPriceItemDoctors(priceItemId: string, doctorIds: string[]) {
    await db.delete(priceItemDoctors).where(eq(priceItemDoctors.priceItemId, priceItemId));
    const unique = Array.from(new Set(doctorIds.filter(Boolean)));
    if (unique.length > 0) {
      await db.insert(priceItemDoctors).values(unique.map((doctorId) => ({ priceItemId, doctorId })));
    }
  }
  async createPriceItem(data: InsertPriceItem) {
    const [row] = await db.insert(priceItems).values(data).returning();
    return row;
  }
  async updatePriceItem(id: string, data: Partial<InsertPriceItem>) {
    const [row] = await db.update(priceItems).set(data).where(eq(priceItems.id, id)).returning();
    return row;
  }
  async updatePriceItemWithRelations(id: string, data: Partial<InsertPriceItem>, directionIds: string[], doctorIds: string[]) {
    let row: PriceItem | undefined;
    if (Object.keys(data).length > 0) {
      const [updated] = await db.update(priceItems).set(data).where(eq(priceItems.id, id)).returning();
      row = updated;
    } else {
      const [existing] = await db.select().from(priceItems).where(eq(priceItems.id, id));
      row = existing;
    }
    if (!row) return undefined;
    await this.setPriceItemDirections(id, directionIds);
    await this.setPriceItemDoctors(id, doctorIds);
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

  // ---- Stories ----
  async listStories(onlyActive = false) {
    const rows = await db.select().from(stories).orderBy(asc(stories.sortOrder));
    return onlyActive ? rows.filter((r) => r.active) : rows;
  }
  async createStory(data: InsertStory) {
    const [row] = await db.insert(stories).values(data).returning();
    return row;
  }
  async updateStory(id: string, data: Partial<InsertStory>) {
    const [row] = await db.update(stories).set(data).where(eq(stories.id, id)).returning();
    return row;
  }
  async deleteStory(id: string) {
    await db.delete(stories).where(eq(stories.id, id));
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
