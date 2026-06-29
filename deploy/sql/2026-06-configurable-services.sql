-- Прод-реплей схемы для боевого VPS (отдельный сервер, не Replit).
-- «Настраиваемые услуги»: услуга ↔ направление и услуга ↔ процедуры прайса —
-- это связи многие-ко-многим. Колонки services.direction_id и
-- services.price_category_id убираются (данные переносятся в join-таблицы).
-- Идемпотентно: безопасно запускать повторно.
--   psql "$DATABASE_URL" -f deploy/sql/2026-06-configurable-services.sql

BEGIN;

-- 1. Join-таблицы (создаём до переноса данных).
CREATE TABLE IF NOT EXISTS service_directions (
  service_id   varchar NOT NULL REFERENCES services(id)   ON DELETE CASCADE,
  direction_id varchar NOT NULL REFERENCES directions(id) ON DELETE CASCADE,
  sort_order   integer NOT NULL DEFAULT 0,
  PRIMARY KEY (service_id, direction_id)
);

CREATE TABLE IF NOT EXISTS service_price_items (
  service_id    varchar NOT NULL REFERENCES services(id)    ON DELETE CASCADE,
  price_item_id varchar NOT NULL REFERENCES price_items(id) ON DELETE CASCADE,
  sort_order    integer NOT NULL DEFAULT 0,
  PRIMARY KEY (service_id, price_item_id)
);

-- 2. Перенос services.direction_id → service_directions.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'direction_id'
  ) THEN
    INSERT INTO service_directions (service_id, direction_id, sort_order)
    SELECT id, direction_id, 0 FROM services
    WHERE direction_id IS NOT NULL
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 3. Перенос services.price_category_id → service_price_items
--    (все процедуры выбранной категории становятся «сопутствующими»).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'price_category_id'
  ) THEN
    INSERT INTO service_price_items (service_id, price_item_id, sort_order)
    SELECT s.id, pi.id, pi.sort_order
    FROM services s
    JOIN price_items pi ON pi.category_id = s.price_category_id
    WHERE s.price_category_id IS NOT NULL
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 4. Удаляем старые колонки.
ALTER TABLE services DROP COLUMN IF EXISTS direction_id;
ALTER TABLE services DROP COLUMN IF EXISTS price_category_id;

COMMIT;
