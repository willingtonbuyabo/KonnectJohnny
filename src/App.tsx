/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { supabaseService, isDemoMode } from "./supabaseService";
import { Profile, Match, UserProfile, MatchFilters, AppPrivacySettings } from "./types";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import SwipeDeck from "./components/SwipeDeck";
import MessageInbox from "./components/MessageInbox";
import Wellness from "./components/Wellness";
import Onboarding from "./components/Onboarding";
import WelcomePortal from "./components/WelcomePortal";
import Filters from "./components/Filters";
import PrivacySettings from "./components/PrivacySettings";
import ConfettiCanvas from "./components/ConfettiCanvas";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, Heart, Sparkles, MessageSquare, X, Flower, ChevronRight, AlertCircle, EyeOff } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("discover");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [matches, setMatches] = useState<Match[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Welcome / landing screen state
  const [showWelcomePortal, setShowWelcomePortal] = useState<boolean>(true);
  const [initialOnboardingSignUp, setInitialOnboardingSignUp] = useState<boolean>(true);

  // Notification tracking refs
  const prevUnreadCountRef = useRef<number | null>(null);
  const prevMatchesCountRef = useRef<number | null>(null);

  // Trigger system notification
  const triggerNotification = async (title: string, body: string, tag: string) => {
    if (!privacySettings.push_notifications_enabled) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification(title, {
          body,
          icon: '/icon-512.jpg',
          badge: '/icon-512.jpg',
          tag,
          vibrate: [100, 50, 100],
        } as any);
      } else {
        new Notification(title, {
          body,
          icon: '/icon-512.jpg',
          tag,
        });
      }
    } catch (e) {
      console.error("Failed to show notification", e);
    }
  };

  // Modals state
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  
  // Match Success Modal overlay
  const [matchSuccessOverlay, setMatchSuccessOverlay] = useState<{
    show: boolean;
    profile: Profile | null;
    matchId?: string;
  }>({ show: false, profile: null });
  const [matchIcebreaker, setMatchIcebreaker] = useState("");

  // Filters state
  const [filters, setFilters] = useState<MatchFilters>({
    age_range: [18, 55],
    max_distance: 40,
    genders: [],
    relationship_goals: [],
  });

  // Privacy Settings state
  const [privacySettings, setPrivacySettings] = useState<AppPrivacySettings>({
    incognito_mode: false,
    hide_distance: false,
    blur_for_unverified: false,
    panic_button_enabled: true,
    panic_redirect_url: "https://www.standardmedia.co.ke/",
    discreet_mode: false,
  });

  // Load user and configurations on mount
  useEffect(() => {
    loadUserAndConfigs();

    // Listen for privacy updates from details panel
    const handlePrivacyUpdate = (e: any) => {
      if (e.detail) {
        setPrivacySettings(e.detail);
      }
    };
    window.addEventListener("privacy_settings_updated", handlePrivacyUpdate);
    return () => window.removeEventListener("privacy_settings_updated", handlePrivacyUpdate);
  }, []);

  // Reload discoverable profiles when filters, user, or tab changes
  useEffect(() => {
    if (currentUser) {
      loadProfiles();
    }
  }, [currentUser, filters]);

  // Periodically check matches & unread chats
  useEffect(() => {
    if (currentUser) {
      loadMatches();
      const interval = setInterval(loadMatches, 8000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const loadUserAndConfigs = async () => {
    try {
      const user = await supabaseService.auth.getCurrentUser();
      setCurrentUser(user);
      
      const privacy = supabaseService.privacy.getSettings();
      setPrivacySettings(privacy);
    } catch (e) {
      console.error("Error setting up user session", e);
    }
  };

  const loadProfiles = async () => {
    try {
      const fetched = await supabaseService.profiles.getDiscoverableProfiles(filters);
      setProfiles(fetched);
      setCurrentIndex(0); // Reset swipe queue index
    } catch (e) {
      console.error("Error loading discoverable profiles", e);
    }
  };

  const loadMatches = async () => {
    try {
      const list = await supabaseService.swipes.getMatches();
      setMatches(list);
      
      // Calculate total unread chats
      const count = list.reduce((acc, match) => acc + (match.unread_count || 0), 0);
      setUnreadCount(count);

      // Check for notifications (only if we've already loaded once)
      if (prevUnreadCountRef.current !== null && count > prevUnreadCountRef.current) {
        // Find which match had an increase in unread_count
        const updatedMatch = list.find(m => (m.unread_count || 0) > 0);
        if (updatedMatch) {
          triggerNotification(
            `New Message from ${updatedMatch.profile.name} 💬`,
            updatedMatch.last_message || "Sent you a message",
            `msg-${updatedMatch.id}`
          );
        }
      }

      if (prevMatchesCountRef.current !== null && list.length > prevMatchesCountRef.current) {
        // Find the new match profile
        const newMatch = list[0]; // Matches are ordered latest first
        if (newMatch) {
          triggerNotification(
            `New Matchmaker Success! 🌸`,
            `You and ${newMatch.profile.name} matched. Connect now!`,
            `match-${newMatch.id}`
          );
        }
      }

      // Store in refs
      prevUnreadCountRef.current = count;
      prevMatchesCountRef.current = list.length;
    } catch (e) {
      console.error("Error loading matched profiles", e);
    }
  };

  const handleSwipe = async (direction: "left" | "right" | "up") => {
    if (currentIndex >= profiles.length) return;

    const topProfile = profiles[currentIndex];
    
    // Increment index immediately for slick, responsive transitions
    setCurrentIndex((prev) => prev + 1);

    if (direction === "right" || direction === "up") {
      try {
        const action = direction === "up" ? "superlike" : "like";
        const result = await supabaseService.swipes.performSwipe(topProfile.id, action);
        
        if (result.is_match && result.matched_profile) {
          // Trigger the beautiful fullscreen match success modal!
          setMatchSuccessOverlay({
            show: true,
            profile: result.matched_profile,
            matchId: result.match_id,
          });
          setMatchIcebreaker(`Hey ${result.matched_profile.name}! I noticed you liked Massage Jonny treatments too. 🌸 Let's connect!`);
          
          // Trigger immediate PWA notification
          triggerNotification(
            `It's a Match! 🌸`,
            `You and ${result.matched_profile.name} liked each other! Spark a conversation.`,
            `match-${result.match_id || 'instant'}`
          );
          
          loadMatches();
        }
      } catch (e) {
        console.error("Failed to perform swipe action", e);
      }
    } else {
      // Record Pass
      try {
        await supabaseService.swipes.performSwipe(topProfile.id, "pass");
      } catch (e) {
        console.error("Failed to record pass", e);
      }
    }
  };

  const handleSendMatchIcebreaker = async (e: React.FormEvent) => {
    e.preventDefault();
    const { profile, matchId } = matchSuccessOverlay;
    if (!profile || !matchId || !matchIcebreaker.trim()) return;

    try {
      await supabaseService.messages.sendMessage(matchId, profile.id, matchIcebreaker.trim());
      setMatchSuccessOverlay({ show: false, profile: null });
      setMatchIcebreaker("");
      setActiveTab("matches"); // Redirect to chat instantly to keep chatting!
      loadMatches();
    } catch (e) {
      console.error("Error sending matchmaking icebreaker", e);
    }
  };

  const handleProfileSave = async (updatedProfile: UserProfile) => {
    try {
      const saved = await supabaseService.profiles.updateProfile(updatedProfile);
      setCurrentUser(saved);
      // Refresh discover stack
      loadProfiles();
    } catch (e) {
      console.error("Error saving profile details", e);
    }
  };

  const handlePrivacySave = (updatedPrivacy: AppPrivacySettings) => {
    setPrivacySettings(updatedPrivacy);
    supabaseService.privacy.saveSettings(updatedPrivacy);
  };

  const handleSignOut = async () => {
    await supabaseService.auth.signOut();
    setCurrentUser(null);
  };

  // double tap panic trigger
  const handleHeaderDoubleTap = () => {
    if (privacySettings.panic_button_enabled) {
      window.location.href = privacySettings.panic_redirect_url;
    }
  };

  return (
    <div className="min-h-screen bg-brand-obsidian text-brand-cream font-sans flex flex-col relative overflow-hidden">
      
      {/* Background Decorative Ambience */}
      <div className="absolute top-[-100px] left-[-100px] w-64 h-64 bg-brand-lavender/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Header with Double-Tap Panic trigger */}
      <div onDoubleClick={handleHeaderDoubleTap} className="cursor-pointer" title="Double tap to trigger panic redirect">
        <Header
          privacySettings={privacySettings}
          activeTab={activeTab}
          onOpenPrivacy={() => setIsPrivacyOpen(true)}
          isDemo={isDemoMode()}
        />
      </div>

      {/* Primary views routing */}
      <main className={`flex-1 flex flex-col relative w-full pt-2 pb-16 mx-auto ${(!currentUser && showWelcomePortal) ? "max-w-6xl px-4 md:px-0" : "max-w-md"}`}>
        
        {/* Incognito warning active banner */}
        {privacySettings.incognito_mode && activeTab === "discover" && (
          <div className="mx-4 mb-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 flex items-center justify-between gap-3 text-[11px] text-emerald-400">
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Incognito Mode active: Only people you like can see you.</span>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!currentUser ? (
            showWelcomePortal ? (
              /* Beautiful General Homepage / Landing Portal */
              <motion.div
                key="welcome-portal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col"
              >
                <WelcomePortal
                  onStartAuth={(isSignUp) => {
                    setInitialOnboardingSignUp(isSignUp);
                    setShowWelcomePortal(false);
                  }}
                  isDemoMode={isDemoMode()}
                />
              </motion.div>
            ) : (
              /* Onboarding authentication if not logged in */
              <motion.div
                key="onboarding"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex-1 flex flex-col"
              >
                <Onboarding
                  userProfile={null}
                  onSave={handleProfileSave}
                  isDemoMode={isDemoMode()}
                  initialSignUp={initialOnboardingSignUp}
                  onBackToLanding={() => setShowWelcomePortal(true)}
                />
              </motion.div>
            )
          ) : (
            <>
              {/* Swipe Discover view */}
              {activeTab === "discover" && (
                <motion.div
                  key="discover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col"
                >
                  <SwipeDeck
                    profiles={profiles}
                    currentIndex={currentIndex}
                    onSwipe={handleSwipe}
                    onOpenFilters={() => setIsFiltersOpen(true)}
                    filters={filters}
                    blurForUnverified={privacySettings.blur_for_unverified}
                    isCurrentUserVerified={currentUser.is_verified}
                    currentUserInterests={currentUser.interests}
                  />
                </motion.div>
              )}

              {/* Chat messaging view */}
              {activeTab === "matches" && (
                <motion.div
                  key="matches"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col"
                >
                  <MessageInbox
                    matches={matches}
                    onRefresh={loadMatches}
                    currentUserProfile={currentUser}
                  />
                </motion.div>
              )}

              {/* Massage Jonny Wellness booking menu */}
              {activeTab === "wellness" && (
                <motion.div
                  key="wellness"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col"
                >
                  <Wellness />
                </motion.div>
              )}

              {/* Profile Management tab */}
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col"
                >
                  <Onboarding
                    userProfile={currentUser}
                    onSave={handleProfileSave}
                    onSignOut={handleSignOut}
                    isDemoMode={isDemoMode()}
                  />
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Filters Modal Overlay */}
      <AnimatePresence>
        {isFiltersOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm"
            >
              <Filters
                filters={filters}
                onChange={setFilters}
                onClose={() => setIsFiltersOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Privacy settings Modal Overlay */}
      <AnimatePresence>
        {isPrivacyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm"
            >
              <PrivacySettings
                settings={privacySettings}
                onSave={handlePrivacySave}
                onClose={() => setIsPrivacyOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Beautiful Fullscreen Match Success Overlay Modal */}
      <AnimatePresence>
        {matchSuccessOverlay.show && matchSuccessOverlay.profile && (
          <div className="fixed inset-0 z-50 bg-brand-obsidian/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none">
            {/* Confetti Animation Celebration */}
            <ConfettiCanvas active={matchSuccessOverlay.show} />

            {/* Sparkles backdrop */}
            <div className="absolute top-1/4 w-72 h-72 bg-brand-gold/15 rounded-full blur-3xl pointer-events-none" />

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="space-y-8 max-w-sm w-full relative z-10"
            >
              <div className="space-y-2">
                <div className="bg-brand-gold/20 border border-brand-gold/30 text-brand-gold text-[10px] uppercase tracking-widest font-mono font-bold px-3 py-1 rounded-full mx-auto w-max flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Matchmaking Success
                </div>
                <h3 className="font-serif font-black text-4xl text-brand-cream leading-tight">
                  It's a Match!
                </h3>
                <p className="text-xs text-brand-cream/70 max-w-xs mx-auto">
                  You and <strong className="text-brand-gold">{matchSuccessOverlay.profile.name}</strong> liked each other. Spark a safe, discrete conversation below!
                </p>
              </div>

              {/* Overlapping profile circles */}
              <div className="flex items-center justify-center -space-x-6 py-6">
                <div className="relative w-28 h-28 rounded-full p-1 bg-brand-gold">
                  <img
                    src={currentUser?.images?.[0] || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600"}
                    alt="You"
                    className="w-full h-full object-cover rounded-full border-4 border-brand-obsidian"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="relative w-28 h-28 rounded-full p-1 bg-brand-lavender">
                  <img
                    src={matchSuccessOverlay.profile.images[0]}
                    alt={matchSuccessOverlay.profile.name}
                    className="w-full h-full object-cover rounded-full border-4 border-brand-obsidian"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Quick Icebreaker input */}
              <form onSubmit={handleSendMatchIcebreaker} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] text-brand-cream/50 uppercase tracking-widest font-mono">
                    Send a Discreet Opening Message
                  </label>
                  <textarea
                    rows={2}
                    value={matchIcebreaker}
                    onChange={(e) => setMatchIcebreaker(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl bg-brand-plum border border-brand-lavender text-brand-cream focus:outline-none focus:border-brand-gold resize-none leading-relaxed"
                  />
                </div>

                <div className="flex flex-col gap-2.5 pt-2">
                  <button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-brand-gold-muted to-brand-gold text-brand-obsidian rounded-xl font-display font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-lg shadow-brand-gold/15"
                  >
                    <MessageSquare className="w-4 h-4 fill-brand-obsidian" />
                    Send Message & Chat
                  </button>
                  <button
                    type="button"
                    onClick={() => setMatchSuccessOverlay({ show: false, profile: null })}
                    className="w-full h-12 bg-brand-lavender/30 border border-brand-lavender/60 text-brand-cream hover:bg-brand-lavender/50 font-display font-semibold text-xs tracking-wider uppercase rounded-xl transition-all"
                  >
                    Keep Matching
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Safety Panic Floating Button (Fixed, tiny, click to instantly leave page for emergencies) */}
      {privacySettings.panic_button_enabled && (
        <button
          onClick={() => {
            window.location.href = privacySettings.panic_redirect_url;
          }}
          className="fixed bottom-18 right-4 z-40 bg-red-600 hover:bg-red-700 text-white font-mono text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-full shadow-2xl shadow-red-600/30 border border-red-500/50 flex items-center gap-1 active:scale-90 transition-all"
          title="Emergency Panic! Exit Immediately"
          id="global-panic-btn"
        >
          <X className="w-3.5 h-3.5" />
          Panic Exit
        </button>
      )}

      {/* Bottom Navigation */}
      {currentUser && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          unreadCount={unreadCount}
        />
      )}
    </div>
  );
}
