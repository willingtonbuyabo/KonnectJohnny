/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from "@supabase/supabase-js";
import { Profile, Match, Message, UserProfile, MatchFilters, AppPrivacySettings } from "./types";
import { mockProfiles } from "./data/mockProfiles";

// Fetch from Vite environment variables
const supabaseUrl = ((import.meta as any).env.VITE_SUPABASE_URL || "").trim();
const supabaseAnonKey = ((import.meta as any).env.VITE_SUPABASE_ANON_KEY || "").trim();

// Initialize real Supabase client if credentials are provided
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const STORAGE_KEYS = {
  USER_PROFILE: "jonny_match_user_profile",
  SWIPES: "jonny_match_swipes",
  MATCHES: "jonny_match_matches",
  MESSAGES: "jonny_match_messages",
  PRIVACY: "jonny_match_privacy_settings",
};

/**
 * --- SUPABASE POSTGRES TABLE SETUP REFERENCE ---
 * 
 * If you are setting up your live Supabase database, create these tables:
 * 
 * -- 1. PROFILES TABLE
 * create table public.profiles (
 *   id uuid references auth.users on delete cascade primary key,
 *   name text not null,
 *   age integer not null,
 *   gender text not null,
 *   pronouns text,
 *   orientation text not null,
 *   bio text,
 *   images text[] default '{}',
 *   interests text[] default '{}',
 *   location_name text,
 *   distance_km float default 0,
 *   is_verified boolean default false,
 *   relationship_goals text[] default '{}',
 *   massage_affinity text,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * 
 * -- 2. SWIPES TABLE
 * create table public.swipes (
 *   id uuid default gen_random_uuid() primary key,
 *   swiper_id uuid references public.profiles(id) on delete cascade not null,
 *   swipee_id uuid references public.profiles(id) on delete cascade not null,
 *   action text check (action in ('like', 'pass', 'superlike')) not null,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null,
 *   unique(swiper_id, swipee_id)
 * );
 * 
 * -- 3. MATCHES TABLE
 * create table public.matches (
 *   id uuid default gen_random_uuid() primary key,
 *   user1_id uuid references public.profiles(id) on delete cascade not null,
 *   user2_id uuid references public.profiles(id) on delete cascade not null,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null,
 *   unique(user1_id, user2_id)
 * );
 * 
 * -- 4. MESSAGES TABLE
 * create table public.messages (
 *   id uuid default gen_random_uuid() primary key,
 *   match_id uuid references public.matches(id) on delete cascade not null,
 *   sender_id uuid references public.profiles(id) on delete cascade not null,
 *   receiver_id uuid references public.profiles(id) on delete cascade not null,
 *   text text not null,
 *   is_read boolean default false,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 */

// Helper to check if we are in Demo/Local mode
export const isDemoMode = () => !supabase;

// Set up robust localStorage-based storage engine for Demo mode
const getLocalStorageItem = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setLocalStorageItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Seed initial localStorage profiles if not present
const initializeDemoDB = () => {
  if (isDemoMode()) {
    // Seed privacy settings
    if (!localStorage.getItem(STORAGE_KEYS.PRIVACY)) {
      const defaultPrivacy: AppPrivacySettings = {
        incognito_mode: false,
        hide_distance: false,
        blur_for_unverified: false,
        panic_button_enabled: true,
        panic_redirect_url: "https://www.standardmedia.co.ke/", // Safe local news site in Kenya
        discreet_mode: false,
      };
      setLocalStorageItem(STORAGE_KEYS.PRIVACY, defaultPrivacy);
    }

    // Seed swiped list (swiper_id -> list of swipee_ids with action)
    if (!localStorage.getItem(STORAGE_KEYS.SWIPES)) {
      setLocalStorageItem(STORAGE_KEYS.SWIPES, {});
    }

    // Seed matches list
    if (!localStorage.getItem(STORAGE_KEYS.MATCHES)) {
      setLocalStorageItem(STORAGE_KEYS.MATCHES, []);
    }

    // Seed messages list
    if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
      // Create some default sweet messages to make the demo lively
      setLocalStorageItem(STORAGE_KEYS.MESSAGES, []);
    }

    // Seed current user profile
    if (!localStorage.getItem(STORAGE_KEYS.USER_PROFILE)) {
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
        massage_affinity: "Swedish Massage Enthusiast"
      };
      setLocalStorageItem(STORAGE_KEYS.USER_PROFILE, defaultUser);
    }
  }
};

initializeDemoDB();

export const supabaseService = {
  // === AUTHENTICATION ===
  auth: {
    async getCurrentUser(): Promise<UserProfile | null> {
      if (supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return null;

          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profile) {
            return {
              ...profile,
              email: user.email,
            } as UserProfile;
          }
          return null;
        } catch (e) {
          console.error("Supabase auth error, falling back", e);
        }
      }
      
      // Local demo fallback
      const localUser = getLocalStorageItem<UserProfile | null>(STORAGE_KEYS.USER_PROFILE, null);
      return localUser;
    },

    async signUp(email: string, password: string, profile: Omit<UserProfile, "id" | "is_verified">): Promise<UserProfile> {
      if (supabase) {
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

        const { error: profileError } = await supabase
          .from("profiles")
          .insert(newProfile);

        if (profileError) throw profileError;
        return newProfile;
      }

      // Local demo signUp
      const newLocalId = "user_" + Math.random().toString(36).substring(2, 11);
      const newLocalProfile: UserProfile = {
        id: newLocalId,
        ...profile,
        is_verified: true, // Auto-verify in local mode for fun
        email,
      };

      setLocalStorageItem(STORAGE_KEYS.USER_PROFILE, newLocalProfile);
      return newLocalProfile;
    },

    async signIn(email: string, password: string): Promise<UserProfile> {
      if (supabase) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Sign in failed");

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authData.user.id)
          .single();

        if (profileError) throw profileError;

        return {
          ...profile,
          email: authData.user.id,
        } as UserProfile;
      }

      // Local demo signIn
      let localUser = getLocalStorageItem<UserProfile | null>(STORAGE_KEYS.USER_PROFILE, null);
      if (!localUser) {
        // Create standard default
        initializeDemoDB();
        localUser = getLocalStorageItem<UserProfile>(STORAGE_KEYS.USER_PROFILE, {} as UserProfile);
      }
      // If logging in, let's keep the user or update their email
      localUser.email = email;
      setLocalStorageItem(STORAGE_KEYS.USER_PROFILE, localUser);
      return localUser;
    },

    async signOut(): Promise<void> {
      if (supabase) {
        await supabase.auth.signOut();
      }
      // Demo: just clear login session or keep local profile
    },
  },

  // === PROFILES ===
  profiles: {
    async getDiscoverableProfiles(filters: MatchFilters): Promise<Profile[]> {
      const currentUser = await supabaseService.auth.getCurrentUser();
      const currentUserId = currentUser ? currentUser.id : "current_user";

      if (supabase) {
        try {
          // 1. Fetch swiped IDs first to exclude them
          const { data: swipes } = await supabase
            .from("swipes")
            .select("swipee_id")
            .eq("swiper_id", currentUserId);

          const swipedIds = swipes ? swipes.map((s) => s.swipee_id) : [];
          swipedIds.push(currentUserId); // exclude self

          // 2. Fetch profiles with filters
          let query = supabase
            .from("profiles")
            .select("*")
            .not("id", "in", `(${swipedIds.join(",")})`);

          // Apply age range
          query = query.gte("age", filters.age_range[0]).lte("age", filters.age_range[1]);

          // Apply gender filter if specified and not empty
          if (filters.genders && filters.genders.length > 0) {
            query = query.in("gender", filters.genders);
          }

          const { data: profiles, error } = await query;
          if (error) throw error;

          // Locally filter by distance (Simulate distance calculations based on mock data)
          return (profiles || []).filter((p) => {
            const distance = p.distance_km || Math.floor(Math.random() * 20) + 1;
            return distance <= filters.max_distance;
          }) as Profile[];
        } catch (e) {
          console.error("Supabase profiles query error, using local mock", e);
        }
      }

      // Demo/Local profile fetching
      const localSwipes = getLocalStorageItem<Record<string, "like" | "pass" | "superlike">>(STORAGE_KEYS.SWIPES, {});
      const swipedIds = Object.keys(localSwipes);

      return mockProfiles.filter((p) => {
        // Exclude swiped profiles
        if (swipedIds.includes(p.id)) return false;

        // Apply filters
        const matchesAge = p.age >= filters.age_range[0] && p.age <= filters.age_range[1];
        const matchesDistance = p.distance_km <= filters.max_distance;
        
        const matchesGender = filters.genders.length === 0 || filters.genders.includes(p.gender);
        const matchesGoal = filters.relationship_goals.length === 0 || 
          p.relationship_goals.some(g => filters.relationship_goals.includes(g));

        return matchesAge && matchesDistance && matchesGender && matchesGoal;
      });
    },

    async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
      const currentUser = await supabaseService.auth.getCurrentUser();
      if (!currentUser) throw new Error("No current user found");

      if (supabase) {
        const { error } = await supabase
          .from("profiles")
          .update(profileData)
          .eq("id", currentUser.id);

        if (error) throw error;
        return { ...currentUser, ...profileData };
      }

      // Demo mode
      const updated = { ...currentUser, ...profileData };
      setLocalStorageItem(STORAGE_KEYS.USER_PROFILE, updated);
      return updated;
    },
  },

  // === SWIPES & MATCHES ===
  swipes: {
    async performSwipe(swipeeId: string, action: "like" | "pass" | "superlike"): Promise<{ is_match: boolean; match_id?: string; matched_profile?: Profile }> {
      const currentUser = await supabaseService.auth.getCurrentUser();
      const currentUserId = currentUser ? currentUser.id : "current_user";

      if (supabase) {
        // 1. Record swipe in database
        const { error: swipeError } = await supabase
          .from("swipes")
          .insert({
            swiper_id: currentUserId,
            swipee_id: swipeeId,
            action,
          });

        if (swipeError) throw swipeError;

        // 2. Check if the swipee has liked the swiper back (mutual swipe)
        if (action === "like" || action === "superlike") {
          const { data: mutualSwipe } = await supabase
            .from("swipes")
            .select("*")
            .eq("swiper_id", swipeeId)
            .eq("swipee_id", currentUserId)
            .in("action", ["like", "superlike"])
            .single();

          if (mutualSwipe) {
            // It's a MATCH! Create Match record
            const { data: match, error: matchError } = await supabase
              .from("matches")
              .insert({
                user1_id: currentUserId < swipeeId ? currentUserId : swipeeId,
                user2_id: currentUserId < swipeeId ? swipeeId : currentUserId,
              })
              .select("*")
              .single();

            if (matchError) throw matchError;

            // Fetch matched profile
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
      }

      // Demo/Local Swiping Engine
      const swipes = getLocalStorageItem<Record<string, "like" | "pass" | "superlike" | string>>(STORAGE_KEYS.SWIPES, {});
      swipes[swipeeId] = action;
      setLocalStorageItem(STORAGE_KEYS.SWIPES, swipes);

      // Check for mutual swipe
      if (action === "like" || action === "superlike") {
        // In local mode, let's create a match with a 65% probability for swiped-right profiles
        // to make the demo application highly interactive and fun!
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

            // Seed an automatic first message from the matched person
            const messages = getLocalStorageItem<Message[]>(STORAGE_KEYS.MESSAGES, []);
            const autoGreeting: Message = {
              id: "msg_auto_" + Math.random().toString(36).substring(2, 11),
              match_id: matchId,
              sender_id: swipeeId,
              receiver_id: currentUserId,
              text: `Hey there! I noticed you are a fan of ${matchedProfile.massage_affinity || 'wellness'}. Nice to meet you! ✨`,
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
      const currentUser = await supabaseService.auth.getCurrentUser();
      const currentUserId = currentUser ? currentUser.id : "current_user";

      if (supabase) {
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

          // Map to Match interface
          const matches: Match[] = (data || []).map((m: any) => {
            const otherProfile = m.user1_id === currentUserId ? m.profile2 : m.profile1;
            return {
              id: m.id,
              user_id: otherProfile.id,
              profile: otherProfile as Profile,
              created_at: m.created_at,
              unread_count: 0, // In dynamic apps, query read status
            };
          });

          return matches;
        } catch (e) {
          console.error("Supabase getMatches error", e);
        }
      }

      // Demo/Local
      return getLocalStorageItem<Match[]>(STORAGE_KEYS.MATCHES, []);
    },
  },

  // === CHAT / MESSAGES ===
  messages: {
    async getMessages(matchId: string): Promise<Message[]> {
      if (supabase) {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("match_id", matchId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        return data as Message[];
      }

      // Demo mode
      const allMessages = getLocalStorageItem<Message[]>(STORAGE_KEYS.MESSAGES, []);
      return allMessages.filter((m) => m.match_id === matchId).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    },

    async markMessagesAsRead(matchId: string): Promise<void> {
      const currentUser = await supabaseService.auth.getCurrentUser();
      const currentUserId = currentUser ? currentUser.id : "current_user";

      if (supabase) {
        try {
          // Attempt to update both is_read and read_at.
          // If read_at doesn't exist yet as a column, this will fail, and we fall back.
          const { error } = await supabase
            .from("messages")
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq("match_id", matchId)
            .eq("receiver_id", currentUserId)
            .eq("is_read", false);

          if (error) {
            // Fallback to only is_read if column is missing
            await supabase
              .from("messages")
              .update({ is_read: true })
              .eq("match_id", matchId)
              .eq("receiver_id", currentUserId)
              .eq("is_read", false);
          }
        } catch (e) {
          console.error("Supabase markMessagesAsRead error, falling back", e);
        }
        return;
      }

      // Demo mode
      const messages = getLocalStorageItem<Message[]>(STORAGE_KEYS.MESSAGES, []);
      let updated = false;
      const updatedMessages = messages.map((m) => {
        if (m.match_id === matchId && m.receiver_id === currentUserId && !m.is_read) {
          updated = true;
          return { ...m, is_read: true, read_at: new Date().toISOString() };
        }
        return m;
      });

      if (updated) {
        setLocalStorageItem(STORAGE_KEYS.MESSAGES, updatedMessages);
        
        // Update unread count in matches list
        const matchesList = getLocalStorageItem<Match[]>(STORAGE_KEYS.MATCHES, []);
        const updatedMatches = matchesList.map((m) => {
          if (m.id === matchId) {
            return { ...m, unread_count: 0 };
          }
          return m;
        });
        setLocalStorageItem(STORAGE_KEYS.MATCHES, updatedMatches);
        
        // Dispatch custom event to notify messages changed
        window.dispatchEvent(new CustomEvent("local_messages_updated", { detail: { matchId } }));
      }
    },

    async sendMessage(matchId: string, receiverId: string, text: string): Promise<Message> {
      const currentUser = await supabaseService.auth.getCurrentUser();
      const currentUserId = currentUser ? currentUser.id : "current_user";

      if (supabase) {
        const { data, error } = await supabase
          .from("messages")
          .insert({
            match_id: matchId,
            sender_id: currentUserId,
            receiver_id: receiverId,
            text,
          })
          .select("*")
          .single();

        if (error) throw error;
        return data as Message;
      }

      // Demo mode
      const messages = getLocalStorageItem<Message[]>(STORAGE_KEYS.MESSAGES, []);
      const newMsgId = "msg_" + Math.random().toString(36).substring(2, 11);
      const newMsg: Message = {
        id: newMsgId,
        match_id: matchId,
        sender_id: currentUserId,
        receiver_id: receiverId,
        text,
        created_at: new Date().toISOString(),
        is_read: false, // Starts as unread for the recipient!
      };

      setLocalStorageItem(STORAGE_KEYS.MESSAGES, [...messages, newMsg]);

      // Update match's last message
      const matches = getLocalStorageItem<Match[]>(STORAGE_KEYS.MATCHES, []);
      const updatedMatches = matches.map((m) => {
        if (m.id === matchId) {
          return {
            ...m,
            last_message: text,
            last_message_time: new Date().toISOString(),
            unread_count: 0,
          };
        }
        return m;
      });
      setLocalStorageItem(STORAGE_KEYS.MATCHES, updatedMatches);

      // Simulate the recipient reading the message after 1.2 seconds!
      setTimeout(() => {
        const currentMessages = getLocalStorageItem<Message[]>(STORAGE_KEYS.MESSAGES, []);
        let readUpdated = false;
        const readUpdatedMessages = currentMessages.map((m) => {
          if (m.id === newMsgId && !m.is_read) {
            readUpdated = true;
            return { ...m, is_read: true, read_at: new Date().toISOString() };
          }
          return m;
        });

        if (readUpdated) {
          setLocalStorageItem(STORAGE_KEYS.MESSAGES, readUpdatedMessages);
          window.dispatchEvent(new CustomEvent("local_messages_updated", { detail: { matchId } }));
        }
      }, 1200);

      // Trigger realistic mock replies from the match to simulate a lively, high fidelity chat experience (after 2.5 seconds)
      setTimeout(() => {
        const currentMessages = getLocalStorageItem<Message[]>(STORAGE_KEYS.MESSAGES, []);
        // Only trigger a reply if they sent a text (and not double-triggering)
        const matchedProfile = mockProfiles.find((p) => p.id === receiverId);
        
        if (matchedProfile) {
          const possibleReplies = [
            `That sounds amazing! Are you free this weekend? We could check out Alchemist Bar or head to Shamba Café. 🍹`,
            `Ah, that's beautiful! I honestly love the massage therapies at Massage Jonny. They have the most inclusive and relaxing environment. ✨`,
            `Totally agree! Discretion and safe queer spaces are so important here. Love that we matched!`,
            `Let's definitely plan a date. What parts of Nairobi do you usually hang out in? 🌸`,
            `Haha, that's super cool! Tell me more about what you do.`,
          ];
          const randomReply = possibleReplies[Math.floor(Math.random() * possibleReplies.length)];
          
          const autoReply: Message = {
            id: "msg_reply_" + Math.random().toString(36).substring(2, 11),
            match_id: matchId,
            sender_id: receiverId,
            receiver_id: currentUserId,
            text: randomReply,
            created_at: new Date().toISOString(),
            is_read: false,
          };

          setLocalStorageItem(STORAGE_KEYS.MESSAGES, [...currentMessages, autoReply]);
          
          // Update match last message again
          const matchesToUpdate = getLocalStorageItem<Match[]>(STORAGE_KEYS.MATCHES, []);
          const finalMatches = matchesToUpdate.map((m) => {
            if (m.id === matchId) {
              return {
                ...m,
                last_message: randomReply,
                last_message_time: new Date().toISOString(),
                unread_count: m.unread_count + 1,
              };
            }
            return m;
          });
          setLocalStorageItem(STORAGE_KEYS.MATCHES, finalMatches);

          // Custom event to notify components that messages changed
          window.dispatchEvent(new CustomEvent("local_messages_updated", { detail: { matchId } }));
        }
      }, 2600);

      return newMsg;
    },
  },

  // === PRIVACY SETTINGS ===
  privacy: {
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
      // Dispatch event to re-render or handle instant switches (e.g. discreet header)
      window.dispatchEvent(new CustomEvent("privacy_settings_updated", { detail: settings }));
    },
  },
};
