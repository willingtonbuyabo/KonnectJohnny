/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory or file-backed secure payment credentials on server
const CONFIG_FILE = path.join(process.cwd(), ".payment-config.json");

interface ServerPaymentConfig {
  mpesa: {
    enabled: boolean;
    environment: "sandbox" | "production";
    consumerKey: string;
    consumerSecret: string;
    passkey: string;
    shortcode: string;
    callbackUrl: string;
  };
  stripe: {
    enabled: boolean;
    environment: "test" | "live";
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
  };
  updatedAt: string;
  updatedBy: string;
}

const loadServerPaymentConfig = (): ServerPaymentConfig => {
  const defaultConfig: ServerPaymentConfig = {
    mpesa: {
      enabled: true,
      environment: (process.env.MPESA_ENV as "sandbox" | "production") || "sandbox",
      consumerKey: process.env.MPESA_CONSUMER_KEY || "",
      consumerSecret: process.env.MPESA_CONSUMER_SECRET || "",
      passkey: process.env.MPESA_PASSKEY || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
      shortcode: process.env.MPESA_SHORTCODE || "174379",
      callbackUrl: process.env.MPESA_CALLBACK_URL || "https://yourdomain.com/api/payments/mpesa/callback",
    },
    stripe: {
      enabled: true,
      environment: (process.env.STRIPE_ENV as "test" | "live") || "test",
      publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
      secretKey: process.env.STRIPE_SECRET_KEY || "",
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
    },
    updatedAt: new Date().toISOString(),
    updatedBy: "System",
  };

  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const saved = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
      return {
        ...defaultConfig,
        ...saved,
        mpesa: { ...defaultConfig.mpesa, ...(saved.mpesa || {}) },
        stripe: { ...defaultConfig.stripe, ...(saved.stripe || {}) },
      };
    }
  } catch (err) {
    console.warn("[Server] Could not read payment config file:", err);
  }
  return defaultConfig;
};

let serverPaymentConfig = loadServerPaymentConfig();

const saveServerPaymentConfig = (updated: Partial<ServerPaymentConfig>) => {
  serverPaymentConfig = {
    ...serverPaymentConfig,
    ...updated,
    mpesa: { ...serverPaymentConfig.mpesa, ...(updated.mpesa || {}) },
    stripe: { ...serverPaymentConfig.stripe, ...(updated.stripe || {}) },
    updatedAt: new Date().toISOString(),
  };

  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(serverPaymentConfig, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Server] Could not persist payment config to disk:", err);
  }
};

// ==========================================
// 1. HEALTH & DIAGNOSTICS APIS
// ==========================================
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    app: "KonnectJohnny",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get("/api/supabase/health", async (_req: Request, res: Response) => {
  const rawUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const anonKey = (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim();

  if (!rawUrl || !anonKey) {
    return res.json({
      configured: false,
      status: "unconfigured",
      message: "No external Supabase credentials set in environment variables.",
      details: "Application is currently operating in offline-first demo storage mode.",
    });
  }

  const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
  const pingUrl = `${cleanUrl}/rest/v1/`;
  const startTime = Date.now();

  try {
    const response = await fetch(pingUrl, {
      method: "GET",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });

    const latencyMs = Date.now() - startTime;
    const bodyText = await response.text();

    if (response.status === 503 || bodyText.toLowerCase().includes("paused")) {
      return res.json({
        configured: true,
        url: cleanUrl,
        status: "paused",
        statusCode: response.status,
        latencyMs,
        message: "⚡ Supabase Project is PAUSED due to inactivity (HTTP 503).",
        details: "Free-tier projects pause after 7 days without queries. Unpause in https://supabase.com/dashboard to restore database compute.",
      });
    }

    if (response.ok || response.status === 200 || response.status === 404 || response.status === 401) {
      return res.json({
        configured: true,
        url: cleanUrl,
        status: "online",
        statusCode: response.status,
        latencyMs,
        message: `🟢 Supabase Database is ONLINE & Active (${latencyMs}ms)!`,
        details: `Successfully connected to endpoint ${cleanUrl}`,
      });
    }

    return res.json({
      configured: true,
      url: cleanUrl,
      status: "error",
      statusCode: response.status,
      latencyMs,
      message: `Supabase returned HTTP status ${response.status}`,
      details: bodyText.slice(0, 200),
    });
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return res.json({
      configured: true,
      url: cleanUrl,
      status: "paused",
      latencyMs,
      message: "⚡ Supabase Connection Failed (Project likely PAUSED due to inactivity).",
      details: err?.message || String(err),
    });
  }
});

// ==========================================
// 2. SECURE PAYMENT GATEWAY APIS
// ==========================================

// Safe public config endpoint (Never returns secrets to client browsers)
app.get("/api/payments/config", (_req: Request, res: Response) => {
  res.json({
    mpesa: {
      enabled: serverPaymentConfig.mpesa.enabled,
      environment: serverPaymentConfig.mpesa.environment,
      consumerKey: serverPaymentConfig.mpesa.consumerKey,
      hasConsumerSecret: Boolean(serverPaymentConfig.mpesa.consumerSecret?.trim()),
      hasPasskey: Boolean(serverPaymentConfig.mpesa.passkey?.trim()),
      shortcode: serverPaymentConfig.mpesa.shortcode,
      callbackUrl: serverPaymentConfig.mpesa.callbackUrl,
    },
    stripe: {
      enabled: serverPaymentConfig.stripe.enabled,
      environment: serverPaymentConfig.stripe.environment,
      publishableKey: serverPaymentConfig.stripe.publishableKey,
      hasSecretKey: Boolean(serverPaymentConfig.stripe.secretKey?.trim()),
      hasWebhookSecret: Boolean(serverPaymentConfig.stripe.webhookSecret?.trim()),
    },
    updatedAt: serverPaymentConfig.updatedAt,
    updatedBy: serverPaymentConfig.updatedBy,
  });
});

// Admin config update endpoint (Stores secrets safely server-side)
app.post("/api/payments/config", (req: Request, res: Response) => {
  const body = req.body;
  if (!body) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const updatedMpesa = { ...serverPaymentConfig.mpesa };
  if (body.mpesa) {
    if (typeof body.mpesa.enabled === "boolean") updatedMpesa.enabled = body.mpesa.enabled;
    if (body.mpesa.environment) updatedMpesa.environment = body.mpesa.environment;
    if (body.mpesa.consumerKey !== undefined) updatedMpesa.consumerKey = body.mpesa.consumerKey;
    if (body.mpesa.consumerSecret) updatedMpesa.consumerSecret = body.mpesa.consumerSecret;
    if (body.mpesa.passkey) updatedMpesa.passkey = body.mpesa.passkey;
    if (body.mpesa.shortcode) updatedMpesa.shortcode = body.mpesa.shortcode;
    if (body.mpesa.callbackUrl) updatedMpesa.callbackUrl = body.mpesa.callbackUrl;
  }

  const updatedStripe = { ...serverPaymentConfig.stripe };
  if (body.stripe) {
    if (typeof body.stripe.enabled === "boolean") updatedStripe.enabled = body.stripe.enabled;
    if (body.stripe.environment) updatedStripe.environment = body.stripe.environment;
    if (body.stripe.publishableKey !== undefined) updatedStripe.publishableKey = body.stripe.publishableKey;
    if (body.stripe.secretKey) updatedStripe.secretKey = body.stripe.secretKey;
    if (body.stripe.webhookSecret) updatedStripe.webhookSecret = body.stripe.webhookSecret;
  }

  saveServerPaymentConfig({
    mpesa: updatedMpesa,
    stripe: updatedStripe,
    updatedBy: body.updatedBy || "System Administrator",
  });

  return res.json({
    success: true,
    message: "Payment Gateway settings updated securely on server.",
    config: {
      mpesa: {
        enabled: serverPaymentConfig.mpesa.enabled,
        environment: serverPaymentConfig.mpesa.environment,
        consumerKey: serverPaymentConfig.mpesa.consumerKey,
        hasConsumerSecret: Boolean(serverPaymentConfig.mpesa.consumerSecret?.trim()),
        hasPasskey: Boolean(serverPaymentConfig.mpesa.passkey?.trim()),
        shortcode: serverPaymentConfig.mpesa.shortcode,
        callbackUrl: serverPaymentConfig.mpesa.callbackUrl,
      },
      stripe: {
        enabled: serverPaymentConfig.stripe.enabled,
        environment: serverPaymentConfig.stripe.environment,
        publishableKey: serverPaymentConfig.stripe.publishableKey,
        hasSecretKey: Boolean(serverPaymentConfig.stripe.secretKey?.trim()),
        hasWebhookSecret: Boolean(serverPaymentConfig.stripe.webhookSecret?.trim()),
      },
      updatedAt: serverPaymentConfig.updatedAt,
    },
  });
});

// Test M-Pesa Safaricom Daraja Credentials Server-Side
app.post("/api/payments/mpesa/test", async (req: Request, res: Response) => {
  const consumerKey = req.body.consumerKey || serverPaymentConfig.mpesa.consumerKey;
  const consumerSecret = req.body.consumerSecret || serverPaymentConfig.mpesa.consumerSecret;
  const environment = req.body.environment || serverPaymentConfig.mpesa.environment;
  const shortcode = req.body.shortcode || serverPaymentConfig.mpesa.shortcode;

  if (!consumerKey?.trim() || !consumerSecret?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Consumer Key and Consumer Secret are required for Safaricom Daraja API.",
    });
  }

  if (!shortcode?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Business Shortcode or Till Number is required.",
    });
  }

  const authHost =
    environment === "production"
      ? "https://api.safaricom.co.ke"
      : "https://sandbox.safaricom.co.ke";

  const authUrl = `${authHost}/oauth/v1/generate?grant_type=client_credentials`;
  const credentials = Buffer.from(`${consumerKey.trim()}:${consumerSecret.trim()}`).toString("base64");

  try {
    const authRes = await fetch(authUrl, {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });

    if (authRes.ok) {
      const data = (await authRes.json()) as any;
      return res.json({
        success: true,
        message: `M-Pesa Daraja (${environment.toUpperCase()}) OAuth successful! Shortcode: ${shortcode}`,
        details: `Access token generated (expires in ${data.expires_in || 3599}s)`,
      });
    } else {
      const errText = await authRes.text();
      return res.status(400).json({
        success: false,
        message: `Safaricom Daraja API returned HTTP ${authRes.status}`,
        details: errText.slice(0, 250),
      });
    }
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "Could not reach Safaricom Daraja server. Check network connectivity.",
      details: err?.message || String(err),
    });
  }
});

// Trigger M-Pesa STK Push Server-Side
app.post("/api/payments/mpesa/stkpush", async (req: Request, res: Response) => {
  const { phone, amount, accountReference, description } = req.body;
  const { consumerKey, consumerSecret, passkey, shortcode, environment, callbackUrl } = serverPaymentConfig.mpesa;

  if (!consumerKey || !consumerSecret || !passkey || !shortcode) {
    return res.status(400).json({
      success: false,
      message: "M-Pesa credentials not fully configured on server.",
    });
  }

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: "Phone number (254XXXXXXXXX) is required for STK Push.",
    });
  }

  // Format phone number to 254XXXXXXXXX
  let formattedPhone = phone.replace(/\D/g, "");
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "254" + formattedPhone.slice(1);
  } else if (formattedPhone.startsWith("+254")) {
    formattedPhone = formattedPhone.slice(1);
  }

  const host =
    environment === "production"
      ? "https://api.safaricom.co.ke"
      : "https://sandbox.safaricom.co.ke";

  try {
    // 1. Get OAuth Token
    const authUrl = `${host}/oauth/v1/generate?grant_type=client_credentials`;
    const basicAuth = Buffer.from(`${consumerKey.trim()}:${consumerSecret.trim()}`).toString("base64");
    const authRes = await fetch(authUrl, {
      method: "GET",
      headers: { Authorization: `Basic ${basicAuth}` },
    });

    if (!authRes.ok) {
      throw new Error(`Daraja OAuth failed with status ${authRes.status}`);
    }

    const authData = (await authRes.json()) as any;
    const token = authData.access_token;

    // 2. Generate Password & Timestamp
    const now = new Date();
    const timestamp =
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0") +
      String(now.getHours()).padStart(2, "0") +
      String(now.getMinutes()).padStart(2, "0") +
      String(now.getSeconds()).padStart(2, "0");

    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

    // 3. Initiate STK Push
    const stkUrl = `${host}/mpesa/stkpush/v1/processrequest`;
    const stkPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount || 1,
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl || "https://yourdomain.com/api/payments/mpesa/callback",
      AccountReference: accountReference || "KonnectJohnny",
      TransactionDesc: description || "KonnectJohnny VIP Membership",
    };

    const stkRes = await fetch(stkUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stkPayload),
    });

    const stkData = (await stkRes.json()) as any;
    if (stkRes.ok && stkData.ResponseCode === "0") {
      return res.json({
        success: true,
        message: "STK push initiated successfully. Please check your phone for the M-Pesa PIN prompt.",
        checkoutRequestId: stkData.CheckoutRequestID,
        merchantRequestId: stkData.MerchantRequestID,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: stkData.errorMessage || stkData.ResponseDescription || "STK Push initiation failed.",
        details: stkData,
      });
    }
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "M-Pesa STK push service error",
      details: err?.message || String(err),
    });
  }
});

// Test Stripe API Key Server-Side
app.post("/api/payments/stripe/test", async (req: Request, res: Response) => {
  const secretKey = req.body.secretKey || serverPaymentConfig.stripe.secretKey;
  const publishableKey = req.body.publishableKey || serverPaymentConfig.stripe.publishableKey;

  if (!secretKey?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Stripe Secret Key (sk_...) is required to validate connection.",
    });
  }

  if (!secretKey.startsWith("sk_")) {
    return res.status(400).json({
      success: false,
      message: "Stripe Secret Key must start with 'sk_test_' or 'sk_live_'.",
    });
  }

  try {
    const stripeRes = await fetch("https://api.stripe.com/v1/balance", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey.trim()}`,
      },
    });

    if (stripeRes.ok) {
      const mode = secretKey.startsWith("sk_test_") ? "TEST" : "LIVE";
      return res.json({
        success: true,
        message: `Stripe (${mode} MODE) validated successfully! Account balance accessible.`,
        mode: mode.toLowerCase(),
      });
    } else {
      const errData = (await stripeRes.json()) as any;
      return res.status(400).json({
        success: false,
        message: errData?.error?.message || `Stripe returned HTTP ${stripeRes.status}`,
      });
    }
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "Could not reach Stripe API servers.",
      details: err?.message || String(err),
    });
  }
});

// Create Stripe Checkout Session Server-Side
app.post("/api/payments/stripe/create-checkout-session", async (req: Request, res: Response) => {
  const { secretKey } = serverPaymentConfig.stripe;
  const { planName, amount, currency = "usd", successUrl, cancelUrl } = req.body;

  if (!secretKey) {
    return res.status(400).json({
      success: false,
      message: "Stripe Secret Key not configured on server.",
    });
  }

  try {
    const params = new URLSearchParams();
    params.append("payment_method_types[]", "card");
    params.append("mode", "payment");
    params.append("line_items[0][price_data][currency]", currency);
    params.append("line_items[0][price_data][product_data][name]", planName || "KonnectJohnny Subscription");
    params.append("line_items[0][price_data][unit_amount]", String(Math.round((amount || 10) * 100)));
    params.append("line_items[0][quantity]", "1");
    params.append("success_url", successUrl || `${req.headers.origin || "http://localhost:3000"}?session_id={CHECKOUT_SESSION_ID}&payment=success`);
    params.append("cancel_url", cancelUrl || `${req.headers.origin || "http://localhost:3000"}?payment=cancel`);

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey.trim()}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const session = (await stripeRes.json()) as any;
    if (stripeRes.ok) {
      return res.json({
        success: true,
        sessionId: session.id,
        checkoutUrl: session.url,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: session?.error?.message || "Failed to create Stripe checkout session",
      });
    }
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "Stripe checkout session creation failed",
      details: err?.message || String(err),
    });
  }
});

// ==========================================
// 3. VITE MIDDLEWARE & STATIC ASSETS
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[KonnectJohnny] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
