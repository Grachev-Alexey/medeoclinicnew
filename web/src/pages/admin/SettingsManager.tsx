import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ImagePicker } from "./ImagePicker";

export function SettingsManager() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useQuery<Record<string, any>>({ queryKey: ["/api/settings"] });

  const [hero, setHero] = useState<any>({});
  const [branding, setBranding] = useState<any>({});
  const [contacts, setContacts] = useState<any>({ phones: [], schedule: [] });
  const [rating, setRating] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setHero(settings.hero || {});
      setBranding(settings.branding || {});
      setContacts(settings.contacts || { phones: [], schedule: [] });
      setRating(settings.rating || {});
    }
  }, [settings]);

  const saveAll = async () => {
    setSaving(true);
    try {
      await apiRequest("PUT", "/api/admin/settings/hero", { value: hero });
      await apiRequest("PUT", "/api/admin/settings/branding", { value: branding });
      await apiRequest("PUT", "/api/admin/settings/contacts", { value: contacts });
      await apiRequest("PUT", "/api/admin/settings/rating", { value: rating });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Настройки сохранены" });
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>;
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-lg border bg-white p-5">
      <h2 className="mb-4 text-lg font-medium text-gray-900">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Настройки сайта</h1>
          <p className="mt-1 text-sm text-gray-500">Шапка, контакты, реквизиты</p>
        </div>
        <Button onClick={saveAll} disabled={saving} data-testid="button-save-settings">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Сохранить всё
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="Брендинг">
          <div className="space-y-1.5">
            <Label>Название</Label>
            <Input value={branding.name ?? ""} onChange={(e) => setBranding({ ...branding, name: e.target.value })} data-testid="input-brand-name" />
          </div>
          <div className="space-y-1.5">
            <Label>Подпись</Label>
            <Input value={branding.tagline ?? ""} onChange={(e) => setBranding({ ...branding, tagline: e.target.value })} />
          </div>
        </Section>

        <Section title="Рейтинг">
          <div className="space-y-1.5">
            <Label>Значение</Label>
            <Input value={rating.value ?? ""} onChange={(e) => setRating({ ...rating, value: e.target.value })} placeholder="4.9" />
          </div>
          <div className="space-y-1.5">
            <Label>Количество отзывов</Label>
            <Input value={rating.count ?? ""} onChange={(e) => setRating({ ...rating, count: e.target.value })} placeholder="более 2 000 отзывов" />
          </div>
        </Section>

        <Section title="Главный экран (Hero)">
          <div className="space-y-1.5">
            <Label>Над заголовком</Label>
            <Input value={hero.tagline ?? ""} onChange={(e) => setHero({ ...hero, tagline: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Заголовок</Label>
            <Textarea value={hero.headline ?? ""} onChange={(e) => setHero({ ...hero, headline: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Подзаголовок</Label>
            <Textarea value={hero.subheadline ?? ""} onChange={(e) => setHero({ ...hero, subheadline: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Изображение</Label>
            <ImagePicker value={hero.imageUrl ?? ""} onChange={(url) => setHero({ ...hero, imageUrl: url })} />
          </div>
        </Section>

        <Section title="Контакты">
          <div className="space-y-1.5">
            <Label>Телефоны</Label>
            {(contacts.phones || []).map((p: string, i: number) => (
              <div key={i} className="flex gap-2">
                <Input value={p} onChange={(e) => {
                  const phones = [...contacts.phones]; phones[i] = e.target.value;
                  setContacts({ ...contacts, phones });
                }} />
                <Button variant="ghost" size="icon" onClick={() => setContacts({ ...contacts, phones: contacts.phones.filter((_: string, idx: number) => idx !== i) })}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setContacts({ ...contacts, phones: [...(contacts.phones || []), ""] })}>
              <Plus className="mr-1 h-3 w-3" /> Телефон
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label>Адрес</Label>
            <Input value={contacts.address ?? ""} onChange={(e) => setContacts({ ...contacts, address: e.target.value })} data-testid="input-address" />
          </div>
          <div className="space-y-1.5">
            <Label>Часы работы</Label>
            {(contacts.schedule || []).map((s: any, i: number) => (
              <div key={i} className="flex gap-2">
                <Input value={s.days} placeholder="Пн–Пт" onChange={(e) => {
                  const schedule = [...contacts.schedule]; schedule[i] = { ...schedule[i], days: e.target.value };
                  setContacts({ ...contacts, schedule });
                }} />
                <Input value={s.hours} placeholder="08:00–21:00" onChange={(e) => {
                  const schedule = [...contacts.schedule]; schedule[i] = { ...schedule[i], hours: e.target.value };
                  setContacts({ ...contacts, schedule });
                }} />
                <Button variant="ghost" size="icon" onClick={() => setContacts({ ...contacts, schedule: contacts.schedule.filter((_: any, idx: number) => idx !== i) })}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setContacts({ ...contacts, schedule: [...(contacts.schedule || []), { days: "", hours: "" }] })}>
              <Plus className="mr-1 h-3 w-3" /> Строка
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label>Юр. лицо</Label>
            <Input value={contacts.entity ?? ""} onChange={(e) => setContacts({ ...contacts, entity: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Лицензия</Label>
            <Input value={contacts.license ?? ""} onChange={(e) => setContacts({ ...contacts, license: e.target.value })} />
          </div>
        </Section>
      </div>
    </div>
  );
}
