/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Search } from "lucide-react";
import { UserProfile, SubscriptionTier } from "../../types";
import { isDesignatedAdminEmail } from "../../services/supabaseClient";

interface AdminUsersTabProps {
  users: UserProfile[];
  onToggleAdminRole: (user: UserProfile) => void;
  onToggleVerification: (user: UserProfile, approve: boolean) => void;
  onChangeSubscription: (user: UserProfile, tier: SubscriptionTier) => void;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  users,
  onToggleAdminRole,
  onToggleVerification,
  onChangeSubscription,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "verified" | "unverified">("all");

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

  return (
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
                    onClick={() => onToggleAdminRole(u)}
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
                    onClick={() => onToggleVerification(u, !isVerified)}
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
                    onChange={(e) => onChangeSubscription(u, e.target.value as SubscriptionTier)}
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
  );
};
