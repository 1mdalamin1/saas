import { FormEvent, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Gender, ProfileUpdate } from '../types/profile';
import { formatDisplayId } from '../utils/formatId';

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: '', label: 'Select…' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export default function ProfilePage() {
  const { user, profile, profileLoading, updateProfile, updatePassword, uploadAvatar } =
    useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender>('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [website, setWebsite] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? '');
    setPhone(profile.phone ?? '');
    setAddress(profile.address ?? '');
    setAge(profile.age != null ? String(profile.age) : '');
    setGender((profile.gender as Gender) ?? '');
    setTwitter(profile.twitter_url ?? '');
    setLinkedin(profile.linkedin_url ?? '');
    setInstagram(profile.instagram_url ?? '');
    setFacebook(profile.facebook_url ?? '');
    setWebsite(profile.website_url ?? '');
  }, [profile]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2 MB');
      return;
    }
    setUploading(true);
    setError(null);
    const { error: err } = await uploadAvatar(file);
    setUploading(false);
    if (err) setError(err);
    else setMessage('Profile photo updated');
  };

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const updates: ProfileUpdate = {
      full_name: fullName.trim() || null,
      phone: phone.trim() || null,
      address: address.trim() || null,
      age: age ? parseInt(age, 10) : null,
      gender: gender || null,
      twitter_url: twitter.trim() || null,
      linkedin_url: linkedin.trim() || null,
      instagram_url: instagram.trim() || null,
      facebook_url: facebook.trim() || null,
      website_url: website.trim() || null,
    };

    const { error: err } = await updateProfile(updates);
    setSaving(false);
    if (err) setError(err);
    else setMessage('Profile saved successfully');
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    const { error: err } = await updatePassword(newPassword);
    setSaving(false);
    if (err) setError(err);
    else {
      setMessage('Password updated');
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  if (profileLoading && !profile) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded-xl w-48" />
        <div className="h-64 bg-white rounded-2xl" />
      </div>
    );
  }

  const initials = (fullName || user?.email || '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1
          className="text-2xl lg:text-3xl font-bold text-gray-900"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          Profile
        </h1>
        <p className="text-gray-500 text-sm mt-1">View and manage your account details</p>
      </div>

      {(message || error) && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            error
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-green-50 border border-green-200 text-green-800'
          }`}
        >
          {error ?? message}
        </div>
      )}

      {/* Read-only account info */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
        <h2
          className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          Account
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <InfoRow
            label="User ID"
            value={formatDisplayId(profile?.display_id)}
          />
          <InfoRow label="Email" value={user?.email ?? '—'} />
          <InfoRow
            label="Member since"
            value={
              profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : '—'
            }
          />
          <InfoRow
            label="Last updated"
            value={
              profile?.updated_at
                ? new Date(profile.updated_at).toLocaleString()
                : '—'
            }
          />
        </dl>
        <p className="text-xs text-gray-400 mt-4">Email cannot be changed here.</p>
      </section>

      {/* Avatar + profile form */}
      <form
        onSubmit={handleProfileSubmit}
        className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 space-y-6"
      >
        <h2
          className="text-sm font-bold text-gray-900 uppercase tracking-wide"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          Personal details
        </h2>

        <div className="flex items-center gap-5">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Profile"
              className="w-20 h-20 rounded-2xl object-cover border border-black/10"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-xl font-bold"
              style={{ backgroundColor: '#E8651C', fontFamily: 'Manrope, sans-serif' }}
            >
              {initials}
            </div>
          )}
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="rounded-xl px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              style={{ backgroundColor: '#1B3B2F' }}
            >
              {uploading ? 'Uploading…' : 'Upload photo'}
            </button>
            <p className="text-xs text-gray-400 mt-1">JPG or PNG, max 2 MB</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Full name" id="fullName">
            <input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
            />
          </FormField>
          <FormField label="Phone" id="phone">
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
              placeholder="+44…"
            />
          </FormField>
          <FormField label="Age" id="age" className="sm:col-span-1">
            <input
              id="age"
              type="number"
              min={1}
              max={150}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className={inputClass}
            />
          </FormField>
          <FormField label="Gender" id="gender">
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              className={inputClass}
            >
              {GENDER_OPTIONS.map((o) => (
                <option key={o.value || 'empty'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Address" id="address" className="sm:col-span-2">
            <textarea
              id="address"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={inputClass}
            />
          </FormField>
        </div>

        <h3
          className="text-xs font-bold text-gray-500 uppercase tracking-wide pt-2"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          Social links
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Twitter / X" id="twitter">
            <input
              id="twitter"
              type="url"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              className={inputClass}
              placeholder="https://x.com/…"
            />
          </FormField>
          <FormField label="LinkedIn" id="linkedin">
            <input
              id="linkedin"
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className={inputClass}
              placeholder="https://linkedin.com/in/…"
            />
          </FormField>
          <FormField label="Instagram" id="instagram">
            <input
              id="instagram"
              type="url"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className={inputClass}
            />
          </FormField>
          <FormField label="Facebook" id="facebook">
            <input
              id="facebook"
              type="url"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              className={inputClass}
            />
          </FormField>
          <FormField label="Website" id="website" className="sm:col-span-2">
            <input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className={inputClass}
            />
          </FormField>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: '#E8651C', fontFamily: 'Manrope, sans-serif' }}
        >
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </form>

      {/* Change password */}
      <form
        onSubmit={handlePasswordSubmit}
        className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 space-y-4"
      >
        <h2
          className="text-sm font-bold text-gray-900 uppercase tracking-wide"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          Change password
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="New password" id="newPassword">
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
            />
          </FormField>
          <FormField label="Confirm new password" id="confirmNewPassword">
            <input
              id="confirmNewPassword"
              type="password"
              autoComplete="new-password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className={inputClass}
            />
          </FormField>
        </div>
        <button
          type="submit"
          disabled={saving || !newPassword}
          className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: '#1B3B2F', fontFamily: 'Manrope, sans-serif' }}
        >
          Update password
        </button>
      </form>
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8651C]/30';

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</dt>
      <dd
        className={`text-sm text-gray-900 mt-1 font-medium break-all ${mono ? 'font-mono text-xs' : ''}`}
        style={{ fontFamily: mono ? undefined : 'Manrope, sans-serif' }}
      >
        {value}
      </dd>
    </div>
  );
}

function FormField({
  label,
  id,
  children,
  className = '',
}: {
  label: string;
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
