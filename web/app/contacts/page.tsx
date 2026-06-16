import type { Metadata } from "next";
import ContactsClient from "./ContactsClient";
import { apiGet } from "../lib/api";
import { JsonLd } from "../_components/JsonLd";
import { breadcrumbLd, pageOpenGraph } from "../lib/seo";

const title = "Контакты";
const description =
  "Адрес, телефоны и режим работы клиники «Медео» у м. Царицыно в Москве. Карта проезда, способы оплаты и запись на приём.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/contacts" },
  openGraph: pageOpenGraph({ title, description, path: "/contacts" }),
};

export default async function Page() {
  const initialSettings = await apiGet<Record<string, any>>("/api/settings");

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Главная", path: "/" },
          { name: "Контакты", path: "/contacts" },
        ])}
      />
      <ContactsClient initialSettings={initialSettings} />
    </>
  );
}
