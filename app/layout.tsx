import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FarcasterProvider from "@/components/farcasterprovider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Syntax",
  description: "Made your magic with Syntax",
  metadataBase: new URL('https://syntax-lunaire.vercel.app'),
  openGraph: {
    title: "Syntax Deployment",
    description: "Made your magic with Syntax",
    url: "https://syntax-lunaire.vercel.app",
    siteName: "Syntax",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Syntax OG Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    title: "Syntax",
    description: "Made your magic with Syntax",
    card: "summary_large_image",
    images: ["/ogt.png"],
  },
  other: {
  "fc:frame": JSON.stringify({
    version: "next",
    imageUrl: "https://syntax-lunaire.vercel.app/ogt.png",
    button: {
      title: "Create your magic",
      action: {
        type: "Create your magic",
        name: "Syntax Lunaire",
        url: "https://syntax-lunaire.vercel.app",
        splashImageUrl: "https://syntax-lunaire.vercel.app/icon.png",
        splashBackgroundColor: "#000000",
      },
    },
  }),
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
        <FarcasterProvider>{children}</FarcasterProvider>
      </body>
    </html>
  );
}
