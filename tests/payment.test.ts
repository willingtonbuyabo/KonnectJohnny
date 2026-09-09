/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from "vitest";

// Helper functions for payment validation
export function sanitizeMpesaPhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9+]/g, "");
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }
  if (cleaned.startsWith("07") || cleaned.startsWith("01")) {
    cleaned = "254" + cleaned.substring(1);
  }
  return cleaned;
}

export function generateMpesaTimestamp(): string {
  const date = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

export function generateMpesaPassword(shortcode: string, passkey: string, timestamp: string): string {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
}

export function maskSecret(secret?: string): string {
  if (!secret) return "";
  return "••••••••••••••••••••••••••••••••";
}

describe("Payment Processing Utilities", () => {
  it("should sanitize Kenyan phone numbers into 254 international format", () => {
    expect(sanitizeMpesaPhone("0712345678")).toBe("254712345678");
    expect(sanitizeMpesaPhone("+254712345678")).toBe("254712345678");
    expect(sanitizeMpesaPhone("0112345678")).toBe("254112345678");
    expect(sanitizeMpesaPhone("254712345678")).toBe("254712345678");
  });

  it("should generate a valid 14-digit M-Pesa timestamp", () => {
    const timestamp = generateMpesaTimestamp();
    expect(timestamp).toHaveLength(14);
    expect(/^\d{14}$/.test(timestamp)).toBe(true);
  });

  it("should generate standard base64 encoded Lipa Na M-Pesa password", () => {
    const shortcode = "174379";
    const passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
    const timestamp = "20260909120000";
    const password = generateMpesaPassword(shortcode, passkey, timestamp);

    const decoded = Buffer.from(password, "base64").toString("utf-8");
    expect(decoded).toBe(`${shortcode}${passkey}${timestamp}`);
  });

  it("should properly mask secrets so credentials are never leaked in public JSON responses", () => {
    const rawSecret = "sk_live_very_secret_stripe_key_12345";
    const masked = maskSecret(rawSecret);
    expect(masked).not.toContain("sk_live");
    expect(masked).toBe("••••••••••••••••••••••••••••••••");
    expect(maskSecret("")).toBe("");
  });
});
