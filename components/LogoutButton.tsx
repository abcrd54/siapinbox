"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);

    await fetch("/api/auth/logout", {
      method: "POST"
    });

    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className="rounded-md border border-line bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-ink disabled:opacity-60"
    >
      {pending ? "Keluar..." : "Logout"}
    </button>
  );
}
