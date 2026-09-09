/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Match, Profile, Message } from "../types";
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

export const matchService = {
  async performSwipe(
    swipeeId: string,
    action: "like" | "pass" | "superlike"
  ): Promise<{ is_match: boolean; match_id?: string; matched_profile?: Profile }> {
    const currentUser = await authService.getCurrentUser();
    const currentUserId = currentUser ? currentUser.id : "current_user";

    if (supabase && !isDemoMode() && isValidUuid(currentUserId) && isValidUuid(swipeeId)) {
      try {
        const { error: swipeError } = await supabase.from("swipes").insert({
          swiper_id: currentUserId,
          swipee_id: swipeeId,
          action,
        });

        if (swipeError) throw swipeError;

        if (action === "like" || action === "superlike") {
          const { data: mutualSwipe } = await supabase
            .from("swipes")
            .select("*")
            .eq("swiper_id", swipeeId)
            .eq("swipee_id", currentUserId)
            .in("action", ["like", "superlike"])
            .single();

          if (mutualSwipe) {
            const { data: match, error: matchError } = await supabase
              .from("matches")
              .insert({
                user1_id: currentUserId < swipeeId ? currentUserId : swipeeId,
                user2_id: currentUserId < swipeeId ? swipeeId : currentUserId,
              })
              .select("*")
              .single();

            if (matchError) throw matchError;

            const { data: matchedProfile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", swipeeId)
              .single();

            return {
              is_match: true,
              match_id: match.id,
              matched_profile: matchedProfile as Profile,
            };
          }
        }

        return { is_match: false };
      } catch (dbErr) {
        console.warn("[MatchService] Supabase swipe error, using local engine:", dbErr);
        handleConnectionError(dbErr);
      }
    }

    // Local Swiping Engine
    const swipes = getLocalStorageItem<Record<string, "like" | "pass" | "superlike" | string>>(
      STORAGE_KEYS.SWIPES,
      {}
    );
    swipes[swipeeId] = action;
    setLocalStorageItem(STORAGE_KEYS.SWIPES, swipes);

    if (action === "like" || action === "superlike") {
      const shouldMatch = Math.random() < 0.65;
      if (shouldMatch) {
        const matchedProfile = mockProfiles.find((p) => p.id === swipeeId);
        if (matchedProfile) {
          const matchId = "match_" + Math.random().toString(36).substring(2, 11);
          const matches = getLocalStorageItem<Match[]>(STORAGE_KEYS.MATCHES, []);

          const newMatch: Match = {
            id: matchId,
            user_id: swipeeId,
            profile: matchedProfile,
            created_at: new Date().toISOString(),
            unread_count: 1,
            last_message: "You connected! Ask them about their favorite massage therapy.",
            last_message_time: new Date().toISOString(),
          };

          setLocalStorageItem(STORAGE_KEYS.MATCHES, [newMatch, ...matches]);

          // Seed automatic first message
          const messages = getLocalStorageItem<Message[]>(STORAGE_KEYS.MESSAGES, []);
          const autoGreeting: Message = {
            id: "msg_auto_" + Math.random().toString(36).substring(2, 11),
            match_id: matchId,
            sender_id: swipeeId,
            receiver_id: currentUserId,
            text: `Hey there! I noticed you are a fan of ${matchedProfile.massage_affinity || "wellness"}. Nice to meet you! ✨`,
            created_at: new Date().toISOString(),
            is_read: false,
          };
          setLocalStorageItem(STORAGE_KEYS.MESSAGES, [...messages, autoGreeting]);

          return {
            is_match: true,
            match_id: matchId,
            matched_profile: matchedProfile,
          };
        }
      }
    }

    return { is_match: false };
  },

  async getMatches(): Promise<Match[]> {
    const currentUser = await authService.getCurrentUser();
    const currentUserId = currentUser ? currentUser.id : "current_user";

    if (supabase && !isDemoMode() && isValidUuid(currentUserId)) {
      try {
        const { data, error } = await supabase
          .from("matches")
          .select(`
            id,
            created_at,
            user1_id,
            user2_id,
            profile1:profiles!user1_id(*),
            profile2:profiles!user2_id(*)
          `)
          .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`);

        if (error) throw error;

        const matches: Match[] = (data || []).map((m: any) => {
          const otherProfile = m.user1_id === currentUserId ? m.profile2 : m.profile1;
          return {
            id: m.id,
            user_id: otherProfile.id,
            profile: otherProfile as Profile,
            created_at: m.created_at,
            unread_count: 0,
          };
        });

        return matches;
      } catch (e) {
        console.warn("[MatchService] Supabase getMatches failed, using local storage:", e);
        handleConnectionError(e);
      }
    }

    return getLocalStorageItem<Match[]>(STORAGE_KEYS.MATCHES, []);
  },
};
