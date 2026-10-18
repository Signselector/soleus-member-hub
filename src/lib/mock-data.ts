export type Booking = {
  id: string;
  dateLabel: string;
  time: string;
  location: string;
};

export const mockMember = {
  firstName: "Max",
  lastName: "Mustermann",
  email: "max.mustermann@example.at",
  phone: "+43 660 123 45 67",
  memberSince: "März 2025",
  membership: {
    name: "Standard",
    price: "49,90 €",
    interval: "Monat",
    renewsOn: "01. November 2026",
  },
  hoursAvailable: 16,
  hoursTotal: 20,
};

export const mockNextSession = {
  dateLabel: "Heute",
  time: "18:00 — 19:00",
  location: "Private Gym",
  accessAvailableFrom: "17:30",
  accessCode: "4 8 2 7 1 9",
};

export const mockUpcomingBookings: Booking[] = [
  { id: "b1", dateLabel: "Heute · Sa 18. Okt", time: "18:00 — 19:00", location: "Private Gym" },
  { id: "b2", dateLabel: "Di · 21. Okt", time: "07:00 — 08:30", location: "Private Gym" },
  { id: "b3", dateLabel: "Fr · 24. Okt", time: "19:00 — 20:00", location: "Private Gym" },
];

/** Membership plans, mirroring the offer on soleus.at. */
export const mockPlans = [
  {
    id: "standard",
    perWeek: "1×",
    name: "Standard",
    tagline: "Perfekt für den Einstieg",
    price: "49,90",
    oldPrice: null,
    badge: null,
    highlight: false,
    features: ["1 Training pro Woche", "Volle Geräteausstattung", "Flexible Buchung 24/7"],
  },
  {
    id: "plus",
    perWeek: "2×",
    name: "Plus",
    tagline: "Unser beliebtestes Paket",
    price: "74,90",
    oldPrice: null,
    badge: "Beliebt",
    highlight: true,
    features: ["2 Trainings pro Woche", "Volle Geräteausstattung", "Flexible Buchung 24/7", "Bestes Preis-Leistungs-Verhältnis"],
  },
  {
    id: "premium",
    perWeek: "3×",
    name: "Premium",
    tagline: "Maximale Ergebnisse",
    price: "89,90",
    oldPrice: null,
    badge: null,
    highlight: false,
    features: ["3 Trainings pro Woche", "Volle Geräteausstattung", "Flexible Buchung 24/7", "Ideal für ambitionierte Ziele"],
  },
  {
    id: "unlimited",
    perWeek: "∞",
    name: "Unlimited",
    tagline: "Für maximale Frequenz",
    price: "109,90",
    oldPrice: "149,90 € / Monat",
    badge: "Special Offer",
    highlight: false,
    features: ["Unlimitierte Trainings pro Woche", "Volle Geräteausstattung", "Flexible Buchung 24/7", "Maximale Trainingsfrequenz"],
  },
] as const;

/** Optional one-off services offered during sign-up. */
export const mockAddons = [
  { id: "bia-1", label: "Segmental Körperanalyse – 1x Messung", price: 59, note: null },
  { id: "bia-5", label: "Segmental Körperanalyse – 5x Messung", price: 145, note: "29,00€/Messung" },
  { id: "plan", label: "Trainingsplan inkl. Ernährungsempfehlung", price: 79, note: null },
] as const;

export const mockGoals = ["Muskelaufbau", "Nachhaltiges Abnehmen", "Fitness steigern", "Rehabilitation", "Beweglichkeit verbessern"] as const;

/** Family & Friends add-on, as offered on soleus.at (bookable on top of any plan). */
export const mockFamilyFriends = { price: 15, label: "Family & Friends", guests: 2 } as const;
