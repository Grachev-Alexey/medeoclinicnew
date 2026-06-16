import { useQuery } from "@tanstack/react-query";

export interface AdminUser {
  id: string;
  username: string;
}

export function useAuth() {
  const { data, isLoading } = useQuery<AdminUser | null>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  return {
    user: data ?? null,
    isLoading,
    isAuthenticated: !!data,
  };
}
