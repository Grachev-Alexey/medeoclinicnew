import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ImagePicker } from "./ImagePicker";
import type { Direction, Service, PriceCategory } from "@shared/schema";

type DirectionWithServices = Direction & { services: Service[] };

export function DirectionsManager() {
  const { toast } = useToast();
  const queryKey = ["/api/admin/directions"];
  const { data: directions = [], isLoading } = useQuery<DirectionWithServices[]>({ queryKey });
  const { data: priceCategories = [] } = useQuery<PriceCategory[]>({
    queryKey: ["/api/admin/price-categories"],
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DirectionWithServices | null>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({
      slug: "", label: "", description: "", stat: "", statLabel: "", imageUrl: "",
      sortOrder: 0, active: true,
      accent: "", heroTitle: "", intro: "", heroImageUrl: "", body: "",
      metaTitle: "", metaDescription: "",
      kind: "audience", priceCategoryId: null,
    });
    setOpen(true);
  };

  const openEdit = (d: DirectionWithServices) => {
    setEditing(d);
    setForm({
      slug: d.slug, label: d.label, description: d.description, stat: d.stat,
      statLabel: d.statLabel, imageUrl: d.imageUrl, sortOrder: d.sortOrder, active: d.active,
      accent: d.accent ?? "", heroTitle: d.heroTitle ?? "", intro: d.intro ?? "",
      heroImageUrl: d.heroImageUrl ?? "", body: d.body ?? "",
      metaTitle: d.metaTitle ?? "", metaDescription: d.metaDescription ?? "",
      kind: d.kind ?? "audience", priceCategoryId: d.priceCategoryId ?? null,
    });
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing) {
        await apiRequest("PATCH", `/api/admin/directions/${editing.id}`, form);
      } else {
        await apiRequest("POST", "/api/admin/directions", form);
      }
      queryClient.invalidateQueries({ queryKey });
      setOpen(false);
      toast({ title: "Сохранено" });
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Удалить направление? Услуги останутся — отвяжутся только от этого направления.")) return;
    await apiRequest("DELETE", `/api/admin/directions/${id}`);
    queryClient.invalidateQueries({ queryKey });
    toast({ title: "Удалено" });
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Направления</h1>
          <p className="mt-1 text-sm text-gray-500">
            Разделы сайта. Услуги привязываются к направлениям в разделе «Услуги».
          </p>
        </div>
        <Button onClick={openCreate} data-testid="button-create-direction" className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Добавить
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {directions.map((d) => (
            <div key={d.id} className="rounded-lg border bg-white p-4" data-testid={`direction-${d.id}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {d.imageUrl && <img src={d.imageUrl} alt="" className="h-12 w-12 rounded object-cover" />}
                  <div>
                    <h3 className="font-medium text-gray-900">{d.label}</h3>
                    <p className="text-xs text-gray-500">/{d.slug}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(d)} data-testid={`button-edit-direction-${d.id}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(d.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">{d.description}</p>
              {d.services.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {d.services.map((s) => (
                    <span key={s.id} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700">
                      {s.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Редактировать направление" : "Новое направление"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Название</Label>
              <Input value={form.label ?? ""} onChange={(e) => setForm({ ...form, label: e.target.value })} data-testid="input-label" />
            </div>
            <div className="space-y-1.5">
              <Label>Slug (для адреса страницы)</Label>
              <Input value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="women" data-testid="input-slug" />
            </div>
            <div className="space-y-1.5">
              <Label>Описание (короткое, для карточки)</Label>
              <Textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Тип раздела</Label>
                <select
                  value={form.kind ?? "audience"}
                  onChange={(e) => setForm({ ...form, kind: e.target.value })}
                  data-testid="select-direction-kind"
                  className="h-9 w-full rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-700"
                >
                  <option value="audience">Для аудитории (с услугами)</option>
                  <option value="specialty">Специальность (только прайс)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Категория прайса (для всего раздела)</Label>
                <select
                  value={form.priceCategoryId ?? ""}
                  onChange={(e) => setForm({ ...form, priceCategoryId: e.target.value || null })}
                  data-testid="select-direction-price-category"
                  className="h-9 w-full rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-700"
                >
                  <option value="">Без прайса</option>
                  {priceCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Категория прайса покажет на странице раздела все процедуры с ценами и
              поиском. Для разделов-специальностей услуги можно не добавлять.
            </p>

            <div className="rounded-lg border border-dashed border-gray-200 p-3 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Страница направления (/napravleniya/{form.slug || "slug"})
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Акцентный цвет</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={form.accent ?? ""}
                      onChange={(e) => setForm({ ...form, accent: e.target.value })}
                      placeholder="#d6336c"
                      data-testid="input-accent"
                    />
                    <span
                      className="h-9 w-9 shrink-0 rounded border"
                      style={{ backgroundColor: form.accent || "#ffffff" }}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Заголовок страницы</Label>
                  <Input value={form.heroTitle ?? ""} onChange={(e) => setForm({ ...form, heroTitle: e.target.value })} placeholder="Женское здоровье…" data-testid="input-hero-title" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Вводный текст (под заголовком)</Label>
                <Textarea value={form.intro ?? ""} onChange={(e) => setForm({ ...form, intro: e.target.value })} rows={2} data-testid="input-intro" />
              </div>
              <div className="space-y-1.5">
                <Label>Основной текст (абзацы — через пустую строку)</Label>
                <Textarea value={form.body ?? ""} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={4} data-testid="input-body" />
              </div>
              <div className="space-y-1.5">
                <Label>Изображение страницы (hero)</Label>
                <ImagePicker value={form.heroImageUrl ?? ""} onChange={(url) => setForm({ ...form, heroImageUrl: url })} />
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1.5">
                  <Label>SEO заголовок (title)</Label>
                  <Input value={form.metaTitle ?? ""} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} data-testid="input-meta-title" />
                </div>
                <div className="space-y-1.5">
                  <Label>SEO описание (description)</Label>
                  <Textarea value={form.metaDescription ?? ""} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} rows={2} data-testid="input-meta-description" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Цифра</Label>
                <Input value={form.stat ?? ""} onChange={(e) => setForm({ ...form, stat: e.target.value })} placeholder="98%" />
              </div>
              <div className="space-y-1.5">
                <Label>Подпись цифры</Label>
                <Input value={form.statLabel ?? ""} onChange={(e) => setForm({ ...form, statLabel: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Изображение</Label>
              <ImagePicker value={form.imageUrl ?? ""} onChange={(url) => setForm({ ...form, imageUrl: url })} />
            </div>

            {editing && editing.services.length > 0 && (
              <div className="space-y-1.5">
                <Label>Услуги направления</Label>
                <p className="text-xs text-gray-400">
                  Управление услугами и их привязкой — в разделе «Услуги».
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {editing.services.map((s) => (
                    <span key={s.id} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Порядок</Label>
                <Input type="number" value={form.sortOrder ?? 0} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
              </div>
              <div className="flex items-center gap-2 pt-7">
                <Switch checked={!!form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                <Label>Показывать</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
            <Button onClick={save} disabled={saving} data-testid="button-save-direction">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
