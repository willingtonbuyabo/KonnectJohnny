/**
 * Supabase Keep-Alive Ping Script
 * 
 * Prevents free-tier Supabase projects from pausing/sleeping after 7 days of inactivity.
 * Can be triggered via npm script, GitHub Actions cron, Vercel cron, or any scheduled server task.
 *
 * Usage:
 *   node scripts/keep-alive.js
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

function cleanUrl(rawUrl) {
  if (!rawUrl) return "";
  let cleaned = rawUrl.trim();
  if (cleaned.endsWith("/rest/v1")) {
    cleaned = cleaned.substring(0, cleaned.length - 8);
  }
  if (cleaned.endsWith("/rest/v1/")) {
    cleaned = cleaned.substring(0, cleaned.length - 9);
  }
  return cleaned.replace(/\/+$/, "");
}

async function pingSupabase() {
  const rawUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim();

  const timestamp = new Date().toISOString();
  console.log(`\n==================================================`);
  console.log(`[Supabase Keep-Alive Ping] ${timestamp}`);
  console.log(`==================================================`);

  if (!rawUrl || !anonKey || anonKey.toLowerCase().includes("placeholder")) {
    console.warn("⚠️  No valid Supabase credentials provided in environment.");
    console.warn("   Skipping ping. (Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env or secrets)");
    console.log(`==================================================\n`);
    process.exit(0);
  }

  const baseUrl = cleanUrl(rawUrl);
  console.log(`📡 Pinging Supabase project host: ${baseUrl}`);

  let successCount = 0;

  // 1. Auth Endpoint Ping
  try {
    const authHealthUrl = `${baseUrl}/auth/v1/health`;
    const res = await fetch(authHealthUrl, {
      headers: { apikey: anonKey }
    });
    if (res.ok) {
      console.log(`✅ [Auth Service] Health ping successful (Status: ${res.status})`);
      successCount++;
    } else {
      console.warn(`⚠️  [Auth Service] Response status: ${res.status}`);
    }
  } catch (err) {
    console.warn(`⚠️  [Auth Service] Could not reach auth health endpoint:`, err.message);
  }

  // 2. Database PostgREST / Supabase Client Ping
  try {
    const supabase = createClient(baseUrl, anonKey);
    const { data, error } = await supabase.from("profiles").select("id").limit(1);

    if (error) {
      console.warn(`⚠️  [Database Query] Notice: ${error.message}`);
      // Fallback: ping root REST endpoint
      const restRes = await fetch(`${baseUrl}/rest/v1/`, {
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` }
      });
      if (restRes.ok || restRes.status < 500) {
        console.log(`✅ [Database REST API] Pinged successfully (Status: ${restRes.status})`);
        successCount++;
      }
    } else {
      console.log(`✅ [Database Query] Successfully queried 'profiles' table (${data?.length || 0} items returned).`);
      successCount++;
    }
  } catch (err) {
    console.warn(`⚠️  [Database Query] Exception:`, err.message);
  }

  if (successCount > 0) {
    console.log(`\n🎉 Supabase project is awake and active! Keep-alive ping completed successfully.`);
    console.log(`==================================================\n`);
    process.exit(0);
  } else {
    console.error(`\n❌ Failed to ping Supabase services.`);
    console.log(`==================================================\n`);
    process.exit(1);
  }
}

pingSupabase();
