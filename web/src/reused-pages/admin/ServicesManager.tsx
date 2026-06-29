import { useMemo, useState } from "react";
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
import { Plus, Pencil, Trash2, Loader2, ChevronDown, ChevronRight, Search, Star, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ImagePicker } from "./ImagePicker";
import type { Direction, PriceCategory, PriceItem } from "@shared/schema";

type ServiceRow = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: string;
  duration: string;
  imageUrl: string;
  metaTitle: string;
  metaDescription: string;
  sortOrder: number;
  active: boolean;
  directionIds: string[];
  priceItemIds: string[];
};

const emptyForm = {
  name: "", slug: "", shortDescription: "", description: "", price: "",
  duration: "", imageUrl: "", metaTitle: "", metaDescription: "",
  sortOrder: 0, active: true,
};

export function ServicesManager() {
  const { toast } = useToast();
  const queryKey = ["/api/admin/services"];
  const { data: services = [], isLoading } = useQuery<ServiceRow[]>({ queryKey });
  const { data: directions = [] } = useQuery<Direction[]>({
    queryKey: ["/api/admin/directions"],
  });
  const { data: categories = [] } = useQuery<PriceCategory[]>({
    queryKey: ["/api/admin/price-categories"],
  });
  const { data: items = [] } = useQuery<PriceItem[]>({
    queryKey: ["/api/admin/price-items"],
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceRow | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [directionIds, setDirectionIds] = useState<string[]>([]);
  const [priceItemIds, setPriceItemIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [itemSearch, setItemSearch] = useState("");

  const dirLabel = useMemo(
    () => new Map(directions.map((d) => [d.id, d.label] as const)),
    [directions],
  );
  const itemsByCategory = useMemo(() => {
    const map = new Map<string, PriceItem[]>();
    for (const it of items) {
      const arr = map.get(it.categoryId);
      if (arr) arr.push(it);
      else map.set(it.categoryId, [it]);
    }
    return map;
  }, [items]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, sortOrder: services.length });
    setDirectionIds([]);
    setPriceItemIds([]);
    setItemSearch("");
    setOpen(true);
  };

  const openEdit = (s: ServiceRow) => {
    setEditing(s);
    setForm({
      name: s.name, slug: s.slug, shortDescription: s.shortDescription,
      description: s.description, price: s.price, duration: s.duration,
      imageUrl: s.imageUrl, metaTitle: s.metaTitle, metaDescription: s.metaDescription,
      sortOrder: s.sortOrder, active: s.active,
    });
    setDirectionIds(s.directionIds ?? []);
    setPriceItemIds(s.priceItemIds ?? []);
    setItemSearch("");
    setOpen(true);
  };

  const toggle = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  const makePrimaryDirection = (id: string) =>
    setDirectionIds((l) => [id, ...l.filter((x) => x !== id)]);

  const moveDirection = (id: string, delta: -1 | 1) =>
    setDirectionIds((l) => {
      const i = l.indexOf(id);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= l.length) return l;
      const next = [...l];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const save = async () => {
    if (!form.name?.trim()) {
      toast({ title: "Укажите название услуги", variant: "destructive" });
      return;
    }
    if (directionIds.length === 0) {
      toast({ title: "Выберите хотя бы одно направление", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, directionIds, priceItemIds };
      if (editing) {
        await apiRequest("PATCH", `/api/admin/services/${editing.id}`, payload);
      } else {
        await apiRequest("POST", "/api/admin/services", payload);
      }
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/directions"] });
      setOpen(false);
      toast({ title: "Сохранено" });
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Удалить услугу?")) return;
    await apiRequest("DELETE", `/api/admin/services/${id}`);
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: ["/api/admin/directions"] });
    toast({ title: "Удалено" });
  };

  const search = itemSearch.trim().toLowerCase();
  const visibleCategories = categories
    .map((c) => ({
      cat: c,
      items: (itemsByCategory.get(c.id) ?? []).filter(
        (it) => !search || it.name.toLowerCase().includes(search),
      ),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Услуги</h1>
          <p className="mt-1 text-sm text-gray-500">
            Услуга редактируется один раз и может показываться в нескольких направлениях.
          </p>
        </div>
        <Button onClick={openCreate} data-testid="button-create-service" className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Добавить
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {services.map((s) => (
            <div key={s.id} className="rounded-lg border bg-white p-4" data-testid={`service-${s.id}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="flex items-center gap-2 font-medium text-gray-900">
                    {s.name}
                    {!s.active && (
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] uppercase text-gray-400">
                        скрыта
                      </span>
                    )}
                  </h3>
                  <p className="truncate text-xs text-gray-500">/{s.slug}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(s)} data-testid={`button-edit-service-${s.id}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(s.id)} data-testid={`button-delete-service-${s.id}`}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(s.directionIds ?? []).map((id, i) => (
                  <span
                    key={id}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs ${
                      i === 0 ? "bg-sky-100 font-medium text-sky-800" : "bg-sky-50 text-sky-700"
                    }`}
                  >
                    {i === 0 && <Star className="h-3 w-3 fill-current" />}
                    {dirLabel.get(id) ?? "—"}
                  </span>
                ))}
              </div>
              {(s.priceItemIds?.length ?? 0) > 0 && (
                <p className="mt-2 text-xs text-gray-400">
                  Сопутствующих процедур: {s.priceItemIds.length}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Редактировать услугу" : "Новая услуга"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Название</Label>
              <Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="input-service-name" />
            </div>
            <div className="space-y-1.5">
              <Label>Slug (адрес страницы, можно оставить пустым)</Label>
              <Input value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="ginekologiya" data-testid="input-service-slug" />
            </div>

            <div className="space-y-1.5">
              <Label>Направления</Label>
              <p className="text-xs text-gray-400">
                Отметьте направления, в которых показывать услугу. «Основное»
                задаёт цвет и хлебные крошки страницы услуги по умолчанию.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {directions.map((d) => {
                  const on = directionIds.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDirectionIds((l) => toggle(l, d.id))}
                      data-testid={`toggle-direction-${d.id}`}
                      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                        on
                          ? "border-sky-500 bg-sky-50 text-sky-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>

              {directionIds.length > 0 && (
                <div className="mt-2 space-y-1 rounded-lg border border-gray-100 p-1.5">
                  {directionIds.map((id, i) => {
                    const isPrimary = i === 0;
                    return (
                      <div
                        key={id}
                        data-testid={`selected-direction-${id}`}
                        className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ${
                          isPrimary ? "bg-sky-50" : ""
                        }`}
                      >
                        {isPrimary ? (
                          <span
                            className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-700"
                            data-testid={`badge-primary-direction-${id}`}
                          >
                            <Star className="h-3 w-3 fill-current" /> Основное
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => makePrimaryDirection(id)}
                            data-testid={`button-make-primary-${id}`}
                            className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500 transition-colors hover:border-sky-300 hover:text-sky-600"
                          >
                            <Star className="h-3 w-3" /> Сделать основным
                          </button>
                        )}
                        <span className="flex-1 truncate text-gray-700">
                          {dirLabel.get(id) ?? "—"}
                        </span>
                        <div className="flex shrink-0 items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => moveDirection(id, -1)}
                            disabled={i === 0}
                            data-testid={`button-move-up-direction-${id}`}
                            className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveDirection(id, 1)}
                            disabled={i === directionIds.length - 1}
                            data-testid={`button-move-down-direction-${id}`}
                            className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Краткое описание (для карточки)</Label>
              <Textarea value={form.shortDescription ?? ""} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} rows={2} data-testid="input-service-short" />
            </div>
            <div className="space-y-1.5">
              <Label>Описание страницы (абзацы — через пустую строку)</Label>
              <Textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} data-testid="input-service-description" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Цена (текст)</Label>
                <Input value={form.price ?? ""} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="от 1 500 ₽" data-testid="input-service-price" />
              </div>
              <div className="space-y-1.5">
                <Label>Длительность</Label>
                <Input value={form.duration ?? ""} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="30 мин" data-testid="input-service-duration" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Изображение (hero)</Label>
              <ImagePicker value={form.imageUrl ?? ""} onChange={(url) => setForm({ ...form, imageUrl: url })} />
            </div>

            <div className="space-y-1.5">
              <Label>Сопутствующие услуги (процедуры с ценами)</Label>
              <p className="text-xs text-gray-400">
                Отмеченные процедуры покажутся на странице услуги блоком «Услуги и цены».
              </p>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  placeholder="Поиск процедуры"
                  className="pl-8"
                  data-testid="input-price-item-search"
                />
              </div>
              <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-gray-100 p-1" data-lenis-prevent>
                {visibleCategories.length === 0 && (
                  <p className="px-2 py-3 text-center text-xs text-gray-400">Ничего не найдено</p>
                )}
                {visibleCategories.map(({ cat, items: catItems }) => {
                  const isCollapsed = collapsed[cat.id] && !search;
                  const selectedInCat = catItems.filter((it) => priceItemIds.includes(it.id)).length;
                  return (
                    <div key={cat.id} className="rounded-md">
                      <button
                        type="button"
                        onClick={() => setCollapsed((c) => ({ ...c, [cat.id]: !c[cat.id] }))}
                        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        <span className="flex-1">{cat.name}</span>
                        {selectedInCat > 0 && (
                          <span className="rounded-full bg-sky-100 px-1.5 text-[10px] text-sky-700">{selectedInCat}</span>
                        )}
                      </button>
                      {!isCollapsed && (
                        <div className="space-y-0.5 pb-1 pl-5 pr-1">
                          {catItems.map((it) => {
                            const on = priceItemIds.includes(it.id);
                            return (
                              <label
                                key={it.id}
                                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs hover:bg-gray-50"
                                data-testid={`toggle-price-item-${it.id}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={on}
                                  onChange={() => setPriceItemIds((l) => toggle(l, it.id))}
                                  className="h-3.5 w-3.5 rounded border-gray-300"
                                />
                                <span className="flex-1 text-gray-700">{it.name}</span>
                                <span className="shrink-0 text-gray-400">{it.price}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {priceItemIds.length > 0 && (
                <p className="text-xs text-gray-500">Выбрано процедур: {priceItemIds.length}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1.5">
                <Label>SEO заголовок (title)</Label>
                <Input value={form.metaTitle ?? ""} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} data-testid="input-service-meta-title" />
              </div>
              <div className="space-y-1.5">
                <Label>SEO описание (description)</Label>
                <Textarea value={form.metaDescription ?? ""} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} rows={2} data-testid="input-service-meta-description" />
              </div>
            </div>

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
            <Button onClick={save} disabled={saving} data-testid="button-save-service">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
