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
    bio: "Visual artist & yoga facilitator based in Kilimani. Wearing my signature neon-pink lipstick and celebrating my Pride! Let's talk about art, indie films, or swap vinyl records. Swedish massage lover!",
    images: [
      "https://images.unsplash.com/photo-1615210431336-f7f185078c57?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=600"
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
    bio: "Software developer & grassroots community advocate. I love vibrant colors, a bright cherry lipstick, and sharing warm smiles. Always active at Alchemist or cycling in Karura forest.",
    images: [
      "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&q=80&w=600",
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
    bio: "Landscape designer and plant parent. Always smiling under a sunny Nairobi sky! Rocking subtle rainbow pride paint today. Looking for healing touch and deep, slow-paced conversations.",
    images: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600",
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
    bio: "Boutique fashion curator & DJ. Matching my loud outfits with an ultra-bright glossy violet lipstick and a giant smile! Love hot stone therapy, high-energy music, and beautiful, bright connections.",
    images: [
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600"
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
    bio: "Creative writer, herbal tea geek, and thrifting wizard. Flashing my bright golden lipstick and warm smile against a gorgeous bright yellow backdrop. Let's share warm stories and laughter!",
    images: [
      "https://images.unsplash.com/photo-1567186937675-a5131c8a89ea?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=600"
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
    bio: "Pastry chef and amateur triathlete. Celebrating my authentic pride-filled journey with an infectious laugh and bright rainbow accessories. Love sports massages at Massage Jonny!",
    images: [
      "https://images.unsplash.com/photo-1621252179027-94459d278660?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600"
    ],
    interests: ["Baking", "Triathlon", "Fitness", "Outdoor Trips", "Coffee"],
    location_name: "CBD, Nairobi",
    distance_km: 6.5,
    is_verified: true,
    relationship_goals: ["Dating", "Matchmaking"],
    massage_affinity: "Sports Massage Devotee"
  },
  {
    id: "p7",
    name: "Makena",
    age: 25,
    gender: "Cis Woman",
    pronouns: "She/Her",
    orientation: "Lesbian",
    bio: "Graphic designer & LGBT+ community organizer. Obsessed with contemporary art galleries, live slam poetry nights, and outdoor garden cafés in Gigiri. Let's find some sunset views, share some good matcha, and connect!",
    images: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600"
    ],
    interests: ["Art", "Design", "Poetry", "Community", "Matcha"],
    location_name: "Gigiri, Nairobi",
    distance_km: 5.1,
    is_verified: true,
    relationship_goals: ["Dating", "Deep Connections"],
    massage_affinity: "Aromatherapy Fan"
  },
  {
    id: "p8",
    name: "Mwangi",
    age: 27,
    gender: "Cis Man",
    pronouns: "He/Him",
    orientation: "Gay",
    bio: "Afrobeats DJ, podcaster, and personal fitness trainer in Kilimani. Huge fan of high-energy house music, early morning runs, and dynamic deep tissue massage therapy. Always spreading good vibes and radiant smiles!",
    images: [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=600"
    ],
    interests: ["DJing", "Fitness", "Podcasts", "House Music", "Swimming"],
    location_name: "Kilimani, Nairobi",
    distance_km: 1.2,
    is_verified: true,
    relationship_goals: ["Dating", "Matchmaking"],
    massage_affinity: "Deep Tissue Devotee"
  },
  {
    id: "p9",
    name: "Sasha",
    age: 26,
    gender: "Trans Woman",
    pronouns: "She/Her",
    orientation: "Lesbian",
    bio: "Professional makeup artist and beauty content creator based in Westlands. Loving bold winged eyeliner, retro runway fashion, and upbeat sushi nights with friends. Always looking for genuine lesbian connections and a therapeutic massage session.",
    images: [
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=600"
    ],
    interests: ["Makeup Artistry", "Runway Fashion", "Sushi", "Vlogging", "Self-Care"],
    location_name: "Westlands, Nairobi",
    distance_km: 2.9,
    is_verified: true,
    relationship_goals: ["Dating", "Friends First"],
    massage_affinity: "Swedish Massage Enthusiast"
  },
  {
    id: "p10",
    name: "Tariq",
    age: 30,
    gender: "Cis Man",
    pronouns: "He/Him",
    orientation: "Gay",
    bio: "Culinary arts instructor and lifestyle food photographer. Big lover of hot spicy food, weekend road trips to Lake Naivasha, and hot stone therapy. Let's swap secret recipes and explore the Nairobi food scene together!",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=600"
    ],
    interests: ["Cooking", "Photography", "Travel", "Hot Spicy Food", "Wine Tasting"],
    location_name: "Lavington, Nairobi",
    distance_km: 3.8,
    is_verified: true,
    relationship_goals: ["Long-term", "Matchmaking"],
    massage_affinity: "Hot Stone Enthusiast"
  },
  {
    id: "p11",
    name: "Wanjiku",
    age: 29,
    gender: "Cis Woman",
    pronouns: "She/Her",
    orientation: "Lesbian",
    bio: "Indie bookstore owner and craft coffee enthusiast in Lavington. Always found buried in a classic vintage novel with a freshly brewed cup of pour-over coffee. Passionate about slow-living, reflexology, and matching like-minded creative souls.",
    images: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600"
    ],
    interests: ["Literature", "Specialty Coffee", "Slow-Living", "Vintage Records", "Aromatherapy"],
    location_name: "Lavington, Nairobi",
    distance_km: 4.1,
    is_verified: true,
    relationship_goals: ["Dating", "Deep Connections"],
    massage_affinity: "Aromatherapy Fan"
  },
  {
    id: "p12",
    name: "Jaden",
    age: 23,
    gender: "Cis Man",
    pronouns: "He/Him",
    orientation: "Gay",
    bio: "UX / UI product designer and competitive swimmer. Highly energetic, loves exploring Nairobi on electric scooters, and down for sunset picnics at Karura Forest. Let's grab some craft beer and chat about design and massage therapy!",
    images: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600"
    ],
    interests: ["UX Design", "Swimming", "Craft Beer", "Picnics", "Electric Scooters"],
    location_name: "Westlands, Nairobi",
    distance_km: 2.2,
    is_verified: true,
    relationship_goals: ["Dating", "Casual Fun"],
    massage_affinity: "Sports Massage Devotee"
  }
];
