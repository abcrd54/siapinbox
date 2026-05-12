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
      className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/85 transition hover:bg-white/10 disabled:opacity-60"
    >
      {pending ? "Keluar..." : "Logout"}
    </button>
  );
}
