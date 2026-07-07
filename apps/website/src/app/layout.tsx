import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./ThemeProvider";
import { PostHogProvider } from "./PostHogProvider";

export const metadata: Metadata = {
  title: "SaleSync - Point of Sale & Inventory Management",
  description: "The ultimate offline-first serverless app for large stores to manage inventory and sales. Instant scan, bulk import, and infinite scale.",
  keywords: ["POS", "Point of Sale", "Inventory Management", "Offline POS", "Retail App", "SaleSync"],
  openGraph: {
    title: "SaleSync - Point of Sale & Inventory Management",
    description: "The ultimate offline-first serverless app for large stores to manage inventory and sales.",
    type: "website",
    siteName: "SaleSync POS",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SaleSync - Point of Sale",
    description: "The ultimate offline-first serverless app for stores.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <PostHogProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
