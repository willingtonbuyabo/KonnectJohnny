/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Profile, UserProfile, MatchFilters } from "../types";
import { mockProfiles } from "../data/mockProfiles";
import {
  supabase,
  isDemoMode,
  isValidUuid,
  handleConnectionError,
} from "./supabaseClient";
import {
  STORAGE_KEYS,
  getLocalStorageItem,
  setLocalStorageItem,
} from "./storage";
import { authService } from "./authService";

export const profileService = {
  async getDiscoverableProfiles(filters: MatchFilters): Promise<Profile[]> {
    const currentUser = await authService.getCurrentUser();
    const currentUserId = currentUser ? currentUser.id : "current_user";

    if (supabase && !isDemoMode() && isValidUuid(currentUserId)) {
      try {
        const { data: swipes, error: swipesError } = await supabase
          .from("swipes")
          .select("swipee_id")
          .eq("swiper_id", currentUserId);

        if (swipesError) throw swipesError;

        const swipedIds = swipes ? swipes.map((s) => s.swipee_id) : [];
        swipedIds.push(currentUserId);

        const validSwipedIds = swipedIds.filter((id) => isValidUuid(id));

        let query = supabase.from("profiles").select("*");

        if (validSwipedIds.length > 0) {
          query = query.not("id", "in", `(${validSwipedIds.join(",")})`);
        }

        query = query.gte("age", filters.age_range[0]).lte("age", filters.age_range[1]);

        if (filters.genders && filters.genders.length > 0) {
          query = query.in("gender", filters.genders);
        }

        const { data: profiles, error } = await query;
        if (error) throw error;

        return (profiles || []).filter((p) => {
          const distance = p.distance_km || Math.floor(Math.random() * 20) + 1;
          return distance <= filters.max_distance;
        }) as Profile[];
      } catch (e) {
        console.warn("[ProfileService] Supabase query failed, falling back to mock profiles:", e);
        handleConnectionError(e);
      }
    }

    // Demo/Local profile filtering
    const localSwipes = getLocalStorageItem<Record<string, "like" | "pass" | "superlike">>(
      STORAGE_KEYS.SWIPES,
      {}
    );
    const swipedIds = Object.keys(localSwipes);

    return mockProfiles.filter((p) => {
      if (swipedIds.includes(p.id)) return false;

      const matchesAge = p.age >= filters.age_range[0] && p.age <= filters.age_range[1];
      const matchesDistance = p.distance_km <= filters.max_distance;
      const matchesGender = filters.genders.length === 0 || filters.genders.includes(p.gender);
      const matchesGoal =
        filters.relationship_goals.length === 0 ||
        p.relationship_goals.some((g) => filters.relationship_goals.includes(g));

      return matchesAge && matchesDistance && matchesGender && matchesGoal;
    });
  },

  async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    let currentUser = await authService.getCurrentUser();

    if (!currentUser) {
      currentUser = {
        id: profileData.id || "current_user",
        name: profileData.name || "Jonny Guest",
        age: profileData.age || 26,
        gender: profileData.gender || "Non-binary",
        pronouns: profileData.pronouns || "They/Them",
        orientation: profileData.orientation || "Queer",
        bio: profileData.bio || "Exploring connections...",
        images: profileData.images || [],
        interests: profileData.interests || [],
        location_name: profileData.location_name || "Kilimani, Nairobi",
        distance_km: profileData.distance_km || 0,
        is_verified: profileData.is_verified || false,
        relationship_goals: profileData.relationship_goals || [],
        massage_affinity: profileData.massage_affinity || "",
        email: profileData.email || "demo@massagejohnny.com",
      };
    }

    if (supabase && !isDemoMode() && isValidUuid(currentUser.id)) {
      try {
        const { error } = await supabase.from("profiles").upsert({
          id: currentUser.id,
          ...currentUser,
          ...profileData,
          email: currentUser.email,
        });

        if (error) {
          console.warn("[ProfileService] Supabase profile upsert warning:", error);
        }
      } catch (dbErr) {
        console.warn("[ProfileService] Exception during profile upsert:", dbErr);
        handleConnectionError(dbErr);
      }

      const updated = { ...currentUser, ...profileData };
      setLocalStorageItem(STORAGE_KEYS.USER_PROFILE, updated);
      return updated;
    }

    const updated = { ...currentUser, ...profileData };
    setLocalStorageItem(STORAGE_KEYS.USER_PROFILE, updated);
    return updated;
  },

  async submitVerificationSelfie(userId: string, selfieUrl: string): Promise<boolean> {
    const patch = {
      verification_selfie_url: selfieUrl,
      verification_status: "pending" as const,
      verification_submitted_at: new Date().toISOString(),
    };
    await this.updateProfile(patch);
    return true;
  },
};
