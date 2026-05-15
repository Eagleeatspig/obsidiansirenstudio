import { ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
        …
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" />;
  return <>{children}</>;
}
