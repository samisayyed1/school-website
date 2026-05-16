import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The VIP School of Excellence — Nizamabad",
  description:
    "Visionary Institute of Piety. A premium primary school in Nizamabad blending modern academics with Quran Shareef Taleem. AC classrooms, digital learning, classes 1–5.",
  keywords: [
    "VIP School of Excellence",
    "Nizamabad school",
    "Islamic school Nizamabad",
    "primary school Bodhan Road",
    "Quran Taleem school",
  ],
  openGraph: {
    title: "The VIP School of Excellence — Nizamabad",
    description:
      "Premium primary education in Nizamabad. Academics + Quran Shareef Taleem. AC, digital classrooms. Limited seats — admissions open.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-vip-cream text-vip-ink antialiased`}>
        {children}
      </body>
    </html>
  );
}
