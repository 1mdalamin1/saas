import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getAuthCallbackUrl, getPasswordResetRedirectUrl } from '../lib/authRedirect';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { PROFILE_BUCKET } from '../lib/storage';
import type { ProfileUpdate, UserProfile } from '../types/profile';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signInWithGoogle: (redirectPath?: string) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<{ error: string | null }>;
  updatePassword: (
    newPassword: string,
  ) => Promise<{ error: string | null }>;
  uploadAvatar: (file: File) => Promise<{ url: string | null; error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('fetchProfile:', error.message);
    return null;
  }
  const row = data as Record<string, unknown>;
  return {
    ...(row as UserProfile),
    hourly_rate: Number(row.hourly_rate ?? 42),
    display_id: Number(row.display_id ?? 0),
  };
}

function nameFromUserMetadata(user: User): string {
  const meta = user.user_metadata ?? {};
  return (
    (meta.full_name as string | undefined) ??
    (meta.name as string | undefined) ??
    ''
  );
}

function avatarFromUserMetadata(user: User): string | null {
  const meta = user.user_metadata ?? {};
  return (
    (meta.avatar_url as string | undefined) ??
    (meta.picture as string | undefined) ??
    null
  );
}

async function ensureProfile(user: User): Promise<UserProfile | null> {
  let profile = await fetchProfile(user.id);
  const fullName = nameFromUserMetadata(user);
  const avatarUrl = avatarFromUserMetadata(user);

  if (profile) {
    const updates: ProfileUpdate = {};
    if (!profile.full_name && fullName) updates.full_name = fullName;
    if (!profile.avatar_url && avatarUrl) updates.avatar_url = avatarUrl;
    if (Object.keys(updates).length > 0) {
      await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      profile = await fetchProfile(user.id);
    }
    return profile;
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      full_name: fullName || null,
      avatar_url: avatarUrl,
    })
    .select()
    .single();

  if (error) {
    console.error('ensureProfile:', error.message);
    return null;
  }
  const row = data as Record<string, unknown>;
  return {
    ...(row as UserProfile),
    hourly_rate: Number(row.hourly_rate ?? 42),
    display_id: Number(row.display_id ?? 0),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const loadProfile = useCallback(async (u: User | null) => {
    if (!u) {
      setProfile(null);
      return;
    }
    setProfileLoading(true);
    const p = await ensureProfile(u);
    setProfile(p);
    setProfileLoading(false);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
      if (s?.user) loadProfile(s.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        loadProfile(s.user);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured. Add keys to .env.local.' };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(
    async (fullName: string, email: string, password: string) => {
      if (!isSupabaseConfigured) {
        return { error: 'Supabase is not configured. Add keys to .env.local.' };
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      return { error: error?.message ?? null };
    },
    [],
  );

  const signInWithGoogle = useCallback(async (redirectPath = '/dashboard') => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured. Add keys to .env.local.' };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getAuthCallbackUrl(redirectPath),
        queryParams: {
          access_type: 'online',
          prompt: 'select_account',
        },
      },
    });
    return { error: error?.message ?? null };
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured. Add keys to .env.local.' };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getPasswordResetRedirectUrl(),
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user);
  }, [user, loadProfile]);

  const updateProfile = useCallback(
    async (updates: ProfileUpdate) => {
      if (!user) return { error: 'Not signed in' };
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (!error) await loadProfile(user);
      return { error: error?.message ?? null };
    },
    [user, loadProfile],
  );

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error?.message ?? null };
  }, []);

  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!user) return { url: null, error: 'Not signed in' };
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(PROFILE_BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        return { url: null, error: uploadError.message };
      }

      const { data } = supabase.storage.from(PROFILE_BUCKET).getPublicUrl(path);
      const url = data.publicUrl;
      const { error: profileError } = await updateProfile({ avatar_url: url });
      if (profileError) return { url: null, error: profileError };
      return { url, error: null };
    },
    [user, updateProfile],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      loading,
      profileLoading,
      isConfigured: isSupabaseConfigured,
      signIn,
      signUp,
      signInWithGoogle,
      resetPassword,
      signOut,
      refreshProfile,
      updateProfile,
      updatePassword,
      uploadAvatar,
    }),
    [
      session,
      user,
      profile,
      loading,
      profileLoading,
      signIn,
      signUp,
      signInWithGoogle,
      resetPassword,
      signOut,
      refreshProfile,
      updateProfile,
      updatePassword,
      uploadAvatar,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
