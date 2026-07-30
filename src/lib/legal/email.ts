/** Internal sentinel only — never show env var names on public pages. */
export const LEGAL_EMAIL_UNSET = "configuration-pending@operator.local";

export function isLegalEmailConfigured(email: string | null | undefined): boolean {
  if (!email?.trim()) return false;
  return !email.includes("configuration-pending") && !email.includes("operator.local");
}
