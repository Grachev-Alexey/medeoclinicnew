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
  insertReviewSchema,
  insertPromotionSchema,
  insertBenefitSchema,
  insertStatSchema,
  insertNavLinkSchema,
  insertBookingSchema,
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

  /* ------------------------------- Bookings ------------------------------ */
  const publicBookingSchema = insertBookingSchema
    .omit({ directionLabel: true })
    .extend({
      name: z.string().trim().min(2, "Укажите имя"),
      phone: z.string().trim().min(5, "Укажите телефон"),
    });

  // Public: submit an online appointment request (lead)
  app.post("/api/bookings", async (req, res) => {
    const data = parseBody(publicBookingSchema, req.body, res);
    if (!data) return;
    let directionLabel = "";
    let directionId = data.directionId ?? null;
    if (directionId) {
      const dir = await storage.getDirection(directionId);
      if (dir) {
        directionLabel = dir.label;
      } else {
        directionId = null;
      }
    }
    const created = await storage.createBooking({ ...data, directionId, directionLabel });
    res.status(201).json({ id: created.id });
  });

  // Admin: list / update status / delete bookings
  app.get("/api/admin/bookings", requireAuth, async (_req, res) => {
    res.json(await storage.listBookings());
  });
  app.patch("/api/admin/bookings/:id", requireAuth, async (req, res) => {
    const data = parseBody(z.object({ status: z.enum(["new", "processed"]) }), req.body, res);
    if (!data) return;
    const updated = await storage.updateBooking(pid(req), data);
    if (!updated) return res.status(404).json({ message: "Не найдено" });
    res.json(updated);
  });
  app.delete("/api/admin/bookings/:id", requireAuth, async (req, res) => {
    await storage.deleteBooking(pid(req));
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

  registerCrud({
    path: "doctors",
    schema: insertDoctorSchema,
    list: (a) => storage.listDoctors(a),
    create: (d) => storage.createDoctor(d),
    update: (id, d) => storage.updateDoctor(id, d),
    remove: (id) => storage.deleteDoctor(id),
  });

  // Public: single active doctor by slug (for /vrachi/[slug])
  app.get("/api/doctors/:slug", async (req, res) => {
    const doctor = await storage.getDoctorBySlug(pid(req, "slug"));
    if (!doctor || !doctor.active) return res.status(404).json({ message: "Не найдено" });
    res.json(doctor);
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
    path: "reviews",
    schema: insertReviewSchema,
    list: (a) => storage.listReviews(a),
    create: (d) => storage.createReview(d),
    update: (id, d) => storage.updateReview(id, d),
    remove: (id) => storage.deleteReview(id),
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
    path: "benefits",
    schema: insertBenefitSchema,
    list: (a) => storage.listBenefits(a),
    create: (d) => storage.createBenefit(d),
    update: (id, d) => storage.updateBenefit(id, d),
    remove: (id) => storage.deleteBenefit(id),
  });

  registerCrud({
    path: "stats",
    schema: insertStatSchema,
    list: () => storage.listStats(),
    create: (d) => storage.createStat(d),
    update: (id, d) => storage.updateStat(id, d),
    remove: (id) => storage.deleteStat(id),
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
    res.json(
      dirs.map((d) => ({
        ...d,
        services: allServices.filter((s) => s.directionId === d.id),
      })),
    );
  });
  app.get("/api/directions/:slug", async (req, res) => {
    const dir = await storage.getDirectionBySlug(pid(req, "slug"));
    if (!dir || !dir.active) return res.status(404).json({ message: "Не найдено" });
    const services = await storage.listServices(dir.id);
    // Aggregate concrete procedures (price items) so the section page can list
    // and search them: the direction's own category ∪ each service's category.
    const catIds: string[] = [];
    const pushId = (id: string | null | undefined) => {
      if (id && !catIds.includes(id)) catIds.push(id);
    };
    pushId(dir.priceCategoryId);
    for (const s of services) pushId(s.priceCategoryId);
    let priceGroups: Array<{
      id: string;
      name: string;
      items: { id: string; name: string; price: string; note: string }[];
    }> = [];
    if (catIds.length) {
      const cats = await storage.listPriceCategories();
      const catById = new Map(cats.map((c) => [c.id, c] as const));
      const allItems = await storage.listPriceItems();
      priceGroups = catIds
        .map((id) => {
          const c = catById.get(id);
          if (!c) return null;
          return {
            id: c.id,
            name: c.name,
            items: allItems
              .filter((i) => i.categoryId === id)
              .map((i) => ({ id: i.id, name: i.name, price: i.price, note: i.note })),
          };
        })
        .filter((g): g is NonNullable<typeof g> => !!g && g.items.length > 0);
    }
    res.json({ ...dir, services, priceGroups });
  });
  app.get("/api/admin/directions", requireAuth, async (_req, res) => {
    const dirs = await storage.listDirections(false);
    const allServices = await storage.listServices();
    res.json(
      dirs.map((d) => ({
        ...d,
        services: allServices.filter((s) => s.directionId === d.id),
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

  // Public: single service by slug (with its direction)
  app.get("/api/services/:slug", async (req, res) => {
    const service = await storage.getServiceBySlug(pid(req, "slug"));
    if (!service || !service.active) return res.status(404).json({ message: "Не найдено" });
    const direction = await storage.getDirection(service.directionId);
    if (!direction || !direction.active) return res.status(404).json({ message: "Не найдено" });
    const related = (await storage.listServices(direction.id)).filter(
      (s) => s.active && s.id !== service.id,
    );
    let priceCategory: { id: string; name: string } | null = null;
    let priceItems: { id: string; name: string; price: string }[] = [];
    if (service.priceCategoryId) {
      const cat = (await storage.listPriceCategories()).find(
        (c) => c.id === service.priceCategoryId,
      );
      if (cat) {
        priceCategory = { id: cat.id, name: cat.name };
        priceItems = (await storage.listPriceItems(cat.id)).map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
        }));
      }
    }
    res.json({ ...service, direction, related, priceCategory, priceItems });
  });

  app.post("/api/admin/services", requireAuth, async (req, res) => {
    const data = parseBody(insertServiceSchema, req.body, res);
    if (!data) return;
    res.status(201).json(await storage.createService(data));
  });
  app.patch("/api/admin/services/:id", requireAuth, async (req, res) => {
    const data = parseBody(insertServiceSchema.partial(), req.body, res);
    if (!data) return;
    const updated = await storage.updateService(pid(req), data);
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
    res.json(await storage.listPriceItems());
  });
  app.post("/api/admin/price-items", requireAuth, async (req, res) => {
    const data = parseBody(insertPriceItemSchema, req.body, res);
    if (!data) return;
    res.status(201).json(await storage.createPriceItem(data));
  });
  app.patch("/api/admin/price-items/:id", requireAuth, async (req, res) => {
    const data = parseBody(insertPriceItemSchema.partial(), req.body, res);
    if (!data) return;
    const updated = await storage.updatePriceItem(pid(req), data);
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
    const [directions, allServices, cats, items, doctors, myths, promotions, reviews] =
      await Promise.all([
        storage.listDirections(true),
        storage.listServices(),
        storage.listPriceCategories(),
        storage.listPriceItems(),
        storage.listDoctors(true),
        storage.listMyths(true),
        storage.listPromotions(true),
        storage.listReviews(true),
      ]);
    const catName = new Map(cats.map((c) => [c.id, c.name]));
    const dirById = new Map(directions.map((d) => [d.id, d]));

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
      const dir = dirById.get(s.directionId);
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
    for (const r of reviews) {
      entries.push({
        type: "review",
        group: "Отзывы",
        title: r.name,
        subtitle: r.text,
        url: "/#about",
        keywords: `${r.name} ${r.text} отзыв`,
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
