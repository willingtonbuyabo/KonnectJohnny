/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Profile {
  id: string;
  name: string;
  age: number;
  gender: string;
  pronouns?: string;
  orientation: string;
  bio: string;
  images: string[];
  interests: string[];
  location_name: string;
  distance_km: number;
  is_verified: boolean;
  relationship_goals: string[];
  massage_affinity?: string; // Tribute to Massage Jonny: e.g. "Deep Tissue Lover", "Swedish Massage Enthusiast", "Aromatherapy Fan"
  safety_flags?: {
    incognito: boolean;
    hide_distance: boolean;
    blur_avatar_unverified: boolean;
  };
}

export type SubscriptionTier = "free" | "gold" | "platinum";

export interface UserSubscription {
  tier: SubscriptionTier;
  billingCycle?: "monthly" | "annual";
  expiresAt?: string;
  autoRenew?: boolean;
}

export interface UserProfile extends Profile {
  email?: string;
  created_at?: string;
  subscription_tier?: SubscriptionTier;
}

export interface Match {
  id: string;
  user_id: string; // The other user's ID
  profile: Profile; // The other user's profile
  created_at: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  created_at: string;
  is_read: boolean;
  read_at?: string;
}

export interface AppPrivacySettings {
  incognito_mode: boolean;
  hide_distance: boolean;
  blur_for_unverified: boolean;
  panic_button_enabled: boolean;
  panic_redirect_url: string;
  discreet_mode: boolean; // Renames app header and swaps icons for stealth
  push_notifications_enabled?: boolean; // PWA push notifications toggle
}

export interface MatchFilters {
  age_range: [number, number];
  max_distance: number;
  genders: string[];
  relationship_goals: string[];
}
