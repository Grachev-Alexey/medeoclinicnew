"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Stethoscope, Layers, MessageSquareQuote, BadgePercent } from "lucide-react";

function StatCard({ href, label, count, icon: Icon }: { href: string; label: string; count: number; icon: any }) {
  return (
    <Link href={href} className="rounded-lg border bg-white p-5 transition-shadow hover:shadow-md" data-testid={`stat-card-${href.replace(/\//g, "-")}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{label}</span>
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <p className="mt-2 text-3xl font-semibold text-gray-900">{count}</p>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const { data: doctors = [] } = useQuery<any[]>({ queryKey: ["/api/admin/doctors"] });
  const { data: directions = [] } = useQuery<any[]>({ queryKey: ["/api/admin/directions"] });
  const { data: reviews = [] } = useQuery<any[]>({ queryKey: ["/api/admin/reviews"] });
  const { data: promotions = [] } = useQuery<any[]>({ queryKey: ["/api/admin/promotions"] });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Обзор</h1>
      <p className="mt-1 text-sm text-gray-500">Управление содержимым сайта МЕДЕО</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard href="/admin/doctors" label="Врачи" count={doctors.length} icon={Stethoscope} />
        <StatCard href="/admin/directions" label="Направления" count={directions.length} icon={Layers} />
        <StatCard href="/admin/reviews" label="Отзывы" count={reviews.length} icon={MessageSquareQuote} />
        <StatCard href="/admin/promotions" label="Акции" count={promotions.length} icon={BadgePercent} />
      </div>
    </div>
  );
}
