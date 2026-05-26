import * as React from "react";

import { supabase, isSupabaseConfigured } from "@/api/supabaseClient";
import type { AuthUser, Role } from "@/types/erp";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  hasRole: (roles: Role[]) => boolean;
}

const fallbackUser: AuthUser = {
  id: "usr-admin",
  name: "Melkz Admin",
  email: "admin@cimentoerp.local",
  role: "admin",
  company: "CimentoERP"
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(fallbackUser);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    let active = true;

    async function loadUser() {
      if (!isSupabaseConfigured || !supabase) {
        return;
      }

      setIsLoading(true);
      try {
        const { data } = await supabase.auth.getUser();
        if (active && data.user) {
          const userData = data.user;
          setUser({
            id: userData.id,
            name: (userData.user_metadata as any)?.name ?? userData.email ?? "Usuario",
            email: userData.email ?? "",
            role: ((userData.user_metadata as any)?.role as Role) ?? "admin",
            company: (userData.user_metadata as any)?.company ?? "CimentoERP"
          });
        }
      } catch (error) {
        console.warn("Supabase auth.getUser() failed; using local admin.", error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadUser();

    return () => {
      active = false;
    };
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      hasRole: (roles) => Boolean(user && (roles.includes(user.role) || user.role === "admin"))
    }),
    [isLoading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
