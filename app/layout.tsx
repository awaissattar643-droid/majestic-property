import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Majestic Property Solutions — Premium Real Estate in Clifton, Karachi",
  description:
    "Handpicked apartments, houses and flats for sale and rent across Clifton, DHA, Bahria Town and DHA City Karachi — by Majestic Property Solutions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
