"use client";

import { CrudManager } from "@/pages/admin/CrudManager";
import { entityConfigs } from "@/pages/admin/entityConfigs";

export default function Page() {
  const c = entityConfigs.doctors;
  return <CrudManager title={c.title} description={c.description} path={c.path} fields={c.fields} columns={c.columns} />;
}
