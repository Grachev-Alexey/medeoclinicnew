import type { Metadata } from "next";
import AboutClient from "./AboutClient";
import { JsonLd } from "../_components/JsonLd";
import { breadcrumbLd, pageOpenGraph } from "../lib/seo";

const title = "О клинике";
const description =
  "Медицинский центр «Медео» — многопрофильная клиника доказательной медицины: команда врачей высшей категории, честные рекомендации и забота о всей семье.";
const PATH = "/o-klinike";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: PATH },
  openGraph: pageOpenGraph({ title, description, path: PATH }),
};

export default function Page() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Главная", path: "/" },
          { name: title, path: PATH },
        ])}
      />
      <AboutClient />
    </>
  );
}
