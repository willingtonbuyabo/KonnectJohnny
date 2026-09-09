/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppPrivacySettings } from "../types";
import { STORAGE_KEYS, getLocalStorageItem, setLocalStorageItem } from "./storage";

export const privacyService = {
  getSettings(): AppPrivacySettings {
    const defaultPrivacy: AppPrivacySettings = {
      incognito_mode: false,
      hide_distance: false,
      blur_for_unverified: false,
      panic_button_enabled: true,
      panic_redirect_url: "https://www.standardmedia.co.ke/",
      discreet_mode: false,
    };
    return getLocalStorageItem<AppPrivacySettings>(STORAGE_KEYS.PRIVACY, defaultPrivacy);
  },

  saveSettings(settings: AppPrivacySettings): void {
    setLocalStorageItem(STORAGE_KEYS.PRIVACY, settings);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("privacy_settings_updated", { detail: settings }));
    }
  },
};
