import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { MotionProvider } from "@/components/motion/motion-provider";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Renza — Yapay Zekâ Destekli Ürün Fotoğrafçılığı",
    template: "%s · Renza",
  },
  description:
    "Takı, saat ve çanta markaları için stüdyo kalitesinde ürün görselleri. Ham fotoğrafını yükle, lüks konsepti seç, saniyeler içinde 2K görsele dönüştür.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <MotionProvider>{children}</MotionProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
