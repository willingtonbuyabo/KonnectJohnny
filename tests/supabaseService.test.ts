/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  cleanUrl,
  isValidSupabaseUrl,
  isValidUuid,
  isDesignatedAdminEmail,
} from "../src/services/supabaseClient";
import {
  STORAGE_KEYS,
  getLocalStorageItem,
  setLocalStorageItem,
  initializeDemoDB,
} from "../src/services/storage";
import { privacyService } from "../src/services/privacyService";

describe("Supabase Client Utilities", () => {
  it("should cleanly strip trailing slashes and /rest/v1 paths from Supabase URLs", () => {
    expect(cleanUrl("https://xyzcompany.supabase.co/rest/v1/")).toBe("https://xyzcompany.supabase.co");
    expect(cleanUrl("https://xyzcompany.supabase.co/rest/v1")).toBe("https://xyzcompany.supabase.co");
    expect(cleanUrl("https://xyzcompany.supabase.co///")).toBe("https://xyzcompany.supabase.co");
    expect(cleanUrl("")).toBe("");
  });

  it("should accurately validate Supabase URLs", () => {
    expect(isValidSupabaseUrl("https://ojxldfqgqjhyfdfnaxoa.supabase.co")).toBe(true);
    expect(isValidSupabaseUrl("https://my-custom-domain.com")).toBe(true);
    // Invalid or placeholders
    expect(isValidSupabaseUrl("")).toBe(false);
    expect(isValidSupabaseUrl("https://your-project.supabase.co")).toBe(false);
    expect(isValidSupabaseUrl("https://placeholder-url.supabase.co")).toBe(false);
    expect(isValidSupabaseUrl("not-a-valid-url")).toBe(false);
  });

  it("should validate standard UUID v4 strings", () => {
    expect(isValidUuid("c8d5c412-9c99-4c12-87ef-7fb651db8f89")).toBe(true);
    expect(isValidUuid("00000000-0000-0000-0000-000000000000")).toBe(true);
    // Invalid UUIDs
    expect(isValidUuid("current_user")).toBe(false);
    expect(isValidUuid("user_12345")).toBe(false);
    expect(isValidUuid("")).toBe(false);
  });

  it("should correctly identify designated admin emails", () => {
    expect(isDesignatedAdminEmail("jerrostech@gmail.com")).toBe(true);
    expect(isDesignatedAdminEmail("admin@massagejohnny.com")).toBe(true);
    expect(isDesignatedAdminEmail("admin@jonnymatch.com")).toBe(true);
    expect(isDesignatedAdminEmail("superadmin@domain.com")).toBe(true);
    // Regular users
    expect(isDesignatedAdminEmail("johnny@gmail.com")).toBe(false);
    expect(isDesignatedAdminEmail("user@example.com")).toBe(false);
    expect(isDesignatedAdminEmail(undefined)).toBe(false);
  });
});

describe("Offline Storage & Privacy Service", () => {
  beforeEach(() => {
    // Clear mock localStorage if available
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
    }
  });

  it("should initialize default demo data and privacy settings", () => {
    initializeDemoDB();
    const privacy = privacyService.getSettings();
    expect(privacy).toBeDefined();
    expect(privacy.panic_button_enabled).toBe(true);
    expect(privacy.panic_redirect_url).toBe("https://www.standardmedia.co.ke/");
  });

  it("should persist and update privacy settings correctly", () => {
    const updated = {
      incognito_mode: true,
      hide_distance: true,
      blur_for_unverified: true,
      panic_button_enabled: true,
      panic_redirect_url: "https://www.google.com",
      discreet_mode: true,
    };
    privacyService.saveSettings(updated);
    const retrieved = privacyService.getSettings();
    expect(retrieved.incognito_mode).toBe(true);
    expect(retrieved.discreet_mode).toBe(true);
    expect(retrieved.panic_redirect_url).toBe("https://www.google.com");
  });
});
