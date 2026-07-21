/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Crown,
  Sparkles,
  Check,
  Zap,
  ShieldCheck,
  Eye,
  Sliders,
  X,
  Heart,
  ChevronRight,
  PhoneCall,
  CreditCard,
  Star,
  Award,
  BadgeCheck
} from "lucide-react";
import { SubscriptionTier } from "../types";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: SubscriptionTier;
  onUpgradeTier: (tier: SubscriptionTier) => void;
  initialSelectedTier?: SubscriptionTier;
}

export default function SubscriptionModal({
  isOpen,
  onClose,
  currentTier,
  onUpgradeTier,
  initialSelectedTier = "gold",
}: SubscriptionModalProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(
    currentTier !== "free" ? currentTier : initialSelectedTier
  );
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "card">("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("0712 345 678");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successTier, setSuccessTier] = useState<SubscriptionTier | null>(null);

  if (!isOpen) return null;

  const handleCheckout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccessTier(selectedTier);
      onUpgradeTier(selectedTier);
    }, 1200);
  };

  const isCurrentActive = currentTier === selectedTier;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-brand-obsidian/80 backdrop-blur-lg overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-xl bg-gradient-to-b from-[#1c1228] via-[#120a1c] to-brand-obsidian border border-brand-gold/40 rounded-3xl shadow-2xl shadow-brand-gold/10 overflow-hidden text-brand-cream my-auto"
        >
          {/* Top Decorative Lights */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-brand-gold/20 via-brand-plum/30 to-transparent blur-2xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-brand-lavender/40 border border-brand-lavender/60 flex items-center justify-center text-brand-cream/80 hover:text-brand-cream hover:bg-brand-lavender transition-all"
            id="close-subscription-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="pt-8 px-6 sm:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-brand-gold/20 via-amber-400/10 to-brand-gold/20 border border-brand-gold/40 text-brand-gold text-xs font-sans font-semibold uppercase tracking-widest mb-3 shadow-sm shadow-brand-gold/20">
              <Crown className="w-3.5 h-3.5 text-brand-gold animate-bounce" />
              <span>Konnect VIP Access</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-cream via-amber-100 to-brand-gold tracking-tight">
              Elevate Your Connections
            </h2>
            <p className="text-xs sm:text-sm text-brand-cream/70 mt-1.5 max-w-md mx-auto font-sans leading-relaxed">
              Unlock unlimited swipes, see secret admirers, apply priority filters & enjoy exclusive Massage Jonny wellness perks.
            </p>

            {/* Billing Cycle Switch */}
            <div className="mt-5 inline-flex p-1 rounded-2xl bg-brand-obsidian/80 border border-brand-lavender/50 text-xs font-sans relative">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1.5 rounded-xl transition-all duration-300 font-medium ${
                  billingCycle === "monthly"
                    ? "bg-brand-gold text-brand-obsidian font-bold shadow-md shadow-brand-gold/20"
                    : "text-brand-cream/70 hover:text-brand-cream"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-4 py-1.5 rounded-xl transition-all duration-300 font-medium flex items-center gap-1.5 ${
                  billingCycle === "annual"
                    ? "bg-brand-gold text-brand-obsidian font-bold shadow-md shadow-brand-gold/20"
                    : "text-brand-cream/70 hover:text-brand-cream"
                }`}
              >
                <span>Annual</span>
                <span className="text-[9px] bg-emerald-500 text-brand-obsidian px-1.5 py-0.2 rounded-full font-black uppercase">
                  Save 25%
                </span>
              </button>
            </div>
          </div>

          {/* Tier Selection Grid */}
          <div className="p-6 sm:p-8 space-y-4 relative z-10">
            {successTier ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-4"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-brand-gold via-amber-300 to-amber-500 p-1 flex items-center justify-center shadow-xl shadow-brand-gold/30">
                  <div className="w-full h-full rounded-full bg-brand-obsidian flex items-center justify-center">
                    <BadgeCheck className="w-10 h-10 text-brand-gold" />
                  </div>
                </div>
                <h3 className="text-2xl font-serif font-bold text-brand-cream">
                  Welcome to Konnect {successTier.toUpperCase()}!
                </h3>
                <p className="text-sm text-brand-cream/80 max-w-sm mx-auto">
                  Your premium features are now active. Enjoy unlimited swipes, priority messaging, and exclusive discovery controls!
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-8 py-3 rounded-2xl bg-gradient-to-r from-brand-gold via-amber-300 to-brand-gold text-brand-obsidian font-bold text-sm shadow-lg shadow-brand-gold/30 hover:scale-105 transition-all"
                >
                  Start Exploring Premium
                </button>
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* GOLD TIER */}
                  <div
                    onClick={() => setSelectedTier("gold")}
                    className={`relative rounded-2xl p-4 cursor-pointer transition-all border ${
                      selectedTier === "gold"
                        ? "bg-gradient-to-b from-brand-gold/20 via-brand-plum/40 to-brand-obsidian border-brand-gold shadow-lg shadow-brand-gold/15 ring-2 ring-brand-gold/30"
                        : "bg-brand-obsidian/60 border-brand-lavender/40 hover:border-brand-gold/50 hover:bg-brand-obsidian/80"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Crown className="w-4 h-4 text-brand-gold" />
                          <h3 className="font-serif font-bold text-base text-brand-cream">Konnect Gold</h3>
                        </div>
                        <span className="text-[10px] text-brand-gold font-sans font-semibold uppercase tracking-wider">
                          Most Popular
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-brand-gold">
                          {billingCycle === "annual" ? "KSh 1,120" : "KSh 1,499"}
                        </div>
                        <div className="text-[10px] text-brand-cream/60">/ month</div>
                      </div>
                    </div>

                    <ul className="mt-3.5 space-y-2 text-xs text-brand-cream/90 font-sans">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                        <span>Unlimited Daily Swipes & Rewinds</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                        <span>See Who Liked You (Secret Admirers)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                        <span>5 Super Likes per day</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                        <span>Hide Distance & Age</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                        <span>VIP Gold Badge on Profile</span>
                      </li>
                    </ul>

                    {currentTier === "gold" && (
                      <div className="mt-3 text-center py-1 bg-brand-gold/20 border border-brand-gold/40 rounded-xl text-[10px] font-bold text-brand-gold uppercase tracking-wider">
                        Current Active Plan
                      </div>
                    )}
                  </div>

                  {/* PLATINUM TIER */}
                  <div
                    onClick={() => setSelectedTier("platinum")}
                    className={`relative rounded-2xl p-4 cursor-pointer transition-all border ${
                      selectedTier === "platinum"
                        ? "bg-gradient-to-b from-amber-400/25 via-purple-900/40 to-brand-obsidian border-amber-300 shadow-xl shadow-amber-300/20 ring-2 ring-amber-300/40"
                        : "bg-brand-obsidian/60 border-brand-lavender/40 hover:border-amber-300/50 hover:bg-brand-obsidian/80"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-amber-300" />
                          <h3 className="font-serif font-bold text-base text-amber-200">Platinum VIP</h3>
                        </div>
                        <span className="text-[10px] text-amber-300 font-sans font-semibold uppercase tracking-wider">
                          Ultimate Power
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-amber-200">
                          {billingCycle === "annual" ? "KSh 2,170" : "KSh 2,899"}
                        </div>
                        <div className="text-[10px] text-brand-cream/60">/ month</div>
                      </div>
                    </div>

                    <ul className="mt-3.5 space-y-2 text-xs text-brand-cream/90 font-sans">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                        <span className="font-semibold text-amber-200">Everything in Gold Tier</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                        <span>Advanced Discovery Filters</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                        <span>Priority Messaging Placement</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                        <span>Incognito Stealth Disguise App</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                        <span>15% OFF Massage Jonny Spa Bookings</span>
                      </li>
                    </ul>

                    {currentTier === "platinum" && (
                      <div className="mt-3 text-center py-1 bg-amber-400/20 border border-amber-300/40 rounded-xl text-[10px] font-bold text-amber-200 uppercase tracking-wider">
                        Current Active Plan
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Options Section */}
                <div className="pt-2 border-t border-brand-lavender/30 space-y-3">
                  <div className="flex items-center justify-between text-xs font-sans text-brand-cream/80">
                    <span className="font-semibold text-brand-cream">Select Payment Method:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPaymentMethod("mpesa")}
                        className={`flex items-center gap-1 px-3 py-1 rounded-xl text-[11px] font-bold transition-all border ${
                          paymentMethod === "mpesa"
                            ? "bg-emerald-600 text-white border-emerald-400 shadow-sm shadow-emerald-500/30"
                            : "bg-brand-obsidian/70 border-brand-lavender/40 text-brand-cream/70"
                        }`}
                      >
                        <PhoneCall className="w-3 h-3" />
                        M-PESA
                      </button>
                      <button
                        onClick={() => setPaymentMethod("card")}
                        className={`flex items-center gap-1 px-3 py-1 rounded-xl text-[11px] font-bold transition-all border ${
                          paymentMethod === "card"
                            ? "bg-indigo-600 text-white border-indigo-400 shadow-sm shadow-indigo-500/30"
                            : "bg-brand-obsidian/70 border-brand-lavender/40 text-brand-cream/70"
                        }`}
                      >
                        <CreditCard className="w-3 h-3" />
                        Card
                      </button>
                    </div>
                  </div>

                  {paymentMethod === "mpesa" && (
                    <div className="flex items-center gap-2 bg-brand-obsidian/90 border border-brand-lavender/50 rounded-2xl px-3 py-2 text-xs">
                      <span className="text-emerald-400 font-bold shrink-0">M-PESA Number:</span>
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="e.g. 0712 345 678"
                        className="bg-transparent text-brand-cream focus:outline-none w-full font-mono text-xs"
                      />
                    </div>
                  )}

                  {/* Submit Action Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className={`w-full py-3.5 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 ${
                      selectedTier === "platinum"
                        ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-brand-obsidian shadow-amber-400/25 hover:brightness-110"
                        : "bg-gradient-to-r from-brand-gold via-amber-300 to-brand-gold text-brand-obsidian shadow-brand-gold/25 hover:brightness-110"
                    }`}
                    id="confirm-subscription-checkout-btn"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-brand-obsidian border-t-transparent rounded-full animate-spin" />
                        <span>Sending M-PESA Prompt...</span>
                      </div>
                    ) : isCurrentActive ? (
                      <span>Manage Current Subscription</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>
                          Subscribe to {selectedTier.toUpperCase()} ({billingCycle === "annual" ? "Annual" : "Monthly"})
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-brand-cream/50 font-sans">
                    Secure 256-bit SSL encrypted checkout. Cancel anytime in your profile settings.
                  </p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
