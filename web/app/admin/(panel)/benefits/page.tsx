"use client";

import { CrudManager } from "@/reused-pages/admin/CrudManager";
import { entityConfigs } from "@/reused-pages/admin/entityConfigs";

export default function Page() {
  const c = entityConfigs.benefits;
  return <CrudManager title={c.title} description={c.description} path={c.path} fields={c.fields} columns={c.columns} />;
}
