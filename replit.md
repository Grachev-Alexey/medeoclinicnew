# ММЦ МЕДЕО — сайт медицинского центра

Сайт медицинского центра «ММЦ МЕДЕО» (medeo-mmc.ru): публичный лендинг +
информационные страницы + закрытая админ-панель для редактирования контента.
Весь пользовательский текст на русском языке.

## Архитектура

Гибрид **Next.js (фронтенд) + Express (только API)**. Это НЕ классический
шаблон Replit «Vite SPA + Express на одном порту» — проект мигрирован с Vite на
Next.js App Router.

- **`web/`** — приложение Next.js 14 (App Router, React 18). Это фронтенд.
  - `web/app/` — маршруты App Router: тонкие серверные/клиентские обёртки,
    метаданные (SEO), провайдеры, общий лэйаут и компоненты оболочки
    (`_components/Site*`, booking-модалка). `web/app/lib/` — хелперы Next
    (серверный fetch к API, query-client, SEO, навигация).
  - `web/src/` — переиспользуемая библиотека UI, перенесённая со старого Vite-клиента:
    `components/ui` (shadcn), `hooks`, `lib` (`queryClient`, `utils`, `useAuth`),
    `pages/sections` (секции лендинга), `pages/admin` (менеджеры контента).
    Алиас `@/*` указывает на `web/src/*`.
  - `web/public/` — статика (`/image/*`, `/figmaAssets/*`, шрифты, favicon).
- **`server/`** — Express, работающий ТОЛЬКО как API (порт 3001). Отдаёт `/api/*`
  и `/objects/*` (загруженные изображения через object storage). Фронтенд не отдаёт.
  - `auth.ts` (сессии + passport-local), `db.ts`, `routes.ts`, `storage.ts`
    (интерфейс `IStorage`), `imageService.ts`, `replit_integrations/` (object storage).
- **`shared/schema.ts`** — единый источник правды для моделей данных
  (Drizzle ORM + drizzle-zod). Используется и сервером, и фронтендом
  (алиас `@shared/*`).
- **`script/`** — `dev.mjs` (запуск dev), `build.ts` (сборка сервера через esbuild),
  `seed.ts` (наполнение БД).
- **`deploy/`** — шаблоны для боевого сервера (`ecosystem.config.cjs` для PM2,
  `nginx.medeo.conf`).

### Поток данных
`/api/*` и `/objects/*` проксируются из Next в Express через `rewrites` в
`web/next.config.mjs` → `127.0.0.1:${API_PORT||3001}`. Один публичный origin —
поэтому сессионные cookie админки остаются Same-Origin (не разносить на два
публичных домена). SEO-страницы получают данные через серверный fetch и засевают
React Query `initialData`, чтобы контент был в HTML для краулеров.

## Окружения

- **Replit (только разработка):** `npm run dev` → Next на порту **5000** (публичный),
  Express в режиме API на **3001**. Запускается воркфлоу «Start application».
- **Прод (собственный Ubuntu VPS, НЕ Replit Deployments):** Nginx (80/443) →
  Next (3000) → Express (3001), процессы под PM2, TLS через Certbot. Поэтому
  деплой-конфиги Replit не используются.

## Команды

- `npm run dev` — dev (Express API + Next dev), через `script/dev.mjs`.
- `npm run check` — типизация сервера/shared/script (`tsc`). Фронтенд проверяется
  отдельно: `cd web && npx tsc --noEmit`.
- `npm run build` — сборка Express в `dist/index.cjs` (esbuild).
- `npm run build:next` / `npm run start:next` — сборка/запуск Next (для прода).
- Конфиги Tailwind/PostCSS живут ТОЛЬКО в `web/` (корневых Vite-конфигов больше нет).

## Схема БД (изменения)
`drizzle-kit push` (`npm run db:push`) в этом окружении НЕ работает — у него
интерактивный TTY-промпт, который зависает. Новые таблицы создаём вручную:
пишем модель в `shared/schema.ts` И создаём таблицу через `CREATE TABLE` SQL,
точно совпадающий с моделью (чтобы будущий diff был пустым).

**Прод-реплей схемы.** Replit-окружение (dev) и боевой VPS (prod) имеют РАЗНЫЕ
базы. Любое ручное изменение схемы в dev нужно повторить на проде. Для этого
каждое изменение оформляем идемпотентным SQL-файлом в `deploy/sql/`
(`YYYY-MM-<feature>.sql`, безопасный к повторному запуску). Эти файлы — часть
рантбука деплоя (см. ниже): их прогоняют на проде при каждом выкате.

## Деплой на прод (рантбук)
Боевой VPS, шаги при каждом выкате (из корня репозитория, `DATABASE_URL`
указывает на прод-Postgres):
1. `git pull` — забрать новый код.
2. `npm ci` — зависимости.
3. **Прогнать новые/изменённые миграции из `deploy/sql/`** (идемпотентны,
   безопасны к повтору), например:
   - `psql "$DATABASE_URL" -f deploy/sql/2026-06-configurable-services.sql`
     (дропает `services.direction_id` / `services.price_category_id`, создаёт
     join-таблицы `service_directions` / `service_price_items` с переносом данных)
   - `psql "$DATABASE_URL" -f deploy/sql/2026-06-doctor-ratings.sql`
4. `npm run build` и `npm run build:next` — сборка Express и Next.
5. `pm2 reload deploy/ecosystem.config.cjs` — перезапуск процессов.

Спот-чек после миграции configurable-services:
```sql
SELECT to_regclass('service_directions'), to_regclass('service_price_items');
SELECT count(*) FROM service_directions;   -- > 0 (бэкфилл прошёл)
SELECT count(*) FROM service_price_items;   -- > 0
SELECT column_name FROM information_schema.columns
  WHERE table_name='services' AND column_name IN ('direction_id','price_category_id'); -- 0 строк
```

## Секреты / переменные окружения
- `DATABASE_URL` — Postgres (обязательно).
- `SESSION_SECRET` — секрет сессий; в проде обязателен (без него сервер падает на старте).
- `ADMIN_PASSWORD` — пароль сид-админа (по умолчанию `medeo-admin`, переопределяемый).
- `API_PORT` (по умолчанию 3001), `PORT` (порт Next), `NEXT_PUBLIC_SITE_URL`
  (по умолчанию `https://medeo-mmc.ru`).
- Object storage настроен через интеграцию `javascript_object_storage`.

## Предпочтения пользователя (User preferences)
- **Общение на русском языке.**
- **Светлая палитра сайта.** Тёмный фон (тёмно-синий `#0f1c2e`) допустим ТОЛЬКО в
  шапке и в мобильном полноэкранном меню — нигде больше. Не добавлять тёмные
  карточки/секции.
- Содержать проект в порядке: без мёртвых файлов, дублей и «хвостов» миграции.
