export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say' | '';

export interface UserProfile {
  id: string;
  display_id: number;
  full_name: string | null;
  hourly_rate: number;
  avatar_url: string | null;
  phone: string | null;
  address: string | null;
  age: number | null;
  gender: Gender | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  website_url: string | null;
  created_at: string;
  updated_at: string;
}

export type ProfileUpdate = Partial<
  Pick<
    UserProfile,
    | 'full_name'
    | 'avatar_url'
    | 'phone'
    | 'address'
    | 'age'
    | 'gender'
    | 'twitter_url'
    | 'linkedin_url'
    | 'instagram_url'
    | 'facebook_url'
    | 'website_url'
  >
>;
