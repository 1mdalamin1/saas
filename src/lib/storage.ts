/** Storage bucket for profile photos (must match Supabase Dashboard bucket name). */
export const PROFILE_BUCKET =
  import.meta.env.VITE_SUPABASE_PROFILE_BUCKET ?? 'Profile pick';
