/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Camera,
  Upload,
  CheckCircle2,
  XCircle,
  X,
  UserCheck,
  Clock,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Lock,
  Check,
  AlertTriangle
} from "lucide-react";
import { UserProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface VerifyMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (updatedProfile: UserProfile) => Promise<void>;
}

export default function VerifyMeModal({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
}: VerifyMeModalProps) {
  const [selfieUrl, setSelfieUrl] = useState<string>(
    userProfile.verification_selfie_url || ""
  );
  const [verificationStatus, setVerificationStatus] = useState<
    "unverified" | "pending" | "approved" | "rejected"
  >(
    userProfile.verification_status ||
      (userProfile.is_verified ? "approved" : "unverified")
  );
  const [isVerified, setIsVerified] = useState<boolean>(
    userProfile.is_verified ?? false
  );
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCapturingWebcam, setIsCapturingWebcam] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  if (!isOpen) return null;

  // Handle file selection / drop
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setFeedbackMessage("Please upload a valid image file (PNG, JPG, WebP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelfieUrl(event.target.result as string);
        setFeedbackMessage("");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Live Camera Capture
  const startCamera = async () => {
    setIsCapturingWebcam(true);
    setFeedbackMessage("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Camera access failed:", err);
      setIsCapturingWebcam(false);
      setFeedbackMessage("Unable to access camera. Please upload a selfie photo instead.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCapturingWebcam(false);
  };

  const captureSnap = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setSelfieUrl(dataUrl);
    }
    stopCamera();
  };

  // User submits selfie for verification
  const handleSubmitSelfie = async () => {
    if (!selfieUrl) {
      setFeedbackMessage("Please upload or take a selfie first.");
      return;
    }
    setIsSubmitting(true);
    setFeedbackMessage("");

    const updated: UserProfile = {
      ...userProfile,
      verification_selfie_url: selfieUrl,
      verification_status: "pending",
      verification_submitted_at: new Date().toISOString(),
      // Keep is_verified false until approved by admin (unless already verified)
      is_verified: isVerified,
    };

    try {
      await onSaveProfile(updated);
      setVerificationStatus("pending");
      setFeedbackMessage("Verification selfie submitted! Pending administrator review.");
    } catch (err) {
      console.error("Failed to submit selfie:", err);
      setFeedbackMessage("Failed to submit verification request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Administrator manual approval/rejection toggle
  const handleAdminToggleVerification = async (newApprovedState: boolean) => {
    setIsSubmitting(true);
    const newStatus = newApprovedState ? "approved" : "rejected";

    const updated: UserProfile = {
      ...userProfile,
      is_verified: newApprovedState,
      verification_status: newStatus,
      verification_selfie_url: selfieUrl || userProfile.verification_selfie_url || userProfile.images?.[0],
    };

    try {
      await onSaveProfile(updated);
      setIsVerified(newApprovedState);
      setVerificationStatus(newStatus);
      setFeedbackMessage(
        newApprovedState
          ? "✅ User profile successfully VERIFIED by Administrator in Supabase!"
          : "❌ User verification status set to UNVERIFIED by Administrator in Supabase."
      );
    } catch (err) {
      console.error("Admin verification update failed:", err);
      setFeedbackMessage("Failed to update verification status in Supabase.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="w-full max-w-lg bg-brand-plum border border-brand-lavender/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden my-8"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-brand-obsidian/60 hover:bg-brand-obsidian text-brand-cream/70 hover:text-brand-cream transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-gold to-amber-300 p-0.5 shrink-0 shadow-lg shadow-brand-gold/20">
            <div className="w-full h-full bg-brand-obsidian rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-brand-gold" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-serif font-bold text-brand-cream">
                Verify Me
              </h3>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isVerified || verificationStatus === "approved"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : verificationStatus === "pending"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-brand-lavender/20 text-brand-cream/60 border-brand-lavender/40"
                }`}
              >
                {isVerified || verificationStatus === "approved"
                  ? "Verified"
                  : verificationStatus === "pending"
                  ? "Pending Review"
                  : "Unverified"}
              </span>
            </div>
            <p className="text-xs text-brand-cream/70 font-sans">
              Authenticity verification for Jonny Match members
            </p>
          </div>
        </div>

        {/* Navigation Tabs: Member Selfie Upload vs Admin Controls */}
        <div className="flex bg-brand-obsidian/80 rounded-2xl p-1 mb-5 border border-brand-lavender/30">
          <button
            type="button"
            onClick={() => setIsAdminMode(false)}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              !isAdminMode
                ? "bg-brand-plum text-brand-cream shadow-sm border border-brand-lavender/40"
                : "text-brand-cream/50 hover:text-brand-cream"
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-brand-gold" />
            Selfie Verification
          </button>

          <button
            type="button"
            onClick={() => setIsAdminMode(true)}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              isAdminMode
                ? "bg-gradient-to-r from-amber-500/20 to-brand-gold/20 text-brand-gold shadow-sm border border-brand-gold/50"
                : "text-brand-cream/50 hover:text-brand-gold/80"
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            Admin Approval Portal
          </button>
        </div>

        {/* Feedback Message Banner */}
        {feedbackMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-brand-obsidian/90 border border-brand-gold/40 text-xs text-brand-cream flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* TAB 1: Member Selfie Verification Upload */}
        {!isAdminMode ? (
          <div className="space-y-5">
            {/* Verification Perks */}
            <div className="bg-brand-obsidian/60 border border-brand-lavender/30 rounded-2xl p-3.5 space-y-2">
              <span className="text-[11px] font-bold text-brand-gold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Why Get Verified?
              </span>
              <ul className="text-xs text-brand-cream/80 space-y-1 font-sans pl-1">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Golden Shield Badge displayed on your profile card
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Unblur photos for privacy-conscious verified matches
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  3x higher response rate from high-value connections
                </li>
              </ul>
            </div>

            {/* Selfie Upload / Live Camera Section */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-brand-cream/80 flex items-center justify-between">
                <span>Upload Verification Selfie</span>
                <span className="text-[10px] text-brand-cream/50 font-mono">Hold pose or smile</span>
              </label>

              {/* Live Webcam Stream or Capture Preview */}
              {isCapturingWebcam ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-brand-gold bg-black aspect-video flex flex-col items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={captureSnap}
                      className="bg-brand-gold text-brand-obsidian text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg"
                    >
                      <Camera className="w-4 h-4" /> Snap Photo
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="bg-brand-obsidian/80 text-brand-cream text-xs px-3 py-2 rounded-xl"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Side-by-side comparison: Profile Photo vs Verification Selfie */}
                  <div className="flex flex-col items-center bg-brand-obsidian/80 p-3 rounded-2xl border border-brand-lavender/30">
                    <span className="text-[10px] text-brand-cream/50 uppercase tracking-widest font-mono mb-2">
                      1. Profile Photo
                    </span>
                    <img
                      src={userProfile.images?.[0] || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600"}
                      alt="Profile photo"
                      className="w-24 h-24 object-cover rounded-full border-2 border-brand-lavender/40 shadow-md"
                    />
                    <span className="text-[11px] text-brand-cream/80 font-medium mt-2">
                      {userProfile.name}
                    </span>
                  </div>

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-dashed transition-all relative ${
                      isDragging
                        ? "border-brand-gold bg-brand-gold/10"
                        : selfieUrl
                        ? "border-emerald-500/50 bg-brand-obsidian/90"
                        : "border-brand-lavender/50 bg-brand-obsidian/40 hover:border-brand-gold/50"
                    }`}
                  >
                    <span className="text-[10px] text-brand-cream/50 uppercase tracking-widest font-mono mb-2">
                      2. Verification Selfie
                    </span>

                    {selfieUrl ? (
                      <div className="relative group flex flex-col items-center">
                        <img
                          src={selfieUrl}
                          alt="Verification selfie"
                          className="w-24 h-24 object-cover rounded-full border-2 border-brand-gold shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => setSelfieUrl("")}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-90 hover:opacity-100"
                          title="Remove selfie"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Ready
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-2 text-center py-1">
                        <Upload className="w-6 h-6 text-brand-gold/80 animate-pulse" />
                        <span className="text-[11px] text-brand-cream/70 font-medium">
                          Drop selfie here or browse
                        </span>
                        <div className="flex gap-2 pt-1">
                          <label className="text-[10px] bg-brand-gold/20 hover:bg-brand-gold/30 text-brand-gold font-bold px-2.5 py-1 rounded-xl cursor-pointer transition-colors border border-brand-gold/40">
                            Upload
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleFileChange}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={startCamera}
                            className="text-[10px] bg-brand-lavender/30 hover:bg-brand-lavender/50 text-brand-cream font-bold px-2.5 py-1 rounded-xl transition-colors border border-brand-lavender/40 flex items-center gap-1"
                          >
                            <Camera className="w-3 h-3 text-brand-gold" /> Camera
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Action Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={!selfieUrl || isSubmitting}
                onClick={handleSubmitSelfie}
                className={`w-full py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                  !selfieUrl || isSubmitting
                    ? "bg-brand-lavender/20 text-brand-cream/40 cursor-not-allowed"
                    : "bg-gradient-to-r from-brand-gold via-amber-300 to-brand-gold text-brand-obsidian hover:brightness-110 active:scale-[0.99] shadow-brand-gold/20"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Saving to Supabase...
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" /> Submit Selfie For Verification
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* TAB 2: Administrator Approval Portal */
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-amber-500/15 via-purple-900/40 to-brand-gold/15 border border-brand-gold/40 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-brand-gold" /> Admin Authenticity Portal
                </span>
                <span className="text-[10px] bg-amber-400 text-brand-obsidian font-black uppercase px-2 py-0.5 rounded-full">
                  Admin Access
                </span>
              </div>
              <p className="text-xs text-brand-cream/80 font-sans">
                Review submitted selfie against user profile details and toggle manual verification approval for Supabase database synchronization.
              </p>
            </div>

            {/* Admin Verification Card */}
            <div className="bg-brand-obsidian/90 border border-brand-lavender/40 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-brand-lavender/20">
                <div>
                  <h4 className="text-sm font-bold text-brand-cream">{userProfile.name}</h4>
                  <p className="text-[11px] text-brand-cream/60">
                    {userProfile.email || "demo@massagejohnny.com"} • {userProfile.location_name}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-brand-cream/50 uppercase block font-mono">Current Status</span>
                  <span
                    className={`text-xs font-bold ${
                      isVerified
                        ? "text-emerald-400"
                        : verificationStatus === "pending"
                        ? "text-amber-300"
                        : "text-red-400"
                    }`}
                  >
                    {isVerified
                      ? "APPROVED & VERIFIED"
                      : verificationStatus === "pending"
                      ? "PENDING REVIEW"
                      : "UNVERIFIED"}
                  </span>
                </div>
              </div>

              {/* Side-by-side comparison for Admin */}
              <div className="grid grid-cols-2 gap-3 bg-brand-plum/50 p-3 rounded-xl border border-brand-lavender/20">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-brand-cream/50 font-mono uppercase mb-1">
                    Profile Photo
                  </span>
                  <img
                    src={userProfile.images?.[0] || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600"}
                    alt="Profile photo"
                    className="w-20 h-20 object-cover rounded-2xl border border-brand-lavender"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-brand-cream/50 font-mono uppercase mb-1">
                    Submitted Selfie
                  </span>
                  {selfieUrl || userProfile.verification_selfie_url ? (
                    <img
                      src={selfieUrl || userProfile.verification_selfie_url}
                      alt="Submitted selfie"
                      className="w-20 h-20 object-cover rounded-2xl border-2 border-brand-gold"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-brand-obsidian border border-dashed border-brand-lavender/50 flex flex-col items-center justify-center p-2 text-center">
                      <ShieldAlert className="w-5 h-5 text-amber-400 mb-1" />
                      <span className="text-[9px] text-brand-cream/50">No selfie submitted</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Manual Approval Toggle Switch */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between bg-brand-plum p-3 rounded-xl border border-brand-lavender/30">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-brand-cream flex items-center gap-1.5">
                      <ShieldCheck className={`w-4 h-4 ${isVerified ? "text-emerald-400" : "text-brand-cream/40"}`} />
                      Manual Verification Switch
                    </span>
                    <p className="text-[10px] text-brand-cream/60">
                      Instantly updates <code className="text-brand-gold">is_verified</code> column in Supabase database.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleAdminToggleVerification(!isVerified)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      isVerified ? "bg-emerald-500" : "bg-brand-lavender/40"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isVerified ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Quick Action Approval Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleAdminToggleVerification(true)}
                    className="py-2.5 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Approve Authenticity
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleAdminToggleVerification(false)}
                    className="py-2.5 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/50 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                  >
                    <XCircle className="w-4 h-4 text-red-400" />
                    Revoke / Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
