/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, X, Sparkles, Shield, EyeOff, Flower, Check, ShieldCheck,
  MapPin, MessageSquare, ChevronRight, HelpCircle, Key, Lock, ArrowRight, Smartphone
} from "lucide-react";
import { Profile } from "../types";
import { mockProfiles } from "../data/mockProfiles";
import ConfettiCanvas from "./ConfettiCanvas";

interface WelcomePortalProps {
  onStartAuth: (isSignUp: boolean) => void;
  isDemoMode: boolean;
}

export default function WelcomePortal({ onStartAuth, isDemoMode }: WelcomePortalProps) {
  // Mock profiles for the swiping phone screen demo
  const [demoProfiles, setDemoProfiles] = useState<Profile[]>(mockProfiles.slice(0, 4));
  const [demoIndex, setDemoIndex] = useState(0);
  const [demoMatches, setDemoMatches] = useState<Profile[]>([]);
  const [showDemoMatchOverlay, setShowDemoMatchOverlay] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);

  // Auto-swipe simulator to show interaction if user doesn't touch it
  useEffect(() => {
    const timer = setTimeout(() => {
      if (demoIndex === 0 && !showDemoMatchOverlay) {
        // Automatically swipe right on first profile after 4 seconds to show it's interactive!
        handleDemoSwipe("right");
      }
    }, 4500);
    return () => clearTimeout(timer);
  }, [demoIndex, showDemoMatchOverlay]);

  const handleDemoSwipe = (direction: "left" | "right") => {
    if (demoIndex >= demoProfiles.length) {
      // Loop back
      setDemoIndex(0);
      setShowDemoMatchOverlay(false);
      return;
    }

    const activeProfile = demoProfiles[demoIndex];

    if (direction === "right") {
      // Simulate high match chance (80%)
      const isMatch = Math.random() < 0.85;
      if (isMatch) {
        setMatchedProfile(activeProfile);
        setShowDemoMatchOverlay(true);
      } else {
        setDemoIndex((prev) => prev + 1);
      }
    } else {
      setDemoIndex((prev) => prev + 1);
    }
  };

  const handleResetDemo = () => {
    setDemoIndex(0);
    setShowDemoMatchOverlay(false);
    setMatchedProfile(null);
  };

  const activeDemoProfile = demoProfiles[demoIndex];

  const renderPhoneMockup = () => {
    return (
      <div className="relative">
        {/* Outer glowing halo - PRIDE RAINBOW GRADIENT */}
        <div className="absolute -inset-4 pride-glowing-halo rounded-[46px] blur-xl opacity-65 pointer-events-none" />

        {/* Device Mockup Frame with Pride border and glowing style */}
        <div className="w-[300px] xs:w-[320px] h-[580px] bg-[#0c0c0c] rounded-[42px] overflow-hidden shadow-2xl relative flex flex-col pride-border">
          
          {/* Top Phone Speaker Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-brand-lavender rounded-b-xl z-30 flex items-center justify-center">
            <div className="w-10 h-1 bg-[#222] rounded-full" />
          </div>

          {/* Inner Phone Screen Content */}
          <div className="flex-1 flex flex-col bg-brand-obsidian text-brand-cream font-sans relative overflow-hidden pt-6">
            
            {/* Mini App Header inside phone */}
            <div className="h-12 border-b border-brand-lavender/20 px-4 flex items-center justify-between bg-brand-obsidian/90">
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-6 border border-brand-gold flex items-center justify-center text-brand-gold text-[9px] font-bold font-serif">KJ</span>
                <span className="text-[10px] tracking-widest font-serif font-black text-brand-gold">KONNECTJOHNNY</span>
              </div>
              <div className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                Nairobi
              </div>
            </div>

            {/* Swipe Deck Canvas in phone */}
            <div className="flex-1 p-3 flex flex-col justify-between relative">
              
              <AnimatePresence mode="wait">
                {activeDemoProfile ? (
                  <motion.div
                    key={activeDemoProfile.id}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="flex-1 bg-brand-plum border border-brand-lavender/30 rounded-[28px] overflow-hidden relative shadow-md flex flex-col justify-end"
                  >
                    {/* Profile Image */}
                    <img 
                      src={activeDemoProfile.images[0]} 
                      alt={activeDemoProfile.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-obsidian via-brand-obsidian/30 to-transparent z-10" />

                    {/* Floating Verification Shield */}
                    {activeDemoProfile.is_verified && (
                      <div className="absolute top-3 right-3 z-20 bg-emerald-500 text-brand-obsidian p-1 rounded-full shadow-lg flex items-center justify-center animate-verified-glow border border-emerald-400/50">
                        <ShieldCheck className="w-4.5 h-4.5 text-white" />
                      </div>
                    )}

                    {/* Card Profile Details */}
                    <div className="p-4 relative z-20 space-y-1.5 text-left">
                      <div className="flex items-baseline gap-1.5">
                        <h3 className="font-serif text-xl font-bold text-brand-cream">{activeDemoProfile.name}</h3>
                        <span className="text-xs font-semibold text-brand-cream/80">{activeDemoProfile.age}</span>
                      </div>

                      {/* Location */}
                      <p className="text-[10px] text-brand-gold flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3" />
                        {activeDemoProfile.location_name}
                      </p>

                      {/* Bio */}
                      <p className="text-[10px] text-brand-cream/70 line-clamp-2 leading-relaxed">
                        {activeDemoProfile.bio}
                      </p>

                      {/* Bio Interest tags */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {activeDemoProfile.interests.slice(0, 3).map((interest) => (
                          <span key={interest} className="text-[8px] px-1.5 py-0.5 rounded-full bg-brand-lavender/50 text-brand-cream/80 border border-brand-lavender/30">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-brand-lavender/30 flex items-center justify-center text-brand-gold-muted mb-2">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-brand-cream/80 font-medium">You've swiped everyone!</p>
                    <button 
                      onClick={handleResetDemo}
                      className="text-[9px] text-brand-gold uppercase tracking-widest mt-2 hover:underline"
                    >
                      Start Over Demo
                    </button>
                  </div>
                )}
              </AnimatePresence>

              {/* Simulated action buttons */}
              {activeDemoProfile && (
                <div className="flex justify-center gap-4 py-2 mt-2">
                  <button 
                    onClick={() => handleDemoSwipe("left")}
                    className="w-10 h-10 rounded-full bg-brand-plum border border-red-500/40 text-red-400 flex items-center justify-center active:scale-90 transition-all hover:bg-red-500/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDemoSwipe("right")}
                    className="w-12 h-12 rounded-full bg-brand-gold text-brand-obsidian flex items-center justify-center active:scale-90 transition-all hover:brightness-110 shadow-lg shadow-brand-gold/20"
                  >
                    <Heart className="w-6 h-6 fill-brand-obsidian" />
                  </button>
                </div>
              )}

            </div>

            {/* Fictitious Match success popup inside phone */}
            <AnimatePresence>
              {showDemoMatchOverlay && matchedProfile && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-brand-obsidian/95 z-20 flex flex-col items-center justify-center p-4 text-center animate-fade-in"
                >
                  {/* Confetti celebration for mock phone */}
                  <ConfettiCanvas active={showDemoMatchOverlay} />

                  <div className="w-8 h-8 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mb-2">
                    <Sparkles className="w-4 h-4 text-brand-gold" />
                  </div>
                  <h4 className="font-serif font-black text-lg text-brand-cream">It's a Match!</h4>
                  <p className="text-[9px] text-brand-cream/60 max-w-[200px] mx-auto mt-1 leading-relaxed">
                    You and <strong className="text-brand-gold">{matchedProfile.name}</strong> liked each other!
                  </p>

                  {/* Circle photos */}
                  <div className="flex items-center -space-x-4 py-3">
                    <div className="w-14 h-14 rounded-full p-0.5 bg-brand-gold">
                      <img 
                        src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200" 
                        alt="You" 
                        className="w-full h-full object-cover rounded-full border border-brand-obsidian"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="w-14 h-14 rounded-full p-0.5 bg-brand-gold">
                      <img 
                        src={matchedProfile.images[0]} 
                        alt={matchedProfile.name} 
                        className="w-full h-full object-cover rounded-full border border-brand-obsidian"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>

                  <p className="text-[9px] text-brand-gold-muted italic mb-3">Try sending a secure greeting...</p>

                  <button
                    onClick={() => onStartAuth(true)}
                    className="w-full h-9 bg-brand-gold text-brand-obsidian rounded-xl font-display font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5 fill-brand-obsidian" />
                    Sign Up & Chat For Real
                  </button>

                  <button 
                    onClick={() => {
                      setShowDemoMatchOverlay(false);
                      setDemoIndex((prev) => prev + 1);
                    }}
                    className="text-[9px] text-brand-cream/50 underline mt-2 hover:text-brand-cream"
                  >
                    Keep Demo Swiping
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom simulator instructions */}
            <div className="h-10 bg-brand-plum border-t border-brand-lavender/20 flex items-center justify-center text-[9px] text-brand-cream/50 uppercase tracking-widest gap-1">
              <Smartphone className="w-3.5 h-3.5 text-brand-gold-muted" />
              Interactive Mock App
            </div>

          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-12 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 min-h-[calc(100vh-140px)] select-none">
      
      {/* LEFT COLUMN: Marketing, Title, and dynamic layout */}
      <div className="flex-1 flex flex-col space-y-8 text-left max-w-xl">
        
        {/* 1. Header & Text Block (Order 1 on mobile) */}
        <div className="space-y-4 order-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pink-500/10 via-yellow-500/10 to-violet-500/10 border border-brand-gold/30 text-brand-gold text-[11px] font-mono uppercase tracking-widest animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-gradient-pride font-black tracking-widest">Nairobi's Safest Queer space</span>
          </div>
          <h2 className="font-serif font-black text-4xl md:text-5xl text-brand-cream leading-tight tracking-tight">
            Elevated Connection.<br />
            <span className="text-gradient-pride font-black">
              Absolute Discretion.
            </span>
          </h2>
          <p className="text-sm md:text-base text-brand-cream/75 leading-relaxed font-sans">
            Welcome to <strong className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-300 font-bold">KonnectJohnny</strong>—a bright, vibrant matchmaking and dating portal created specifically for the Nairobi queer community. Designed from the ground up for safety, absolute privacy, premium wellness integration, and genuine pride-filled connections.
          </p>
        </div>

        {/* 2. Interactive Mockup on Mobile ONLY (Order 2 on mobile, hidden on desktop) */}
        <div className="order-2 lg:hidden w-full flex justify-center py-4">
          {renderPhoneMockup()}
        </div>

        {/* 3. Feature grid (Order 3 on mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 order-3">
          <div className="p-4 bg-brand-plum/40 border border-brand-lavender/40 rounded-2xl space-y-2 hover:border-brand-gold/35 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
              <Shield className="w-4.5 h-4.5" />
            </div>
            <h4 className="text-xs font-semibold tracking-wider uppercase text-brand-cream">
              Double-Tap Panic Button
            </h4>
            <p className="text-[11px] text-brand-cream/60 leading-relaxed">
              Instantly leaves the application for a generic news or utility site in case of sudden intrusion.
            </p>
          </div>

          <div className="p-4 bg-brand-plum/40 border border-brand-lavender/40 rounded-2xl space-y-2 hover:border-brand-gold/35 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
              <EyeOff className="w-4.5 h-4.5" />
            </div>
            <h4 className="text-xs font-semibold tracking-wider uppercase text-brand-cream">
              Discreet Stealth Mode
            </h4>
            <p className="text-[11px] text-brand-cream/60 leading-relaxed">
              Disguise the app header, change icons, obfuscate distance, and blur photos for unverified visitors.
            </p>
          </div>

          <div className="p-4 bg-brand-plum/40 border border-brand-lavender/40 rounded-2xl space-y-2 hover:border-brand-gold/35 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
              <Flower className="w-4.5 h-4.5" />
            </div>
            <h4 className="text-xs font-semibold tracking-wider uppercase text-brand-cream">
              Massage Jonny Wellness
            </h4>
            <p className="text-[11px] text-brand-cream/60 leading-relaxed">
              Unlock relaxing massage sessions, therapeutic aromatherapy, and professional treatments directly on-app.
            </p>
          </div>

          <div className="p-4 bg-brand-plum/40 border border-brand-lavender/40 rounded-2xl space-y-2 hover:border-brand-gold/35 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
              <MapPin className="w-4.5 h-4.5" />
            </div>
            <h4 className="text-xs font-semibold tracking-wider uppercase text-brand-cream">
              Local Nairobi Venues
            </h4>
            <p className="text-[11px] text-brand-cream/60 leading-relaxed">
              Find verified singles in Kilimani, Westlands, Karen, Lavington, Ngong Road, and CBD safely.
            </p>
          </div>
        </div>

        {/* 4. Primary Call to Actions (Order 4 on mobile) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4 order-4">
          <button
            onClick={() => onStartAuth(true)}
            className="h-12 px-8 bg-gradient-to-r from-brand-gold-muted to-brand-gold text-brand-obsidian font-display font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all shadow-lg shadow-brand-gold/10"
          >
            Create Secure Account
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onStartAuth(false)}
            className="h-12 px-8 bg-brand-lavender/30 border border-brand-lavender/60 text-brand-cream hover:bg-brand-lavender/50 font-display font-semibold text-xs uppercase tracking-wider rounded-xl transition-all"
          >
            Sign In to Account
          </button>
        </div>

        {isDemoMode && (
          <p className="text-[10px] text-brand-gold-muted italic flex items-center gap-1 order-5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-ping" />
            Sandbox active: Register or log in with any fictitious email and password instantly.
          </p>
        )}
      </div>

      {/* RIGHT SIDE: Desktop-only phone mockup */}
      <div className="hidden lg:flex w-full lg:w-auto flex-col items-center justify-center shrink-0">
        {renderPhoneMockup()}
      </div>

    </div>
  );
}
