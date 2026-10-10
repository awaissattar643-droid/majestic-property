export type PropertyType = "sale" | "rent";

export type Property = {
  id: string;
  title: string;
  location: string;
  /** Display price, e.g. "Rs 3.2 Crore" or "Rs 85,000 / month" */
  price_text: string;
  /** Numeric price in PKR (for filtering). Null when not applicable. */
  price_num: number | null;
  type: PropertyType;
  beds: number | null;
  baths: number | null;
  area_sqft: number | null;
  description: string;
  images: string[];
  created_at?: string;
  /** True for the built-in demo listings shown when Supabase is not connected. */
  sample?: boolean;
};

export function formatSpecs(p: Property): string {
  const parts: string[] = [];
  if (p.beds) parts.push(`${p.beds} Bed`);
  if (p.baths) parts.push(`${p.baths} Bath`);
  if (p.area_sqft) parts.push(`${p.area_sqft.toLocaleString()} sqft`);
  return parts.join(" • ") || "—";
}

export function whatsappInquiryUrl(p: Property, ownerNumber: string): string {
  const text = `Salam! I am interested in "${p.title}" (${p.location}, ${p.price_text}). Please share more details.`;
  return `https://wa.me/${ownerNumber}?text=${encodeURIComponent(text)}`;
}
