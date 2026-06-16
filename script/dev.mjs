import { spawn } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const procs = [];
let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const p of procs) {
    try {
      p.kill("SIGTERM");
    } catch {}
  }
  setTimeout(() => process.exit(code), 600);
}

function run(name, cmd, args, opts = {}) {
  const p = spawn(cmd, args, { stdio: "inherit", ...opts });
  procs.push(p);
  p.on("exit", (code) => {
    console.log(`[dev] ${name} exited (code ${code})`);
    shutdown(code ?? 0);
  });
  p.on("error", (err) => {
    console.error(`[dev] ${name} failed to start:`, err);
    shutdown(1);
  });
  return p;
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

const tsxBin = path.join(root, "node_modules", ".bin", "tsx");
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");

// Express API server on 3001
run("api", tsxBin, ["server/index.ts"], {
  env: { ...process.env, API_PORT: "3001", NODE_ENV: "development" },
});

// Next.js dev server on the public Replit port (5000)
run("next", "node", [nextBin, "dev", "-H", "0.0.0.0", "-p", "5000"], {
  cwd: path.join(root, "web"),
  env: { ...process.env, API_PORT: "3001" },
});
