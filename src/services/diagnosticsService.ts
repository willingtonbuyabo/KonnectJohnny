/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase, supabaseUrl, isValidSupabaseUrl, setConnectionError } from "./supabaseClient";

export interface SupabaseHealthResult {
  configured: boolean;
  url?: string;
  status: "online" | "paused" | "unconfigured" | "error";
  statusCode?: number;
  latencyMs?: number;
  message: string;
  details?: string;
}

export const diagnosticsService = {
  /**
   * Diagnostic check to confirm if Supabase connection is alive or paused.
   * Leverages server-side ping first with client fallback.
   */
  async checkSupabaseHealth(): Promise<SupabaseHealthResult> {
    // 1. First attempt server-side proxy check to avoid CORS or browser preflight quirks
    try {
      const serverRes = await fetch("/api/supabase/health");
      if (serverRes.ok) {
        const result = (await serverRes.json()) as SupabaseHealthResult;
        if (result.status === "paused") {
          setConnectionError(true);
        } else if (result.status === "online") {
          setConnectionError(false);
        }
        return result;
      }
    } catch {
      // Server-side check failed or unavailable, fallback to client-side direct ping
    }

    // 2. Direct client-side ping check
    const rawSupabaseAnonKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "").trim();

    if (!supabaseUrl || !rawSupabaseAnonKey || !isValidSupabaseUrl(supabaseUrl)) {
      return {
        configured: false,
        status: "unconfigured",
        message: "No external Supabase credentials set in environment (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).",
        details: "The application is currently operating in rich offline-first LocalStorage mode. All user actions, swipes, matches, and messages are persisted locally in the browser.",
      };
    }

    const startTime = performance.now();
    try {
      const restEndpoint = `${supabaseUrl}/rest/v1/`;
      const response = await fetch(restEndpoint, {
        method: "GET",
        headers: {
          apikey: rawSupabaseAnonKey,
          Authorization: `Bearer ${rawSupabaseAnonKey}`,
        },
      });

      const latencyMs = Math.round(performance.now() - startTime);

      if (response.ok || response.status === 200 || response.status === 404 || response.status === 401) {
        if (supabase) {
          const { error } = await supabase.from("profiles").select("id").limit(1);
          if (error) {
            const errStr = (error.message || "").toLowerCase();
            if (errStr.includes("paused") || response.status === 503) {
              setConnectionError(true);
              return {
                configured: true,
                url: supabaseUrl,
                status: "paused",
                statusCode: 503,
                latencyMs,
                message: "⚡ Supabase Project is PAUSED due to inactivity.",
                details: "Supabase free-tier projects automatically pause after 7 days without query traffic. Log into https://supabase.com/dashboard and click 'Restore Project' to reactivate.",
              };
            }
          }
        }

        setConnectionError(false);
        return {
          configured: true,
          url: supabaseUrl,
          status: "online",
          statusCode: response.status,
          latencyMs,
          message: `🟢 Supabase Database is ONLINE & Active (${latencyMs}ms)!`,
          details: `Successfully pinged: ${supabaseUrl}`,
        };
      } else if (response.status === 503 || response.status === 502) {
        setConnectionError(true);
        return {
          configured: true,
          url: supabaseUrl,
          status: "paused",
          statusCode: response.status,
          latencyMs,
          message: "⚡ Supabase Project is PAUSED by Supabase (HTTP 503).",
          details: "Log into https://supabase.com/dashboard, click on your project, and select 'Restore Project' to reactivate database compute.",
        };
      } else {
        return {
          configured: true,
          url: supabaseUrl,
          status: "error",
          statusCode: response.status,
          latencyMs,
          message: `Supabase returned HTTP status ${response.status}`,
          details: response.statusText || "Database endpoint returned unexpected HTTP status code.",
        };
      }
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      setConnectionError(true);
      return {
        configured: true,
        url: supabaseUrl,
        status: "paused",
        latencyMs,
        message: "⚡ Supabase Connection Failed (Project likely PAUSED due to inactivity).",
        details: "When a Supabase project is paused, network preflights fail or time out. Visit https://supabase.com/dashboard and click 'Restore project' to resume service.",
      };
    }
  },
};
