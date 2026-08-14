"use client"

import dynamic from "next/dynamic"

// Recharts has no reason to render on the server. Loading it client-only
// means the server render for /analytics doesn't wait on it, and the JS
// only downloads once the user is actually on this route.
export const AnalyticsDashboardLazy = dynamic(
  () => import("./analytics-dashboard").then((m) => m.AnalyticsDashboard),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 animate-pulse rounded-xl bg-card/30 border border-border" />
    ),
  }
)