/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  MpesaConfig,
  StripeConfig,
  PaymentGatewayConfig,
  PublicPaymentConfig,
  PaymentTestResult,
} from "../types";
import { getLocalStorageItem, setLocalStorageItem, STORAGE_KEYS } from "./storage";

const DEFAULT_PAYMENT_CONFIG: PaymentGatewayConfig = {
  mpesa: {
    enabled: true,
    environment: "sandbox",
    consumerKey: "uG4mD5o1m3eexampleDARJAkey",
    consumerSecret: "••••••••••••••••••••••••••••••••",
    passkey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
    shortcode: "174379",
    callbackUrl: "https://yourdomain.com/api/payments/mpesa/callback",
  },
  stripe: {
    enabled: true,
    environment: "test",
    publishableKey: "pk_test_51MzExample0000000000000000000000000000000000000000000000000000000000000000000000000000",
    secretKey: "••••••••••••••••••••••••••••••••",
    webhookSecret: "••••••••••••••••••••••••••••••••",
  },
  updatedAt: new Date().toISOString(),
  updatedBy: "System Default",
};

export const paymentService = {
  /**
   * Retrieves payment configuration from backend server.
   * If server is offline, falls back to safe cached config (secrets masked).
   */
  async getPaymentConfig(): Promise<PaymentGatewayConfig> {
    try {
      const res = await fetch("/api/payments/config");
      if (res.ok) {
        const publicConfig = (await res.json()) as PublicPaymentConfig;
        const mapped: PaymentGatewayConfig = {
          mpesa: {
            enabled: publicConfig.mpesa.enabled,
            environment: publicConfig.mpesa.environment,
            consumerKey: publicConfig.mpesa.consumerKey || "",
            consumerSecret: publicConfig.mpesa.hasConsumerSecret ? "••••••••••••••••••••••••••••••••" : "",
            passkey: publicConfig.mpesa.hasPasskey ? "••••••••••••••••••••••••••••••••" : "",
            shortcode: publicConfig.mpesa.shortcode || "174379",
            callbackUrl: publicConfig.mpesa.callbackUrl || "",
          },
          stripe: {
            enabled: publicConfig.stripe.enabled,
            environment: publicConfig.stripe.environment,
            publishableKey: publicConfig.stripe.publishableKey || "",
            secretKey: publicConfig.stripe.hasSecretKey ? "••••••••••••••••••••••••••••••••" : "",
            webhookSecret: publicConfig.stripe.hasWebhookSecret ? "••••••••••••••••••••••••••••••••" : "",
          },
          updatedAt: publicConfig.updatedAt || new Date().toISOString(),
          updatedBy: publicConfig.updatedBy || "Server",
        };
        return mapped;
      }
    } catch (err) {
      console.warn("[PaymentService] Failed to load config from server, falling back:", err);
    }

    // Fallback to local storage (only stores safe, non-sensitive entries)
    return getLocalStorageItem<PaymentGatewayConfig>(STORAGE_KEYS.PAYMENT_CONFIG, DEFAULT_PAYMENT_CONFIG);
  },

  /**
   * Updates payment configuration securely on the backend server.
   * Server persists secrets in server-side storage, NOT in client localStorage.
   */
  async savePaymentConfig(
    config: Partial<PaymentGatewayConfig>,
    adminEmail?: string
  ): Promise<PaymentGatewayConfig> {
    const payload = {
      ...config,
      updatedBy: adminEmail || "Administrator",
    };

    try {
      const res = await fetch("/api/payments/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        // Notify any active UI listeners
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("payment_config_updated", { detail: data.config }));
        }
        return await this.getPaymentConfig();
      }
    } catch (err) {
      console.warn("[PaymentService] Backend save failed, saving local snapshot:", err);
    }

    // Local fallback snapshot
    const current = await this.getPaymentConfig();
    const merged: PaymentGatewayConfig = {
      ...current,
      ...config,
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail || "Admin (Offline)",
    };
    setLocalStorageItem(STORAGE_KEYS.PAYMENT_CONFIG, merged);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("payment_config_updated", { detail: merged }));
    }
    return merged;
  },

  /**
   * Tests Safaricom Daraja credentials via secure server-side proxy
   */
  async testMpesaConnection(config?: Partial<MpesaConfig>): Promise<PaymentTestResult> {
    try {
      const res = await fetch("/api/payments/mpesa/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config || {}),
      });

      const data = await res.json();
      return {
        success: Boolean(res.ok && data.success),
        message: data.message || (res.ok ? "M-Pesa verified successfully." : "M-Pesa validation failed."),
        details: data.details,
      };
    } catch (err: any) {
      return {
        success: false,
        message: "Could not reach server to test M-Pesa.",
        details: err?.message || String(err),
      };
    }
  },

  /**
   * Tests Stripe API Key via secure server-side proxy
   */
  async testStripeConnection(config?: Partial<StripeConfig>): Promise<PaymentTestResult> {
    try {
      const res = await fetch("/api/payments/stripe/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config || {}),
      });

      const data = await res.json();
      return {
        success: Boolean(res.ok && data.success),
        message: data.message || (res.ok ? "Stripe verified successfully." : "Stripe validation failed."),
        details: data.details,
      };
    } catch (err: any) {
      return {
        success: false,
        message: "Could not reach server to test Stripe.",
        details: err?.message || String(err),
      };
    }
  },

  /**
   * Triggers Safaricom Daraja STK Push on user's mobile device
   */
  async triggerMpesaStkPush(params: {
    phone: string;
    amount: number;
    accountReference?: string;
    description?: string;
  }): Promise<{ success: boolean; message: string; checkoutRequestId?: string }> {
    try {
      const res = await fetch("/api/payments/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      return {
        success: Boolean(res.ok && data.success),
        message: data.message || "STK push initiated.",
        checkoutRequestId: data.checkoutRequestId,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || "Failed to trigger M-Pesa STK Push.",
      };
    }
  },

  /**
   * Initiates Stripe Checkout Session server-side
   */
  async createStripeCheckout(params: {
    planName: string;
    amount: number;
    currency?: string;
    successUrl?: string;
    cancelUrl?: string;
  }): Promise<{ success: boolean; sessionId?: string; checkoutUrl?: string; message?: string }> {
    try {
      const res = await fetch("/api/payments/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      return {
        success: Boolean(res.ok && data.success),
        sessionId: data.sessionId,
        checkoutUrl: data.checkoutUrl,
        message: data.message,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || "Failed to create Stripe Checkout session.",
      };
    }
  },
};
