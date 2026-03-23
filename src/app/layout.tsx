import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ThemeInitializer } from "@/components/theme-initializer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "CodeOps — Company Management Dashboard",
  description: "Manage all your Claude Code projects from a single dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeInitializer />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
