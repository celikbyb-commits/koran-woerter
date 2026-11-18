import type { Metadata, Viewport } from "next";
import { Amiri, Nunito } from "next/font/google";
import ServiceWorker from "@/components/ServiceWorker";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Koran-Wörter",
  description: "Die Wörter des Korans lernen – Deutsch und Türkisch",
  appleWebApp: { capable: true, title: "Koran-Wörter", statusBarStyle: "default" },
  icons: { apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#059669",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="de"
      className={`${nunito.variable} ${amiri.variable} antialiased`}
    >
      <body className="min-h-dvh">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
