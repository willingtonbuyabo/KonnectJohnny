/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
  Lock,
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  Crown,
  Copy,
  Check,
  X,
  RefreshCw,
  SlidersHorizontal,
  Server,
  Key,
  Globe,
  Database,
  UserPlus,
  Camera,
  CreditCard,
  Smartphone,
  Eye,
  EyeOff,
  Save,
  Zap,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { UserProfile, SubscriptionTier, PaymentGatewayConfig } from "../types";
import { supabaseService, isDesignatedAdminEmail } from "../supabaseService";
import { motion, AnimatePresence } from "motion/react";

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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "verified" | "unverified">("all");
  const [selectedSelfieUser, setSelectedSelfieUser] = useState<UserProfile | null>(null);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [notification, setNotification] = useState<string>("");

  // Payment API Keys state
  const [paymentConfig, setPaymentConfig] = useState<PaymentGatewayConfig>(() =>
    supabaseService.admin.getPaymentConfig()
  );
  const [showMpesaSecret, setShowMpesaSecret] = useState<boolean>(false);
  const [showMpesaPasskey, setShowMpesaPasskey] = useState<boolean>(false);
  const [showStripeSecret, setShowStripeSecret] = useState<boolean>(false);
  const [showStripeWebhook, setShowStripeWebhook] = useState<boolean>(false);
  const [testResultMpesa, setTestResultMpesa] = useState<{ success?: boolean; message?: string }>({});
  const [testResultStripe, setTestResultStripe] = useState<{ success?: boolean; message?: string }>({});


  useEffect(() => {
    if (isOpen) {
      loadAdminData();
    }
  }, [isOpen]);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const allUsers = await supabaseService.admin.getAllUsers();
      const systemStats = await supabaseService.admin.getSystemStats();
      const payConfig = supabaseService.admin.getPaymentConfig();
      setUsers(allUsers);
      setStats(systemStats);
      setPaymentConfig(payConfig);
    } catch (err) {
      console.error("Failed to load admin portal data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePaymentConfig = () => {
    supabaseService.admin.savePaymentConfig(paymentConfig);
    showToast("💾 Payment API Keys and Gateway settings saved successfully!");
  };

  const handleTestMpesa = async () => {
    const res = await supabaseService.admin.testMpesaConnection(paymentConfig.mpesa);
    setTestResultMpesa(res);
  };

  const handleTestStripe = async () => {
    const res = await supabaseService.admin.testStripeConnection(paymentConfig.stripe);
    setTestResultStripe(res);
  };

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3500);
  };

  // Admin User Role Toggle
  const handleToggleAdminRole = async (targetUser: UserProfile) => {
    const nextAdminState = !(targetUser.is_admin || targetUser.role === "admin");
    await supabaseService.admin.updateUserRole(targetUser.id, nextAdminState);
    
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

  // Admin Verification Toggle
  const handleToggleVerification = async (targetUser: UserProfile, approve: boolean) => {
    const status = approve ? "approved" : "rejected";
    await supabaseService.admin.updateUserVerification(targetUser.id, approve, status);

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

  // Admin Subscription Tier Toggle
  const handleChangeSubscription = async (targetUser: UserProfile, tier: SubscriptionTier) => {
    await supabaseService.admin.updateUserSubscription(targetUser.id, tier);
    showToast(`Updated subscription for ${targetUser.name} to ${tier.toUpperCase()}`);
    loadAdminData();
  };

  // Promote current logged-in user to Admin
  const handleSelfPromoteAdmin = async () => {
    if (!currentUser) return;
    await supabaseService.admin.updateUserRole(currentUser.id, true);
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

  // Filtered user list
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.location_name.toLowerCase().includes(searchQuery.toLowerCase());

    const isAdmin = u.is_admin || u.role === "admin" || isDesignatedAdminEmail(u.email);
    const matchesRole =
      roleFilter === "all" ? true : roleFilter === "admin" ? isAdmin : !isAdmin;

    const isVerified = u.is_verified || u.verification_status === "approved";
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "pending"
        ? u.verification_status === "pending"
        : statusFilter === "verified"
        ? isVerified
        : !isVerified;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // SQL Migration Script for Supabase Table & RLS Setup
  const supabaseSqlScript = `-- ========================================================
-- JONNY MATCH / KONNECT - SUPABASE PRODUCTION DATABASE SCHEMA
-- Execute this SQL in your Supabase SQL Editor
-- ========================================================

-- 1. Create Profiles Table with Verification & Admin Support
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  age INTEGER DEFAULT 25,
  gender TEXT DEFAULT 'Non-binary',
  pronouns TEXT DEFAULT 'They/Them',
  orientation TEXT DEFAULT 'Queer',
  bio TEXT DEFAULT '',
  location_name TEXT DEFAULT 'Nairobi, Kenya',
  distance_km NUMERIC DEFAULT 5,
  images TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  relationship_goals TEXT[] DEFAULT '{}',
  massage_affinity TEXT DEFAULT '',
  is_verified BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'user',
  verification_selfie_url TEXT,
  verification_status TEXT DEFAULT 'unverified',
  verification_submitted_at TIMESTAMPTZ,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Swipes Table
CREATE TABLE IF NOT EXISTS public.swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  swipee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('like', 'pass', 'superlike')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(swiper_id, swipee_id)
);

-- 3. Create Matches Table
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- 4. Create Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 6. Grant Access Policies
CREATE POLICY "Public profiles read access" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users insert/update own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Swipes access policy" ON public.swipes FOR ALL USING (auth.uid() = swiper_id);
CREATE POLICY "Matches view policy" ON public.matches FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Messages access policy" ON public.messages FOR ALL USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(supabaseSqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

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
          <div className="space-y-6 overflow-y-auto pr-1 flex-1">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-brand-obsidian/80 border border-brand-lavender/30 rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-[10px] text-brand-cream/60 font-mono uppercase">Total Users</span>
                <span className="text-2xl font-bold text-brand-cream font-serif mt-1">{stats.totalUsers}</span>
                <span className="text-[10px] text-brand-gold/80 mt-1">Registered Members</span>
              </div>

              <div className="bg-brand-obsidian/80 border border-brand-lavender/30 rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-[10px] text-brand-cream/60 font-mono uppercase">Verified</span>
                <span className="text-2xl font-bold text-emerald-400 font-serif mt-1">{stats.verifiedUsers}</span>
                <span className="text-[10px] text-emerald-400/80 mt-1">Golden Shield Badges</span>
              </div>

              <div className="bg-brand-obsidian/80 border border-brand-lavender/30 rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-[10px] text-brand-cream/60 font-mono uppercase">Pending Selfies</span>
                <span className="text-2xl font-bold text-amber-300 font-serif mt-1">{stats.pendingVerifications}</span>
                <span className="text-[10px] text-amber-300/80 mt-1">Awaiting Review</span>
              </div>

              <div className="bg-brand-obsidian/80 border border-brand-lavender/30 rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-[10px] text-brand-cream/60 font-mono uppercase">Admin Accounts</span>
                <span className="text-2xl font-bold text-brand-gold font-serif mt-1">{stats.adminUsers}</span>
                <span className="text-[10px] text-brand-gold/80 mt-1">Platform Managers</span>
              </div>
            </div>

            {/* Admin Self-Elevation Banner */}
            <div className="bg-gradient-to-r from-brand-gold/20 via-amber-400/10 to-brand-plum border border-brand-gold/50 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-brand-gold" />
                  <h4 className="text-sm font-bold text-brand-cream">
                    Administrator Account: {currentUser?.email || "jerrostech@gmail.com"}
                  </h4>
                </div>
                <p className="text-xs text-brand-cream/70 font-sans">
                  {currentUser?.is_admin || currentUser?.role === "admin"
                    ? "Your logged-in account has full Administrator access privileges in Supabase and locally."
                    : "Elevate your current logged-in account to Super Admin with 1 click."}
                </p>
              </div>

              {(!currentUser?.is_admin && currentUser?.role !== "admin") && (
                <button
                  type="button"
                  onClick={handleSelfPromoteAdmin}
                  className="bg-brand-gold hover:bg-amber-300 text-brand-obsidian font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-lg shrink-0 transition-all"
                >
                  Promote Me to Admin
                </button>
              )}
            </div>

            {/* Registered Users Preview Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold font-mono">
                  Platform Accounts List
                </h4>
                <button
                  onClick={loadAdminData}
                  className="text-[11px] text-brand-cream/60 hover:text-brand-cream flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh List
                </button>
              </div>

              <div className="space-y-2">
                {users.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    className="bg-brand-obsidian/80 border border-brand-lavender/30 rounded-2xl p-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.images?.[0] || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600"}
                        alt={user.name}
                        className="w-10 h-10 object-cover rounded-full border border-brand-gold"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-brand-cream">{user.name}</span>
                          {(user.is_admin || user.role === "admin") && (
                            <span className="bg-brand-gold/20 text-brand-gold border border-brand-gold/40 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                              ADMIN
                            </span>
                          )}
                          {user.is_verified && (
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                              VERIFIED
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-brand-cream/60 block font-sans">
                          {user.email || "demo@massagejohnny.com"} • {user.location_name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleAdminRole(user)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border transition-all ${
                          user.is_admin || user.role === "admin"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : "bg-brand-lavender/20 text-brand-cream/60 border-brand-lavender/40 hover:border-brand-gold"
                        }`}
                      >
                        {user.is_admin || user.role === "admin" ? "Revoke Admin" : "Make Admin"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE USER ACCOUNTS */}
        {activeTab === "users" && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            {/* Search & Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative col-span-1 sm:col-span-1">
                <Search className="w-4 h-4 text-brand-cream/50 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search user, email, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-brand-obsidian/80 border border-brand-lavender/40 rounded-2xl pl-9 pr-3 py-2 text-xs text-brand-cream focus:outline-none focus:border-brand-gold"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="bg-brand-obsidian/80 border border-brand-lavender/40 rounded-2xl px-3 py-2 text-xs text-brand-cream focus:outline-none focus:border-brand-gold"
              >
                <option value="all">All Roles (Admins & Users)</option>
                <option value="admin">Administrators Only</option>
                <option value="user">Standard Users Only</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-brand-obsidian/80 border border-brand-lavender/40 rounded-2xl px-3 py-2 text-xs text-brand-cream focus:outline-none focus:border-brand-gold"
              >
                <option value="all">All Verification Statuses</option>
                <option value="pending">Pending Selfie Review</option>
                <option value="verified">Verified Members</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>

            {/* Users List */}
            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center bg-brand-obsidian/40 rounded-2xl border border-brand-lavender/30 text-xs text-brand-cream/60">
                  No user accounts matching the selected criteria.
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const isAdmin = u.is_admin || u.role === "admin" || isDesignatedAdminEmail(u.email);
                  const isVerified = u.is_verified || u.verification_status === "approved";

                  return (
                    <div
                      key={u.id}
                      className="bg-brand-obsidian/90 border border-brand-lavender/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={u.images?.[0] || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600"}
                          alt={u.name}
                          className="w-12 h-12 object-cover rounded-2xl border border-brand-gold shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-brand-cream">{u.name}</h4>
                            <span className="text-xs text-brand-cream/60">({u.age}, {u.gender})</span>
                            
                            {isAdmin && (
                              <span className="bg-brand-gold/20 text-brand-gold border border-brand-gold/40 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                                ADMIN
                              </span>
                            )}

                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                                isVerified
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                  : u.verification_status === "pending"
                                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                  : "bg-brand-lavender/20 text-brand-cream/60 border-brand-lavender/40"
                              }`}
                            >
                              {isVerified ? "Verified" : u.verification_status === "pending" ? "Pending" : "Unverified"}
                            </span>
                          </div>

                          <p className="text-xs text-brand-cream/60 font-sans mt-0.5">
                            {u.email || "demo@massagejohnny.com"} • {u.location_name}
                          </p>
                        </div>
                      </div>

                      {/* Action Controls */}
                      <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
                        {/* Admin Role Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleAdminRole(u)}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all ${
                            isAdmin
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                              : "bg-brand-lavender/20 text-brand-cream/70 border-brand-lavender/40 hover:border-brand-gold"
                          }`}
                        >
                          {isAdmin ? "Revoke Admin" : "Grant Admin"}
                        </button>

                        {/* Verification Status Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleVerification(u, !isVerified)}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all ${
                            isVerified
                              ? "bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                          }`}
                        >
                          {isVerified ? "Reject Verification" : "Approve & Verify"}
                        </button>

                        {/* Subscription Selector */}
                        <select
                          value={u.subscription_tier || "free"}
                          onChange={(e) => handleChangeSubscription(u, e.target.value as SubscriptionTier)}
                          className="bg-brand-plum text-brand-cream text-[10px] font-bold px-2 py-1.5 rounded-xl border border-brand-lavender/40 focus:outline-none focus:border-brand-gold"
                        >
                          <option value="free">Free Tier</option>
                          <option value="gold">Gold Pass</option>
                          <option value="platinum">Platinum VIP</option>
                        </select>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SELFIE REVIEWS */}
        {activeTab === "verifications" && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            <div className="bg-brand-obsidian/60 border border-brand-lavender/30 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-brand-gold uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Camera className="w-4 h-4" /> Pending Selfie Verification Requests
              </h4>
              <p className="text-xs text-brand-cream/70 font-sans mt-1">
                Members upload a live camera selfie to verify their authenticity. Compare the selfie against their profile photo and approve/reject.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.filter((u) => u.verification_status === "pending" || u.verification_selfie_url).length === 0 ? (
                <div className="col-span-full p-8 text-center bg-brand-obsidian/40 rounded-2xl border border-brand-lavender/30 text-xs text-brand-cream/60">
                  🎉 No pending selfie verifications in queue! All members are up to date.
                </div>
              ) : (
                users
                  .filter((u) => u.verification_status === "pending" || u.verification_selfie_url)
                  .map((u) => (
                    <div
                      key={u.id}
                      className="bg-brand-obsidian/90 border border-brand-gold/40 rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-brand-lavender/20 pb-2">
                        <div>
                          <h4 className="text-sm font-bold text-brand-cream">{u.name}</h4>
                          <span className="text-[10px] text-brand-cream/60">{u.email || "demo@massagejohnny.com"}</span>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                            u.is_verified || u.verification_status === "approved"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          }`}
                        >
                          {u.is_verified ? "Verified" : "Pending Approval"}
                        </span>
                      </div>

                      {/* Side-by-side comparison */}
                      <div className="grid grid-cols-2 gap-3 bg-brand-plum/60 p-2.5 rounded-xl border border-brand-lavender/30">
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] text-brand-cream/50 uppercase font-mono mb-1">
                            Profile Avatar
                          </span>
                          <img
                            src={u.images?.[0] || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600"}
                            alt="Profile Avatar"
                            className="w-24 h-24 object-cover rounded-2xl border border-brand-lavender shadow-md"
                          />
                        </div>

                        <div className="flex flex-col items-center">
                          <span className="text-[9px] text-brand-cream/50 uppercase font-mono mb-1">
                            Submitted Selfie
                          </span>
                          {u.verification_selfie_url ? (
                            <img
                              src={u.verification_selfie_url}
                              alt="Submitted Selfie"
                              className="w-24 h-24 object-cover rounded-2xl border-2 border-brand-gold shadow-md"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-2xl bg-brand-obsidian border border-dashed border-brand-lavender/40 flex flex-col items-center justify-center p-2 text-center">
                              <ShieldAlert className="w-5 h-5 text-amber-400 mb-1" />
                              <span className="text-[9px] text-brand-cream/40">No Selfie</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Approval Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => handleToggleVerification(u, true)}
                          className="py-2 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Approve & Verify
                        </button>

                        <button
                          onClick={() => handleToggleVerification(u, false)}
                          className="py-2 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/50 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                        >
                          <XCircle className="w-4 h-4 text-red-400" />
                          Reject Request
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: API KEYS & PAYMENT GATEWAYS */}
        {activeTab === "apikeys" && (
          <div className="space-y-6 overflow-y-auto pr-1 flex-1">
            {/* Top Bar with Save Button */}
            <div className="bg-gradient-to-r from-brand-obsidian via-brand-plum to-brand-obsidian border border-brand-gold/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-brand-gold" />
                  <h4 className="text-sm font-bold text-brand-cream font-serif">
                    Payment Gateway API Keys & Credentials
                  </h4>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Live Production Ready
                  </span>
                </div>
                <p className="text-xs text-brand-cream/70 font-sans">
                  Configure Safaricom M-Pesa (Daraja API) for mobile money and Stripe for international card payments.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSavePaymentConfig}
                className="bg-brand-gold hover:bg-amber-300 text-brand-obsidian font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-lg shrink-0 flex items-center gap-1.5 transition-all"
              >
                <Save className="w-4 h-4" /> Save API Keys
              </button>
            </div>

            {/* SECTION 1: SAFARICOM M-PESA DARAJA API */}
            <div className="bg-brand-obsidian/90 border border-emerald-500/40 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-brand-lavender/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-brand-cream">Safaricom M-Pesa Express (Daraja API)</h4>
                    <span className="text-[10px] text-brand-cream/60">STK Push & Lipa na M-PESA Online</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-brand-cream/80">
                    <input
                      type="checkbox"
                      checked={paymentConfig.mpesa.enabled}
                      onChange={(e) =>
                        setPaymentConfig({
                          ...paymentConfig,
                          mpesa: { ...paymentConfig.mpesa, enabled: e.target.checked },
                        })
                      }
                      className="accent-brand-gold w-4 h-4 rounded"
                    />
                    Enable M-Pesa
                  </label>

                  <select
                    value={paymentConfig.mpesa.environment}
                    onChange={(e) =>
                      setPaymentConfig({
                        ...paymentConfig,
                        mpesa: {
                          ...paymentConfig.mpesa,
                          environment: e.target.value as "sandbox" | "production",
                        },
                      })
                    }
                    className="bg-brand-plum text-brand-cream text-xs font-bold px-2.5 py-1.5 rounded-xl border border-brand-lavender/40 focus:outline-none focus:border-brand-gold"
                  >
                    <option value="sandbox">Sandbox (Testing)</option>
                    <option value="production">Production (Live)</option>
                  </select>
                </div>
              </div>

              {/* M-Pesa Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Consumer Key */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-cream/70 uppercase font-mono">
                    Consumer Key
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 7mK08XW9..."
                    value={paymentConfig.mpesa.consumerKey}
                    onChange={(e) =>
                      setPaymentConfig({
                        ...paymentConfig,
                        mpesa: { ...paymentConfig.mpesa, consumerKey: e.target.value },
                      })
                    }
                    className="w-full bg-black/60 border border-brand-lavender/40 rounded-xl px-3 py-2 text-brand-cream focus:outline-none focus:border-brand-gold font-mono"
                  />
                </div>

                {/* Consumer Secret */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-cream/70 uppercase font-mono">
                    Consumer Secret
                  </label>
                  <div className="relative">
                    <input
                      type={showMpesaSecret ? "text" : "password"}
                      placeholder="e.g. Zq89xL..."
                      value={paymentConfig.mpesa.consumerSecret}
                      onChange={(e) =>
                        setPaymentConfig({
                          ...paymentConfig,
                          mpesa: { ...paymentConfig.mpesa, consumerSecret: e.target.value },
                        })
                      }
                      className="w-full bg-black/60 border border-brand-lavender/40 rounded-xl pl-3 pr-10 py-2 text-brand-cream focus:outline-none focus:border-brand-gold font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMpesaSecret(!showMpesaSecret)}
                      className="absolute right-3 top-2.5 text-brand-cream/50 hover:text-brand-cream"
                    >
                      {showMpesaSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Passkey */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-brand-cream/70 uppercase font-mono">
                    Lipa Na M-PESA Online Passkey
                  </label>
                  <div className="relative">
                    <input
                      type={showMpesaPasskey ? "text" : "password"}
                      placeholder="e.g. bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
                      value={paymentConfig.mpesa.passkey}
                      onChange={(e) =>
                        setPaymentConfig({
                          ...paymentConfig,
                          mpesa: { ...paymentConfig.mpesa, passkey: e.target.value },
                        })
                      }
                      className="w-full bg-black/60 border border-brand-lavender/40 rounded-xl pl-3 pr-10 py-2 text-brand-cream focus:outline-none focus:border-brand-gold font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMpesaPasskey(!showMpesaPasskey)}
                      className="absolute right-3 top-2.5 text-brand-cream/50 hover:text-brand-cream"
                    >
                      {showMpesaPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Shortcode */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-cream/70 uppercase font-mono">
                    Business Shortcode / Paybill / Till Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 174379 or 600000"
                    value={paymentConfig.mpesa.shortcode}
                    onChange={(e) =>
                      setPaymentConfig({
                        ...paymentConfig,
                        mpesa: { ...paymentConfig.mpesa, shortcode: e.target.value },
                      })
                    }
                    className="w-full bg-black/60 border border-brand-lavender/40 rounded-xl px-3 py-2 text-brand-cream focus:outline-none focus:border-brand-gold font-mono"
                  />
                </div>

                {/* Callback URL */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-cream/70 uppercase font-mono">
                    STK Push Callback URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://yourdomain.com/api/mpesa/callback"
                    value={paymentConfig.mpesa.callbackUrl}
                    onChange={(e) =>
                      setPaymentConfig({
                        ...paymentConfig,
                        mpesa: { ...paymentConfig.mpesa, callbackUrl: e.target.value },
                      })
                    }
                    className="w-full bg-black/60 border border-brand-lavender/40 rounded-xl px-3 py-2 text-brand-cream focus:outline-none focus:border-brand-gold font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* M-Pesa Test Action */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleTestMpesa}
                  className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                >
                  <Zap className="w-3.5 h-3.5" /> Validate M-Pesa Keys
                </button>

                {testResultMpesa.message && (
                  <span
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border ${
                      testResultMpesa.success
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                        : "bg-red-500/10 text-red-300 border-red-500/30"
                    }`}
                  >
                    {testResultMpesa.message}
                  </span>
                )}
              </div>
            </div>

            {/* SECTION 2: STRIPE CARD CHECKOUT API */}
            <div className="bg-brand-obsidian/90 border border-indigo-500/40 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-brand-lavender/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-brand-cream">Stripe Credit Card & Wallet Gateway</h4>
                    <span className="text-[10px] text-brand-cream/60">Visa, Mastercard, Apple Pay & Google Pay</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-brand-cream/80">
                    <input
                      type="checkbox"
                      checked={paymentConfig.stripe.enabled}
                      onChange={(e) =>
                        setPaymentConfig({
                          ...paymentConfig,
                          stripe: { ...paymentConfig.stripe, enabled: e.target.checked },
                        })
                      }
                      className="accent-brand-gold w-4 h-4 rounded"
                    />
                    Enable Stripe
                  </label>

                  <select
                    value={paymentConfig.stripe.environment}
                    onChange={(e) =>
                      setPaymentConfig({
                        ...paymentConfig,
                        stripe: {
                          ...paymentConfig.stripe,
                          environment: e.target.value as "test" | "live",
                        },
                      })
                    }
                    className="bg-brand-plum text-brand-cream text-xs font-bold px-2.5 py-1.5 rounded-xl border border-brand-lavender/40 focus:outline-none focus:border-brand-gold"
                  >
                    <option value="test">Test Mode (pk_test_...)</option>
                    <option value="live">Live Mode (pk_live_...)</option>
                  </select>
                </div>
              </div>

              {/* Stripe Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Publishable Key */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-brand-cream/70 uppercase font-mono">
                    Stripe Publishable Key
                  </label>
                  <input
                    type="text"
                    placeholder="pk_test_51Nx..."
                    value={paymentConfig.stripe.publishableKey}
                    onChange={(e) =>
                      setPaymentConfig({
                        ...paymentConfig,
                        stripe: { ...paymentConfig.stripe, publishableKey: e.target.value },
                      })
                    }
                    className="w-full bg-black/60 border border-brand-lavender/40 rounded-xl px-3 py-2 text-brand-cream focus:outline-none focus:border-brand-gold font-mono text-[11px]"
                  />
                </div>

                {/* Secret Key */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-cream/70 uppercase font-mono">
                    Stripe Secret Key
                  </label>
                  <div className="relative">
                    <input
                      type={showStripeSecret ? "text" : "password"}
                      placeholder="sk_test_51Nx..."
                      value={paymentConfig.stripe.secretKey}
                      onChange={(e) =>
                        setPaymentConfig({
                          ...paymentConfig,
                          stripe: { ...paymentConfig.stripe, secretKey: e.target.value },
                        })
                      }
                      className="w-full bg-black/60 border border-brand-lavender/40 rounded-xl pl-3 pr-10 py-2 text-brand-cream focus:outline-none focus:border-brand-gold font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStripeSecret(!showStripeSecret)}
                      className="absolute right-3 top-2.5 text-brand-cream/50 hover:text-brand-cream"
                    >
                      {showStripeSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Webhook Signing Secret */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-cream/70 uppercase font-mono">
                    Stripe Webhook Signing Secret
                  </label>
                  <div className="relative">
                    <input
                      type={showStripeWebhook ? "text" : "password"}
                      placeholder="whsec_..."
                      value={paymentConfig.stripe.webhookSecret}
                      onChange={(e) =>
                        setPaymentConfig({
                          ...paymentConfig,
                          stripe: { ...paymentConfig.stripe, webhookSecret: e.target.value },
                        })
                      }
                      className="w-full bg-black/60 border border-brand-lavender/40 rounded-xl pl-3 pr-10 py-2 text-brand-cream focus:outline-none focus:border-brand-gold font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStripeWebhook(!showStripeWebhook)}
                      className="absolute right-3 top-2.5 text-brand-cream/50 hover:text-brand-cream"
                    >
                      {showStripeWebhook ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Stripe Test Action */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleTestStripe}
                  className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/50 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                >
                  <Zap className="w-3.5 h-3.5" /> Validate Stripe Keys
                </button>

                {testResultStripe.message && (
                  <span
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border ${
                      testResultStripe.success
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                        : "bg-red-500/10 text-red-300 border-red-500/30"
                    }`}
                  >
                    {testResultStripe.message}
                  </span>
                )}
              </div>
            </div>

            {/* SECTION 3: ENVIRONMENT FILE PERSISTENCE & INSTRUCTIONS */}
            <div className="bg-brand-obsidian/60 border border-brand-lavender/30 rounded-2xl p-4 space-y-2 text-xs">
              <h4 className="font-bold text-brand-gold flex items-center gap-1.5 font-mono uppercase text-[11px]">
                <Server className="w-4 h-4" /> Server Environment Variable Declaration
              </h4>
              <p className="text-brand-cream/70 font-sans">
                For backend deployment (e.g., Node.js / Express servers or cPanel), also declare these environment variables in your <code className="text-brand-gold bg-black/40 px-1 rounded">.env</code> file:
              </p>
              <pre className="bg-black/80 p-3 rounded-xl text-[10px] font-mono text-emerald-300 overflow-x-auto border border-brand-lavender/20">
{`# M-Pesa Safaricom Daraja Credentials
MPESA_CONSUMER_KEY=${paymentConfig.mpesa.consumerKey || 'your_consumer_key'}
MPESA_CONSUMER_SECRET=${paymentConfig.mpesa.consumerSecret || 'your_consumer_secret'}
MPESA_PASSKEY=${paymentConfig.mpesa.passkey || 'your_passkey'}
MPESA_SHORTCODE=${paymentConfig.mpesa.shortcode || '174379'}

# Stripe Credit Card Keys
VITE_STRIPE_PUBLISHABLE_KEY=${paymentConfig.stripe.publishableKey || 'pk_test_...'}
STRIPE_SECRET_KEY=${paymentConfig.stripe.secretKey || 'sk_test_...'}
STRIPE_WEBHOOK_SECRET=${paymentConfig.stripe.webhookSecret || 'whsec_...'}`}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 5: PRODUCTION & CPANEL DEPLOYMENT GUIDE */}
        {activeTab === "production" && (
          <div className="space-y-5 overflow-y-auto pr-1 flex-1">
            <div className="bg-brand-obsidian/80 border border-brand-gold/40 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-gold uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Globe className="w-4 h-4" /> Production cPanel Deployment Instructions
                </span>
                <span className="text-[10px] bg-brand-gold text-brand-obsidian font-black uppercase px-2 py-0.5 rounded-full">
                  Step-By-Step
                </span>
              </div>
              <p className="text-xs text-brand-cream/80 font-sans">
                Follow these 4 simple steps to deploy this application to your custom cPanel web domain.
              </p>
            </div>

            {/* Deployment Steps */}
            <div className="space-y-3">
              <div className="bg-brand-obsidian/60 border border-brand-lavender/30 rounded-2xl p-3.5 space-y-1">
                <span className="text-xs font-bold text-brand-cream flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-gold text-brand-obsidian text-[10px] font-black flex items-center justify-center">1</span>
                  Build Static Web Bundle
                </span>
                <p className="text-xs text-brand-cream/70 font-sans pl-7">
                  Run <code className="text-brand-gold bg-black/40 px-1.5 py-0.5 rounded">npm run build</code> in your code repository. This generates the production static files inside the <code className="text-brand-gold bg-black/40 px-1.5 py-0.5 rounded">dist/</code> folder.
                </p>
              </div>

              <div className="bg-brand-obsidian/60 border border-brand-lavender/30 rounded-2xl p-3.5 space-y-1">
                <span className="text-xs font-bold text-brand-cream flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-gold text-brand-obsidian text-[10px] font-black flex items-center justify-center">2</span>
                  Upload Files to cPanel
                </span>
                <p className="text-xs text-brand-cream/70 font-sans pl-7">
                  Open cPanel File Manager, navigate to <code className="text-brand-gold bg-black/40 px-1.5 py-0.5 rounded">public_html</code> (or your domain folder), and upload all contents of the <code className="text-brand-gold bg-black/40 px-1.5 py-0.5 rounded">dist/</code> directory.
                </p>
              </div>

              <div className="bg-brand-obsidian/60 border border-brand-lavender/30 rounded-2xl p-3.5 space-y-1">
                <span className="text-xs font-bold text-brand-cream flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-gold text-brand-obsidian text-[10px] font-black flex items-center justify-center">3</span>
                  Create `.htaccess` for Single Page App (SPA) Routing
                </span>
                <p className="text-xs text-brand-cream/70 font-sans pl-7">
                  Inside <code className="text-brand-gold bg-black/40 px-1.5 py-0.5 rounded">public_html</code>, create a file named <code className="text-brand-gold bg-black/40 px-1.5 py-0.5 rounded">.htaccess</code> and paste:
                </p>
                <pre className="bg-black/60 p-2.5 rounded-xl text-[10px] font-mono text-emerald-300 ml-7 overflow-x-auto border border-brand-lavender/20">
{`RewriteEngine On
RewriteBase /
RewriteRule ^index\\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]`}
                </pre>
              </div>

              <div className="bg-brand-obsidian/60 border border-brand-lavender/30 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-cream flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-brand-gold text-brand-obsidian text-[10px] font-black flex items-center justify-center">4</span>
                    Execute Supabase Database SQL Script
                  </span>
                  <button
                    onClick={copySqlToClipboard}
                    className="bg-brand-gold/20 hover:bg-brand-gold/30 text-brand-gold border border-brand-gold/40 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                  >
                    {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedSql ? "Copied!" : "Copy SQL Script"}
                  </button>
                </div>
                <p className="text-xs text-brand-cream/70 font-sans pl-7">
                  Paste the SQL script below into your Supabase SQL Editor to initialize all tables, RLS security policies, and admin role columns:
                </p>
                <div className="ml-7 pt-1">
                  <textarea
                    readOnly
                    value={supabaseSqlScript}
                    rows={8}
                    className="w-full bg-black/80 border border-brand-lavender/30 rounded-xl p-3 text-[10px] font-mono text-amber-200/90 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
