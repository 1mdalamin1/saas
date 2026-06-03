/** OAuth return URL — must be allowlisted in Supabase → Authentication → URL Configuration. */
export function getAuthCallbackUrl(nextPath = '/dashboard'): string {
  const next = nextPath.startsWith('/') ? nextPath : `/${nextPath}`;
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

/** Password reset email link — allowlist in Supabase → Authentication → URL Configuration. */
export function getPasswordResetRedirectUrl(): string {
  return `${window.location.origin}/reset-password`;
}
