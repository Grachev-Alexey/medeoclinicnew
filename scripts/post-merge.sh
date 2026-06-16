#!/bin/bash
set -e

# Runs automatically after a task is merged into main.
# Only install deps — the dev workflow (`npm run dev`) uses tsx + `next dev`,
# so no build step is needed here.
#
# NOTE: deliberately NO `npm run db:push`. drizzle-kit's push is interactive
# (requires a TTY) and hangs/times out in this environment. Schema changes in
# this project are applied with raw `CREATE TABLE`/`ALTER TABLE` SQL that matches
# shared/schema.ts (see .agents/memory/medeo-nextjs-migration.md).
npm install
