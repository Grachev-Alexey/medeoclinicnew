"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function AdminLoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiRequest("POST", "/api/auth/login", { username, password });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      router.replace("/admin/doctors");
    } catch {
      toast({ title: "Неверный логин или пароль", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1c2e] px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-xl font-semibold text-gray-900">Панель управления</h1>
        <p className="mt-1 text-sm text-gray-500">МЕДЕО — вход для администратора</p>
        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label>Логин</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" data-testid="input-username" />
          </div>
          <div className="space-y-1.5">
            <Label>Пароль</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" data-testid="input-password" />
          </div>
          <Button type="submit" className="w-full" disabled={loading} data-testid="button-login">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Войти
          </Button>
        </div>
      </form>
    </div>
  );
}
