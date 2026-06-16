import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Booking {
  id: string;
  name: string;
  phone: string;
  preferredAt: string;
  directionLabel: string;
  status: string;
  createdAt: string;
}

const queryKey = ["/api/admin/bookings"];

function formatDateTime(value: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function BookingsManager() {
  const { toast } = useToast();
  const { data: items = [], isLoading } = useQuery<Booking[]>({ queryKey });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const setStatus = async (id: string, status: string) => {
    try {
      await apiRequest("PATCH", `/api/admin/bookings/${id}`, { status });
      queryClient.invalidateQueries({ queryKey });
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await apiRequest("DELETE", `/api/admin/bookings/${deleteId}`);
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Удалено" });
    } catch {
      toast({ title: "Ошибка удаления", variant: "destructive" });
    } finally {
      setDeleteId(null);
    }
  };

  const newCount = items.filter((b) => b.status === "new").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900" data-testid="text-page-title">
          Заявки
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Онлайн-заявки на приём с сайта
          {newCount > 0 && (
            <span className="ml-2 rounded-full bg-[#e8f6f6] px-2 py-0.5 text-xs font-medium text-[#007d83]">
              новых: {newCount}
            </span>
          )}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Дата заявки</th>
                <th className="px-4 py-3 font-medium">Имя</th>
                <th className="px-4 py-3 font-medium">Телефон</th>
                <th className="px-4 py-3 font-medium">Желаемое время</th>
                <th className="px-4 py-3 font-medium">Направление</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((b) => (
                <tr
                  key={b.id}
                  data-testid={`row-booking-${b.id}`}
                  className={b.status === "new" ? "bg-[#f7fbfb]" : undefined}
                >
                  <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                    {formatDateTime(b.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800" data-testid={`text-name-${b.id}`}>
                    {b.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <a
                      href={`tel:${b.phone.replace(/[^\d+]/g, "")}`}
                      className="text-[#007d83] hover:underline"
                      data-testid={`link-phone-${b.id}`}
                    >
                      {b.phone}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {b.preferredAt ? formatDateTime(b.preferredAt) : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{b.directionLabel || "—"}</td>
                  <td className="px-4 py-3">
                    <Select value={b.status} onValueChange={(v) => setStatus(b.id, v)}>
                      <SelectTrigger className="h-8 w-[160px]" data-testid={`select-status-${b.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Новая</SelectItem>
                        <SelectItem value="processed">Обработана</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteId(b.id)}
                      data-testid={`button-delete-${b.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    Пока нет заявок
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить заявку?</AlertDialogTitle>
            <AlertDialogDescription>Это действие нельзя отменить.</AlertDialogDescription>
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
