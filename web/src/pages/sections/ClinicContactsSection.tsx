import { useQuery } from "@tanstack/react-query";
import { MapPin, Phone, Clock, ArrowUpRight, CreditCard } from "lucide-react";

type Contacts = {
  phones: string[];
  address: string;
  schedule: { days: string; hours: string }[];
  entity: string;
  license: string;
};

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
const mapHref = (address: string) =>
  `https://yandex.ru/maps/?text=${encodeURIComponent(address)}`;

export const ClinicContactsSection = (): JSX.Element => {
  const { data: settings } = useQuery<Record<string, any>>({ queryKey: ["/api/settings"] });

  const contacts: Contacts = settings?.contacts ?? {
    phones: [],
    address: "",
    schedule: [],
    entity: "",
    license: "",
  };
  const phones = contacts.phones ?? [];
  const schedule = contacts.schedule ?? [];

  return (
    <section className="w-full">

      {/* Main block */}
      <div className="bg-white py-10 lg:py-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 lg:px-0">

          <div className="flex flex-col lg:grid lg:grid-cols-2 lg:min-h-[560px]">

            {/* Left: contacts */}
            <div className="lg:px-12 lg:py-16 flex flex-col gap-7">

              <div>
                <p className="text-xs font-semibold tracking-[0.15em] text-[#007d83] uppercase mb-2">
                  Контакты
                </p>
                <h2 className="text-2xl lg:text-3xl font-semibold text-[#0f1c2e] tracking-tight">
                  ММЦ «Медео»
                </h2>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#e8f6f6]">
                  <MapPin className="h-5 w-5 text-[#007d83]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Адрес</p>
                  <p className="text-sm text-[#374151] leading-relaxed" data-testid="text-address">
                    {contacts.address}
                  </p>
                  <a
                    href={mapHref(contacts.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#007d83] hover:text-[#005f64] transition-colors"
                    data-testid="link-map-directions"
                  >
                    Открыть в Яндекс Картах
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#e8f6f6]">
                  <Clock className="h-5 w-5 text-[#007d83]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Режим работы</p>
                  <div className="flex flex-col gap-1.5">
                    {schedule.map((item, i) => (
                      <div key={i} className="flex items-center justify-between gap-8">
                        <span className="text-sm text-gray-500">{item.days}</span>
                        <span className="text-sm font-medium text-[#0f1c2e]">{item.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Phones */}
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#e8f6f6]">
                  <Phone className="h-5 w-5 text-[#007d83]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Телефоны</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {phones.map((phone, i) => (
                      <a
                        key={i}
                        href={telHref(phone)}
                        data-testid={i === 0 ? "link-phone-primary" : `link-phone-${i}`}
                        className={
                          i === 0
                            ? "inline-flex items-center justify-center gap-2 bg-[#007d83] hover:bg-[#006970] text-white text-sm font-medium rounded-md px-5 py-2.5 transition-colors"
                            : "inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-[#007d83] text-[#374151] hover:text-[#007d83] text-sm font-medium rounded-md px-5 py-2.5 transition-colors"
                        }
                      >
                        {phone}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payments */}
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#e8f6f6]">
                  <CreditCard className="h-5 w-5 text-[#007d83]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Принимаем к оплате</p>
                  <img
                    className="h-auto max-w-[240px]"
                    alt="Способы оплаты"
                    src="/figmaAssets/ul-contacts--payments-list.svg"
                  />
                </div>
              </div>
            </div>

            {/* Right: map — no search widget, coordinate-based */}
            <div className="mt-8 lg:mt-0 rounded-2xl lg:rounded-none overflow-hidden h-72 lg:h-auto">
              <iframe
                src="https://yandex.ru/map-widget/v1/?ll=37.659218%2C55.606157&z=16&l=map&pt=37.659218%2C55.606157%2Cpm2rdm"
                width="100%"
                height="100%"
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
                title="Карта клиники Медео"
              />
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};
