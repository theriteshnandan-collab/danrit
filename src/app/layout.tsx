import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  metadataBase: new URL("https://danrit.tech"),
  title: "DANRIT | The Universal API",
  description: "One Key. All Tools. The infrastructure of the internet.",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans bg-[var(--background)] text-[var(--foreground)] antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
