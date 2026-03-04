import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "./components/NavBar";
import { BottomNav } from "./components/BottomNav";
import { ServiceWorkerRegister } from "./components/ServiceWorkerRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "FreshCart",
  description: "Grocery delivery made fresh — shop, deliver, and manage orders.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FreshCart",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ServiceWorkerRegister />
        <div className="min-h-dvh bg-zinc-50 text-zinc-900 pb-16 sm:pb-0">
          <NavBar />
          <div className="mx-auto w-full max-w-6xl px-4 py-6">{children}</div>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
