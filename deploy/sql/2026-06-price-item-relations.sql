-- Идемпотентное создание таблиц price_item_directions и price_item_doctors.
-- Прогнать на проде: psql "$DATABASE_URL" -f deploy/sql/2026-06-price-item-relations.sql

CREATE TABLE IF NOT EXISTS price_item_directions (
  price_item_id varchar NOT NULL REFERENCES price_items(id) ON DELETE CASCADE,
  direction_id  varchar NOT NULL REFERENCES directions(id) ON DELETE CASCADE,
  PRIMARY KEY (price_item_id, direction_id)
);

CREATE TABLE IF NOT EXISTS price_item_doctors (
  price_item_id varchar NOT NULL REFERENCES price_items(id) ON DELETE CASCADE,
  doctor_id     varchar NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  PRIMARY KEY (price_item_id, doctor_id)
);
