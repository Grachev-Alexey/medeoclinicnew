import type { Express, Request, Response } from "express";
import { type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth, requireAuth, hashPassword } from "./auth";
import { optimizeAndUpload } from "./imageService";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import passport from "passport";
import { z, ZodSchema } from "zod";
import {
  insertDoctorSchema,
  insertDirectionSchema,
  insertServiceSchema,
  insertPriceCategorySchema,
  insertPriceItemSchema,
  insertMythSchema,
  insertPromotionSchema,
  insertStorySchema,
  insertBenefitSchema,
  insertNavLinkSchema,
  type Direction,
  type PriceItem,
} from "@shared/schema";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

const pid = (req: Request, key = "id"): string => String(req.params[key]);

function parseBody<T>(schema: ZodSchema<T>, body: unknown, res: Response): T | null {
  const result = schema.safeParse(body);
  if (!result.success) {
    res.status(400).json({ message: "Ошибка валидации", errors: result.error.flatten() });
    return null;
  }
  return result.data;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  setupAuth(app);
  registerObjectStorageRoutes(app);

  /* ----------------------------- Auth routes ----------------------------- */
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Неверные данные" });
      req.logIn(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        return res.json({ id: user.id, username: user.username });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "ok" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
      const user = req.user as any;
      return res.json({ id: user.id, username: user.username });
    }
    return res.status(401).json({ message: "Не авторизован" });
  });

  app.post("/api/auth/change-password", requireAuth, async (req, res) => {
    const schema = z.object({ password: z.string().min(6) });
    const data = parseBody(schema, req.body, res);
    if (!data) return;
    const user = req.user as any;
    await storage.updateUserPassword(user.id, await hashPassword(data.password));
    res.json({ message: "ok" });
  });

  /* ----------------------------- Image upload ---------------------------- */
  app.post("/api/admin/images", requireAuth, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "Файл не загружен" });
      const optimized = await optimizeAndUpload(req.file.buffer);
      const asset = await storage.createMedia({
        url: optimized.url,
        originalName: req.file.originalname,
        mimeType: optimized.mimeType,
        width: optimized.width,
        height: optimized.height,
        size: optimized.size,
        alt: (req.body?.alt as string) || "",
      });
      res.status(201).json(asset);
    } catch (err) {
      console.error("Image upload failed:", err);
      res.status(500).json({ message: "Не удалось загрузить изображение" });
    }
  });

  app.get("/api/media", requireAuth, async (_req, res) => {
    res.json(await storage.listMedia());
  });
  app.patch("/api/admin/media/:id", requireAuth, async (req, res) => {
    const asset = await storage.updateMedia(pid(req), req.body);
    if (!asset) return res.status(404).json({ message: "Не найдено" });
    res.json(asset);
  });
  app.delete("/api/admin/media/:id", requireAuth, async (req, res) => {
    await storage.deleteMedia(pid(req));
    res.json({ message: "ok" });
  });

  /* --------------------------- Generic CRUD helper ----------------------- */
  type CrudConfig = {
    path: string;
    schema: z.AnyZodObject;
    list: (onlyActive?: boolean) => Promise<any[]>;
    create: (data: any) => Promise<any>;
    update: (id: string, data: any) => Promise<any>;
    remove: (id: string) => Promise<void>;
  };

  function registerCrud(config: CrudConfig) {
    // Public list (active only)
    app.get(`/api/${config.path}`, async (_req, res) => {
      res.json(await config.list(true));
    });
    // Admin list (all)
    app.get(`/api/admin/${config.path}`, requireAuth, async (_req, res) => {
      res.json(await config.list(false));
    });
    app.post(`/api/admin/${config.path}`, requireAuth, async (req, res) => {
      const data = parseBody(config.schema, req.body, res);
      if (!data) return;
      res.status(201).json(await config.create(data));
    });
    app.patch(`/api/admin/${config.path}/:id`, requireAuth, async (req, res) => {
      const data = parseBody(config.schema.partial(), req.body, res);
      if (!data) return;
      const updated = await config.update(pid(req), data);
      if (!updated) return res.status(404).json({ message: "Не найдено" });
      res.json(updated);
    });
    app.delete(`/api/admin/${config.path}/:id`, requireAuth, async (req, res) => {
      await config.remove(pid(req));
      res.json({ message: "ok" });
    });
  }

  // ---- Doctor CRUD (custom — handles serviceIds join table) ----
  // Helper to enrich a list of doctors with their serviceIds
  async function enrichDoctorsWithServiceIds(docs: any[]) {
    const links = await storage.listAllDoctorServiceLinks();
    const byDoctor = new Map<string, string[]>();
    for (const l of links) {
      const arr = byDoctor.get(l.doctorId) ?? [];
      arr.push(l.serviceId);
      byDoctor.set(l.doctorId, arr);
    }
    return docs.map((d) => ({ ...d, serviceIds: byDoctor.get(d.id) ?? [] }));
  }

  // Public list (active only) — no serviceIds needed
  app.get("/api/doctors", async (_req, res) => {
    res.json(await storage.listDoctors(true));
  });
  // Admin list (all) — include serviceIds for the edit form
  app.get("/api/admin/doctors", requireAuth, async (_req, res) => {
    const docs = await storage.listDoctors(false);
    res.json(await enrichDoctorsWithServiceIds(docs));
  });
  app.post("/api/admin/doctors", requireAuth, async (req, res) => {
    const { serviceIds, ...rest } = req.body as any;
    const data = parseBody(insertDoctorSchema, rest, res);
    if (!data) return;
    const created = await storage.createDoctor(data);
    if (Array.isArray(serviceIds)) await storage.setDoctorServices(created.id, serviceIds);
    res.status(201).json({ ...created, serviceIds: serviceIds ?? [] });
  });
  app.patch("/api/admin/doctors/:id", requireAuth, async (req, res) => {
    const { serviceIds, ...rest } = req.body as any;
    const data = parseBody(insertDoctorSchema.partial(), rest, res);
    if (!data) return;
    const updated = await storage.updateDoctor(pid(req), data);
    if (!updated) return res.status(404).json({ message: "Не найдено" });
    if (Array.isArray(serviceIds)) await storage.setDoctorServices(updated.id, serviceIds);
    const ids = Array.isArray(serviceIds)
      ? serviceIds
      : (await storage.listAllDoctorServiceLinks())
          .filter((l) => l.doctorId === updated.id)
          .map((l) => l.serviceId);
    res.json({ ...updated, serviceIds: ids });
  });
  app.delete("/api/admin/doctors/:id", requireAuth, async (req, res) => {
    await storage.deleteDoctor(pid(req));
    res.json({ message: "ok" });
  });

  // Public: single active doctor by slug — include linked services
  app.get("/api/doctors/:slug", async (req, res) => {
    const doctor = await storage.getDoctorBySlug(pid(req, "slug"));
    if (!doctor || !doctor.active) return res.status(404).json({ message: "Не найдено" });
    const linkedServices = await storage.getDoctorServices(doctor.id);
    res.json({ ...doctor, services: linkedServices });
  });

  registerCrud({
    path: "myths",
    schema: insertMythSchema,
    list: (a) => storage.listMyths(a),
    create: (d) => storage.createMyth(d),
    update: (id, d) => storage.updateMyth(id, d),
    remove: (id) => storage.deleteMyth(id),
  });

  registerCrud({
    path: "promotions",
    schema: insertPromotionSchema,
    list: (a) => storage.listPromotions(a),
    create: (d) => storage.createPromotion(d),
    update: (id, d) => storage.updatePromotion(id, d),
    remove: (id) => storage.deletePromotion(id),
  });

  registerCrud({
    path: "stories",
    schema: insertStorySchema,
    list: (a) => storage.listStories(a),
    create: (d) => storage.createStory(d),
    update: (id, d) => storage.updateStory(id, d),
    remove: (id) => storage.deleteStory(id),
  });

  registerCrud({
    path: "benefits",
    schema: insertBenefitSchema,
    list: (a) => storage.listBenefits(a),
    create: (d) => storage.createBenefit(d),
    update: (id, d) => storage.updateBenefit(id, d),
    remove: (id) => storage.deleteBenefit(id),
  });

  registerCrud({
    path: "nav-links",
    schema: insertNavLinkSchema,
    list: (a) => storage.listNavLinks(a),
    create: (d) => storage.createNavLink(d),
    update: (id, d) => storage.updateNavLink(id, d),
    remove: (id) => storage.deleteNavLink(id),
  });

  /* ------------------------- Directions + services ----------------------- */
  // Public: directions with nested services
  app.get("/api/directions", async (_req, res) => {
    const dirs = await storage.listDirections(true);
    const allServices = await storage.listServices();
    const links = await storage.listServiceDirections();
    const dirIdsBySvc = new Map<string, Set<string>>();
    for (const l of links) {
      const set = dirIdsBySvc.get(l.serviceId);
      if (set) set.add(l.directionId);
      else dirIdsBySvc.set(l.serviceId, new Set([l.directionId]));
    }
    res.json(
      dirs.map((d) => ({
        ...d,
        services: allServices.filter((s) => dirIdsBySvc.get(s.id)?.has(d.id)),
      })),
    );
  });
  app.get("/api/directions/:slug", async (req, res) => {
    const dir = await storage.getDirectionBySlug(pid(req, "slug"));
    if (!dir || !dir.active) return res.status(404).json({ message: "Не найдено" });
    const services = await storage.listServices(dir.id);
    // Aggregate the concrete procedures (price items) shown + searchable on the
    // section page: every item hand-picked for this section's services, plus the
    // direction's own catalog category (used by specialty sections).
    const allItems = await storage.listPriceItems();
    const spLinks = await storage.listServicePriceItems();
    const svcIds = new Set(services.map((s) => s.id));
    const wantedItemIds = new Set<string>();
    for (const l of spLinks) if (svcIds.has(l.serviceId)) wantedItemIds.add(l.priceItemId);
    if (dir.priceCategoryId) {
      for (const it of allItems) {
        if (it.categoryId === dir.priceCategoryId) wantedItemIds.add(it.id);
      }
    }
    const cats = await storage.listPriceCategories();
    const priceGroups = cats
      .map((c) => ({
        id: c.id,
        name: c.name,
        items: allItems
          .filter((i) => i.categoryId === c.id && wantedItemIds.has(i.id))
          .map((i) => ({ id: i.id, name: i.name, price: i.price, note: i.note })),
      }))
      .filter((g) => g.items.length > 0);
    res.json({ ...dir, services, priceGroups });
  });
  app.get("/api/admin/directions", requireAuth, async (_req, res) => {
    const dirs = await storage.listDirections(false);
    const allServices = await storage.listServices();
    const links = await storage.listServiceDirections();
    const dirIdsBySvc = new Map<string, Set<string>>();
    for (const l of links) {
      const set = dirIdsBySvc.get(l.serviceId);
      if (set) set.add(l.directionId);
      else dirIdsBySvc.set(l.serviceId, new Set([l.directionId]));
    }
    res.json(
      dirs.map((d) => ({
        ...d,
        services: allServices.filter((s) => dirIdsBySvc.get(s.id)?.has(d.id)),
      })),
    );
  });
  app.post("/api/admin/directions", requireAuth, async (req, res) => {
    const data = parseBody(insertDirectionSchema, req.body, res);
    if (!data) return;
    res.status(201).json(await storage.createDirection(data));
  });
  app.patch("/api/admin/directions/:id", requireAuth, async (req, res) => {
    const data = parseBody(insertDirectionSchema.partial(), req.body, res);
    if (!data) return;
    const updated = await storage.updateDirection(pid(req), data);
    if (!updated) return res.status(404).json({ message: "Не найдено" });
    res.json(updated);
  });
  app.delete("/api/admin/directions/:id", requireAuth, async (req, res) => {
    await storage.deleteDirection(pid(req));
    res.json({ message: "ok" });
  });

  // Public: single service by slug (with its primary direction + chosen procedures)
  app.get("/api/services/:slug", async (req, res) => {
    const service = await storage.getServiceBySlug(pid(req, "slug"));
    if (!service || !service.active) return res.status(404).json({ message: "Не найдено" });
    // Resolve the service's directions; the first active one drives the page
    // accent + breadcrumb (a service can belong to several directions).
    const dLinks = (await storage.listServiceDirections()).filter(
      (l) => l.serviceId === service.id,
    );
    const allDirections = await storage.listDirections(false);
    const dirById = new Map(allDirections.map((d) => [d.id, d] as const));
    const memberDirs = dLinks
      .map((l) => dirById.get(l.directionId))
      .filter((d): d is Direction => !!d && d.active);
    if (memberDirs.length === 0) return res.status(404).json({ message: "Не найдено" });
    const direction = memberDirs[0];
    // Hand-picked procedures = the "сопутствующие услуги" block, in chosen order.
    const spLinks = (await storage.listServicePriceItems()).filter(
      (l) => l.serviceId === service.id,
    );
    const itemById = new Map((await storage.listPriceItems()).map((i) => [i.id, i] as const));
    const priceItems = spLinks
      .map((l) => itemById.get(l.priceItemId))
      .filter((i): i is PriceItem => !!i)
      .map((i) => ({ id: i.id, name: i.name, price: i.price }));
    res.json({ ...service, direction, directions: memberDirs, priceItems });
  });

  // Admin: every service enriched with its direction + price-item links
  app.get("/api/admin/services", requireAuth, async (_req, res) => {
    const [allServices, dLinks, pLinks] = await Promise.all([
      storage.listServices(),
      storage.listServiceDirections(),
      storage.listServicePriceItems(),
    ]);
    const dirBySvc = new Map<string, string[]>();
    for (const l of dLinks) {
      const arr = dirBySvc.get(l.serviceId);
      if (arr) arr.push(l.directionId);
      else dirBySvc.set(l.serviceId, [l.directionId]);
    }
    const itemBySvc = new Map<string, string[]>();
    for (const l of pLinks) {
      const arr = itemBySvc.get(l.serviceId);
      if (arr) arr.push(l.priceItemId);
      else itemBySvc.set(l.serviceId, [l.priceItemId]);
    }
    res.json(
      allServices.map((s) => ({
        ...s,
        directionIds: dirBySvc.get(s.id) ?? [],
        priceItemIds: itemBySvc.get(s.id) ?? [],
      })),
    );
  });

  app.post("/api/admin/services", requireAuth, async (req, res) => {
    const { directionIds, priceItemIds, ...rest } = req.body ?? {};
    const data = parseBody(insertServiceSchema, rest, res);
    if (!data) return;
    const svc = await storage.createServiceWithRelations(
      data,
      Array.isArray(directionIds) ? directionIds : [],
      Array.isArray(priceItemIds) ? priceItemIds : [],
    );
    res.status(201).json(svc);
  });
  app.patch("/api/admin/services/:id", requireAuth, async (req, res) => {
    const { directionIds, priceItemIds, ...rest } = req.body ?? {};
    const data = parseBody(insertServiceSchema.partial(), rest, res);
    if (!data) return;
    const updated = await storage.updateServiceWithRelations(
      pid(req),
      data,
      Array.isArray(directionIds) ? directionIds : undefined,
      Array.isArray(priceItemIds) ? priceItemIds : undefined,
    );
    if (!updated) return res.status(404).json({ message: "Не найдено" });
    res.json(updated);
  });
  app.delete("/api/admin/services/:id", requireAuth, async (req, res) => {
    await storage.deleteService(pid(req));
    res.json({ message: "ok" });
  });

  /* ----------------------- Promotion landing detail ---------------------- */
  // Public: single promotion by slug (with its related services)
  app.get("/api/promotions/:slug", async (req, res) => {
    const promo = await storage.getPromotionBySlug(pid(req, "slug"));
    if (!promo || !promo.active) return res.status(404).json({ message: "Не найдено" });
    const ids = new Set(promo.serviceIds ?? []);
    const related = ids.size
      ? (await storage.listServices()).filter((s) => ids.has(s.id) && s.active)
      : [];
    res.json({ ...promo, related });
  });

  /* ------------------------------- Prices -------------------------------- */
  app.get("/api/prices", async (_req, res) => {
    const cats = await storage.listPriceCategories();
    const items = await storage.listPriceItems();
    res.json(
      cats.map((c) => ({
        ...c,
        items: items.filter((i) => i.categoryId === c.id),
      })),
    );
  });
  app.get("/api/admin/price-categories", requireAuth, async (_req, res) => {
    res.json(await storage.listPriceCategories());
  });
  app.post("/api/admin/price-categories", requireAuth, async (req, res) => {
    const data = parseBody(insertPriceCategorySchema, req.body, res);
    if (!data) return;
    res.status(201).json(await storage.createPriceCategory(data));
  });
  app.patch("/api/admin/price-categories/:id", requireAuth, async (req, res) => {
    const data = parseBody(insertPriceCategorySchema.partial(), req.body, res);
    if (!data) return;
    const updated = await storage.updatePriceCategory(pid(req), data);
    if (!updated) return res.status(404).json({ message: "Не найдено" });
    res.json(updated);
  });
  app.delete("/api/admin/price-categories/:id", requireAuth, async (req, res) => {
    await storage.deletePriceCategory(pid(req));
    res.json({ message: "ok" });
  });

  app.get("/api/admin/price-items", requireAuth, async (_req, res) => {
    res.json(await storage.listPriceItemsWithRelations());
  });
  app.post("/api/admin/price-items", requireAuth, async (req, res) => {
    const { directionIds: _d, doctorIds: _doc, ...rest } = req.body;
    const data = parseBody(insertPriceItemSchema, rest, res);
    if (!data) return;
    const item = await storage.createPriceItem(data);
    if (Array.isArray(_d)) await storage.setPriceItemDirections(item.id, _d);
    if (Array.isArray(_doc)) await storage.setPriceItemDoctors(item.id, _doc);
    res.status(201).json(item);
  });
  app.patch("/api/admin/price-items/:id", requireAuth, async (req, res) => {
    const { directionIds, doctorIds, ...rest } = req.body;
    const data = parseBody(insertPriceItemSchema.partial(), rest, res);
    if (!data) return;
    const updated = await storage.updatePriceItemWithRelations(
      pid(req),
      data,
      Array.isArray(directionIds) ? directionIds : [],
      Array.isArray(doctorIds) ? doctorIds : [],
    );
    if (!updated) return res.status(404).json({ message: "Не найдено" });
    res.json(updated);
  });
  app.delete("/api/admin/price-items/:id", requireAuth, async (req, res) => {
    await storage.deletePriceItem(pid(req));
    res.json({ message: "ok" });
  });

  /* ----------------------------- Search index ---------------------------- */
  // Public aggregated index for the global mega-search.
  app.get("/api/search-index", async (_req, res) => {
    const landingBySlug: Record<string, string> = {
      dentistry: "/stomatologiya",
      cosmetology: "/kosmetologiya",
    };
    const [directions, allServices, sdLinks, cats, items, doctors, myths, promotions] =
      await Promise.all([
        storage.listDirections(true),
        storage.listServices(),
        storage.listServiceDirections(),
        storage.listPriceCategories(),
        storage.listPriceItems(),
        storage.listDoctors(true),
        storage.listMyths(true),
        storage.listPromotions(true),
      ]);
    const catName = new Map(cats.map((c) => [c.id, c.name]));
    const dirById = new Map(directions.map((d) => [d.id, d]));
    // First listed direction per service drives its search subtitle.
    const primaryDirBySvc = new Map<string, string>();
    for (const l of sdLinks) {
      if (!primaryDirBySvc.has(l.serviceId)) primaryDirBySvc.set(l.serviceId, l.directionId);
    }

    const entries: Array<{
      type: string;
      group: string;
      title: string;
      subtitle: string;
      url: string;
      keywords: string;
    }> = [];

    for (const d of directions) {
      entries.push({
        type: "direction",
        group: "Направления",
        title: d.label,
        subtitle: d.description,
        url: landingBySlug[d.slug] ?? `/napravleniya/${d.slug}`,
        keywords: `${d.label} ${d.description} ${d.intro}`,
      });
    }
    for (const s of allServices) {
      if (!s.active) continue;
      const dir = dirById.get(primaryDirBySvc.get(s.id) ?? "");
      entries.push({
        type: "service",
        group: "Услуги",
        title: s.name,
        subtitle: s.shortDescription || dir?.label || "",
        url: `/uslugi/${s.slug}`,
        keywords: `${s.name} ${s.shortDescription} ${dir?.label ?? ""}`,
      });
    }
    for (const it of items) {
      entries.push({
        type: "price",
        group: "Цены",
        title: it.name,
        subtitle: [it.price, catName.get(it.categoryId)].filter(Boolean).join(" · "),
        url: `/prices#item-${it.id}`,
        keywords: `${it.name} ${catName.get(it.categoryId) ?? ""} цена стоимость`,
      });
    }
    for (const doc of doctors) {
      entries.push({
        type: "doctor",
        group: "Врачи",
        title: doc.name,
        subtitle: doc.specialty,
        url: doc.slug ? `/vrachi/${doc.slug}` : "/vrachi",
        keywords: `${doc.name} ${doc.specialty} врач`,
      });
    }
    for (const m of myths) {
      entries.push({
        type: "myth",
        group: "Полезное",
        title: m.question,
        subtitle: m.tag || "Мифы и факты",
        url: "/#myths",
        keywords: `${m.question} ${m.answer} ${m.tag}`,
      });
    }
    for (const p of promotions) {
      entries.push({
        type: "promotion",
        group: "Акции",
        title: p.title,
        subtitle: p.description,
        url: p.slug ? `/akcii/${p.slug}` : "/akcii",
        keywords: `${p.title} ${p.description} ${p.intro} акция скидка предложение`,
      });
    }

    res.json(entries);
  });

  /* --------------------------- Site settings ----------------------------- */
  app.get("/api/settings", async (_req, res) => {
    res.json(await storage.getAllSettings());
  });
  app.put("/api/admin/settings/:key", requireAuth, async (req, res) => {
    await storage.setSetting(pid(req, "key"), req.body?.value ?? req.body);
    res.json({ message: "ok" });
  });

  return httpServer;
}
