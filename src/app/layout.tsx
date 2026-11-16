import type { Metadata, Viewport } from "next";
import { Amiri, Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Koran-Wörter",
  description:
    "Die wichtigsten Wörter des Korans auf Deutsch lernen und im Quiz trainieren",
};

export const viewport: Viewport = {
  themeColor: "#059669",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${amiri.variable} antialiased`}
    >
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
