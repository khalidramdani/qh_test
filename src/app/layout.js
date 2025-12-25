import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Queen House",
  description: "Queen House Official Website",
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Favicon links (cache-busting query param) */}
        <link rel="icon" type="image/png" href="/favicon.png?v=2" />
        <link rel="shortcut icon" href="/favicon.png?v=2" />
        <link rel="apple-touch-icon" href="/favicon.png?v=2" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
