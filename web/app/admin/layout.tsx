import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminProviders } from "./_components/AdminProviders";

export const metadata: Metadata = {
  title: "Панель управления",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminProviders>{children}</AdminProviders>;
}
