/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Shield, EyeOff, Map, Eye, AlertCircle, Sparkles, Sliders, ToggleLeft, ToggleRight, ExternalLink, Bell } from "lucide-react";
import { AppPrivacySettings } from "../types";

interface PrivacySettingsProps {
  settings: AppPrivacySettings;
  onSave: (settings: AppPrivacySettings) => void;
  onClose: () => void;
}

export default function PrivacySettings({ settings, onSave, onClose }: PrivacySettingsProps) {
  const [panicUrl, setPanicUrl] = useState(settings.panic_redirect_url);
  const [notificationError, setNotificationError] = useState<string | null>(null);

  const toggleField = (field: keyof AppPrivacySettings) => {
    onSave({
      ...settings,
      [field]: !settings[field],
    });
  };

  const handleNotificationToggle = async () => {
    const isEnabling = !settings.push_notifications_enabled;
    setNotificationError(null);

    if (isEnabling) {
      if (!('Notification' in window)) {
        setNotificationError("Push notifications are not supported on this device/browser.");
        return;
      }
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          onSave({
            ...settings,
            push_notifications_enabled: true,
          });
          // Show verification notification using SW if available
          if ('serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.ready;
            reg.showNotification('Notifications Enabled! 🌸', {
              body: 'You will receive secure, discreet updates for matches and messages on Jonny Match.',
              icon: '/icon-512.jpg',
              badge: '/icon-512.jpg',
              tag: 'jonny-match-welcome'
            } as any);
          } else {
            new Notification('Notifications Enabled! 🌸', {
              body: 'You will receive secure, discreet updates for matches and messages on Jonny Match.',
              icon: '/icon-512.jpg'
            });
          }
        } else {
          setNotificationError("Permission denied. Grant notifications in site settings.");
        }
      } catch (err) {
        setNotificationError("Failed to request notification permissions.");
      }
    } else {
      onSave({
        ...settings,
        push_notifications_enabled: false,
      });
    }
  };

  const handlePanicUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setPanicUrl(url);
    onSave({
      ...settings,
      panic_redirect_url: url,
    });
  };

  const executePanicRedirect = () => {
    window.location.href = settings.panic_redirect_url;
  };

  return (
    <div className="bg-brand-plum border border-brand-lavender/60 rounded-3xl p-6 shadow-2xl space-y-6 max-w-md mx-auto" id="privacy-settings-panel">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-brand-lavender/40 pb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5.5 h-5.5 text-brand-gold" />
          <div>
            <h3 className="font-display font-semibold text-base text-brand-cream leading-none">
              Privacy & Discretion
            </h3>
            <span className="text-[10px] text-brand-gold-muted uppercase tracking-wider font-sans mt-0.5 block">
              Safeguard your identity
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-xs px-3 py-1.5 rounded-xl bg-brand-lavender/30 hover:bg-brand-lavender/50 text-brand-cream/80 hover:text-brand-cream transition-colors"
        >
          Save & Exit
        </button>
      </div>

      {/* Safety Alert Warning */}
      <div className="bg-brand-gold/10 border border-brand-gold/20 rounded-2xl p-3.5 flex gap-3 text-xs text-brand-gold-muted leading-relaxed">
        <AlertCircle className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-brand-cream">Discretion First:</span> In Nairobi and across East Africa, your safety and privacy are paramount. We built custom discrete features so you can customize exactly who sees your profile.
        </div>
      </div>

      <div className="space-y-4 divide-y divide-brand-lavender/30">
        {/* Incognito Mode */}
        <div className="pt-4 first:pt-0 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-sm text-brand-cream">
              <EyeOff className="w-4 h-4 text-brand-gold-muted" />
              Incognito Browsing
            </div>
            <p className="text-xs text-brand-cream/60">
              Only people you swipe right on (Like) can see your profile. You will not appear in the public discover deck.
            </p>
          </div>
          <button onClick={() => toggleField("incognito_mode")} className="shrink-0 text-brand-gold transition-colors">
            {settings.incognito_mode ? (
              <ToggleRight className="w-10 h-10 stroke-[1.5]" />
            ) : (
              <ToggleLeft className="w-10 h-10 stroke-[1.5] text-brand-cream/30" />
            )}
          </button>
        </div>

        {/* Hide Distance */}
        <div className="pt-4 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-sm text-brand-cream">
              <Map className="w-4 h-4 text-brand-gold-muted" />
              Disguise Distance & Location
            </div>
            <p className="text-xs text-brand-cream/60">
              Hides your exact distance in kilometers. Other users will only see "Nairobi Area" on your profile instead of "1.2 km away".
            </p>
          </div>
          <button onClick={() => toggleField("hide_distance")} className="shrink-0 text-brand-gold transition-colors">
            {settings.hide_distance ? (
              <ToggleRight className="w-10 h-10 stroke-[1.5]" />
            ) : (
              <ToggleLeft className="w-10 h-10 stroke-[1.5] text-brand-cream/30" />
            )}
          </button>
        </div>

        {/* Blur for unverified */}
        <div className="pt-4 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-sm text-brand-cream">
              <Eye className="w-4 h-4 text-brand-gold-muted" />
              Blur Photo for Unverified Profiles
            </div>
            <p className="text-xs text-brand-cream/60">
              Only verified profiles (bearing the blue shield checkmark) can view your high-res photos. Unverified profiles will see a secure blur.
            </p>
          </div>
          <button onClick={() => toggleField("blur_for_unverified")} className="shrink-0 text-brand-gold transition-colors">
            {settings.blur_for_unverified ? (
              <ToggleRight className="w-10 h-10 stroke-[1.5]" />
            ) : (
              <ToggleLeft className="w-10 h-10 stroke-[1.5] text-brand-cream/30" />
            )}
          </button>
        </div>

        {/* Discreet Header Mode */}
        <div className="pt-4 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-sm text-brand-cream">
              <Sparkles className="w-4 h-4 text-brand-gold-muted" />
              Discreet Stealth Mode (Stealth Header)
            </div>
            <p className="text-xs text-brand-cream/60">
              Renames the app title to "Daily Kenyan News" with a newspaper icon. If someone glances at your screen, it looks like a news portal.
            </p>
          </div>
          <button onClick={() => toggleField("discreet_mode")} className="shrink-0 text-brand-gold transition-colors">
            {settings.discreet_mode ? (
              <ToggleRight className="w-10 h-10 stroke-[1.5]" />
            ) : (
              <ToggleLeft className="w-10 h-10 stroke-[1.5] text-brand-cream/30" />
            )}
          </button>
        </div>

        {/* PWA Push Notifications */}
        <div className="pt-4 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-sm text-brand-cream">
                <Bell className="w-4 h-4 text-brand-gold-muted" />
                PWA Push Notifications
              </div>
              <p className="text-xs text-brand-cream/60">
                Receive secure, instant alerts on your device for new matches, likes, and confidential direct messages.
              </p>
            </div>
            <button onClick={handleNotificationToggle} className="shrink-0 text-brand-gold transition-colors">
              {settings.push_notifications_enabled ? (
                <ToggleRight className="w-10 h-10 stroke-[1.5]" />
              ) : (
                <ToggleLeft className="w-10 h-10 stroke-[1.5] text-brand-cream/30" />
              )}
            </button>
          </div>
          {notificationError && (
            <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{notificationError}</span>
            </div>
          )}
          {settings.push_notifications_enabled && !notificationError && (
            <div className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Device registered successfully for push events.</span>
            </div>
          )}
        </div>

        {/* Panic Button Redirect */}
        <div className="pt-4 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-sm text-brand-cream">
                <Sliders className="w-4 h-4 text-brand-gold-muted" />
                Quick Panic Redirection
              </div>
              <p className="text-xs text-brand-cream/60">
                Instantly closes the matchmaking app and redirects to a safe website of your choice. Click the panic button below or double-tap the header to trigger.
              </p>
            </div>
            <button onClick={() => toggleField("panic_button_enabled")} className="shrink-0 text-brand-gold transition-colors">
              {settings.panic_button_enabled ? (
                <ToggleRight className="w-10 h-10 stroke-[1.5]" />
              ) : (
                <ToggleLeft className="w-10 h-10 stroke-[1.5] text-brand-cream/30" />
              )}
            </button>
          </div>

          {settings.panic_button_enabled && (
            <div className="space-y-2 mt-2">
              <label className="text-[10px] text-brand-cream/50 uppercase tracking-widest font-mono">
                Panic Destination URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={panicUrl}
                  onChange={handlePanicUrlChange}
                  placeholder="https://www.standardmedia.co.ke/"
                  className="flex-1 text-xs px-3 py-2 rounded-xl bg-brand-obsidian border border-brand-lavender/50 text-brand-cream focus:outline-none focus:border-brand-gold"
                />
                <button
                  onClick={executePanicRedirect}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-2 rounded-xl text-xs flex items-center gap-1"
                  title="Test Panic Button"
                >
                  Panic Now
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 text-center text-[10px] text-brand-cream/40 font-mono">
        All discretion settings apply instantly on client devices.
      </div>
    </div>
  );
}
