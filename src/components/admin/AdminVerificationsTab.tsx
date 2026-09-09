/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Camera, CheckCircle2, XCircle, ShieldAlert } from "lucide-react";
import { UserProfile } from "../../types";

interface AdminVerificationsTabProps {
  users: UserProfile[];
  onToggleVerification: (user: UserProfile, approve: boolean) => void;
}

export const AdminVerificationsTab: React.FC<AdminVerificationsTabProps> = ({
  users,
  onToggleVerification,
}) => {
  const pendingUsers = users.filter(
    (u) => u.verification_status === "pending" || u.verification_selfie_url
  );

  return (
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
        {pendingUsers.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-brand-obsidian/40 rounded-2xl border border-brand-lavender/30 text-xs text-brand-cream/60">
            🎉 No pending selfie verifications in queue! All members are up to date.
          </div>
        ) : (
          pendingUsers.map((u) => (
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
                  type="button"
                  onClick={() => onToggleVerification(u, true)}
                  className="py-2 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Approve & Verify
                </button>

                <button
                  type="button"
                  onClick={() => onToggleVerification(u, false)}
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
  );
};
