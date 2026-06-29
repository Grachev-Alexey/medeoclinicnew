import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Phone, Clock, ArrowUpRight, CreditCard, Navigation, TramFront, X } from "lucide-react";

type Contacts = {
  phones: string[];
  address: string;
  schedule: { days: string; hours: string }[];
  entity: string;
  license: string;
};

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

/** Точные координаты клиники (широта, долгота) — не зависят от текстового адреса. */
const CLINIC_LAT = 55.606157;
const CLINIC_LON = 37.659218;
/** Карточка организации в Яндекс Картах (точное место, отзывы, инфо). */
const ORG_MAP_URL = "https://yandex.ru/maps/org/medeo/226407459658/";
/** Маршрут по точным координатам (rtext = широта,долгота). Так маршрут строится
 *  корректно и на iOS, где приложение Яндекс.Карт не распознаёт текстовый адрес. */
const ROUTE_URL = `https://yandex.ru/maps/?mode=routes&rtext=~${CLINIC_LAT}%2C${CLINIC_LON}&rtt=auto`;
/** Достаём станцию метро из адреса вида «…, м. Царицыно, Москва». */
const metroFrom = (address: string) =>
  address.match(/м\.\s*([^,]+)/i)?.[1]?.trim() ?? "";

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
  const metro = metroFrom(contacts.address ?? "");
  // На мобильных карточку можно свернуть, чтобы не перекрывала карту.
  // На ПК (lg) карточка показывается всегда — там места достаточно.
  const [cardOpen, setCardOpen] = useState(true);

  return (
    <section className="w-full">

      {/* Main block */}
      <div className="bg-white py-10 lg:py-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 lg:px-0">

          <div className="flex flex-col lg:grid lg:grid-cols-2 lg:min-h-[560px]">

            {/* Left: contacts */}
            <div className="lg:px-12 lg:py-16 flex flex-col gap-7">

              <div>
                <p className="text-xs font-semibold tracking-[0.15em] text-[#005eb8] uppercase mb-2">
                  Контакты
                </p>
                <h2 className="text-2xl lg:text-3xl font-semibold text-[#0f1c2e] tracking-tight">
                  ММЦ «Медео»
                </h2>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#e8f1fc]">
                  <MapPin className="h-5 w-5 text-[#005eb8]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Адрес</p>
                  <p className="text-sm text-[#374151] leading-relaxed" data-testid="text-address">
                    {contacts.address}
                  </p>
                  <a
                    href={ORG_MAP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#005eb8] hover:text-[#004a93] transition-colors"
                    data-testid="link-map-directions"
                  >
                    Открыть в Яндекс Картах
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#e8f1fc]">
                  <Clock className="h-5 w-5 text-[#005eb8]" />
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
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#e8f1fc]">
                  <Phone className="h-5 w-5 text-[#005eb8]" />
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
                            ? "inline-flex items-center justify-center gap-2 bg-[#005eb8] hover:bg-[#004a93] text-white text-sm font-medium rounded-md px-5 py-2.5 transition-colors"
                            : "inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-[#005eb8] text-[#374151] hover:text-[#005eb8] text-sm font-medium rounded-md px-5 py-2.5 transition-colors"
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
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#e8f1fc]">
                  <CreditCard className="h-5 w-5 text-[#005eb8]" />
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

            {/* Right: map with floating info card overlay */}
            <div className="group relative mt-8 lg:mt-0 h-80 lg:h-auto overflow-hidden rounded-2xl lg:rounded-none ring-1 ring-[#005eb8]/10 lg:ring-0">
              <iframe
                src="https://yandex.ru/map-widget/v1/?ll=37.659218%2C55.606157&z=16&l=map&pt=37.659218%2C55.606157%2Cpm2rdm"
                width="100%"
                height="100%"
                className="absolute inset-0 h-full w-full"
                frameBorder="0"
                allowFullScreen
                title="Карта клиники Медео"
              />

              {/* Плавающая карточка в верхнем левом углу — свободная зона без
                  нативных контролов карты (зум справа, пробки сверху-справа,
                  атрибуция и «Открыть в Картах» снизу). Кликается только карточка. */}
              {contacts.address && (
                <div className="pointer-events-none absolute inset-0 flex items-start justify-start p-4 sm:p-5">
                  {/* Кнопка «развернуть» — видна только на мобильных, когда карточка свёрнута */}
                  <button
                    type="button"
                    onClick={() => setCardOpen(true)}
                    className={`pointer-events-auto items-center gap-2 rounded-full bg-white/95 px-4 py-2.5 text-sm font-semibold text-[#005eb8] shadow-[0_12px_30px_-12px_rgba(15,28,46,0.5)] ring-1 ring-black/5 backdrop-blur-md transition-colors hover:text-[#004a93] lg:hidden ${
                      cardOpen ? "hidden" : "inline-flex"
                    }`}
                    data-testid="button-map-card-open"
                  >
                    <MapPin className="h-4 w-4" />
                    Адрес и маршрут
                  </button>

                  <div
                    className={`pointer-events-auto relative w-full max-w-[19rem] rounded-2xl bg-white/95 p-4 shadow-[0_24px_60px_-24px_rgba(15,28,46,0.55)] ring-1 ring-black/5 backdrop-blur-md transition-transform duration-300 sm:p-5 lg:block lg:group-hover:-translate-y-1 ${
                      cardOpen ? "block" : "hidden"
                    }`}
                    data-testid="card-map-overlay"
                  >
                    {/* Кнопка «свернуть» — только на мобильных, аккуратно внутри карточки */}
                    <button
                      type="button"
                      onClick={() => setCardOpen(false)}
                      aria-label="Свернуть карточку"
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-[#0f1c2e]/40 transition-colors hover:bg-[#e8f1fc] hover:text-[#005eb8] lg:hidden"
                      data-testid="button-map-card-close"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <div className="flex items-start gap-3 pr-7">
                      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#005eb8] text-white shadow-sm">
                        <MapPin className="h-5 w-5" />
                        <span className="absolute -right-1 -top-1 flex h-3 w-3">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#005eb8]/70" />
                          <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-[#005eb8]" />
                        </span>
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#0f1c2e]">ММЦ «Медео»</p>
                        {metro && (
                          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#e8f1fc] px-2 py-0.5 text-[11px] font-medium text-[#005eb8]">
                            <TramFront className="h-3 w-3" />
                            м. {metro}
                          </span>
                        )}
                        <p className="mt-1.5 text-xs leading-relaxed text-gray-500" title={contacts.address}>
                          {contacts.address}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <a
                        href={ROUTE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#005eb8] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#004a93]"
                        data-testid="link-map-route"
                      >
                        <Navigation className="h-4 w-4" />
                        Построить маршрут
                      </a>
                      <a
                        href={ORG_MAP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Открыть в Яндекс Картах"
                        className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-3 py-2.5 text-[#374151] transition-colors hover:border-[#005eb8] hover:text-[#005eb8]"
                        data-testid="link-map-open"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};
