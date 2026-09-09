/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { STORAGE_KEYS } from "./storage";

// Fetch from Vite environment variables
const rawSupabaseUrl = ((import.meta as any).env?.VITE_SUPABASE_URL || "").trim();
const supabaseAnonKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "").trim();

export const cleanUrl = (url: string): string => {
  let cleaned = (url || "").trim();
  if (cleaned.endsWith("/rest/v1/")) {
    cleaned = cleaned.slice(0, -9);
  } else if (cleaned.endsWith("/rest/v1")) {
    cleaned = cleaned.slice(0, -8);
  }
  return cleaned.replace(/\/+$/, "");
};

export const supabaseUrl = cleanUrl(rawSupabaseUrl);

export function isDesignatedAdminEmail(email?: string): boolean {
  if (!email) return false;
  const lower = email.trim().toLowerCase();
  return (
    lower === "jerrostech@gmail.com" ||
    lower.startsWith("admin@") ||
    lower.includes("admin") ||
    lower === "admin@massagejohnny.com" ||
    lower === "admin@jonnymatch.com"
  );
}

export const isValidSupabaseUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (typeof window !== "undefined" && parsed.origin === window.location.origin) return false;

    const host = parsed.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1") return false;
    if (host.includes("placeholder") || host.includes("your-") || host.includes("your_")) return false;

    if (
      url.includes("europe-west2.run.app") ||
      url.includes("ai.studio/build") ||
      url.includes("ais-dev") ||
      url.includes("ais-pre")
    ) {
      return false;
    }

    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
};

export const isValidUuid = (id: string): boolean => {
  if (!id) return false;
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(id);
};

export const supabase: SupabaseClient | null =
  supabaseUrl &&
  supabaseAnonKey &&
  isValidSupabaseUrl(supabaseUrl) &&
  !supabaseAnonKey.toLowerCase().includes("placeholder")
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export let hasConnectionError = false;

export const setConnectionError = (val: boolean): void => {
  if (val && !hasConnectionError) {
    console.warn("Supabase connection issue detected. Falling back to local offline-first storage.");
  }
  hasConnectionError = val;
};

export const handleConnectionError = (e: any): void => {
  if (!e) return;
  const msg = String(e.message || e).toLowerCase();
  if (
    msg.includes("fetch") ||
    msg.includes("network") ||
    msg.includes("cors") ||
    msg.includes("unreachable") ||
    msg.includes("failed to fetch") ||
    e.name === "TypeError"
  ) {
    setConnectionError(true);
  }
};

export const isDemoMode = (): boolean => {
  if (typeof window === "undefined") return true;
  const forceDemo = localStorage.getItem(STORAGE_KEYS.DEMO_MODE) === "true";
  return !supabase || forceDemo || hasConnectionError;
};
