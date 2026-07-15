/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Filter, RotateCcw, X, MapPin } from "lucide-react";
import { MatchFilters } from "../types";

interface FiltersProps {
  filters: MatchFilters;
  onChange: (filters: MatchFilters) => void;
  onClose: () => void;
}

const GENDER_OPTIONS = [
  "Non-binary",
  "Trans Woman",
  "Trans Man",
  "Cis Woman",
  "Cis Man",
  "Genderfluid",
  "Queer"
];

const GOAL_OPTIONS = [
  "Dating",
  "Matchmaking",
  "Friends First",
  "Deep Connections",
  "Casual Fun"
];

const DEFAULT_FILTERS: MatchFilters = {
  age_range: [18, 50],
  max_distance: 30,
  genders: [],
  relationship_goals: []
};

export default function Filters({ filters, onChange, onClose }: FiltersProps) {
  const toggleGender = (gender: string) => {
    const isSelected = filters.genders.includes(gender);
    const updated = isSelected
      ? filters.genders.filter((g) => g !== gender)
      : [...filters.genders, gender];
    
    onChange({ ...filters, genders: updated });
  };

  const toggleGoal = (goal: string) => {
    const isSelected = filters.relationship_goals.includes(goal);
    const updated = isSelected
      ? filters.relationship_goals.filter((g) => g !== goal)
      : [...filters.relationship_goals, goal];

    onChange({ ...filters, relationship_goals: updated });
  };

  const handleAgeMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minVal = parseInt(e.target.value);
    const maxVal = filters.age_range[1];
    if (minVal <= maxVal) {
      onChange({ ...filters, age_range: [minVal, maxVal] });
    }
  };

  const handleAgeMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maxVal = parseInt(e.target.value);
    const minVal = filters.age_range[0];
    if (maxVal >= minVal) {
      onChange({ ...filters, age_range: [minVal, maxVal] });
    }
  };

  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, max_distance: parseInt(e.target.value) });
  };

  const handleReset = () => {
    onChange(DEFAULT_FILTERS);
  };

  return (
    <div className="bg-brand-plum border border-brand-lavender/60 rounded-3xl p-6 shadow-2xl space-y-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-brand-gold" />
          <h3 className="font-display font-semibold text-lg text-brand-cream">
            Matchmaking Filters
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-brand-gold-muted hover:text-brand-gold transition-colors py-1 px-2 rounded-lg hover:bg-brand-lavender/20"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-brand-lavender/30 hover:bg-brand-lavender/50 text-brand-cream transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {/* Distance Filter */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-brand-cream/80 flex items-center gap-1">
              <MapPin className="w-4 h-4 text-brand-gold" />
              Maximum Distance
            </span>
            <span className="font-mono text-brand-gold font-semibold">
              {filters.max_distance} km
            </span>
          </div>
          <input
            type="range"
            min="2"
            max="100"
            step="1"
            value={filters.max_distance}
            onChange={handleDistanceChange}
            className="w-full accent-brand-gold cursor-pointer bg-brand-lavender/40 h-1.5 rounded-full outline-none"
          />
          <div className="flex justify-between text-[10px] text-brand-cream/40 font-mono">
            <span>2 km</span>
            <span>Nairobi Area</span>
            <span>100 km+</span>
          </div>
        </div>

        {/* Age Range Filter */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-brand-cream/80">Age Range</span>
            <span className="font-mono text-brand-gold font-semibold">
              {filters.age_range[0]} - {filters.age_range[1]} years
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex-1 space-y-1">
              <span className="text-[10px] text-brand-cream/50 uppercase tracking-wider">Min</span>
              <input
                type="range"
                min="18"
                max="70"
                value={filters.age_range[0]}
                onChange={handleAgeMinChange}
                className="w-full accent-brand-gold cursor-pointer bg-brand-lavender/40 h-1.5 rounded-full"
              />
            </div>
            <div className="flex-1 space-y-1">
              <span className="text-[10px] text-brand-cream/50 uppercase tracking-wider">Max</span>
              <input
                type="range"
                min="18"
                max="70"
                value={filters.age_range[1]}
                onChange={handleAgeMaxChange}
                className="w-full accent-brand-gold cursor-pointer bg-brand-lavender/40 h-1.5 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Gender Identity Filter */}
        <div className="space-y-2">
          <span className="block text-sm font-medium text-brand-cream/80">
            Show Me (Gender Identity)
          </span>
          <div className="flex flex-wrap gap-2">
            {GENDER_OPTIONS.map((gender) => {
              const isSelected = filters.genders.includes(gender);
              return (
                <button
                  key={gender}
                  onClick={() => toggleGender(gender)}
                  className={`text-xs px-3.5 py-1.5 rounded-full border transition-all duration-300 font-medium ${
                    isSelected
                      ? "bg-brand-gold text-brand-obsidian border-brand-gold shadow-lg shadow-brand-gold/10 scale-[1.03]"
                      : "bg-brand-lavender/20 border-brand-lavender/70 text-brand-cream/70 hover:border-brand-gold/40"
                  }`}
                >
                  {gender}
                </button>
              );
            })}
          </div>
        </div>

        {/* Relationship Goals Filter */}
        <div className="space-y-2">
          <span className="block text-sm font-medium text-brand-cream/80">
            Connections & Matching Goals
          </span>
          <div className="flex flex-wrap gap-2">
            {GOAL_OPTIONS.map((goal) => {
              const isSelected = filters.relationship_goals.includes(goal);
              return (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`text-xs px-3.5 py-1.5 rounded-full border transition-all duration-300 font-medium ${
                    isSelected
                      ? "bg-brand-gold text-brand-obsidian border-brand-gold shadow-lg shadow-brand-gold/10 scale-[1.03]"
                      : "bg-brand-lavender/20 border-brand-lavender/70 text-brand-cream/70 hover:border-brand-gold/40"
                  }`}
                >
                  {goal}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full bg-gradient-to-r from-brand-gold-muted to-brand-gold text-brand-obsidian py-3 rounded-xl font-display font-semibold text-sm tracking-wide shadow-lg hover:brightness-110 active:scale-[0.98] transition-all"
        id="apply-filters-btn"
      >
        Apply Search Filters
      </button>
    </div>
  );
}
