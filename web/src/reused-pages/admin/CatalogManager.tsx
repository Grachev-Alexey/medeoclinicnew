import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { PriceCategory, PriceItem } from "@shared/schema";

export function CatalogManager() {
  const { toast } = useToast();
  const catKey = ["/api/admin/price-categories"];
  const itemKey = ["/api/admin/price-items"];
  const { data: categories = [] } = useQuery<PriceCategory[]>({ queryKey: catKey });
  const { data: items = [], isLoading } = useQuery<PriceItem[]>({ queryKey: itemKey });

  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [catDialog, setCatDialog] = useState(false);
  const [catForm, setCatForm] = useState<{ id?: string; name: string; sortOrder: number }>({ name: "", sortOrder: 0 });
  const [itemDialog, setItemDialog] = useState(false);
  const [itemForm, setItemForm] = useState<any>({ name: "", price: "", note: "", categoryId: "", sortOrder: 0 });
  const [saving, setSaving] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: catKey });
    queryClient.invalidateQueries({ queryKey: itemKey });
  };

  const q = search.trim().toLowerCase();
  const itemsByCat = useMemo(() => {
    const map: Record<string, PriceItem[]> = {};
    for (const it of items) {
      if (q && !it.name.toLowerCase().includes(q) && !it.price.toLowerCase().includes(q)) continue;
      (map[it.categoryId] ||= []).push(it);
    }
    for (const id of Object.keys(map)) map[id].sort((a, b) => a.sortOrder - b.sortOrder);
    return map;
  }, [items, q]);

  const sortedCats = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [categories],
  );
  const visibleCats = q ? sortedCats.filter((c) => (itemsByCat[c.id]?.length ?? 0) > 0) : sortedCats;
  const totalShown = Object.values(itemsByCat).reduce((a, l) => a + l.length, 0);

  const saveCat = async () => {
    if (!catForm.name.trim()) return;
    setSaving(true);
    try {
      if (catForm.id) await apiRequest("PATCH", `/api/admin/price-categories/${catForm.id}`, { name: catForm.name, sortOrder: catForm.sortOrder });
      else await apiRequest("POST", "/api/admin/price-categories", { name: catForm.name, sortOrder: catForm.sortOrder });
      invalidate();
      setCatDialog(false);
      toast({ title: "Сохранено" });
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const saveItem = async () => {
    if (!itemForm.name.trim() || !itemForm.categoryId) return;
    setSaving(true);
    try {
      const payload = {
        name: itemForm.name,
        price: itemForm.price,
        note: itemForm.note || "",
        categoryId: itemForm.categoryId,
        sortOrder: Number(itemForm.sortOrder) || 0,
      };
      if (itemForm.id) await apiRequest("PATCH", `/api/admin/price-items/${itemForm.id}`, payload);
      else await apiRequest("POST", "/api/admin/price-items", payload);
      invalidate();
      setItemDialog(false);
      toast({ title: "Сохранено" });
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const removeCat = async (id: string) => {
    if (!confirm("Удалить категорию вместе со всеми услугами внутри?")) return;
    await apiRequest("DELETE", `/api/admin/price-categories/${id}`);
    invalidate();
    toast({ title: "Удалено" });
  };
  const removeItem = async (id: string) => {
    if (!confirm("Удалить эту услугу?")) return;
    await apiRequest("DELETE", `/api/admin/price-items/${id}`);
    invalidate();
  };

  const openNewCat = () => {
    setCatForm({ name: "", sortOrder: categories.length });
    setCatDialog(true);
  };
  const openEditCat = (cat: PriceCategory) => {
    setCatForm({ id: cat.id, name: cat.name, sortOrder: cat.sortOrder });
    setCatDialog(true);
  };
  const openNewItem = (categoryId?: string) => {
    const catId = categoryId || categories[0]?.id || "";
    const count = items.filter((i) => i.categoryId === catId).length;
    setItemForm({ name: "", price: "", note: "", categoryId: catId, sortOrder: count });
    setItemDialog(true);
  };
  const openEditItem = (item: PriceItem) => {
    setItemForm({ ...item });
    setItemDialog(true);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Услуги и цены</h1>
          <p className="mt-1 text-sm text-gray-500">
            Полный каталог услуг клиники с ценами. Здесь добавляйте, редактируйте и удаляйте услуги и их категории — изменения сразу видны на сайте.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openNewCat} data-testid="button-add-category">
            <Plus className="mr-2 h-4 w-4" /> Категория
          </Button>
          <Button onClick={() => openNewItem()} disabled={categories.length === 0} data-testid="button-add-item">
            <Plus className="mr-2 h-4 w-4" /> Услуга
          </Button>
        </div>
      </div>

      <div className="relative mb-5 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск услуги по названию или цене…"
          className="pl-9"
          data-testid="input-search-catalog"
        />
      </div>

      {q && (
        <p className="mb-3 text-sm text-gray-500" data-testid="text-search-count">
          Найдено услуг: {totalShown}
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : (
        <div className="space-y-4">
          {visibleCats.map((cat) => {
            const catItems = itemsByCat[cat.id] ?? [];
            const allCount = items.filter((i) => i.categoryId === cat.id).length;
            const isCollapsed = !q && collapsed[cat.id];
            return (
              <div key={cat.id} className="overflow-hidden rounded-lg border bg-white" data-testid={`price-category-${cat.id}`}>
                <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setCollapsed((s) => ({ ...s, [cat.id]: !s[cat.id] }))}
                    className="flex items-center gap-2 text-left"
                    data-testid={`button-toggle-category-${cat.id}`}
                  >
                    {isCollapsed ? <ChevronRight className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                    <h3 className="font-medium text-gray-900">{cat.name}</h3>
                    <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">{allCount}</span>
                  </button>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openNewItem(cat.id)} data-testid={`button-add-item-${cat.id}`}>
                      <Plus className="mr-1 h-4 w-4" /> Услуга
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => openEditCat(cat)} data-testid={`button-edit-category-${cat.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => removeCat(cat.id)} data-testid={`button-delete-category-${cat.id}`}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                {!isCollapsed && (
                  <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] text-sm">
                    <tbody className="divide-y">
                      {catItems.map((item) => (
                        <tr key={item.id} data-testid={`price-item-${item.id}`}>
                          <td className="px-4 py-2.5 text-gray-800">
                            {item.name}
                            {item.note && <span className="ml-2 text-xs text-gray-400">{item.note}</span>}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2.5 text-right font-medium text-gray-900">{item.price}</td>
                          <td className="w-20 px-4 py-2.5 text-right">
                            <div className="flex justify-end gap-1">
                              <Button size="icon" variant="ghost" onClick={() => openEditItem(item)} data-testid={`button-edit-item-${item.id}`}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => removeItem(item.id)} data-testid={`button-delete-item-${item.id}`}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {catItems.length === 0 && (
                        <tr><td className="px-4 py-4 text-center text-gray-400" colSpan={3}>Нет услуг в этой категории</td></tr>
                      )}
                    </tbody>
                  </table>
                  </div>
                )}
              </div>
            );
          })}
          {visibleCats.length === 0 && (
            <div className="rounded-lg border border-dashed py-16 text-center text-gray-400">
              {q ? "Ничего не найдено" : "Создайте первую категорию"}
            </div>
          )}
        </div>
      )}

      <Dialog open={catDialog} onOpenChange={setCatDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>{catForm.id ? "Редактировать категорию" : "Новая категория"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Название категории</Label>
              <Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="Например: УЗИ-диагностика" data-testid="input-category-name" />
            </div>
            <div className="space-y-1.5">
              <Label>Порядок отображения</Label>
              <Input type="number" value={catForm.sortOrder} onChange={(e) => setCatForm({ ...catForm, sortOrder: Number(e.target.value) })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDialog(false)}>Отмена</Button>
            <Button onClick={saveCat} disabled={saving} data-testid="button-save-category">{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={itemDialog} onOpenChange={setItemDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{itemForm.id ? "Редактировать услугу" : "Новая услуга"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Категория</Label>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={itemForm.categoryId}
                onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                data-testid="select-item-category"
              >
                {sortedCats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Название услуги</Label>
              <Input value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} placeholder="Например: УЗИ щитовидной железы" data-testid="input-item-name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Цена</Label>
                <Input value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} placeholder="2 500 ₽" data-testid="input-item-price" />
              </div>
              <div className="space-y-1.5">
                <Label>Порядок</Label>
                <Input type="number" value={itemForm.sortOrder} onChange={(e) => setItemForm({ ...itemForm, sortOrder: Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Примечание (необязательно)</Label>
              <Input value={itemForm.note} onChange={(e) => setItemForm({ ...itemForm, note: e.target.value })} placeholder="Например: первичный приём" data-testid="input-item-note" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialog(false)}>Отмена</Button>
            <Button onClick={saveItem} disabled={saving} data-testid="button-save-item">{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
