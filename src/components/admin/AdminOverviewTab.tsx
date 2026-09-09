/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Crown,
  Database,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { UserProfile } from "../../types";
import { SupabaseHealthResult } from "../../services/diagnosticsService";

interface AdminOverviewTabProps {
  stats: {
    totalUsers: number;
    verifiedUsers: number;
    pendingVerifications: number;
    adminUsers: number;
    totalMatches: number;
  };
  currentUser: UserProfile | null;
  users: UserProfile[];
  supabaseHealth: {
    loading: boolean;
    result: SupabaseHealthResult | null;
  };
  onRunSupabaseHealthCheck: () => void;
  onSelfPromoteAdmin: () => void;
  onToggleAdminRole: (user: UserProfile) => void;
  onRefreshData: () => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  stats,
  currentUser,
  users,
  supabaseHealth,
  onRunSupabaseHealthCheck,
  onSelfPromoteAdmin,
  onToggleAdminRole,
  onRefreshData,
}) => {
  return (
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

        {!currentUser?.is_admin && currentUser?.role !== "admin" && (
          <button
            type="button"
            onClick={onSelfPromoteAdmin}
            className="bg-brand-gold hover:bg-amber-300 text-brand-obsidian font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-lg shrink-0 transition-all"
          >
            Promote Me to Admin
          </button>
        )}
      </div>

      {/* Supabase Connection Live Diagnostics Card */}
      <div className="bg-gradient-to-r from-brand-obsidian via-brand-plum/80 to-brand-obsidian border border-brand-lavender/40 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-brand-lavender/20 pb-3">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-brand-gold" />
            <div>
              <h4 className="text-sm font-bold text-brand-cream">
                Supabase Database Connection Health
              </h4>
              <span className="text-[10px] text-brand-cream/60 font-mono">
                Real-time Ping & Cloud Service Status Check
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onRunSupabaseHealthCheck}
            disabled={supabaseHealth.loading}
            className="bg-brand-plum hover:bg-brand-lavender/20 text-brand-cream border border-brand-lavender/40 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${supabaseHealth.loading ? "animate-spin text-brand-gold" : ""}`} />
            {supabaseHealth.loading ? "Pinging..." : "Test Supabase Connection"}
          </button>
        </div>

        {/* Status Result Display */}
        {supabaseHealth.loading ? (
          <div className="flex items-center gap-3 text-xs text-brand-cream/70 py-2">
            <RefreshCw className="w-4 h-4 animate-spin text-brand-gold" />
            <span>Pinging Supabase REST API & database endpoint...</span>
          </div>
        ) : supabaseHealth.result ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    supabaseHealth.result.status === "online"
                      ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"
                      : supabaseHealth.result.status === "paused"
                      ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse"
                      : "bg-red-400"
                  }`}
                />
                <span className="text-xs font-bold text-brand-cream uppercase tracking-wider font-mono">
                  Status:{" "}
                  <span
                    className={
                      supabaseHealth.result.status === "online"
                        ? "text-emerald-400"
                        : supabaseHealth.result.status === "paused"
                        ? "text-amber-300"
                        : "text-red-400"
                    }
                  >
                    {supabaseHealth.result.status.toUpperCase()}
                  </span>
                </span>
              </div>

              {supabaseHealth.result.latencyMs !== undefined && (
                <span className="text-[11px] text-brand-cream/60 font-mono">
                  Latency: <span className="text-brand-gold">{supabaseHealth.result.latencyMs}ms</span>
                </span>
              )}
            </div>

            <p className="text-xs text-brand-cream font-medium bg-black/40 p-3 rounded-xl border border-brand-lavender/20">
              {supabaseHealth.result.message}
            </p>

            {supabaseHealth.result.details && (
              <p className="text-[11px] text-brand-cream/70 leading-relaxed font-sans">
                {supabaseHealth.result.details}
              </p>
            )}

            {/* Direct Instructions if PAUSED */}
            {supabaseHealth.result.status === "paused" && (
              <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>How to Unpause & Restore your Supabase Database:</span>
                </div>
                <ol className="list-decimal list-inside text-brand-cream/80 space-y-1 pl-1 text-[11px]">
                  <li>
                    Open your Supabase Dashboard at{" "}
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-gold underline font-bold"
                    >
                      https://supabase.com/dashboard
                    </a>
                  </li>
                  <li>Select your project.</li>
                  <li>
                    Click the yellow <span className="font-bold text-amber-300">&quot;Restore Project&quot;</span> or{" "}
                    <span className="font-bold text-amber-300">&quot;Unpause&quot;</span> button.
                  </li>
                  <li>Wait ~60 seconds for the database to wake up, then click <strong>&quot;Test Supabase Connection&quot;</strong> above.</li>
                </ol>
                <div className="pt-1">
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-brand-obsidian font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-md transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open Supabase Dashboard
                  </a>
                </div>
              </div>
            )}

            {/* Auto-Fallback Note */}
            <div className="text-[10px] text-brand-cream/50 italic flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                Fallback Active: If Supabase is paused or unreachable, the app seamlessly runs on the local storage engine so zero user features break.
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Registered Users Preview Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold font-mono">
            Platform Accounts List
          </h4>
          <button
            onClick={onRefreshData}
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
                  onClick={() => onToggleAdminRole(user)}
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
  );
};
