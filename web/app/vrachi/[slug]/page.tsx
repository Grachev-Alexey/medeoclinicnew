import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DoctorClient from "../../_components/DoctorClient";
import { apiGet } from "../../lib/api";
import { JsonLd } from "../../_components/JsonLd";
import { breadcrumbLd, pageOpenGraph } from "../../lib/seo";

type Doctor = {
  id: string;
  slug: string;
  name: string;
  specialty: string;
  experience: string;
  price: string;
  imageUrl: string;
  quote: string;
  about: string;
  credentials: string[];
  available: boolean;
  availableDate: string;
};

async function getDoctor(slug: string): Promise<Doctor | undefined> {
  return apiGet<Doctor>(`/api/doctors/${slug}`);
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const doctor = await getDoctor(params.slug);
  if (!doctor) return {};
  const path = `/vrachi/${doctor.slug}`;
  const title = `${doctor.name} — ${doctor.specialty || "врач"} | ММЦ «Медео»`;
  const description =
    (doctor.about || doctor.quote || `${doctor.name}, ${doctor.specialty}.`)
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 300);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: pageOpenGraph({ title, description, path }),
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const doctor = await getDoctor(params.slug);
  if (!doctor) notFound();

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Главная", path: "/" },
            { name: "Врачи", path: "/vrachi" },
            { name: doctor!.name, path: `/vrachi/${doctor!.slug}` },
          ]),
        ]}
      />
      <DoctorClient slug={params.slug} initialData={doctor as any} />
    </>
  );
}
