// PM2 process manager config for the Ubuntu VPS (production).
//
// Two processes, same-origin via Next rewrites:
//   - express-api : Express API server on 127.0.0.1:3001 (DB + admin)
//   - next-web    : Next.js (standalone build) on 127.0.0.1:3000
//
// Build before first start:
//   npm ci
//   npm run build        # builds the Express bundle (dist/index.cjs)
//   npm run build:next   # builds Next standalone output in web/.next
//
// Start / manage:
//   pm2 start deploy/ecosystem.config.cjs
//   pm2 save && pm2 startup
//
// Nginx terminates TLS (Certbot) and proxies 80/443 -> 127.0.0.1:3000.
// Next then proxies /api/* -> 127.0.0.1:3001 (see web/next.config.mjs).

module.exports = {
  apps: [
    {
      name: "express-api",
      script: "dist/index.cjs",
      cwd: __dirname + "/..",
      env: {
        NODE_ENV: "production",
        API_PORT: "3001",
        // DATABASE_URL, SESSION_SECRET, object-storage vars, etc.
        // are provided by the server environment / .env on the VPS.
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
    },
    {
      name: "next-web",
      // Next standalone server emitted by `next build` (output: "standalone").
      // NOTE: verify the exact path after `npm run build:next`. Because the repo
      // root (lockfile) is above web/, Next traces from the root and usually
      // nests the entry at web/.next/standalone/web/server.js. If your build
      // emits it at web/.next/standalone/server.js instead, use that path.
      script: "web/.next/standalone/web/server.js",
      cwd: __dirname + "/..",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        HOSTNAME: "127.0.0.1",
        // Used by next.config.mjs rewrites to reach the Express API:
        API_PORT: "3001",
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
    },
  ],
};
