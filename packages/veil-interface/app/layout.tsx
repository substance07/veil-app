import type React from "react";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";
import { generateMetadata } from "@/lib/utils/seo";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  ...generateMetadata(),
  title: {
    default: "Veil Whitelist – Encrypted Whitelist for Campaigns",
    template: "%s | Veil Whitelist",
  },
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`} suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster
            duration={8000}
            position="top-right"
            richColors
            closeButton
            expand
            visibleToasts={3}
            toastOptions={{
              actionButtonStyle: {
                backgroundColor: "#F5A800",
                color: "#FFFFFF",
                borderRadius: "0px",
                padding: "0.25rem 0.5rem",
                border: "2px solid black",
                boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)",
              },
              style: {
                pointerEvents: "auto",
                borderRadius: "0px",
                border: "2px solid black",
                boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)",
              },
            }}
          />
        </Providers>
        <Analytics />
        <Script
          src="https://cdn.zama.org/relayer-sdk-js/0.3.0-5/relayer-sdk-js.umd.cjs"
          type="text/javascript"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
