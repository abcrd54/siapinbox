function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const env = {
  get supabaseUrl() {
    return requireEnv("SUPABASE_URL");
  },
  get supabaseServiceRoleKey() {
    return requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  },
  get inboundEmailSecret() {
    return requireEnv("INBOUND_EMAIL_SECRET");
  },
  get appApiSecret() {
    return requireEnv("APP_API_SECRET");
  },
  get dashboardPassword() {
    return process.env.DASHBOARD_PASSWORD || requireEnv("APP_API_SECRET");
  },
  get publicAppUrl() {
    return process.env.PUBLIC_APP_URL || "http://localhost:3000";
  },
  get appDomain() {
    return process.env.APP_DOMAIN || "siapdigital.web.id";
  }
};
