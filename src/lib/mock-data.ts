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
