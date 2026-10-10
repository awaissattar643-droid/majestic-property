import type { Property } from "./types";

/**
 * SAMPLE DATA — shown only when Supabase env vars are not configured.
 * Clearly labeled as sample in the UI. Replace with real listings once
 * the backend is connected.
 */
const img = (seed: string) => `https://picsum.photos/seed/${seed}/800/500`;

export const SAMPLE_PROPERTIES: Property[] = [
  {
    id: "sample-1",
    title: "3 Bed Luxury Apartment",
    location: "DHA Phase 6, Karachi",
    price_text: "Rs 3.2 Crore",
    price_num: 32000000,
    type: "sale",
    beds: 3,
    baths: 3,
    area_sqft: 2100,
    description:
      "Sample listing — bright corner apartment with modern fittings, covered parking and 24/7 security in the heart of DHA Phase 6.",
    images: [img("majestic1")],
    sample: true,
  },
  {
    id: "sample-2",
    title: "5 Marla House",
    location: "Clifton Block 2, Karachi",
    price_text: "Rs 85,000 / month",
    price_num: 85000,
    type: "rent",
    beds: 4,
    baths: 3,
    area_sqft: 1360,
    description:
      "Sample listing — well-maintained family house near the market and schools. Available for immediate possession.",
    images: [img("majestic2")],
    sample: true,
  },
  {
    id: "sample-3",
    title: "Sea-View Flat",
    location: "DHA Phase 8, Creek Marina",
    price_text: "Rs 4.5 Crore",
    price_num: 45000000,
    type: "sale",
    beds: 4,
    baths: 4,
    area_sqft: 2800,
    description:
      "Sample listing — premium sea-facing apartment with panoramic views, high-end finishes and concierge service.",
    images: [img("majestic5")],
    sample: true,
  },
];
