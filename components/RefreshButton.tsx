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
      className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-ink disabled:opacity-70"
    >
      <span className={`inline-block text-base ${refreshing ? "animate-spin" : ""}`}>↻</span>
      <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
    </button>
  );
}
