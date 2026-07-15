/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Heart, X, Sparkles, Filter, RefreshCw, Compass, ShieldCheck, Share2 } from "lucide-react";
import { Profile, MatchFilters } from "../types";
import ProfileCard from "./ProfileCard";
import { motion, AnimatePresence } from "motion/react";

interface SwipeDeckProps {
  profiles: Profile[];
  currentIndex: number;
  onSwipe: (direction: "left" | "right" | "up") => void;
  onOpenFilters: () => void;
  filters: MatchFilters;
  blurForUnverified: boolean;
  isCurrentUserVerified: boolean;
}

export default function SwipeDeck({
  profiles,
  currentIndex,
  onSwipe,
  onOpenFilters,
  filters,
  blurForUnverified,
  isCurrentUserVerified,
}: SwipeDeckProps) {
  const activeProfile = profiles[currentIndex];
  const hasProfiles = currentIndex < profiles.length;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Jonny Match",
        text: "Join Jonny Match - Nairobi's premium, safe queer matchmaking and dating network!",
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert("Link copied! Share Jonny Match with your queer community in Kenya.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full max-w-sm mx-auto px-4 py-3">
      <AnimatePresence mode="wait">
        {hasProfiles ? (
          <motion.div
            key={activeProfile.id}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full flex flex-col items-center"
          >
            {/* Swiper Deck Profile Card */}
            <ProfileCard
              profile={activeProfile}
              onLike={() => onSwipe("right")}
              onPass={() => onSwipe("left")}
              blurForUnverified={blurForUnverified}
              isCurrentUserVerified={isCurrentUserVerified}
            />

            {/* Swipe Deck Buttons panel */}
            <div className="flex items-center justify-center gap-6 mt-6 w-full">
              {/* Pass Button */}
              <button
                onClick={() => onSwipe("left")}
                className="w-14 h-14 rounded-full bg-brand-plum border border-brand-lavender/60 flex items-center justify-center text-brand-cream/60 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 active:scale-90 transition-all duration-300 shadow-lg"
                title="Pass (Swipe Left)"
                id="swipe-pass-btn"
              >
                <X className="w-6 h-6 stroke-[2.5]" />
              </button>

              {/* Filter Shortcut */}
              <button
                onClick={onOpenFilters}
                className="w-11 h-11 rounded-full bg-brand-plum border border-brand-lavender/40 flex items-center justify-center text-brand-gold-muted hover:text-brand-gold hover:border-brand-gold/30 hover:bg-brand-gold/10 active:scale-90 transition-all duration-300 shadow-md"
                title="Adjust Matchmaker Filters"
                id="swipe-filter-btn"
              >
                <Filter className="w-4.5 h-4.5" />
              </button>

              {/* Like Button */}
              <button
                onClick={() => onSwipe("right")}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-brand-gold-muted to-brand-gold text-brand-obsidian flex items-center justify-center hover:brightness-110 hover:shadow-brand-gold/20 hover:shadow-xl active:scale-90 transition-all duration-300 shadow-lg"
                title="Like (Swipe Right)"
                id="swipe-like-btn"
              >
                <Heart className="w-6 h-6 fill-brand-obsidian stroke-[2.5]" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-10 px-6 rounded-[32px] bg-brand-plum border border-brand-lavender/40 shadow-2xl flex flex-col items-center justify-center space-y-6 w-full h-[480px]"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-brand-lavender/30 flex items-center justify-center border border-brand-gold/20">
                <Compass className="w-10 h-10 text-brand-gold animate-spin" style={{ animationDuration: "12s" }} />
              </div>
              <Sparkles className="w-6 h-6 text-brand-gold absolute -top-1 -right-1 animate-bounce" />
            </div>

            <div className="space-y-2 max-w-xs">
              <h3 className="font-display font-semibold text-lg text-brand-cream">
                All Caught Up!
              </h3>
              <p className="text-xs text-brand-cream/60 leading-relaxed">
                You've swiped on all available profiles matching your filters in Nairobi. Broaden your search criteria to find more folks!
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-2.5 w-full max-w-[240px]">
              <button
                onClick={onOpenFilters}
                className="w-full py-2.5 bg-brand-gold text-brand-obsidian rounded-xl font-display font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all"
                id="deck-broaden-filters"
              >
                <Filter className="w-3.5 h-3.5" />
                Broaden Filters
              </button>

              <button
                onClick={handleShare}
                className="w-full py-2.5 bg-brand-lavender/30 border border-brand-lavender/60 text-brand-gold rounded-xl font-display font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 hover:bg-brand-lavender/50 transition-all"
                id="deck-share-app"
              >
                <Share2 className="w-3.5 h-3.5" />
                Invite Friends
              </button>
            </div>

            {/* Brand wellness tribute */}
            <div className="border-t border-brand-lavender/30 pt-4 mt-2 max-w-xs">
              <p className="text-[10px] text-brand-cream/50 italic leading-relaxed">
                Take a break from matching! Treat yourself to a comforting, inclusive massage at <strong>Massage Jonny</strong>. Call +254 (0) 790... or book in the Spa tab!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
