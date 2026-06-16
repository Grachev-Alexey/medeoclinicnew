import type { Metadata } from "next";
import PatientsClient from "./PatientsClient";
import { JsonLd } from "../_components/JsonLd";
import { breadcrumbLd, pageOpenGraph } from "../lib/seo";

const title = "Пациентам";
const description =
  "Всё для пациентов клиники «Медео»: как записаться на приём, подготовка к визиту, документы, оплата и ДМС, ответы на частые вопросы.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/patients" },
  openGraph: pageOpenGraph({ title, description, path: "/patients" }),
};

export default function Page() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Главная", path: "/" },
          { name: "Пациентам", path: "/patients" },
        ])}
      />
      <PatientsClient />
    </>
  );
}
