import crypto from "crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { env } from "@/lib/env";

const SESSION_COOKIE = "siapinbox_session";

function sessionValue() {
  return crypto.createHash("sha256").update(env.appApiSecret).digest("hex");
}

export async function isDashboardAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === sessionValue();
}

export async function requireDashboardAuth() {
  const authenticated = await isDashboardAuthenticated();

  if (!authenticated) {
    redirect("/login");
  }
}

export async function requireDashboardApiAuth() {
  const authenticated = await isDashboardAuthenticated();

  if (!authenticated) {
    throw new Error("UNAUTHORIZED_DASHBOARD");
  }
}

export async function createDashboardSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
}

export async function clearDashboardSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export function verifyDashboardPassword(password: string) {
  return password === env.dashboardPassword;
}
