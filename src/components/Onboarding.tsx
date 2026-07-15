/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, ShieldCheck, Heart, MapPin, Sparkles, Upload, Flower, CheckCircle, Check, Key } from "lucide-react";
import { UserProfile } from "../types";

interface OnboardingProps {
  userProfile: UserProfile | null;
  onSave: (profile: UserProfile) => void;
  onSignOut?: () => void;
  isDemoMode: boolean;
  initialSignUp?: boolean;
  onBackToLanding?: () => void;
}

const GENDER_OPTIONS = ["Non-binary", "Trans Woman", "Trans Man", "Cis Woman", "Cis Man", "Genderfluid", "Queer"];
const ORIENTATION_OPTIONS = ["Queer", "Lesbian", "Gay", "Bisexual", "Pansexual", "Fluid", "Asexual"];
const GOAL_OPTIONS = ["Dating", "Matchmaking", "Friends First", "Deep Connections", "Casual Fun"];
const MASSAGE_AFFINITIES = [
  "Swedish Massage Enthusiast",
  "Aromatherapy Fan",
  "Deep Tissue Devotee",
  "Hot Stone Enthusiast",
  "Reflexology & Tea Lover",
];
const NAIROBI_NEIGHBOURHOODS = [
  "Kilimani, Nairobi",
  "Westlands, Nairobi",
  "Karen, Nairobi",
  "Lavington, Nairobi",
  "Ngong Road, Nairobi",
  "CBD, Nairobi",
  "Parklands, Nairobi",
  "Gigiri, Nairobi",
];

export default function Onboarding({ userProfile, onSave, onSignOut, isDemoMode, initialSignUp = true, onBackToLanding }: OnboardingProps) {
  // If no profile, we start in Auth/Welcome mode
  const [isAuthMode, setIsAuthMode] = useState(!userProfile);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(initialSignUp);

  // Form Fields
  const [name, setName] = useState(userProfile?.name || "");
  const [age, setAge] = useState(userProfile?.age || 25);
  const [gender, setGender] = useState(userProfile?.gender || GENDER_OPTIONS[0]);
  const [pronouns, setPronouns] = useState(userProfile?.pronouns || "They/Them");
  const [orientation, setOrientation] = useState(userProfile?.orientation || ORIENTATION_OPTIONS[0]);
  const [bio, setBio] = useState(userProfile?.bio || "");
  const [locationName, setLocationName] = useState(userProfile?.location_name || NAIROBI_NEIGHBOURHOODS[0]);
  const [imageUrl, setImageUrl] = useState(userProfile?.images?.[0] || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600");
  const [massageAffinity, setMassageAffinity] = useState(userProfile?.massage_affinity || MASSAGE_AFFINITIES[0]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(userProfile?.relationship_goals || ["Dating"]);
  const [isVerified, setIsVerified] = useState(userProfile?.is_verified ?? true);

  const handleToggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedProfile: UserProfile = {
      id: userProfile?.id || "current_user",
      name,
      age: Number(age),
      gender,
      pronouns,
      orientation,
      bio,
      location_name: locationName,
      distance_km: 0,
      images: [imageUrl],
      interests: ["Art", "Yoga", "Vinyl", "Music"],
      is_verified: isVerified,
      relationship_goals: selectedGoals,
      massage_affinity: massageAffinity,
      email: userProfile?.email || email || "demo@massagejohnny.com",
    };

    onSave(updatedProfile);
    setIsAuthMode(false);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate / execute registration
    const defaultProfile: UserProfile = {
      id: "current_user",
      name: name || "Jonny Guest",
      age: Number(age) || 26,
      gender,
      pronouns,
      orientation,
      bio: bio || "Exploring connections in Nairobi...",
      location_name: locationName,
      distance_km: 0,
      images: [imageUrl],
      interests: ["Coffee", "Art", "Yoga"],
      is_verified: isVerified,
      relationship_goals: selectedGoals,
      massage_affinity: massageAffinity,
      email,
    };

    onSave(defaultProfile);
    setIsAuthMode(false);
  };

  if (isAuthMode) {
    /* Welcome / Register Screen */
    return (
      <div className="w-full max-w-md mx-auto h-[calc(100vh-130px)] overflow-y-auto px-4 py-5 space-y-6 bg-brand-obsidian pb-20">
        
        {onBackToLanding && (
          <button
            type="button"
            onClick={onBackToLanding}
            className="text-xs text-brand-gold hover:text-brand-gold-muted font-display font-medium tracking-wide flex items-center gap-1.5 py-1 mb-2 transition-all"
          >
            ← Back to Homepage
          </button>
        )}

        <div className="text-center space-y-2 py-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-brand-gold to-brand-lavender border border-brand-gold/30 flex items-center justify-center mx-auto mb-3">
            <Heart className="w-7 h-7 text-brand-gold animate-pulse-heart" />
          </div>
          <h3 className="font-serif font-bold text-2xl text-brand-cream tracking-tight">
            Nairobi's Safe Space
          </h3>
          <p className="text-xs text-brand-cream/60 max-w-xs mx-auto leading-relaxed">
            A premium, highly-discrete matchmaking and dating network created by Massage Jonny for the queer community in Kenya.
          </p>
        </div>

        <form onSubmit={handleAuthSubmit} className="bg-brand-plum border border-brand-lavender/50 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex border-b border-brand-lavender/40 pb-2">
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 text-xs font-display font-semibold uppercase tracking-wider pb-2 transition-colors ${
                isSignUp ? "text-brand-gold border-b-2 border-brand-gold" : "text-brand-cream/40"
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 text-xs font-display font-semibold uppercase tracking-wider pb-2 transition-colors ${
                !isSignUp ? "text-brand-gold border-b-2 border-brand-gold" : "text-brand-cream/40"
              }`}
            >
              Sign In
            </button>
          </div>

          <div className="space-y-3.5">
            {/* Email */}
            <div className="space-y-1">
              <label className="text-[10px] text-brand-cream/50 uppercase tracking-widest font-mono">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full text-xs px-3 py-2.5 rounded-xl bg-brand-obsidian border border-brand-lavender text-brand-cream focus:outline-none focus:border-brand-gold"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[10px] text-brand-cream/50 uppercase tracking-widest font-mono">
                Secret Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs px-3 py-2.5 rounded-xl bg-brand-obsidian border border-brand-lavender text-brand-cream focus:outline-none focus:border-brand-gold"
              />
            </div>

            {isSignUp && (
              <>
                {/* Public Name */}
                <div className="space-y-1">
                  <label className="text-[10px] text-brand-cream/50 uppercase tracking-widest font-mono">
                    Public First Name (or Alias)
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Charlie"
                    className="w-full text-xs px-3 py-2.5 rounded-xl bg-brand-obsidian border border-brand-lavender text-brand-cream focus:outline-none focus:border-brand-gold"
                  />
                </div>

                {/* Public Age */}
                <div className="space-y-1">
                  <label className="text-[10px] text-brand-cream/50 uppercase tracking-widest font-mono">
                    Age (Must be 18+)
                  </label>
                  <input
                    type="number"
                    required
                    min="18"
                    max="99"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2.5 rounded-xl bg-brand-obsidian border border-brand-lavender text-brand-cream focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-brand-gold-muted to-brand-gold text-brand-obsidian font-display font-semibold text-xs tracking-wider uppercase rounded-xl shadow-md active:scale-98 transition-all mt-4"
          >
            {isSignUp ? "Create Secure Profile" : "Secure Sign In"}
          </button>

          {isDemoMode && (
            <div className="text-[10px] text-brand-gold-muted text-center leading-relaxed italic bg-brand-obsidian/30 p-2.5 rounded-xl mt-3">
              Running in local sandbox. You can use any mockup credentials to sign up or log in instantly.
            </div>
          )}
        </form>
      </div>
    );
  }

  /* Profile Editor View (when activeTab is 'profile') */
  return (
    <div className="w-full max-w-md mx-auto h-[calc(100vh-130px)] overflow-y-auto px-4 py-5 space-y-6 bg-brand-obsidian pb-20">
      <div className="flex items-center justify-between">
        <h3 className="font-serif font-bold text-lg text-brand-cream flex items-center gap-2">
          <User className="w-5 h-5 text-brand-gold" />
          Edit Your Public Card
        </h3>
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="text-[10px] font-sans font-semibold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-xl hover:bg-red-500/20 transition-all"
          >
            Sign Out
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-brand-plum border border-brand-lavender/50 rounded-3xl p-5 shadow-lg">
        {/* Verification Check Simulator */}
        <div className="bg-brand-gold/10 border border-brand-gold/20 rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-brand-cream flex items-center gap-1">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
              Verified Status (Shield check)
            </span>
            <p className="text-[10px] text-brand-cream/60">
              Show others you are a verified member of Jonny Match.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsVerified(!isVerified)}
            className={`text-[10px] font-sans font-semibold uppercase tracking-wider px-3 py-1.5 rounded-xl border transition-all ${
              isVerified
                ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                : "bg-brand-lavender/40 border-brand-lavender text-brand-cream/50 hover:border-brand-gold/40"
            }`}
          >
            {isVerified ? "Verified" : "Unverified"}
          </button>
        </div>

        {/* Profile Image URL */}
        <div className="space-y-2">
          <label className="text-[10px] text-brand-cream/50 uppercase tracking-widest font-mono block">
            Profile Image URL (Portrait)
          </label>
          <div className="flex gap-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-brand-obsidian border border-brand-lavender">
              <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
            </div>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Unsplash portrait URL..."
              className="flex-1 text-xs px-3 py-2.5 rounded-xl bg-brand-obsidian border border-brand-lavender text-brand-cream focus:outline-none focus:border-brand-gold"
            />
          </div>
          <div className="flex gap-2 justify-end mt-1.5">
            <button
              type="button"
              onClick={() => setImageUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600")}
              className="text-[9px] text-brand-gold-muted hover:text-brand-gold uppercase tracking-wider"
            >
              Preset A
            </button>
            <button
              type="button"
              onClick={() => setImageUrl("https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600")}
              className="text-[9px] text-brand-gold-muted hover:text-brand-gold uppercase tracking-wider"
            >
              Preset B
            </button>
          </div>
        </div>

        {/* Name and Age */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 space-y-1.5">
            <label className="text-[10px] text-brand-cream/50 uppercase tracking-widest font-mono">
              Display Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl bg-brand-obsidian border border-brand-lavender text-brand-cream focus:outline-none focus:border-brand-gold"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-brand-cream/50 uppercase tracking-widest font-mono">
              Age
            </label>
            <input
              type="number"
              required
              min="18"
              max="99"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full text-xs px-3 py-2.5 rounded-xl bg-brand-obsidian border border-brand-lavender text-brand-cream focus:outline-none focus:border-brand-gold"
            />
          </div>
        </div>

        {/* Gender, Pronouns, Orientation */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] text-brand-cream/50 uppercase tracking-widest font-mono">
              Gender Identity
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl bg-brand-obsidian border border-brand-lavender text-brand-cream focus:outline-none focus:border-brand-gold"
            >
              {GENDER_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-brand-cream/50 uppercase tracking-widest font-mono">
              Pronouns
            </label>
            <input
              type="text"
              value={pronouns}
              onChange={(e) => setPronouns(e.target.value)}
              placeholder="They/Them"
              className="w-full text-xs px-3 py-2.5 rounded-xl bg-brand-obsidian border border-brand-lavender text-brand-cream focus:outline-none focus:border-brand-gold"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] text-brand-cream/50 uppercase tracking-widest font-mono">
            Orientation
          </label>
          <select
            value={orientation}
            onChange={(e) => setOrientation(e.target.value)}
            className="w-full text-xs px-3 py-2.5 rounded-xl bg-brand-obsidian border border-brand-lavender text-brand-cream focus:outline-none focus:border-brand-gold"
          >
            {ORIENTATION_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        {/* Location selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-brand-cream/50 uppercase tracking-widest font-mono flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-brand-gold" />
            Nairobi Location
          </label>
          <select
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            className="w-full text-xs px-3 py-2.5 rounded-xl bg-brand-obsidian border border-brand-lavender text-brand-cream focus:outline-none focus:border-brand-gold"
          >
            {NAIROBI_NEIGHBOURHOODS.map((neighborhood) => (
              <option key={neighborhood} value={neighborhood}>
                {neighborhood}
              </option>
            ))}
          </select>
        </div>

        {/* Massage affinity tribute selection */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-brand-cream/50 uppercase tracking-widest font-mono flex items-center gap-1">
            <Flower className="w-3.5 h-3.5 text-brand-gold" />
            Jonny's Massage Preference
          </label>
          <select
            value={massageAffinity}
            onChange={(e) => setMassageAffinity(e.target.value)}
            className="w-full text-xs px-3 py-2.5 rounded-xl bg-brand-obsidian border border-brand-lavender text-brand-cream focus:outline-none focus:border-brand-gold"
          >
            {MASSAGE_AFFINITIES.map((affinity) => (
              <option key={affinity} value={affinity}>
                {affinity}
              </option>
            ))}
          </select>
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-brand-cream/50 uppercase tracking-widest font-mono">
            Public Card Bio (About you)
          </label>
          <textarea
            required
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us what you're passionate about, your hobbies, or your favorite chill spots in Nairobi..."
            className="w-full text-xs px-3 py-2.5 rounded-xl bg-brand-obsidian border border-brand-lavender text-brand-cream focus:outline-none focus:border-brand-gold leading-relaxed resize-none"
          />
        </div>

        {/* Goals selection (Chips) */}
        <div className="space-y-2">
          <label className="text-[10px] text-brand-cream/50 uppercase tracking-widest font-mono">
            Match Goals
          </label>
          <div className="flex flex-wrap gap-2">
            {GOAL_OPTIONS.map((goal) => {
              const isSelected = selectedGoals.includes(goal);
              return (
                <button
                  key={goal}
                  type="button"
                  onClick={() => handleToggleGoal(goal)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-300 ${
                    isSelected
                      ? "bg-brand-gold text-brand-obsidian border-brand-gold font-semibold shadow-md"
                      : "bg-brand-obsidian border-brand-lavender text-brand-cream/70 hover:border-brand-gold/40"
                  }`}
                >
                  {goal}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-brand-gold-muted to-brand-gold text-brand-obsidian font-display font-semibold text-sm tracking-wide rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all mt-4"
          id="profile-save-btn"
        >
          Save Profile Card
        </button>
      </form>
    </div>
  );
}
