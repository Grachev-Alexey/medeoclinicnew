import { useQuery } from "@tanstack/react-query";
import {
  ShieldCheck,
  Users,
  Cpu,
  Heart,
  Sparkles,
  Stethoscope,
  Award,
  Clock,
  type LucideIcon,
} from "lucide-react";

type Benefit = { id: string; title: string; text: string; icon: string };

const iconMap: Record<string, LucideIcon> = {
  "shield-check": ShieldCheck,
  users: Users,
  cpu: Cpu,
  heart: Heart,
  sparkles: Sparkles,
  stethoscope: Stethoscope,
  award: Award,
  clock: Clock,
};

function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = iconMap[name] || ShieldCheck;
  return <Cmp className={className} />;
}

export const BenefitHighlightsSection = (): JSX.Element | null => {
  const { data: benefits = [] } = useQuery<Benefit[]>({ queryKey: ["/api/benefits"] });

  if (benefits.length === 0) return null;

  const featured = benefits[0];
  const rest = benefits.slice(1);

  return (
    <section className="w-full bg-white py-10 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h2 className="text-2xl lg:text-3xl font-semibold text-[#0f1c2e] tracking-tight">
            Почему выбирают Медео
          </h2>
        </header>

        {/* Desktop: featured wide top + smaller below | Mobile: stacked */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">

          {/* Featured wide card */}
          <div className="lg:col-span-3 rounded-2xl bg-[#e8f6f6] p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
            <div className="shrink-0 flex items-center justify-center w-16 h-16 rounded-xl bg-white/70">
              <Icon name={featured.icon} className="h-9 w-9 text-[#007d83]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-[#0f1c2e] leading-snug">{featured.title}</h3>
              <p className="mt-1.5 text-sm text-[#374151] leading-relaxed max-w-2xl">{featured.text}</p>
            </div>
            {/* Decorative teal bar */}
            <div className="hidden lg:block w-1 self-stretch rounded-full bg-[#007d83]/20 shrink-0" />
          </div>

          {/* Smaller cards */}
          {rest.map((item) => (
            <div
              key={item.id}
              className="col-span-1 rounded-2xl bg-gray-50 border border-gray-100 p-5 flex flex-col justify-between min-h-[170px] group hover:border-[#007d83]/25 hover:bg-white hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white border border-gray-100 group-hover:border-[#007d83]/20 transition-colors">
                <Icon name={item.icon} className="h-6 w-6 text-[#007d83]" />
              </div>
              <div>
                <div className="w-5 h-0.5 rounded-full bg-[#007d83]/30 group-hover:bg-[#007d83] mb-2.5 transition-colors duration-200" />
                <h3 className="font-semibold text-[14px] text-[#0f1c2e] leading-snug mb-1">{item.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
