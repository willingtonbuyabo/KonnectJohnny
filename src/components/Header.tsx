/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, Newspaper, Shield, Heart, Crown } from "lucide-react";
import { AppPrivacySettings, SubscriptionTier } from "../types";

interface HeaderProps {
  privacySettings: AppPrivacySettings;
  activeTab: string;
  onOpenPrivacy: () => void;
  onOpenSubscription: () => void;
  subscriptionTier?: SubscriptionTier;
  isDemo: boolean;
}

export default function Header({
  privacySettings,
  activeTab,
  onOpenPrivacy,
  onOpenSubscription,
  subscriptionTier = "free",
  isDemo,
}: HeaderProps) {
  const isDiscreet = privacySettings.discreet_mode;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-lavender/50 bg-brand-obsidian/95 backdrop-blur-md px-4 py-3.5 flex items-center justify-between">
      {/* Brand / Logo */}
      <div className="flex items-center gap-2">
        {isDiscreet ? (
          <div className="flex items-center gap-2 text-gray-300">
            <Newspaper className="w-5 h-5 text-gray-400" id="header-discreet-icon" />
            <span className="font-display font-medium text-sm tracking-tight" id="header-discreet-title">
              Daily Kenyan News
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* Elegant Massage Jonny Match Dual Logo */}
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-brand-lavender to-brand-plum border border-brand-gold/30">
              <Heart className="w-4 h-4 text-brand-gold animate-pulse-heart absolute" />
              <div className="absolute inset-0 rounded-full border border-dashed border-brand-gold/10 animate-spin" style={{ animationDuration: "20s" }} />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-semibold text-lg text-brand-cream tracking-tight flex items-center gap-1 leading-none" id="header-title">
                KonnectJohnny
              </span>
              <span className="text-[9px] font-sans text-brand-gold-muted uppercase tracking-widest leading-none mt-0.5">
                by Massage Jonny
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2.5">
        {/* VIP / Subscription Tier Badge Button */}
        <button
          onClick={onOpenSubscription}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all duration-300 shadow-sm ${
            subscriptionTier === "platinum"
              ? "bg-gradient-to-r from-amber-400/20 to-amber-300/10 border-amber-300 text-amber-200 shadow-amber-300/20"
              : subscriptionTier === "gold"
              ? "bg-gradient-to-r from-brand-gold/20 to-amber-400/10 border-brand-gold text-brand-gold shadow-brand-gold/20"
              : "bg-gradient-to-r from-brand-gold/10 via-amber-400/10 to-brand-plum/30 border-brand-gold/40 text-brand-gold hover:border-brand-gold hover:shadow-brand-gold/20"
          }`}
          title="Konnect VIP Subscription Plans"
          id="header-subscription-btn"
        >
          <Crown className="w-4 h-4 text-brand-gold animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider">
            {subscriptionTier === "free" ? "VIP Plans" : subscriptionTier}
          </span>
        </button>

        {/* Demo Mode Badge */}
        {isDemo && (
          <div className="hidden sm:flex items-center gap-1 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-2 py-0.5 text-[9px] text-brand-gold font-sans uppercase tracking-wider">
            <Sparkles className="w-2.5 h-2.5" />
            Demo Mode
          </div>
        )}

        {/* Privacy Trigger */}
        <button
          onClick={onOpenPrivacy}
          className={`flex items-center justify-center p-2 rounded-xl border transition-all duration-300 ${
            privacySettings.incognito_mode 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
              : "bg-brand-lavender/30 border-brand-lavender/50 text-brand-gold-muted hover:text-brand-gold hover:border-brand-gold/30"
          }`}
          title="Privacy & Discretion Center"
          id="privacy-center-btn"
        >
          <Shield className="w-4.5 h-4.5" />
          {privacySettings.incognito_mode && (
            <span className="ml-1 text-[10px] font-medium hidden xs:inline uppercase tracking-wider">Incognito</span>
          )}
        </button>
      </div>
    </header>
  );
}
