"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type Direction = { id: string; label: string };

const formSchema = z.object({
  name: z.string().trim().min(2, "Введите имя"),
  phone: z.string().trim().min(5, "Введите номер телефона"),
  preferredAt: z.string().optional(),
  directionId: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

const BookingContext = createContext<{ open: () => void } | null>(null);

export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
};

export function BookingProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  const { data: directions = [] } = useQuery<Direction[]>({
    queryKey: ["/api/directions"],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", phone: "", preferredAt: "", directionId: "" },
  });

  // Open the booking modal from any "Записаться" CTA across the site. All such
  // CTAs link to `#contacts` (the Contacts page uses the `/contacts` route), so
  // we intercept those clicks here — capture phase + stopPropagation overrides
  // the legacy scroll-to-contacts behavior, even in reused sections we can't edit.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      // Respect browser open-in-new-tab semantics (Cmd/Ctrl/Shift/Alt + click,
      // middle/right click) — don't hijack those.
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const el = e.target as HTMLElement | null;
      const link = el?.closest?.('a[href$="#contacts"]');
      if (link) {
        e.preventDefault();
        e.stopPropagation();
        setOpen(true);
      }
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      window.setTimeout(() => {
        setDone(false);
        form.reset();
      }, 200);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await apiRequest("POST", "/api/bookings", {
        name: values.name,
        phone: values.phone,
        preferredAt: values.preferredAt || "",
        directionId: values.directionId || null,
      });
      setDone(true);
    } catch (err: any) {
      toast({
        title: "Не удалось отправить заявку",
        description: err?.message ?? "Попробуйте позвонить нам",
        variant: "destructive",
      });
    }
  };

  return (
    <BookingContext.Provider value={{ open: () => setOpen(true) }}>
      {children}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          {done ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-[#007d83]" />
              <h3 className="text-lg font-semibold text-[#0f1c2e]">
                Заявка отправлена!
              </h3>
              <p className="text-sm text-gray-500">
                Мы свяжемся с вами в ближайшее время, чтобы подтвердить запись.
              </p>
              <Button
                className="mt-2 bg-[#007d83] hover:bg-[#006970]"
                onClick={() => handleOpenChange(false)}
                data-testid="button-booking-close"
              >
                Закрыть
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-[#0f1c2e]">Запись на приём</DialogTitle>
                <DialogDescription>
                  Оставьте контакты — администратор перезвонит и подтвердит запись.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Имя</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Как к вам обращаться"
                            data-testid="input-booking-name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Телефон</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+7 (___) ___-__-__"
                            data-testid="input-booking-phone"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="preferredAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Желаемая дата и время</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            data-testid="input-booking-datetime"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="directionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Направление</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger data-testid="select-booking-direction">
                              <SelectValue placeholder="Выберите направление" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {directions.map((d) => (
                              <SelectItem key={d.id} value={d.id}>
                                {d.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="h-11 w-full bg-[#007d83] text-white hover:bg-[#006970]"
                    disabled={form.formState.isSubmitting}
                    data-testid="button-booking-submit"
                  >
                    {form.formState.isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Записаться
                  </Button>
                </form>
              </Form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </BookingContext.Provider>
  );
}
