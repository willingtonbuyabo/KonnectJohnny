/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Globe, Copy, Check } from "lucide-react";

export const AdminProductionTab: React.FC = () => {
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  const supabaseSqlScript = `-- ========================================================
-- JONNY MATCH / KONNECT - SUPABASE PRODUCTION DATABASE SCHEMA
-- Execute this SQL in your Supabase SQL Editor
-- ========================================================

-- 1. Create Profiles Table with Verification & Admin Support
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  age INTEGER DEFAULT 25,
  gender TEXT DEFAULT 'Non-binary',
  pronouns TEXT DEFAULT 'They/Them',
  orientation TEXT DEFAULT 'Queer',
  bio TEXT DEFAULT '',
  location_name TEXT DEFAULT 'Nairobi, Kenya',
  distance_km NUMERIC DEFAULT 5,
  images TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  relationship_goals TEXT[] DEFAULT '{}',
  massage_affinity TEXT DEFAULT '',
  is_verified BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'user',
  verification_selfie_url TEXT,
  verification_status TEXT DEFAULT 'unverified',
  verification_submitted_at TIMESTAMPTZ,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Swipes Table
CREATE TABLE IF NOT EXISTS public.swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  swipee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('like', 'pass', 'superlike')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(swiper_id, swipee_id)
);

-- 3. Create Matches Table
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- 4. Create Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 6. Grant Access Policies
CREATE POLICY "Public profiles read access" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users insert/update own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Swipes access policy" ON public.swipes FOR ALL USING (auth.uid() = swiper_id);
CREATE POLICY "Matches view policy" ON public.matches FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Messages access policy" ON public.messages FOR ALL USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(supabaseSqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-5 overflow-y-auto pr-1 flex-1">
      <div className="bg-brand-obsidian/80 border border-brand-gold/40 rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-brand-gold uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Globe className="w-4 h-4" /> Production cPanel Deployment Instructions
          </span>
          <span className="text-[10px] bg-brand-gold text-brand-obsidian font-black uppercase px-2 py-0.5 rounded-full">
            Step-By-Step
          </span>
        </div>
        <p className="text-xs text-brand-cream/80 font-sans">
          Follow these 4 simple steps to deploy this application to your custom cPanel web domain.
        </p>
      </div>

      {/* Deployment Steps */}
      <div className="space-y-3">
        <div className="bg-brand-obsidian/60 border border-brand-lavender/30 rounded-2xl p-3.5 space-y-1">
          <span className="text-xs font-bold text-brand-cream flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-brand-gold text-brand-obsidian text-[10px] font-black flex items-center justify-center">1</span>
            Build Static Web Bundle
          </span>
          <p className="text-xs text-brand-cream/70 font-sans pl-7">
            Run <code className="text-brand-gold bg-black/40 px-1.5 py-0.5 rounded">npm run build</code> in your code repository. This generates the production static files inside the <code className="text-brand-gold bg-black/40 px-1.5 py-0.5 rounded">dist/</code> folder.
          </p>
        </div>

        <div className="bg-brand-obsidian/60 border border-brand-lavender/30 rounded-2xl p-3.5 space-y-1">
          <span className="text-xs font-bold text-brand-cream flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-brand-gold text-brand-obsidian text-[10px] font-black flex items-center justify-center">2</span>
            Upload Files to cPanel
          </span>
          <p className="text-xs text-brand-cream/70 font-sans pl-7">
            Open cPanel File Manager, navigate to <code className="text-brand-gold bg-black/40 px-1.5 py-0.5 rounded">public_html</code> (or your domain folder), and upload all contents of the <code className="text-brand-gold bg-black/40 px-1.5 py-0.5 rounded">dist/</code> directory.
          </p>
        </div>

        <div className="bg-brand-obsidian/60 border border-brand-lavender/30 rounded-2xl p-3.5 space-y-1">
          <span className="text-xs font-bold text-brand-cream flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-brand-gold text-brand-obsidian text-[10px] font-black flex items-center justify-center">3</span>
            Create `.htaccess` for Single Page App (SPA) Routing
          </span>
          <p className="text-xs text-brand-cream/70 font-sans pl-7">
            Inside <code className="text-brand-gold bg-black/40 px-1.5 py-0.5 rounded">public_html</code>, create a file named <code className="text-brand-gold bg-black/40 px-1.5 py-0.5 rounded">.htaccess</code> and paste:
          </p>
          <pre className="bg-black/60 p-2.5 rounded-xl text-[10px] font-mono text-emerald-300 ml-7 overflow-x-auto border border-brand-lavender/20">
{`RewriteEngine On
RewriteBase /
RewriteRule ^index\\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]`}
          </pre>
        </div>

        <div className="bg-brand-obsidian/60 border border-brand-lavender/30 rounded-2xl p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-cream flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-brand-gold text-brand-obsidian text-[10px] font-black flex items-center justify-center">4</span>
              Execute Supabase Database SQL Script
            </span>
            <button
              onClick={copySqlToClipboard}
              className="bg-brand-gold/20 hover:bg-brand-gold/30 text-brand-gold border border-brand-gold/40 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
            >
              {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedSql ? "Copied!" : "Copy SQL Script"}
            </button>
          </div>
          <p className="text-xs text-brand-cream/70 font-sans pl-7">
            Paste the SQL script below into your Supabase SQL Editor to initialize all tables, RLS security policies, and admin role columns:
          </p>
          <div className="ml-7 pt-1">
            <textarea
              readOnly
              value={supabaseSqlScript}
              rows={8}
              className="w-full bg-black/80 border border-brand-lavender/30 rounded-xl p-3 text-[10px] font-mono text-amber-200/90 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
