export function extractOtp(text: string | null | undefined) {
  if (!text) {
    return null;
  }

  const match = text.match(/\b\d{4,8}\b/);
  return match?.[0] ?? null;
}
