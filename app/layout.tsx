import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Majestic Property Solutions — Property Manager",
  description:
    "Property listings by Majestic Property Solutions, Clifton Karachi. Browse houses, apartments and flats for sale and rent.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
