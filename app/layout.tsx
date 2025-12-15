import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import InitializeApp from "@/components/InitializeApp";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MQTT Dashboard - Real-time Device Monitoring",
  description: "Monitor and control your smart home devices with MQTT protocol",
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
        <InitializeApp>{children}</InitializeApp>
      </body>
    </html>
  );
}
