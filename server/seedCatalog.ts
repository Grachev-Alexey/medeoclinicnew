import { db } from "./db";
import { priceCategories, priceItems } from "../shared/schema";
import { PRICE_CATALOG } from "./catalogData";

/**
 * Идемпотентно наполняет каталог «Услуги и цены» реальными данными клиники.
 * Срабатывает ТОЛЬКО когда таблица priceCategories пуста (первый запуск).
 * После этого каталог редактируется через админку и этот сид больше не вмешивается.
 * Возвращает true, если данные были засеяны.
 */
export async function seedPriceCatalogIfEmpty(): Promise<boolean> {
  const existing = await db
    .select({ id: priceCategories.id })
    .from(priceCategories)
    .limit(1);
  if (existing.length > 0) return false;

  // Транзакция: при сбое в середине каталог не останется наполовину заполненным
  // (иначе повторный сид не сработает — таблица уже «не пуста»).
  await db.transaction(async (tx) => {
    for (let c = 0; c < PRICE_CATALOG.length; c++) {
      const cat = PRICE_CATALOG[c];
      const [created] = await tx
        .insert(priceCategories)
        .values({ name: cat.category, sortOrder: c })
        .returning();
      if (!cat.items.length) continue;
      await tx.insert(priceItems).values(
        cat.items.map((it, i) => ({
          categoryId: created.id,
          name: it.name,
          price: it.price,
          sortOrder: i,
        })),
      );
    }
  });
  return true;
}
