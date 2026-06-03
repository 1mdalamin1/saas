/** App origin for auth redirects (runtime in browser, or VITE_APP_URL when set). */
export function getAppOrigin(): string {
  const configured = import.meta.env.VITE_APP_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
}

/** OAuth return URL — must be allowlisted in Supabase → Authentication → URL Configuration. */
export function getAuthCallbackUrl(nextPath = '/dashboard'): string {
  const next = nextPath.startsWith('/') ? nextPath : `/${nextPath}`;
  return `${getAppOrigin()}/auth/callback?next=${encodeURIComponent(next)}`;
}

/** Password reset email link — allowlist in Supabase → Authentication → URL Configuration. */
export function getPasswordResetRedirectUrl(): string {
  return `${getAppOrigin()}/reset-password`;
}
