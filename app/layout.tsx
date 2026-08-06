import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Footprint | Personal Carbon Footprint Calculator",
  description: "Track, analyze, and reduce your personal environmental carbon footprint across Transport, Energy, Food, and Waste with a unified abstraction model.",
  keywords: ["carbon footprint", "sustainability", "CO2 calculator", "climate action", "emissions tracking"],
  authors: [{ name: "Footprint Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 min-h-screen selection:bg-emerald-500 selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}

