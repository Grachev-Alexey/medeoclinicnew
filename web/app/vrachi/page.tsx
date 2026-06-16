import type { Metadata } from "next";
import DoctorsListClient from "../_components/DoctorsListClient";
import { apiGet } from "../lib/api";
import { JsonLd } from "../_components/JsonLd";
import { breadcrumbLd, pageOpenGraph } from "../lib/seo";

type Doctor = {
  id: string;
  slug: string;
  name: string;
  specialty: string;
  experience: string;
  price: string;
  imageUrl: string;
  available: boolean;
  availableDate: string;
};

const TITLE = "Врачи — ММЦ «Медео»";
const DESCRIPTION =
  "Врачи медицинского центра «Медео» в Москве: опытные специалисты с бережным, доказательным подходом. Познакомьтесь с командой и запишитесь на приём.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/vrachi" },
  openGraph: pageOpenGraph({ title: TITLE, description: DESCRIPTION, path: "/vrachi" }),
};

export default async function Page() {
  const doctors = (await apiGet<Doctor[]>("/api/doctors")) ?? [];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Главная", path: "/" },
            { name: "Врачи", path: "/vrachi" },
          ]),
        ]}
      />
      <DoctorsListClient initialData={doctors} />
    </>
  );
}
