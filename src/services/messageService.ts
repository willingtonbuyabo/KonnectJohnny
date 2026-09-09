/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Message, Match } from "../types";
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

export const messageService = {
  async getMessages(matchId: string): Promise<Message[]> {
    if (supabase && !isDemoMode() && isValidUuid(matchId)) {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("match_id", matchId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        return data as Message[];
      } catch (e) {
        console.warn("[MessageService] Supabase getMessages error, falling back locally:", e);
        handleConnectionError(e);
      }
    }

    const allMessages = getLocalStorageItem<Message[]>(STORAGE_KEYS.MESSAGES, []);
    return allMessages
      .filter((m) => m.match_id === matchId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  },

  async markMessagesAsRead(matchId: string): Promise<void> {
    const currentUser = await authService.getCurrentUser();
    const currentUserId = currentUser ? currentUser.id : "current_user";

    if (supabase && !isDemoMode() && isValidUuid(matchId) && isValidUuid(currentUserId)) {
      try {
        const { error } = await supabase
          .from("messages")
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq("match_id", matchId)
          .eq("receiver_id", currentUserId)
          .eq("is_read", false);

        if (error) {
          await supabase
            .from("messages")
            .update({ is_read: true })
            .eq("match_id", matchId)
            .eq("receiver_id", currentUserId)
            .eq("is_read", false);
        }
      } catch (e) {
        console.warn("[MessageService] Supabase markMessagesAsRead error:", e);
        handleConnectionError(e);
      }
      return;
    }

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

      const matchesList = getLocalStorageItem<Match[]>(STORAGE_KEYS.MATCHES, []);
      const updatedMatches = matchesList.map((m) => {
        if (m.id === matchId) {
          return { ...m, unread_count: 0 };
        }
        return m;
      });
      setLocalStorageItem(STORAGE_KEYS.MATCHES, updatedMatches);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("local_messages_updated", { detail: { matchId } }));
      }
    }
  },

  async sendMessage(matchId: string, receiverId: string, text: string): Promise<Message> {
    const currentUser = await authService.getCurrentUser();
    const currentUserId = currentUser ? currentUser.id : "current_user";

    if (
      supabase &&
      !isDemoMode() &&
      isValidUuid(matchId) &&
      isValidUuid(currentUserId) &&
      isValidUuid(receiverId)
    ) {
      try {
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
      } catch (e) {
        console.warn("[MessageService] Supabase sendMessage error, saving locally:", e);
        handleConnectionError(e);
      }
    }

    // Local demo mode
    const messages = getLocalStorageItem<Message[]>(STORAGE_KEYS.MESSAGES, []);
    const newMsgId = "msg_" + Math.random().toString(36).substring(2, 11);
    const newMsg: Message = {
      id: newMsgId,
      match_id: matchId,
      sender_id: currentUserId,
      receiver_id: receiverId,
      text,
      created_at: new Date().toISOString(),
      is_read: false,
    };

    setLocalStorageItem(STORAGE_KEYS.MESSAGES, [...messages, newMsg]);

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

    // Recipient read timer simulation
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
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("local_messages_updated", { detail: { matchId } }));
        }
      }
    }, 1200);

    // Mock conversational reply
    setTimeout(() => {
      const currentMessages = getLocalStorageItem<Message[]>(STORAGE_KEYS.MESSAGES, []);
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

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("local_messages_updated", { detail: { matchId } }));
        }
      }
    }, 2600);

    return newMsg;
  },
};
