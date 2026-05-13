import Link from "next/link";

import { env } from "@/lib/env";

import { LogoutButton } from "./LogoutButton";

const links = [
  { href: "/dashboard", label: "Inbox" },
  { href: "/dashboard/addresses", label: "Addresses" },
  { href: "/dashboard/api-keys", label: "API Keys" },
  { href: "/docs/api", label: "Docs" }
];

export function AppShell({
  children,
  title,
  subtitle,
  wide = false
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  wide?: boolean;
}) {
  const shellWidth = wide ? "max-w-[1800px]" : "max-w-7xl";

  return (
    <main className="min-h-screen">
      <div className="border-b border-line bg-white">
        <div className={`mx-auto flex ${shellWidth} flex-col gap-4 px-4 py-4 md:px-6 xl:px-8 2xl:px-10 lg:flex-row lg:items-center lg:justify-between`}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-ink text-sm font-bold text-white">SI</div>
            <div>
              <div className="text-sm font-semibold text-ink">SiapInbox</div>
              <div className="text-xs text-muted">@{env.appDomain}</div>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
            <LogoutButton />
          </nav>
        </div>
      </div>

      <div className={`mx-auto flex ${shellWidth} flex-col gap-5 px-4 py-5 md:px-6 xl:px-8 2xl:px-10`}>
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-normal text-ink">{title}</h1>
          <p className="max-w-3xl text-sm text-muted">{subtitle || `Domain aktif: @${env.appDomain}`}</p>
        </header>

        {children}
      </div>
    </main>
  );
}
