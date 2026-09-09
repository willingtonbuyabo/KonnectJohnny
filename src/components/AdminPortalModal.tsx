/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  UserCheck,
  Users,
  Crown,
  X,
  Server,
  Key,
  Sparkles,
} from "lucide-react";
import { UserProfile, SubscriptionTier, PaymentGatewayConfig } from "../types";
import { adminService } from "../services/adminService";
import { paymentService } from "../services/paymentService";
import { diagnosticsService, SupabaseHealthResult } from "../services/diagnosticsService";
import { motion } from "motion/react";

import { AdminOverviewTab } from "./admin/AdminOverviewTab";
import { AdminUsersTab } from "./admin/AdminUsersTab";
import { AdminVerificationsTab } from "./admin/AdminVerificationsTab";
import { AdminPaymentConfigTab } from "./admin/AdminPaymentConfigTab";
import { AdminProductionTab } from "./admin/AdminProductionTab";

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUpdateCurrentUser?: (updated: UserProfile) => void;
}

export default function AdminPortalModal({
  isOpen,
  onClose,
  currentUser,
  onUpdateCurrentUser,
}: AdminPortalModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "verifications" | "apikeys" | "production">("overview");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    pendingVerifications: 0,
    adminUsers: 0,
    totalMatches: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<string>("");

  const [paymentConfig, setPaymentConfig] = useState<PaymentGatewayConfig>({
    mpesa: {
      enabled: true,
      environment: "sandbox",
      consumerKey: "",
      consumerSecret: "",
      passkey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
      shortcode: "174379",
      callbackUrl: "https://yourdomain.com/api/payments/mpesa/callback",
    },
    stripe: {
      enabled: true,
      environment: "test",
      publishableKey: "",
      secretKey: "",
      webhookSecret: "",
    },
    updatedAt: new Date().toISOString(),
    updatedBy: "System Administrator",
  });

  const [supabaseHealth, setSupabaseHealth] = useState<{
    loading: boolean;
    result: SupabaseHealthResult | null;
  }>({ loading: false, result: null });

  useEffect(() => {
    if (isOpen) {
      loadAdminData();
      runSupabaseHealthCheck();
    }
  }, [isOpen]);

  const runSupabaseHealthCheck = async () => {
    setSupabaseHealth({ loading: true, result: null });
    const health = await diagnosticsService.checkSupabaseHealth();
    setSupabaseHealth({ loading: false, result: health });
  };

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [allUsers, systemStats, payConfig] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getSystemStats(),
        paymentService.getPaymentConfig(),
      ]);
      setUsers(allUsers);
      setStats(systemStats);
      setPaymentConfig(payConfig);
    } catch (err) {
      console.error("[AdminPortal] Failed to load admin portal data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3500);
  };

  const handleSavePaymentConfig = async () => {
    await paymentService.savePaymentConfig(paymentConfig, currentUser?.email);
    showToast("💾 Payment API Keys and Gateway settings securely saved to server!");
  };

  const handleToggleAdminRole = async (targetUser: UserProfile) => {
    const nextAdminState = !(targetUser.is_admin || targetUser.role === "admin");
    await adminService.updateUserRole(targetUser.id, nextAdminState);

    showToast(
      nextAdminState
        ? `Granted Admin privileges to ${targetUser.name}`
        : `Revoked Admin privileges from ${targetUser.name}`
    );

    if (currentUser && targetUser.id === currentUser.id && onUpdateCurrentUser) {
      onUpdateCurrentUser({
        ...currentUser,
        is_admin: nextAdminState,
        role: nextAdminState ? "admin" : "user",
      });
    }

    loadAdminData();
  };

  const handleToggleVerification = async (targetUser: UserProfile, approve: boolean) => {
    const status = approve ? "approved" : "rejected";
    await adminService.updateUserVerification(targetUser.id, approve, status);

    showToast(
      approve
        ? `✅ Approved & Verified profile for ${targetUser.name}`
        : `❌ Set profile status to Unverified for ${targetUser.name}`
    );

    if (currentUser && targetUser.id === currentUser.id && onUpdateCurrentUser) {
      onUpdateCurrentUser({
        ...currentUser,
        is_verified: approve,
        verification_status: status,
      });
    }

    loadAdminData();
  };

  const handleChangeSubscription = async (targetUser: UserProfile, tier: SubscriptionTier) => {
    await adminService.updateUserSubscription(targetUser.id, tier);
    showToast(`Updated subscription for ${targetUser.name} to ${tier.toUpperCase()}`);
    loadAdminData();
  };

  const handleSelfPromoteAdmin = async () => {
    if (!currentUser) return;
    await adminService.updateUserRole(currentUser.id, true);
    if (onUpdateCurrentUser) {
      onUpdateCurrentUser({
        ...currentUser,
        is_admin: true,
        role: "admin",
      });
    }
    showToast("🎉 Your account has been elevated to Administrator!");
    loadAdminData();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="w-full max-w-4xl bg-brand-plum border border-brand-gold/40 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden my-6 max-h-[92vh] flex flex-col"
      >
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-brand-obsidian/80 hover:bg-brand-obsidian text-brand-cream/70 hover:text-brand-cream transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6 shrink-0 pr-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-gold via-amber-300 to-brand-gold p-0.5 shadow-lg shadow-brand-gold/20 shrink-0">
            <div className="w-full h-full bg-brand-obsidian rounded-[14px] flex items-center justify-center">
              <Crown className="w-6 h-6 text-brand-gold" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-serif font-bold text-brand-cream">
                Admin Control Center
              </h2>
              <span className="bg-brand-gold text-brand-obsidian font-black text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow">
                Production Ready
              </span>
            </div>
            <p className="text-xs text-brand-cream/70 font-sans">
              Manage accounts, user verification authenticity, and Supabase production deployment
            </p>
          </div>
        </div>

        {/* Toast Notification Banner */}
        {notification && (
          <div className="mb-4 p-3 rounded-2xl bg-brand-obsidian border border-brand-gold/50 text-xs text-brand-cream flex items-center gap-2 shrink-0 animate-fade-in shadow-lg">
            <Sparkles className="w-4 h-4 text-brand-gold shrink-0" />
            <span className="font-medium">{notification}</span>
          </div>
        )}

        {/* Admin Navigation Tabs */}
        <div className="flex bg-brand-obsidian/90 rounded-2xl p-1 mb-5 border border-brand-lavender/30 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-brand-gold text-brand-obsidian shadow-md"
                : "text-brand-cream/60 hover:text-brand-cream"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Overview & Stats
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === "users"
                ? "bg-brand-gold text-brand-obsidian shadow-md"
                : "text-brand-cream/60 hover:text-brand-cream"
            }`}
          >
            <Users className="w-4 h-4" />
            Manage Accounts ({users.length})
          </button>

          <button
            onClick={() => setActiveTab("verifications")}
            className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap relative ${
              activeTab === "verifications"
                ? "bg-brand-gold text-brand-obsidian shadow-md"
                : "text-brand-cream/60 hover:text-brand-cream"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Selfie Reviews
            {stats.pendingVerifications > 0 && (
              <span className="bg-amber-500 text-brand-obsidian text-[9px] font-black rounded-full px-1.5 py-0.2 ml-1">
                {stats.pendingVerifications}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("apikeys")}
            className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === "apikeys"
                ? "bg-brand-gold text-brand-obsidian shadow-md"
                : "text-brand-cream/60 hover:text-brand-cream"
            }`}
          >
            <Key className="w-4 h-4" />
            M-Pesa & Stripe Keys
          </button>

          <button
            onClick={() => setActiveTab("production")}
            className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === "production"
                ? "bg-brand-gold text-brand-obsidian shadow-md"
                : "text-brand-cream/60 hover:text-brand-cream"
            }`}
          >
            <Server className="w-4 h-4" />
            cPanel & SQL Guide
          </button>
        </div>

        {/* TAB 1: OVERVIEW & STATS */}
        {activeTab === "overview" && (
          <AdminOverviewTab
            stats={stats}
            currentUser={currentUser}
            users={users}
            supabaseHealth={supabaseHealth}
            onRunSupabaseHealthCheck={runSupabaseHealthCheck}
            onSelfPromoteAdmin={handleSelfPromoteAdmin}
            onToggleAdminRole={handleToggleAdminRole}
            onRefreshData={loadAdminData}
          />
        )}

        {/* TAB 2: MANAGE USER ACCOUNTS */}
        {activeTab === "users" && (
          <AdminUsersTab
            users={users}
            onToggleAdminRole={handleToggleAdminRole}
            onToggleVerification={handleToggleVerification}
            onChangeSubscription={handleChangeSubscription}
          />
        )}

        {/* TAB 3: SELFIE REVIEWS */}
        {activeTab === "verifications" && (
          <AdminVerificationsTab
            users={users}
            onToggleVerification={handleToggleVerification}
          />
        )}

        {/* TAB 4: API KEYS & PAYMENT GATEWAYS */}
        {activeTab === "apikeys" && (
          <AdminPaymentConfigTab
            paymentConfig={paymentConfig}
            setPaymentConfig={setPaymentConfig}
            onSavePaymentConfig={handleSavePaymentConfig}
          />
        )}

        {/* TAB 5: PRODUCTION & CPANEL DEPLOYMENT GUIDE */}
        {activeTab === "production" && <AdminProductionTab />}
      </motion.div>
    </div>
  );
}
