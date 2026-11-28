import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// The Julquiz look's titles (D75); only loaded where a Julquiz shows a title.
const julquizTitle = Playfair_Display({
  variable: "--font-julquiz-title",
  subsets: ["latin"],
  weight: ["700"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Quz",
  description: "Julquiz – live quiz for TV, team phones and hosts",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="sv"
      className={`${geistSans.variable} ${geistMono.variable} ${julquizTitle.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
