/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Flame, MessageSquare, User, Flower, HelpCircle } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadCount: number;
}

export default function BottomNav({ activeTab, onTabChange, unreadCount }: BottomNavProps) {
  const tabs = [
    { id: "discover", label: "Discover", icon: Flame },
    { id: "matches", label: "Messages", icon: MessageSquare, badge: unreadCount },
    { id: "wellness", label: "Jonny Spa", icon: Flower }, // Direct tribute to Massage Jonny
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-brand-obsidian/95 backdrop-blur-md border-t border-brand-lavender/50 px-2 pb-safe-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all duration-300 min-w-16 ${
                isActive 
                  ? "text-brand-gold" 
                  : "text-brand-cream/50 hover:text-brand-cream"
              }`}
              id={`nav-tab-${tab.id}`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "scale-110 stroke-[2.5]" : "stroke-2"}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-[10px] font-bold text-white rounded-full w-4 h-4 flex items-center justify-center animate-bounce">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] font-sans font-medium tracking-wide">
                {tab.label}
              </span>
              
              {isActive && (
                <span className="absolute bottom-0 w-4 h-0.5 bg-brand-gold rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
