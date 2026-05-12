import { clearDashboardSession } from "@/lib/auth";
import { jsonOk } from "@/lib/http";

export async function POST() {
  await clearDashboardSession();
  return jsonOk({ success: true });
}
