/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Key,
  Smartphone,
  CreditCard,
  Eye,
  EyeOff,
  Save,
  Zap,
  Server,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { PaymentGatewayConfig, PaymentTestResult } from "../../types";
import { paymentService } from "../../services/paymentService";

interface AdminPaymentConfigTabProps {
  paymentConfig: PaymentGatewayConfig;
  setPaymentConfig: React.Dispatch<React.SetStateAction<PaymentGatewayConfig>>;
  onSavePaymentConfig: () => void;
}

export const AdminPaymentConfigTab: React.FC<AdminPaymentConfigTabProps> = ({
  paymentConfig,
  setPaymentConfig,
  onSavePaymentConfig,
}) => {
  const [showMpesaSecret, setShowMpesaSecret] = useState<boolean>(false);
  const [showMpesaPasskey, setShowMpesaPasskey] = useState<boolean>(false);
  const [showStripeSecret, setShowStripeSecret] = useState<boolean>(false);
  const [showStripeWebhook, setShowStripeWebhook] = useState<boolean>(false);

  const [testResultMpesa, setTestResultMpesa] = useState<PaymentTestResult>({ success: false, message: "" });
  const [testResultStripe, setTestResultStripe] = useState<PaymentTestResult>({ success: false, message: "" });
  const [isTestingMpesa, setIsTestingMpesa] = useState<boolean>(false);
  const [isTestingStripe, setIsTestingStripe] = useState<boolean>(false);

  const handleTestMpesa = async () => {
    setIsTestingMpesa(true);
    setTestResultMpesa({ success: false, message: "Validating via server proxy..." });
    try {
      const res = await paymentService.testMpesaConnection(paymentConfig.mpesa);
      setTestResultMpesa(res);
    } catch (err: any) {
      setTestResultMpesa({ success: false, message: err?.message || "Test failed" });
    } finally {
      setIsTestingMpesa(false);
    }
  };

  const handleTestStripe = async () => {
    setIsTestingStripe(true);
    setTestResultStripe({ success: false, message: "Validating via server proxy..." });
    try {
      const res = await paymentService.testStripeConnection(paymentConfig.stripe);
      setTestResultStripe(res);
    } catch (err: any) {
      setTestResultStripe({ success: false, message: err?.message || "Test failed" });
    } finally {
      setIsTestingStripe(false);
    }
  };

  return (
    <div className="space-y-6 overflow-y-auto pr-1 flex-1">
      {/* Top Bar with Save Button & Security Notice */}
      <div className="bg-gradient-to-r from-brand-obsidian via-brand-plum to-brand-obsidian border border-brand-gold/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-brand-gold" />
            <h4 className="text-sm font-bold text-brand-cream font-serif">
              Payment Gateway API Keys & Credentials
            </h4>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
              <Lock className="w-3 h-3" /> Server-Secured
            </span>
          </div>
          <p className="text-xs text-brand-cream/70 font-sans">
            Credentials are encrypted and processed through the dedicated server backend to eliminate client-side key exposure.
          </p>
        </div>

        <button
          type="button"
          onClick={onSavePaymentConfig}
          className="bg-brand-gold hover:bg-amber-300 text-brand-obsidian font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-lg shrink-0 flex items-center gap-1.5 transition-all"
        >
          <Save className="w-4 h-4" /> Save API Keys
        </button>
      </div>

      {/* SECTION 1: SAFARICOM M-PESA DARAJA API */}
      <div className="bg-brand-obsidian/90 border border-emerald-500/40 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-brand-lavender/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-brand-cream">Safaricom M-Pesa Express (Daraja API)</h4>
              <span className="text-[10px] text-brand-cream/60">STK Push & Lipa na M-PESA Online</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-brand-cream/80">
              <input
                type="checkbox"
                checked={paymentConfig.mpesa.enabled}
                onChange={(e) =>
                  setPaymentConfig({
                    ...paymentConfig,
                    mpesa: { ...paymentConfig.mpesa, enabled: e.target.checked },
                  })
                }
                className="accent-brand-gold w-4 h-4 rounded"
              />
              Enable M-Pesa
            </label>

            <select
              value={paymentConfig.mpesa.environment}
              onChange={(e) =>
                setPaymentConfig({
                  ...paymentConfig,
                  mpesa: {
                    ...paymentConfig.mpesa,
                    environment: e.target.value as "sandbox" | "production",
                  },
                })
              }
              className="bg-brand-plum text-brand-cream text-xs font-bold px-2.5 py-1.5 rounded-xl border border-brand-lavender/40 focus:outline-none focus:border-brand-gold"
            >
              <option value="sandbox">Sandbox (Testing)</option>
              <option value="production">Production (Live)</option>
            </select>
          </div>
        </div>

        {/* M-Pesa Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Consumer Key */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-brand-cream/70 uppercase font-mono">
              Consumer Key
            </label>
            <input
              type="text"
              placeholder="e.g. 7mK08XW9..."
              value={paymentConfig.mpesa.consumerKey}
              onChange={(e) =>
                setPaymentConfig({
                  ...paymentConfig,
                  mpesa: { ...paymentConfig.mpesa, consumerKey: e.target.value },
                })
              }
              className="w-full bg-black/60 border border-brand-lavender/40 rounded-xl px-3 py-2 text-brand-cream focus:outline-none focus:border-brand-gold font-mono"
            />
          </div>

          {/* Consumer Secret */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-brand-cream/70 uppercase font-mono">
              Consumer Secret
            </label>
            <div className="relative">
              <input
                type={showMpesaSecret ? "text" : "password"}
                placeholder="e.g. Zq89xL..."
                value={paymentConfig.mpesa.consumerSecret}
                onChange={(e) =>
                  setPaymentConfig({
                    ...paymentConfig,
                    mpesa: { ...paymentConfig.mpesa, consumerSecret: e.target.value },
                  })
                }
                className="w-full bg-black/60 border border-brand-lavender/40 rounded-xl pl-3 pr-10 py-2 text-brand-cream focus:outline-none focus:border-brand-gold font-mono"
              />
              <button
                type="button"
                onClick={() => setShowMpesaSecret(!showMpesaSecret)}
                className="absolute right-3 top-2.5 text-brand-cream/50 hover:text-brand-cream"
              >
                {showMpesaSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Passkey */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[10px] font-bold text-brand-cream/70 uppercase font-mono">
              Lipa Na M-PESA Online Passkey
            </label>
            <div className="relative">
              <input
                type={showMpesaPasskey ? "text" : "password"}
                placeholder="e.g. bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
                value={paymentConfig.mpesa.passkey}
                onChange={(e) =>
                  setPaymentConfig({
                    ...paymentConfig,
                    mpesa: { ...paymentConfig.mpesa, passkey: e.target.value },
                  })
                }
                className="w-full bg-black/60 border border-brand-lavender/40 rounded-xl pl-3 pr-10 py-2 text-brand-cream focus:outline-none focus:border-brand-gold font-mono text-[11px]"
              />
              <button
                type="button"
                onClick={() => setShowMpesaPasskey(!showMpesaPasskey)}
                className="absolute right-3 top-2.5 text-brand-cream/50 hover:text-brand-cream"
              >
                {showMpesaPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Shortcode */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-brand-cream/70 uppercase font-mono">
              Business Shortcode / Paybill / Till Number
            </label>
            <input
              type="text"
              placeholder="e.g. 174379 or 600000"
              value={paymentConfig.mpesa.shortcode}
              onChange={(e) =>
                setPaymentConfig({
                  ...paymentConfig,
                  mpesa: { ...paymentConfig.mpesa, shortcode: e.target.value },
                })
              }
              className="w-full bg-black/60 border border-brand-lavender/40 rounded-xl px-3 py-2 text-brand-cream focus:outline-none focus:border-brand-gold font-mono"
            />
          </div>

          {/* Callback URL */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-brand-cream/70 uppercase font-mono">
              STK Push Callback URL
            </label>
            <input
              type="text"
              placeholder="https://yourdomain.com/api/payments/mpesa/callback"
              value={paymentConfig.mpesa.callbackUrl}
              onChange={(e) =>
                setPaymentConfig({
                  ...paymentConfig,
                  mpesa: { ...paymentConfig.mpesa, callbackUrl: e.target.value },
                })
              }
              className="w-full bg-black/60 border border-brand-lavender/40 rounded-xl px-3 py-2 text-brand-cream focus:outline-none focus:border-brand-gold font-mono text-[11px]"
            />
          </div>
        </div>

        {/* M-Pesa Test Action */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleTestMpesa}
            disabled={isTestingMpesa}
            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
          >
            <Zap className={`w-3.5 h-3.5 ${isTestingMpesa ? "animate-spin" : ""}`} />
            {isTestingMpesa ? "Testing Server Proxy..." : "Validate M-Pesa Credentials"}
          </button>

          {testResultMpesa.message && (
            <span
              className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border ${
                testResultMpesa.success
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                  : "bg-red-500/10 text-red-300 border-red-500/30"
              }`}
            >
              {testResultMpesa.message}
            </span>
          )}
        </div>
      </div>

      {/* SECTION 2: STRIPE CARD CHECKOUT API */}
      <div className="bg-brand-obsidian/90 border border-indigo-500/40 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-brand-lavender/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-brand-cream">Stripe Credit Card & Wallet Gateway</h4>
              <span className="text-[10px] text-brand-cream/60">Visa, Mastercard, Apple Pay & Google Pay</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-brand-cream/80">
              <input
                type="checkbox"
                checked={paymentConfig.stripe.enabled}
                onChange={(e) =>
                  setPaymentConfig({
                    ...paymentConfig,
                    stripe: { ...paymentConfig.stripe, enabled: e.target.checked },
                  })
                }
                className="accent-brand-gold w-4 h-4 rounded"
              />
              Enable Stripe
            </label>

            <select
              value={paymentConfig.stripe.environment}
              onChange={(e) =>
                setPaymentConfig({
                  ...paymentConfig,
                  stripe: {
                    ...paymentConfig.stripe,
                    environment: e.target.value as "test" | "live",
                  },
                })
              }
              className="bg-brand-plum text-brand-cream text-xs font-bold px-2.5 py-1.5 rounded-xl border border-brand-lavender/40 focus:outline-none focus:border-brand-gold"
            >
              <option value="test">Test Mode (pk_test_...)</option>
              <option value="live">Live Mode (pk_live_...)</option>
            </select>
          </div>
        </div>

        {/* Stripe Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Publishable Key */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[10px] font-bold text-brand-cream/70 uppercase font-mono">
              Stripe Publishable Key
            </label>
            <input
              type="text"
              placeholder="pk_test_51Nx..."
              value={paymentConfig.stripe.publishableKey}
              onChange={(e) =>
                setPaymentConfig({
                  ...paymentConfig,
                  stripe: { ...paymentConfig.stripe, publishableKey: e.target.value },
                })
              }
              className="w-full bg-black/60 border border-brand-lavender/40 rounded-xl px-3 py-2 text-brand-cream focus:outline-none focus:border-brand-gold font-mono text-[11px]"
            />
          </div>

          {/* Secret Key */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-brand-cream/70 uppercase font-mono">
              Stripe Secret Key
            </label>
            <div className="relative">
              <input
                type={showStripeSecret ? "text" : "password"}
                placeholder="sk_test_51Nx..."
                value={paymentConfig.stripe.secretKey}
                onChange={(e) =>
                  setPaymentConfig({
                    ...paymentConfig,
                    stripe: { ...paymentConfig.stripe, secretKey: e.target.value },
                  })
                }
                className="w-full bg-black/60 border border-brand-lavender/40 rounded-xl pl-3 pr-10 py-2 text-brand-cream focus:outline-none focus:border-brand-gold font-mono text-[11px]"
              />
              <button
                type="button"
                onClick={() => setShowStripeSecret(!showStripeSecret)}
                className="absolute right-3 top-2.5 text-brand-cream/50 hover:text-brand-cream"
              >
                {showStripeSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Webhook Signing Secret */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-brand-cream/70 uppercase font-mono">
              Stripe Webhook Signing Secret
            </label>
            <div className="relative">
              <input
                type={showStripeWebhook ? "text" : "password"}
                placeholder="whsec_..."
                value={paymentConfig.stripe.webhookSecret}
                onChange={(e) =>
                  setPaymentConfig({
                    ...paymentConfig,
                    stripe: { ...paymentConfig.stripe, webhookSecret: e.target.value },
                  })
                }
                className="w-full bg-black/60 border border-brand-lavender/40 rounded-xl pl-3 pr-10 py-2 text-brand-cream focus:outline-none focus:border-brand-gold font-mono text-[11px]"
              />
              <button
                type="button"
                onClick={() => setShowStripeWebhook(!showStripeWebhook)}
                className="absolute right-3 top-2.5 text-brand-cream/50 hover:text-brand-cream"
              >
                {showStripeWebhook ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Stripe Test Action */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleTestStripe}
            disabled={isTestingStripe}
            className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/50 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
          >
            <Zap className={`w-3.5 h-3.5 ${isTestingStripe ? "animate-spin" : ""}`} />
            {isTestingStripe ? "Validating with Stripe..." : "Validate Stripe Keys"}
          </button>

          {testResultStripe.message && (
            <span
              className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border ${
                testResultStripe.success
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                  : "bg-red-500/10 text-red-300 border-red-500/30"
              }`}
            >
              {testResultStripe.message}
            </span>
          )}
        </div>
      </div>

      {/* Security Architecture Card */}
      <div className="bg-brand-obsidian/60 border border-brand-lavender/30 rounded-2xl p-4 space-y-2 text-xs">
        <h4 className="font-bold text-brand-gold flex items-center gap-1.5 font-mono uppercase text-[11px]">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Payment Key Isolation Architecture
        </h4>
        <p className="text-brand-cream/70 font-sans">
          All client payment requests (STK Push, Stripe Checkout) are routed through server endpoints (<code className="text-brand-gold bg-black/40 px-1 rounded">/api/payments/*</code>). Sensitive secrets are never shipped to browsers, meeting high standards for financial security.
        </p>
      </div>
    </div>
  );
};
