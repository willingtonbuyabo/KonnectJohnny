/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Profile } from "../types";

export const mockProfiles: Profile[] = [
  {
    id: "p1",
    name: "Zuri",
    age: 24,
    gender: "Non-binary",
    pronouns: "They/Them",
    orientation: "Queer",
    bio: "Visual artist & yoga facilitator based in Kilimani. Let's grab cozy coffee at Shamba Cafe, talk about indie films, or swap vinyl records. Swedish massage lover!",
    images: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600"
    ],
    interests: ["Art", "Yoga", "Vinyl", "Indie Cinema", "Coffee"],
    location_name: "Kilimani, Nairobi",
    distance_km: 1.8,
    is_verified: true,
    relationship_goals: ["Dating", "Deep Connections"],
    massage_affinity: "Swedish Massage Enthusiast"
  },
  {
    id: "p2",
    name: "Kendi",
    age: 28,
    gender: "Trans Woman",
    pronouns: "She/Her",
    orientation: "Lesbian",
    bio: "Software developer & grassroots community advocate. Big fan of trivia nights at Alchemist, cycling in Karura forest, and winding down with aromatherapy. Looking for a genuine connection in Nairobi.",
    images: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600"
    ],
    interests: ["Coding", "Activism", "Cycling", "Trivia", "Nature"],
    location_name: "Westlands, Nairobi",
    distance_km: 3.4,
    is_verified: true,
    relationship_goals: ["Dating", "Matchmaking"],
    massage_affinity: "Aromatherapy Fan"
  },
  {
    id: "p3",
    name: "Jonah",
    age: 31,
    gender: "Queer Man",
    pronouns: "He/Him",
    orientation: "Gay",
    bio: "Landscape designer and plant parent. When I'm not gardening in Karen, I'm trying out new culinary recipes or reading historical fiction. I believe in healing touch and deep, slow-paced conversations.",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600"
    ],
    interests: ["Gardening", "Cooking", "Literature", "Sustainability", "Wine"],
    location_name: "Karen, Nairobi",
    distance_km: 12.1,
    is_verified: true,
    relationship_goals: ["Matchmaking", "Long-term"],
    massage_affinity: "Deep Tissue Devotee"
  },
  {
    id: "p4",
    name: "Fatma",
    age: 26,
    gender: "Cis Woman",
    pronouns: "She/Her",
    orientation: "Bisexual",
    bio: "Boutique fashion curator & occasional DJ. I spend my weekends crate-digging or scouting out brunch spots in Lavington. Love hot stone therapy and high-energy music. Let's make memories!",
    images: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=600"
    ],
    interests: ["Fashion", "DJing", "Brunch", "Vinyl", "Travel"],
    location_name: "Lavington, Nairobi",
    distance_km: 4.2,
    is_verified: false,
    relationship_goals: ["Dating", "Casual Fun"],
    massage_affinity: "Hot Stone Enthusiast"
  },
  {
    id: "p5",
    name: "Neo",
    age: 22,
    gender: "Genderfluid",
    pronouns: "They/She/He",
    orientation: "Pansexual",
    bio: "Creative writer, herbal tea geek, and thrifting wizard. Usually found exploring Nairobi's vintage scene or relaxing on Ngong Road. Looking for sweet, fluid souls to share massages, stories, and warm laughter.",
    images: [
      "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&q=80&w=600"
    ],
    interests: ["Writing", "Thrifting", "Herbal Tea", "Thrift Fashion", "Music"],
    location_name: "Ngong Road, Nairobi",
    distance_km: 2.7,
    is_verified: true,
    relationship_goals: ["Friends First", "Dating"],
    massage_affinity: "Aromatherapy & Reflexology"
  },
  {
    id: "p6",
    name: "Amani",
    age: 29,
    gender: "Transmasculine",
    pronouns: "He/They",
    orientation: "Queer",
    bio: "Pastry chef and amateur triathlete. Love high-intensity workouts and recovering with sports massage at Massage Jonny. Looking for like-minded active folks to co-create safe and loving spaces.",
    images: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600"
    ],
    interests: ["Baking", "Triathlon", "Fitness", "Outdoor Trips", "Coffee"],
    location_name: "CBD, Nairobi",
    distance_km: 6.5,
    is_verified: true,
    relationship_goals: ["Dating", "Matchmaking"],
    massage_affinity: "Sports Massage Devotee"
  }
];
