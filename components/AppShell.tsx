import Link from "next/link";

import { Card } from "@/components/ui";
import { env } from "@/lib/env";

import { LogoutButton } from "./LogoutButton";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/addresses", label: "Addresses" },
  { href: "/dashboard/api-keys", label: "API Keys" }
];

export function AppShell({
  children,
  title,
  subtitle
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <Card className="overflow-hidden bg-ink p-0 text-white">
          <div className="flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                SiapInbox
              </div>
              <div>
                <h1 className="text-3xl font-semibold">{title}</h1>
                <p className="mt-2 max-w-2xl text-sm text-white/70">
                  {subtitle || `Domain aktif: @${env.appDomain}`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/85 transition hover:bg-white/10"
                >
                  {link.label}
                </Link>
              ))}
              <LogoutButton />
            </div>
          </div>
        </Card>

        {children}
      </div>
    </main>
  );
}
