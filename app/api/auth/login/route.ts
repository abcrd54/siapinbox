import { createDashboardSession, verifyDashboardPassword } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!verifyDashboardPassword(password)) {
    return jsonError("Password tidak valid", 401);
  }

  await createDashboardSession();

  return jsonOk({ success: true });
}
