/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ShieldCheck, MapPin, Info, ArrowLeft, Heart, Flower, Sparkles, Check, Lock, Flag, AlertTriangle } from "lucide-react";
import { Profile } from "../types";

interface ProfileCardProps {
  profile: Profile;
  onLike: () => void;
  onPass: () => void;
  blurForUnverified: boolean;
  isCurrentUserVerified: boolean;
  currentUserInterests?: string[];
}

export default function ProfileCard({ 
  profile, 
  onLike, 
  onPass, 
  blurForUnverified, 
  isCurrentUserVerified,
  currentUserInterests = []
}: ProfileCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Reporting feature states
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportNotes, setReportNotes] = useState("");
  const [isReportSubmitted, setIsReportSubmitted] = useState(false);

  const defaultFallbackImage = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600";
  const imagesList = Array.isArray(profile.images) && profile.images.length > 0
    ? profile.images
    : [defaultFallbackImage];
  const imagesCount = imagesList.length;
  const currentImage = imagesList[currentImageIndex] || imagesList[0] || defaultFallbackImage;

  // Compatibility matching logic based on matching interests
  const sharedInterests = (profile.interests || []).filter(interest =>
    currentUserInterests.some(userInterest =>
      userInterest.toLowerCase().trim() === interest.toLowerCase().trim()
    )
  );

  let compatibilityLabel = "";
  let compatibilityStyle = "";

  if (sharedInterests.length >= 3) {
    compatibilityLabel = "High Match";
    compatibilityStyle = "bg-brand-gold/20 border border-brand-gold text-brand-gold animate-pulse";
  } else if (sharedInterests.length > 0) {
    compatibilityLabel = "Shared Interests";
    compatibilityStyle = "bg-brand-lavender/30 border border-brand-lavender/60 text-brand-cream/90";
  }

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : imagesCount - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev < imagesCount - 1 ? prev + 1 : 0));
  };

  const shouldBlur = blurForUnverified && !profile.is_verified && !isCurrentUserVerified;

  return (
    <div className="relative w-full max-w-sm h-[520px] rounded-[32px] overflow-hidden bg-brand-plum border border-brand-lavender/40 shadow-2xl flex flex-col select-none">
      {/* Photo stack / Tinder card */}
      <div className="relative w-full h-full overflow-hidden flex-1 group">
        {/* Images Navigation bar indicators */}
        {imagesCount > 1 && !isExpanded && (
          <div className="absolute top-4 left-4 right-4 z-20 flex gap-1.5 px-2">
            {imagesList.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  idx === currentImageIndex ? "bg-brand-gold" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        )}

        {/* Profile Image with Blur Option */}
        <div className="absolute inset-0 bg-brand-obsidian">
          <img
            src={currentImage}
            alt={profile.name}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = defaultFallbackImage;
            }}
            className={`w-full h-full object-cover transition-all duration-500 ${
              shouldBlur ? "blur-2xl opacity-40 scale-110" : "scale-100"
            }`}
            referrerPolicy="no-referrer"
          />

          {/* Secure Blur Overlay for privacy */}
          {shouldBlur && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-obsidian/80 px-6 text-center z-10">
              <div className="w-14 h-14 rounded-2xl bg-brand-lavender/80 border border-brand-gold/30 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-brand-gold" />
              </div>
              <h4 className="font-display font-semibold text-brand-cream text-base mb-1">
                Photo Discretely Blurred
              </h4>
              <p className="text-xs text-brand-cream/60 max-w-xs leading-relaxed">
                This user has enabled Discretion Blurring. Obtain verification (blue shield check) to unlock high-res photos.
              </p>
              <div className="mt-4 bg-brand-gold/10 border border-brand-gold/30 text-brand-gold rounded-full px-3 py-1 text-[10px] font-sans font-medium uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Discretion Active
              </div>
            </div>
          )}
        </div>

        {/* Tap areas to swipe image */}
        {!isExpanded && !shouldBlur && (
          <>
            <div
              className="absolute left-0 top-12 bottom-20 w-1/2 z-10 cursor-w-resize"
              onClick={handlePrevImage}
            />
            <div
              className="absolute right-0 top-12 bottom-20 w-1/2 z-10 cursor-e-resize"
              onClick={handleNextImage}
            />
          </>
        )}

        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-obsidian via-brand-obsidian/30 to-transparent pointer-events-none" />

        {/* Front Info Card details Overlay */}
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end text-brand-cream z-20">
            {/* Compatibility Indicator */}
            {compatibilityLabel && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider mb-2.5 w-fit shadow-md border backdrop-blur-md ${compatibilityStyle}`} id="compatibility-indicator">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>{compatibilityLabel}</span>
                <span className="opacity-75 font-medium normal-case">({sharedInterests.length} shared)</span>
              </div>
            )}

            {/* Badges row */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              <span className="text-[10px] font-sans font-semibold tracking-wider uppercase bg-brand-lavender/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-brand-gold/20 text-brand-gold">
                {profile.orientation}
              </span>
              <span className="text-[10px] font-sans font-semibold tracking-wider uppercase bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-brand-cream/90">
                {profile.gender}
              </span>
              {profile.pronouns && (
                <span className="text-[10px] font-sans font-semibold tracking-wider bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-brand-cream/60">
                  {profile.pronouns}
                </span>
              )}
            </div>

            {/* Interest Badges on Front Card with Shared Interests Highlighted */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {profile.interests.slice(0, 4).map((interest) => {
                  const isShared = currentUserInterests.some(
                    (ui) => ui.toLowerCase().trim() === interest.toLowerCase().trim()
                  );
                  return (
                    <span
                      key={interest}
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 transition-all backdrop-blur-md ${
                        isShared
                          ? "bg-gradient-to-r from-amber-500/35 to-amber-400/25 border border-amber-400 text-amber-200 font-bold shadow-sm shadow-amber-400/20 ring-1 ring-amber-400/50"
                          : "bg-black/40 border border-white/10 text-brand-cream/80"
                      }`}
                    >
                      {isShared && <Sparkles className="w-3 h-3 text-amber-300 animate-pulse shrink-0" />}
                      {interest}
                      {isShared && (
                        <span className="text-[8px] bg-amber-400 text-brand-obsidian px-1.5 py-0.2 rounded-full font-black uppercase tracking-wider ml-0.5">
                          Shared
                        </span>
                      )}
                    </span>
                  );
                })}
                {profile.interests.length > 4 && (
                  <span className="text-[9px] bg-black/40 border border-white/10 text-brand-cream/60 px-2 py-0.5 rounded-full backdrop-blur-md">
                    +{profile.interests.length - 4} more
                  </span>
                )}
              </div>
            )}

            {/* Profile main details */}
            <div className="flex items-end justify-between gap-2">
              <div>
                <h4 className="font-display font-bold text-2xl tracking-tight flex items-center gap-1.5">
                  {profile.name}, {profile.age}
                  {profile.is_verified && (
                    <span className="animate-verified-glow inline-flex items-center justify-center relative" title="Verified Profile">
                      {/* Premium pulsing aura ring */}
                      <span className="absolute inset-0 rounded-full bg-emerald-400/20 blur-sm scale-125" />
                      <ShieldCheck className="w-5 h-5 text-emerald-400 fill-emerald-400/30 relative z-10" />
                    </span>
                  )}
                </h4>

                <div className="flex items-center gap-1 text-xs text-brand-cream/80 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-gold-muted" />
                  <span>{profile.location_name}</span>
                  <span className="mx-1">•</span>
                  <span>{profile.distance_km} km away</span>
                </div>
              </div>

              {/* Info Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(true);
                }}
                className="w-10 h-10 rounded-full bg-brand-cream/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-brand-cream hover:bg-brand-gold hover:text-brand-obsidian hover:border-brand-gold transition-all duration-300 active:scale-95 shadow-md shrink-0"
                title="View Full Profile Details"
              >
                <Info className="w-5 h-5" />
              </button>
            </div>

            {/* Micro Jonny Massage Affinity Tribute */}
            {profile.massage_affinity && (
              <div className="mt-3 flex items-center gap-1.5 bg-brand-gold/10 border border-brand-gold/20 rounded-xl px-3 py-1.5 text-[10px] text-brand-gold-muted font-sans tracking-wide">
                <Flower className="w-3.5 h-3.5 text-brand-gold shrink-0 animate-pulse-heart" />
                <span>Jonny affinity: <strong className="text-brand-gold font-medium">{profile.massage_affinity}</strong></span>
              </div>
            )}
          </div>
        )}

        {/* Expanded Profile View Overlay */}
        {isExpanded && (
          <div className="absolute inset-0 bg-brand-plum overflow-y-auto p-6 text-brand-cream flex flex-col z-30 transition-all duration-300">
            {isReporting ? (
              <div className="flex-1 flex flex-col h-full justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-brand-lavender/40 pb-3">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <h3 className="font-serif font-black text-base text-brand-cream">Report Account</h3>
                    </div>
                    <button
                      onClick={() => {
                        setIsReporting(false);
                        setReportReason("");
                        setReportNotes("");
                      }}
                      className="text-xs text-brand-cream/50 hover:text-brand-cream"
                    >
                      Cancel
                    </button>
                  </div>

                  {isReportSubmitted ? (
                    <div className="space-y-4 py-8 text-center flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2 animate-bounce">
                        <Check className="w-6 h-6 stroke-[3]" />
                      </div>
                      <h4 className="font-serif font-bold text-base text-brand-cream">Flagged Successfully</h4>
                      <p className="text-[11px] text-brand-cream/70 max-w-xs leading-relaxed">
                        We take community safety extremely seriously. Your discreet report for <strong className="text-brand-gold">{profile.name}</strong> has been logged. Admin review will happen within 24 hours. This user will now be auto-passed.
                      </p>
                      <button
                        onClick={() => {
                          setIsReporting(false);
                          setIsReportSubmitted(false);
                          setIsExpanded(false);
                          setReportReason("");
                          setReportNotes("");
                          onPass(); // Dismiss profile
                        }}
                        className="w-full py-2.5 bg-brand-gold text-brand-obsidian rounded-xl font-display font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-md mt-4 active:scale-95 transition-all"
                      >
                        Dismiss & Continue Swiping
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      <p className="text-[11px] text-brand-cream/60 leading-relaxed">
                        To maintain Nairobi's safest queer space, please report any violations of safety, harassment, fake profiles, or solicitation.
                      </p>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-mono tracking-widest text-brand-gold block">
                          Reason for Report
                        </label>
                        <div className="grid grid-cols-1 gap-1.5">
                          {[
                            "Fake profile / Catfishing",
                            "Harassment or Abusive behavior",
                            "Inappropriate or stolen photos",
                            "Commercial soliciting or Scam",
                            "Underage or offensive bio details",
                            "Extortion or safety threat"
                          ].map((reason) => (
                            <button
                              key={reason}
                              type="button"
                              onClick={() => setReportReason(reason)}
                              className={`w-full py-2 px-3 text-left rounded-xl text-[11px] border transition-all ${
                                reportReason === reason
                                  ? "bg-red-500/15 border-red-500/50 text-red-400 font-semibold"
                                  : "bg-brand-obsidian/40 border-brand-lavender/30 text-brand-cream/70 hover:border-brand-lavender/60"
                              }`}
                            >
                              {reason}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-mono tracking-widest text-brand-gold block">
                          Additional Details (Optional)
                        </label>
                        <textarea
                          value={reportNotes}
                          onChange={(e) => setReportNotes(e.target.value)}
                          placeholder="Provide specific notes so our safety moderators can investigate details immediately..."
                          className="w-full h-18 bg-brand-obsidian/40 border border-brand-lavender/30 rounded-xl p-2.5 text-xs text-brand-cream/90 placeholder-brand-cream/30 focus:outline-none focus:border-brand-gold/50 resize-none font-sans"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {!isReportSubmitted && (
                  <div className="flex gap-3 pt-3 border-t border-brand-lavender/30">
                    <button
                      type="button"
                      onClick={() => {
                        setIsReporting(false);
                        setReportReason("");
                        setReportNotes("");
                      }}
                      className="flex-1 py-2 bg-brand-lavender/20 border border-brand-lavender/40 text-brand-cream/80 rounded-xl text-xs font-semibold hover:bg-brand-lavender/30 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!reportReason) return;
                        setIsReportSubmitted(true);
                      }}
                      disabled={!reportReason}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 transition-all ${
                        reportReason
                          ? "bg-red-500 text-brand-cream hover:bg-red-600 shadow-md shadow-red-500/20"
                          : "bg-brand-lavender/20 text-brand-cream/25 cursor-not-allowed"
                      }`}
                    >
                      <Flag className="w-3.5 h-3.5" />
                      Submit Report
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Header back button */}
                <div className="flex items-center justify-between mb-4 border-b border-brand-lavender/40 pb-3">
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="flex items-center gap-1 text-xs text-brand-gold-muted hover:text-brand-gold font-sans font-medium transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to swiping
                  </button>
                  <div className="flex items-center gap-1.5">
                    {profile.is_verified && (
                      <div className="flex items-center gap-1 bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 border border-emerald-500/40 text-emerald-300 rounded-full px-2.5 py-0.5 text-[9px] uppercase tracking-wider font-sans font-semibold shadow-sm animate-verified-glow">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified
                      </div>
                    )}
                    <button
                      onClick={() => setIsReporting(true)}
                      className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-full px-2 py-0.5 text-[9px] uppercase tracking-wider font-sans font-semibold transition-all duration-300 shadow-sm"
                      title="Report User for Safety"
                    >
                      <Flag className="w-3 h-3" /> Report
                    </button>
                  </div>
                </div>

                {/* Expanded Bio details */}
                <div className="space-y-4 flex-1">
                  <div>
                    <h4 className="font-serif font-bold text-2xl tracking-tight">
                      {profile.name}, {profile.age}
                    </h4>
                    <p className="text-xs text-brand-cream/50 font-sans mt-0.5">{profile.gender} • {profile.orientation}</p>
                  </div>

                  <div className="space-y-1 bg-brand-obsidian/40 border border-brand-lavender/40 rounded-2xl p-4">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gold">About Me</span>
                    <p className="text-sm text-brand-cream/90 leading-relaxed mt-1">
                      {profile.bio}
                    </p>
                  </div>

                  {/* Photo Gallery Grid in Expanded View */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gold block">
                      Photo Album ({imagesCount})
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {imagesList.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`relative aspect-3/4 rounded-xl overflow-hidden border cursor-pointer transition-all ${
                            idx === currentImageIndex
                              ? "border-brand-gold shadow-md shadow-brand-gold/20 ring-2 ring-brand-gold/30"
                              : "border-brand-lavender/40 hover:border-brand-gold/60 opacity-80 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt={`${profile.name} photo ${idx + 1}`}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = defaultFallbackImage;
                            }}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {idx === currentImageIndex && (
                            <div className="absolute top-1.5 right-1.5 bg-brand-gold text-brand-obsidian text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                              Active
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Massage Jonny Wellness Tribute Section */}
                  {profile.massage_affinity && (
                    <div className="bg-gradient-to-br from-brand-lavender/40 to-brand-plum border border-brand-gold/30 rounded-2xl p-4 space-y-2">
                      <span className="flex items-center gap-1 text-[10px] uppercase font-mono tracking-widest text-brand-gold font-semibold">
                        <Flower className="w-4 h-4 text-brand-gold" />
                        Jonny's Healing Space
                      </span>
                      <p className="text-xs text-brand-cream/80 leading-relaxed">
                        This user loves wellness! Their preference: <strong className="text-brand-gold">{profile.massage_affinity}</strong>. Connect and book a soothing couple's session at Massage Jonny Westlands!
                      </p>
                    </div>
                  )}

                  {/* Interests Tags */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gold">Passions & Interests</span>
                      {sharedInterests.length > 0 && (
                        <span className="text-[10px] font-sans font-bold text-amber-300 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          {sharedInterests.length} Shared with you
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.interests.map((interest) => {
                        const isShared = currentUserInterests.some(
                          (ui) => ui.toLowerCase().trim() === interest.toLowerCase().trim()
                        );
                        return (
                          <span
                            key={interest}
                            className={`text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 transition-all ${
                              isShared
                                ? "bg-gradient-to-r from-amber-500/30 to-amber-400/20 border-2 border-amber-400 text-amber-200 font-bold shadow-md shadow-amber-500/20 ring-1 ring-amber-400/40"
                                : "bg-brand-lavender/30 border border-brand-lavender/60 text-brand-cream/80"
                            }`}
                          >
                            {isShared && <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />}
                            {interest}
                            {isShared && (
                              <span className="text-[9px] bg-amber-400 text-brand-obsidian font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider ml-0.5 shadow-xs">
                                Shared
                              </span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Goals */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gold">Looking For</span>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.relationship_goals.map((goal) => (
                        <span
                          key={goal}
                          className="text-xs bg-brand-gold/10 border border-brand-gold/30 text-brand-gold px-3 py-1 rounded-full font-medium"
                        >
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick action triggers inside info */}
                <div className="flex justify-center gap-4 mt-6 pt-4 border-t border-brand-lavender/40">
                  <button
                    onClick={onPass}
                    className="w-12 h-12 rounded-full bg-brand-lavender/30 border border-brand-lavender text-brand-cream/70 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 flex items-center justify-center transition-all duration-300 active:scale-95"
                    title="Pass"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={onLike}
                    className="flex-1 bg-gradient-to-r from-brand-gold-muted to-brand-gold text-brand-obsidian h-12 rounded-2xl font-display font-semibold text-sm tracking-wide flex items-center justify-center gap-1.5 shadow-lg active:scale-98 transition-all"
                    title="Swipe Right"
                  >
                    <Heart className="w-4 h-4 fill-brand-obsidian" />
                    Connect Now
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
