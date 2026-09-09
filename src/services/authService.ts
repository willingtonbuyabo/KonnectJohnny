/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile } from "../types";
import {
  supabase,
  hasConnectionError,
  handleConnectionError,
  isDemoMode,
  isValidUuid,
} from "./supabaseClient";
import {
  STORAGE_KEYS,
  getLocalStorageItem,
  setLocalStorageItem,
  initializeDemoDB,
} from "./storage";

export const authService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    const forceDemo = typeof window !== "undefined" && localStorage.getItem(STORAGE_KEYS.DEMO_MODE) === "true";
    if (supabase && !forceDemo) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          const result = {
            ...profile,
            email: user.email,
          } as UserProfile;
          setLocalStorageItem(STORAGE_KEYS.USER_PROFILE, result);
          return result;
        }

        const cachedProfile = getLocalStorageItem<UserProfile | null>(STORAGE_KEYS.USER_PROFILE, null);
        if (cachedProfile && cachedProfile.id === user.id) {
          return {
            ...cachedProfile,
            email: user.email || cachedProfile.email,
          };
        }

        const defaultProfile: UserProfile = {
          id: user.id,
          name: user.email?.split("@")[0] || "Jonny Guest",
          age: 26,
          gender: "Non-binary",
          pronouns: "They/Them",
          orientation: "Queer",
          bio: "Exploring connections...",
          location_name: "Kilimani, Nairobi",
          distance_km: 0,
          images: ["https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600"],
          interests: ["Coffee", "Art", "Yoga"],
          is_verified: true,
          relationship_goals: ["Dating"],
          massage_affinity: "Swedish Massage Enthusiast",
          email: user.email || "",
        };

        setLocalStorageItem(STORAGE_KEYS.USER_PROFILE, defaultProfile);

        try {
          await supabase.from("profiles").insert(defaultProfile);
        } catch (insertErr) {
          console.warn("[Auth] Could not auto-insert default profile:", insertErr);
        }
        return defaultProfile;
      } catch (e) {
        console.error("[Auth] Supabase auth error, falling back:", e);
        handleConnectionError(e);
      }
    }

    return getLocalStorageItem<UserProfile | null>(STORAGE_KEYS.USER_PROFILE, null);
  },

  async signUp(
    email: string,
    password: string,
    profile: Omit<UserProfile, "id" | "is_verified">
  ): Promise<UserProfile> {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.DEMO_MODE, "false");
    }

    if (supabase && !hasConnectionError) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Sign up failed");

        const newProfile: UserProfile = {
          id: authData.user.id,
          ...profile,
          is_verified: false,
          email,
        };

        try {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert(newProfile);

          if (profileError) {
            console.warn("[Auth] Profiles table insert warning:", profileError);
          }
        } catch (dbErr) {
          console.warn("[Auth] Profiles insert exception:", dbErr);
        }

        setLocalStorageItem(STORAGE_KEYS.USER_PROFILE, newProfile);
        return newProfile;
      } catch (authErr: any) {
        console.warn("[Auth] Supabase signUp failed, using fallback:", authErr);
        handleConnectionError(authErr);
        const msg = String(authErr?.message || authErr).toLowerCase();
        if (!msg.includes("fetch") && !msg.includes("network") && !msg.includes("failed")) {
          throw authErr;
        }
      }
    }

    // Local demo signup
    const newLocalId = "user_" + Math.random().toString(36).substring(2, 11);
    const newLocalProfile: UserProfile = {
      id: newLocalId,
      ...profile,
      is_verified: true,
      email,
    };

    setLocalStorageItem(STORAGE_KEYS.USER_PROFILE, newLocalProfile);
    return newLocalProfile;
  },

  async signIn(email: string, password: string, forceDemo?: boolean): Promise<UserProfile> {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.DEMO_MODE, forceDemo ? "true" : "false");
    }

    if (supabase && !forceDemo && !hasConnectionError) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Sign in failed");

        let profile: UserProfile | null = null;
        try {
          const { data, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authData.user.id)
            .single();

          if (!profileError && data) {
            profile = data as UserProfile;
          }
        } catch (err) {
          console.warn("[Auth] Profile fetch exception:", err);
        }

        if (!profile) {
          profile = {
            id: authData.user.id,
            name: email.split("@")[0] || "Jonny Guest",
            age: 26,
            gender: "Non-binary",
            pronouns: "They/Them",
            orientation: "Queer",
            bio: "Exploring connections...",
            location_name: "Kilimani, Nairobi",
            distance_km: 0,
            images: ["https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600"],
            interests: ["Coffee", "Art", "Yoga"],
            is_verified: true,
            relationship_goals: ["Dating"],
            massage_affinity: "Swedish Massage Enthusiast",
            email: authData.user.email || email,
          };

          try {
            await supabase.from("profiles").insert(profile);
          } catch (e) {
            console.warn("[Auth] Could not insert default profile:", e);
          }
        }

        const loggedInProfile: UserProfile = {
          ...profile,
          email: authData.user.email || email,
        };

        setLocalStorageItem(STORAGE_KEYS.USER_PROFILE, loggedInProfile);
        return loggedInProfile;
      } catch (authErr: any) {
        console.warn("[Auth] Supabase signIn error:", authErr);
        handleConnectionError(authErr);
        const msg = String(authErr?.message || authErr).toLowerCase();
        if (!msg.includes("fetch") && !msg.includes("network") && !msg.includes("failed")) {
          throw authErr;
        }
      }
    }

    let localUser = getLocalStorageItem<UserProfile | null>(STORAGE_KEYS.USER_PROFILE, null);
    if (!localUser) {
      initializeDemoDB();
      localUser = getLocalStorageItem<UserProfile>(STORAGE_KEYS.USER_PROFILE, {} as UserProfile);
    }
    localUser.email = email;
    setLocalStorageItem(STORAGE_KEYS.USER_PROFILE, localUser);
    return localUser;
  },

  async signOut(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.DEMO_MODE, "false");
    }
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn("[Auth] Supabase signOut error:", e);
        handleConnectionError(e);
      }
    }
  },
};
