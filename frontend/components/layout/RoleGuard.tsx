"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { LoadingState } from "@/components/ui/LoadingState";

export function RoleGuard({ role, children }: { role: "ADMIN" | "USER"; children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && user.role !== role) {
      router.replace(user.role === "ADMIN" ? "/admin" : "/dashboard");
    }
  }, [isLoading, user, role, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <LoadingState label="Verifying access…" />
      </div>
    );
  }

  if (user.role !== role) return null;

  return <>{children}</>;
}
