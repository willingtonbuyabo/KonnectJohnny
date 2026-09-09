/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, SubscriptionTier, Match, PaymentGatewayConfig, MpesaConfig, StripeConfig } from "../types";
import { mockProfiles } from "../data/mockProfiles";
import {
  supabase,
  isDemoMode,
  isValidUuid,
  isDesignatedAdminEmail,
} from "./supabaseClient";
import {
  STORAGE_KEYS,
  getLocalStorageItem,
  setLocalStorageItem,
} from "./storage";
import { paymentService } from "./paymentService";

export const adminService = {
  async getAllUsers(): Promise<UserProfile[]> {
    let dbProfiles: UserProfile[] = [];
    if (supabase && !isDemoMode()) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) {
          dbProfiles = data as UserProfile[];
        }
      } catch (err) {
        console.warn("[AdminService] Could not fetch all users from Supabase:", err);
      }
    }

    const currentLocal = getLocalStorageItem<UserProfile | null>(STORAGE_KEYS.USER_PROFILE, null);
    const allMap = new Map<string, UserProfile>();

    if (currentLocal) {
      const isAdmin = currentLocal.is_admin || isDesignatedAdminEmail(currentLocal.email);
      allMap.set(currentLocal.id, {
        ...currentLocal,
        is_admin: isAdmin,
        role: isAdmin ? "admin" : currentLocal.role || "user",
      });
    }

    dbProfiles.forEach((p) => {
      const email = p.email || (p.id === currentLocal?.id ? currentLocal.email : undefined);
      const isAdmin = p.is_admin || isDesignatedAdminEmail(email);
      allMap.set(p.id, {
        ...p,
        email,
        is_admin: isAdmin,
        role: isAdmin ? "admin" : p.role || "user",
      });
    });

    mockProfiles.forEach((m) => {
      if (!allMap.has(m.id)) {
        allMap.set(m.id, {
          ...m,
          email: `${m.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
          is_admin: false,
          role: "user",
        });
      }
    });

    return Array.from(allMap.values());
  },

  async updateUserRole(userId: string, isAdmin: boolean): Promise<boolean> {
    const role = isAdmin ? "admin" : "user";
    if (supabase && !isDemoMode() && isValidUuid(userId)) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ is_admin: isAdmin, role })
          .eq("id", userId);

        if (error) console.warn("[AdminService] Supabase admin role update warning:", error);
      } catch (e) {
        console.warn("[AdminService] Supabase admin role update exception:", e);
      }
    }

    const current = getLocalStorageItem<UserProfile | null>(STORAGE_KEYS.USER_PROFILE, null);
    if (current && current.id === userId) {
      setLocalStorageItem(STORAGE_KEYS.USER_PROFILE, {
        ...current,
        is_admin: isAdmin,
        role,
      });
    }
    return true;
  },

  async updateUserVerification(
    userId: string,
    isVerified: boolean,
    status: "unverified" | "pending" | "approved" | "rejected" = isVerified ? "approved" : "unverified"
  ): Promise<boolean> {
    if (supabase && !isDemoMode() && isValidUuid(userId)) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({
            is_verified: isVerified,
            verification_status: status,
          })
          .eq("id", userId);

        if (error) console.warn("[AdminService] Supabase verification update warning:", error);
      } catch (e) {
        console.warn("[AdminService] Supabase verification update exception:", e);
      }
    }

    const current = getLocalStorageItem<UserProfile | null>(STORAGE_KEYS.USER_PROFILE, null);
    if (current && current.id === userId) {
      setLocalStorageItem(STORAGE_KEYS.USER_PROFILE, {
        ...current,
        is_verified: isVerified,
        verification_status: status,
      });
    }
    return true;
  },

  async updateUserSubscription(userId: string, tier: SubscriptionTier): Promise<boolean> {
    if (supabase && !isDemoMode() && isValidUuid(userId)) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ subscription_tier: tier })
          .eq("id", userId);

        if (error) console.warn("[AdminService] Supabase subscription update warning:", error);
      } catch (e) {
        console.warn("[AdminService] Supabase subscription update exception:", e);
      }
    }

    const current = getLocalStorageItem<UserProfile | null>(STORAGE_KEYS.USER_PROFILE, null);
    if (current && current.id === userId) {
      setLocalStorageItem(STORAGE_KEYS.USER_PROFILE, {
        ...current,
        subscription_tier: tier,
      });
    }
    return true;
  },

  async getSystemStats(): Promise<{
    totalUsers: number;
    verifiedUsers: number;
    pendingVerifications: number;
    adminUsers: number;
    totalMatches: number;
  }> {
    const users = await this.getAllUsers();
    const matches = getLocalStorageItem<Match[]>(STORAGE_KEYS.MATCHES, []);

    return {
      totalUsers: users.length,
      verifiedUsers: users.filter((u) => u.is_verified || u.verification_status === "approved").length,
      pendingVerifications: users.filter((u) => u.verification_status === "pending").length,
      adminUsers: users.filter((u) => u.is_admin || u.role === "admin" || isDesignatedAdminEmail(u.email)).length,
      totalMatches: matches.length,
    };
  },

  // Payment gateways delegation to paymentService
  async getPaymentConfig(): Promise<PaymentGatewayConfig> {
    return await paymentService.getPaymentConfig();
  },

  async savePaymentConfig(config: PaymentGatewayConfig): Promise<boolean> {
    await paymentService.savePaymentConfig(config);
    return true;
  },

  async testMpesaConnection(mpesa: MpesaConfig): Promise<{ success: boolean; message: string }> {
    const result = await paymentService.testMpesaConnection(mpesa);
    return {
      success: result.success,
      message: result.message,
    };
  },

  async testStripeConnection(stripe: StripeConfig): Promise<{ success: boolean; message: string }> {
    const result = await paymentService.testStripeConnection(stripe);
    return {
      success: result.success,
      message: result.message,
    };
  },
};
