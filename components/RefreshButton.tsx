"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RefreshButton() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 900);
  }

  return (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={refreshing}
      className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/85 transition hover:bg-white/10 disabled:opacity-70"
    >
      <span className={`inline-block text-base ${refreshing ? "animate-spin" : ""}`}>↻</span>
      <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
    </button>
  );
}
