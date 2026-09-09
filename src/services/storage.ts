/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppPrivacySettings, UserProfile } from "../types";

export const STORAGE_KEYS = {
  USER_PROFILE: "jonny_match_user_profile",
  SWIPES: "jonny_match_swipes",
  MATCHES: "jonny_match_matches",
  MESSAGES: "jonny_match_messages",
  PRIVACY: "jonny_match_privacy_settings",
  PAYMENT_CONFIG: "jonny_match_payment_gateway_config",
  DEMO_MODE: "jonny_match_use_demo_mode",
};

// Memory store fallback for SSR, test environments, or when localStorage is disabled by browser policies
const memoryStore = new Map<string, string>();

export const getLocalStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    if (typeof localStorage !== "undefined") {
      const data = localStorage.getItem(key);
      if (data !== null) return JSON.parse(data);
    }
  } catch (e) {
    // Fall back to memoryStore
  }
  const memData = memoryStore.get(key);
  return memData ? JSON.parse(memData) : defaultValue;
};

export const setLocalStorageItem = <T>(key: string, value: T): void => {
  const serialized = JSON.stringify(value);
  memoryStore.set(key, serialized);
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, serialized);
    }
  } catch (e) {
    // QuotaExceededError or Node environment without webstorage
  }
};

export const removeLocalStorageItem = (key: string): void => {
  memoryStore.delete(key);
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(key);
    }
  } catch (e) {
    // Ignore
  }
};

/**
 * Seeds default offline-first database state if keys are missing
 */
export const initializeDemoDB = (): void => {
  // Seed privacy settings
  if (!getLocalStorageItem(STORAGE_KEYS.PRIVACY, null)) {
    const defaultPrivacy: AppPrivacySettings = {
      incognito_mode: false,
      hide_distance: false,
      blur_for_unverified: false,
      panic_button_enabled: true,
      panic_redirect_url: "https://www.standardmedia.co.ke/",
      discreet_mode: false,
    };
    setLocalStorageItem(STORAGE_KEYS.PRIVACY, defaultPrivacy);
  }

  // Seed swiped list
  if (!getLocalStorageItem(STORAGE_KEYS.SWIPES, null)) {
    setLocalStorageItem(STORAGE_KEYS.SWIPES, {});
  }

  // Seed matches list
  if (!getLocalStorageItem(STORAGE_KEYS.MATCHES, null)) {
    setLocalStorageItem(STORAGE_KEYS.MATCHES, []);
  }

  // Seed messages list
  if (!getLocalStorageItem(STORAGE_KEYS.MESSAGES, null)) {
    setLocalStorageItem(STORAGE_KEYS.MESSAGES, []);
  }

  // Seed current user profile
  if (!getLocalStorageItem(STORAGE_KEYS.USER_PROFILE, null)) {
    const defaultUser: UserProfile = {
      id: "current_user",
      name: "Jonny Fan",
      age: 26,
      gender: "Non-binary",
      pronouns: "They/Them",
      orientation: "Queer",
      bio: "Just a beautiful soul looking for connections in Nairobi. Big fan of soothing aromatherapies and outdoor adventures.",
      images: ["https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600"],
      interests: ["Music", "Coffee", "Yoga", "Thrifting"],
      location_name: "Kilimani, Nairobi",
      distance_km: 0,
      is_verified: true,
      relationship_goals: ["Dating"],
      massage_affinity: "Swedish Massage Enthusiast",
    };
    setLocalStorageItem(STORAGE_KEYS.USER_PROFILE, defaultUser);
  }
};
