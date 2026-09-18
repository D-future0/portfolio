"use client";

import { useEffect } from "react";

export function AnalyticsView({ tenantId, path }: { tenantId: string; path: string }) {
  useEffect(() => {
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId, type: "view", path }),
      keepalive: true,
    });
  }, [tenantId, path]);
  return null;
}