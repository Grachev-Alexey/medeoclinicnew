-- Прод-реплей схемы для боевого VPS (отдельный сервер, не Replit).
-- Добавляет колонки рейтингов ПроДокторов/Яндекс в таблицу doctors.
-- Идемпотентно: безопасно запускать повторно.
--   psql "$DATABASE_URL" -f deploy/sql/2026-06-doctor-ratings.sql

ALTER TABLE doctors
  ADD COLUMN IF NOT EXISTS prodoctorov_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS prodoctorov_rating text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS prodoctorov_reviews text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS yandex_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS yandex_rating text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS yandex_reviews text NOT NULL DEFAULT '';
