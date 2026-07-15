/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Flower, Calendar, Users, MapPin, Sparkles, CheckCircle2, Phone, MessageSquare, Clock, ShieldCheck } from "lucide-react";

interface Booking {
  id: string;
  treatment: string;
  therapist: string;
  date: string;
  time: string;
  match_invited?: string;
  status: "Confirmed" | "Pending";
}

const TREATMENTS = [
  {
    id: "t1",
    name: "Aromatherapy Couple's Ritual",
    duration: "90 Mins",
    price: "KES 6,500",
    desc: "Unwind side-by-side with your matched partner. Indulge in warm lavender, sandalwood, and ylang-ylang essential oils. Ideal for new connections.",
    icon: Users,
  },
  {
    id: "t2",
    name: "Intimacy & Safe Touch Workshop",
    duration: "120 Mins",
    price: "KES 8,000",
    desc: "A safe, professionally-guided session teaching communication, boundaries, and therapeutic, non-judgmental healing touch.",
    icon: ShieldCheck,
  },
  {
    id: "t3",
    name: "Classic Swedish Massage",
    duration: "60 Mins",
    price: "KES 4,000",
    desc: "Our hallmark full-body relaxation treatment designed to relieve city stress, boost circulation, and calm the nervous system.",
    icon: Flower,
  },
  {
    id: "t4",
    name: "Deep Tissue Muscle Recovery",
    duration: "60 Mins",
    price: "KES 5,000",
    desc: "Rigorous therapy targeting severe muscle tension, perfect for fitness recovery or clearing physical fatigue.",
    icon: Sparkles,
  },
];

const SAFE_THERAPISTS = [
  { name: "Therapist Johnny", specialty: "Swedish & Deep Tissue Master", bio: "Founder of Massage Jonny. 8+ years advocating safe, healing spaces in Nairobi." },
  { name: "Therapist Sarah", specialty: "Aromatherapy & Reflexology", bio: "Specialist in holistic energy work and soothing, comforting massage sessions." },
  { name: "Therapist Dennis", specialty: "Sports Massage & Hot Stone", bio: "Focused on structural release, athletic wellness, and deep physical decompression." },
];

export default function Wellness() {
  const [selectedTreatment, setSelectedTreatment] = useState(TREATMENTS[0].name);
  const [selectedTherapist, setSelectedTherapist] = useState(SAFE_THERAPISTS[0].name);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem("jonny_match_bookings");
    return saved ? JSON.parse(saved) : [];
  });
  const [successMessage, setSuccessMessage] = useState(false);

  const handleBookSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate || !bookingTime) return;

    const newBooking: Booking = {
      id: "book_" + Math.random().toString(36).substring(2, 11),
      treatment: selectedTreatment,
      therapist: selectedTherapist,
      date: bookingDate,
      time: bookingTime,
      status: "Confirmed", // Instantly confirm in demo
    };

    const updatedBookings = [newBooking, ...bookings];
    setBookings(updatedBookings);
    localStorage.setItem("jonny_match_bookings", JSON.stringify(updatedBookings));

    setSuccessMessage(true);
    setBookingDate("");
    setBookingTime("");
    setSpecialInstructions("");

    setTimeout(() => {
      setSuccessMessage(false);
    }, 5000);
  };

  return (
    <div className="w-full max-w-md mx-auto h-[calc(100vh-130px)] overflow-y-auto px-4 py-5 space-y-6 bg-brand-obsidian pb-20">
      {/* Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-tr from-brand-lavender to-brand-plum border border-brand-gold/30 p-5 overflow-hidden shadow-xl">
        <div className="relative z-10 space-y-2">
          <div className="bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[9px] font-sans font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full w-max flex items-center gap-1">
            <Flower className="w-3 h-3 animate-pulse-heart" />
            Queer Affirming Wellness
          </div>
          <h3 className="font-serif font-bold text-xl text-brand-cream tracking-tight">
            Massage Jonny Healing Space
          </h3>
          <p className="text-xs text-brand-cream/80 leading-relaxed">
            Nairobi can be high-pressure. We provide a completely private, licensed, and non-judgmental sanctuary for the queer community in Kilimani & Westlands. Treat yourself or bring a Match along!
          </p>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-15">
          <Flower className="w-40 h-40 text-brand-gold" />
        </div>
      </div>

      {/* Booking Form or Success Alert */}
      {successMessage ? (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-display font-semibold text-brand-cream text-sm">
              Wellness Session Secured!
            </h4>
            <p className="text-xs text-brand-cream/70 leading-relaxed max-w-xs mx-auto">
              Your appointment is locked in with our safe therapists. We will send a discreet SMS confirmation to your registered phone.
            </p>
          </div>
          <div className="text-[10px] text-brand-gold font-mono uppercase tracking-wider bg-brand-obsidian/60 p-2 rounded-xl">
            Meet at: Massage Jonny, Wood Avenue, Kilimani, Nairobi
          </div>
        </div>
      ) : (
        <form onSubmit={handleBookSession} className="bg-brand-plum border border-brand-lavender/50 rounded-3xl p-5 space-y-4 shadow-md">
          <h4 className="text-xs font-display font-semibold uppercase tracking-widest text-brand-gold flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            Book a Discreet Treatment
          </h4>

          {/* Treatment Selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-brand-cream/50 uppercase tracking-widest font-mono">
              Therapeutic Treatment
            </label>
            <select
              value={selectedTreatment}
              onChange={(e) => setSelectedTreatment(e.target.value)}
              className="w-full text-xs px-3 py-3 rounded-xl bg-brand-obsidian border border-brand-lavender text-brand-cream focus:outline-none focus:border-brand-gold"
            >
              {TREATMENTS.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name} ({t.duration} - {t.price})
                </option>
              ))}
            </select>
          </div>

          {/* Therapist Selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-brand-cream/50 uppercase tracking-widest font-mono">
              Safe Certified Therapist
            </label>
            <select
              value={selectedTherapist}
              onChange={(e) => setSelectedTherapist(e.target.value)}
              className="w-full text-xs px-3 py-3 rounded-xl bg-brand-obsidian border border-brand-lavender text-brand-cream focus:outline-none focus:border-brand-gold"
            >
              {SAFE_THERAPISTS.map((therapist) => (
                <option key={therapist.name} value={therapist.name}>
                  {therapist.name} ({therapist.specialty})
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] text-brand-cream/50 uppercase tracking-widest font-mono">
                Select Date
              </label>
              <input
                type="date"
                required
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl bg-brand-obsidian border border-brand-lavender text-brand-cream focus:outline-none focus:border-brand-gold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-brand-cream/50 uppercase tracking-widest font-mono">
                Select Time
              </label>
              <input
                type="time"
                required
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl bg-brand-obsidian border border-brand-lavender text-brand-cream focus:outline-none focus:border-brand-gold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-brand-gold-muted to-brand-gold text-brand-obsidian font-display font-semibold text-xs tracking-wider uppercase rounded-xl shadow-md active:scale-98 transition-all mt-2"
          >
            Schedule Appointment
          </button>
        </form>
      )}

      {/* Section: List of Treatments */}
      <div className="space-y-3">
        <h4 className="text-xs font-display font-semibold uppercase tracking-widest text-brand-gold">
          Our Affirming Spa Menu
        </h4>
        <div className="space-y-3">
          {TREATMENTS.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.id}
                className="p-4 rounded-2xl bg-brand-plum/40 border border-brand-lavender/30 flex gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-lavender/40 border border-brand-gold/20 flex items-center justify-center shrink-0 text-brand-gold">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex justify-between items-baseline">
                    <h5 className="font-display font-semibold text-sm text-brand-cream">{t.name}</h5>
                    <span className="text-[11px] font-mono font-bold text-brand-gold shrink-0">{t.price}</span>
                  </div>
                  <p className="text-xs text-brand-cream/60 leading-relaxed">{t.desc}</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-brand-gold-muted font-sans font-medium mt-1">
                    <Clock className="w-3 h-3 text-brand-gold" />
                    <span>{t.duration} session</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safe Therapists Profiles */}
      <div className="space-y-3">
        <h4 className="text-xs font-display font-semibold uppercase tracking-widest text-brand-gold">
          Safe Space Therapists
        </h4>
        <div className="space-y-3">
          {SAFE_THERAPISTS.map((therapist) => (
            <div key={therapist.name} className="p-4 rounded-2xl bg-brand-plum/40 border border-brand-lavender/30">
              <h5 className="font-display font-semibold text-xs text-brand-cream">{therapist.name}</h5>
              <span className="text-[10px] text-brand-gold-muted uppercase tracking-wider block mt-0.5">{therapist.specialty}</span>
              <p className="text-xs text-brand-cream/60 leading-relaxed mt-2">{therapist.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bookings log */}
      {bookings.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-display font-semibold uppercase tracking-widest text-brand-gold">
            Your Scheduled Sessions
          </h4>
          <div className="space-y-2">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-2xl bg-brand-plum border border-brand-lavender/50 flex justify-between items-center"
              >
                <div>
                  <h5 className="text-xs font-semibold text-brand-cream">{b.treatment}</h5>
                  <p className="text-[10px] text-brand-cream/50 mt-1 font-mono">
                    {b.date} at {b.time} with {b.therapist}
                  </p>
                </div>
                <span className="text-[10px] font-sans font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Location footer details */}
      <div className="text-center space-y-2 border-t border-brand-lavender/30 pt-6">
        <div className="flex justify-center items-center gap-1 text-xs text-brand-cream/60">
          <MapPin className="w-3.5 h-3.5 text-brand-gold" />
          <span>Kilimani: Wood Avenue Court, Nairobi, Kenya</span>
        </div>
        <p className="text-[10px] text-brand-cream/40 leading-relaxed">
          Open Daily: 9:00 AM – 9:00 PM. Highly discreet entrances. Safe parking inside. All bookings are private.
        </p>
      </div>
    </div>
  );
}
