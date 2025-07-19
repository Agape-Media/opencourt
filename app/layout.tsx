import type { Viewport } from "next";
import { Geist } from "next/font/google";
import { Providers } from "@/context";
import { Header } from "@/components/header";
import SparkleBackground from "@/components/sparkle-background";
import { siteConfig } from "@/lib/content";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: true,
});

export const dynamic = "force-static";
export const revalidate = 30;

export const viewport: Viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
};

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://opencourt.dev",
  ),
  title: {
    template: siteConfig.metadata.titleTemplate,
    default: siteConfig.metadata.defaultTitle,
  },
  description: siteConfig.metadata.defaultDescription,
  openGraph: {
    type: "website",
    images: [siteConfig.metadata.ogImage.url],
  },
  twitter: {
    card: "summary_large_image",
    images: [siteConfig.metadata.ogImage.url],
  },
  icons: [siteConfig.metadata.favicon.url],
  generator: "v0.dev",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.className} antialiased max-w-screen min-h-svh bg-black text-white`}
      >
        <Providers>
          <SparkleBackground />
          <div className="max-w-screen-sm mx-auto w-full relative z-10 flex flex-col min-h-screen">
            <div className="px-5 gap-8 flex flex-col flex-1 py-8 sm:py-[12vh]">
              <Header />
              <main className="flex justify-center">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
