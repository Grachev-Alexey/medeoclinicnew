-- Таблица doctor_services (many-to-many: doctor ↔ service)
-- Идемпотентна: безопасна к повторному запуску на проде.
CREATE TABLE IF NOT EXISTS doctor_services (
  doctor_id  varchar NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  service_id varchar NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  PRIMARY KEY (doctor_id, service_id)
);
