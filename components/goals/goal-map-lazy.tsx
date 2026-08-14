"use client"

import dynamic from "next/dynamic"

// React Flow is a large, canvas/DOM-heavy client library with no reason to
// render on the server. Loading it client-only avoids paying its bundle
// cost on the server render for /goals/map.
export const GoalMapLazy = dynamic(
  () => import("./goal-map").then((m) => m.GoalMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse rounded-xl bg-card/30 border border-border" />
    ),
  }
)