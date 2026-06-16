import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ImagePicker } from "./ImagePicker";

export interface CrudField {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "boolean" | "image" | "select" | "multiselect" | "list";
  options?: { label: string; value: string }[];
  optionsPath?: string;
  optionLabel?: string;
  optionValue?: string;
  placeholder?: string;
  defaultValue?: unknown;
}

interface CrudManagerProps {
  title: string;
  description?: string;
  path: string;
  fields: CrudField[];
  columns: { name: string; label: string; type?: "image" | "boolean" }[];
}

export function CrudManager({
  title,
  description,
  path,
  fields,
  columns,
}: CrudManagerProps) {
  const { toast } = useToast();
  const queryKey = [`/api/admin/${path}`];
  const { data: items = [], isLoading } = useQuery<any[]>({ queryKey });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const emptyForm = () => {
    const f: Record<string, any> = {};
    for (const field of fields) {
      f[field.name] =
        field.defaultValue ??
        (field.type === "boolean"
          ? true
          : field.type === "number"
          ? 0
          : field.type === "multiselect" || field.type === "list"
          ? []
          : "");
    }
    return f;
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditing(item);
    const f: Record<string, any> = {};
    for (const field of fields) {
      const v = item[field.name];
      f[field.name] =
        field.type === "multiselect" || field.type === "list"
          ? (Array.isArray(v) ? v : [])
          : v ?? "";
    }
    setForm(f);
    setDialogOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload: Record<string, any> = {};
      for (const field of fields) {
        let v = form[field.name];
        if (field.type === "number") v = Number(v) || 0;
        if (field.type === "multiselect") v = Array.isArray(v) ? v : [];
        if (field.type === "list")
          v = (Array.isArray(v) ? v : []).map((s: any) => String(s).trim()).filter(Boolean);
        payload[field.name] = v;
      }
      if (editing) {
        await apiRequest("PATCH", `/api/admin/${path}/${editing.id}`, payload);
      } else {
        await apiRequest("POST", `/api/admin/${path}`, payload);
      }
      queryClient.invalidateQueries({ queryKey });
      setDialogOpen(false);
      toast({ title: editing ? "Сохранено" : "Создано" });
    } catch (err: any) {
      toast({ title: "Ошибка сохранения", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await apiRequest("DELETE", `/api/admin/${path}/${deleteId}`);
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Удалено" });
    } catch (err: any) {
      toast({ title: "Ошибка удаления", variant: "destructive" });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900" data-testid="text-page-title">
            {title}
          </h1>
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>
        <Button onClick={openCreate} data-testid="button-create">
          <Plus className="mr-2 h-4 w-4" />
          Добавить
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 text-left text-gray-500">
              <tr>
                {columns.map((c) => (
                  <th key={c.name} className="px-4 py-3 font-medium">
                    {c.label}
                  </th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item) => (
                <tr key={item.id} data-testid={`row-${path}-${item.id}`}>
                  {columns.map((c) => (
                    <td key={c.name} className="px-4 py-3 align-middle">
                      {c.type === "image" ? (
                        item[c.name] ? (
                          <img src={item[c.name]} alt="" className="h-10 w-10 rounded object-cover" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )
                      ) : c.type === "boolean" ? (
                        <span
                          className={
                            item[c.name]
                              ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700"
                              : "rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
                          }
                        >
                          {item[c.name] ? "Да" : "Нет"}
                        </span>
                      ) : (
                        <span className="line-clamp-1 max-w-xs text-gray-800">
                          {String(item[c.name] ?? "")}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEdit(item)}
                        data-testid={`button-edit-${item.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleteId(item.id)}
                        data-testid={`button-delete-${item.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-gray-400">
                    Пока пусто
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Редактировать" : "Добавить"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {fields.map((field) => (
              <div key={field.name} className="space-y-1.5">
                <Label>{field.label}</Label>
                {field.type === "textarea" ? (
                  <Textarea
                    value={form[field.name] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                    data-testid={`input-${field.name}`}
                  />
                ) : field.type === "boolean" ? (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!!form[field.name]}
                      onCheckedChange={(v) => setForm({ ...form, [field.name]: v })}
                      data-testid={`switch-${field.name}`}
                    />
                  </div>
                ) : field.type === "image" ? (
                  <ImagePicker
                    value={form[field.name] ?? ""}
                    onChange={(url) => setForm({ ...form, [field.name]: url })}
                  />
                ) : field.type === "multiselect" ? (
                  <MultiSelectField
                    optionsPath={field.optionsPath!}
                    optionLabel={field.optionLabel}
                    optionValue={field.optionValue}
                    value={Array.isArray(form[field.name]) ? form[field.name] : []}
                    onChange={(vals) => setForm({ ...form, [field.name]: vals })}
                    testid={`multiselect-${field.name}`}
                  />
                ) : field.type === "list" ? (
                  <ListField
                    value={Array.isArray(form[field.name]) ? form[field.name] : []}
                    onChange={(vals) => setForm({ ...form, [field.name]: vals })}
                    placeholder={field.placeholder}
                    testid={`list-${field.name}`}
                  />
                ) : field.type === "select" ? (
                  <Select
                    value={String(form[field.name] ?? "")}
                    onValueChange={(v) => setForm({ ...form, [field.name]: v })}
                  >
                    <SelectTrigger data-testid={`select-${field.name}`}>
                      <SelectValue placeholder="Выберите" />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={field.type === "number" ? "number" : "text"}
                    value={form[field.name] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                    data-testid={`input-${field.name}`}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={save} disabled={saving} data-testid="button-save">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить запись?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} data-testid="button-confirm-delete">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ListField({
  value,
  onChange,
  placeholder,
  testid,
}: {
  value: string[];
  onChange: (vals: string[]) => void;
  placeholder?: string;
  testid?: string;
}) {
  const update = (i: number, val: string) => {
    const next = [...value];
    next[i] = val;
    onChange(next);
  };
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const add = () => onChange([...value, ""]);

  return (
    <div className="space-y-2" data-testid={testid}>
      {value.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={item}
            placeholder={placeholder}
            onChange={(e) => update(i, e.target.value)}
            data-testid={`${testid}-input-${i}`}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => remove(i)}
            data-testid={`${testid}-remove-${i}`}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add} data-testid={`${testid}-add`}>
        <Plus className="mr-2 h-4 w-4" /> Добавить пункт
      </Button>
    </div>
  );
}

function MultiSelectField({
  optionsPath,
  optionLabel = "name",
  optionValue = "id",
  value,
  onChange,
  testid,
}: {
  optionsPath: string;
  optionLabel?: string;
  optionValue?: string;
  value: string[];
  onChange: (vals: string[]) => void;
  testid?: string;
}) {
  const { data: options = [], isLoading } = useQuery<any[]>({ queryKey: [optionsPath] });
  const toggle = (val: string) =>
    onChange(value.includes(val) ? value.filter((v) => v !== val) : [...value, val]);

  if (isLoading) {
    return <div className="text-sm text-gray-400">Загрузка…</div>;
  }
  return (
    <div className="max-h-48 space-y-0.5 overflow-y-auto rounded-md border p-2" data-testid={testid}>
      {options.length === 0 && <div className="px-2 py-1 text-sm text-gray-400">Нет вариантов</div>}
      {options.map((o) => {
        const val = String(o[optionValue]);
        const checked = value.includes(val);
        return (
          <label
            key={val}
            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(val)}
              className="h-4 w-4 accent-[#007d83]"
            />
            <span className="text-gray-800">{String(o[optionLabel])}</span>
          </label>
        );
      })}
    </div>
  );
}
