import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

let cachedClient: ReturnType<typeof createClient> | null = null;

function getSupabaseAdminClient() {
  if (!cachedClient) {
    cachedClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return cachedClient;
}

export const supabaseAdmin: any = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, property) {
    return getSupabaseAdminClient()[property as keyof ReturnType<typeof createClient>];
  }
});
