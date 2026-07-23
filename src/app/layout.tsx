import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
  metadataBase: new URL('https://mdpreview.ca'),
  title: "MD Preview - Instant Markdown & MDX HTML Exporter",
  description: "Free client-side Markdown & MDX viewer and HTML exporter. / Visualiseur Markdown et MDX 100% local. Drag, drop, or paste Markdown (.md) to convert and download as fully responsive, styled standalone HTML or PDF files.",
  keywords: [
    // Core English Keywords & Search Queries
    "md to html",
    "md preview",
    "mdx preview",
    "markdown viewer",
    "mdx viewer",
    "markdown to html converter",
    "export markdown to html",
    "save markdown as pdf",
    "instant md preview",
    "client-side markdown parsing",
    "mdx to html",
    "online markdown viewer",
    "convert md to html",
    "markdown editor",
    "online markdown editor",
    "mdx editor",
    "online mdx editor",
    "markdown previewer",
    "online markdown previewer",
    "md viewer",
    "md previewer",
    "convert md to pdf",
    "md to pdf converter",
    "convert mdx to html",
    "gfm viewer",
    "github flavored markdown viewer",
    "local markdown viewer",
    "private markdown editor",
    "offline markdown viewer",
    "mermaid diagram viewer",
    
    // Core French Keywords & Search Queries
    "convertisseur md en html",
    "visualiseur markdown",
    "visualiseur mdx",
    "aperçu markdown",
    "aperçu mdx",
    "convertir markdown en html",
    "markdown en html",
    "exportateur html markdown",
    "éditeur markdown",
    "éditeur mdx",
    "convertir md en pdf",
    "générateur html markdown",
    "lecteur markdown en ligne"
  ],
  authors: [{ name: "Northbit", url: "https://northbit.ca/" }],
  openGraph: {
    title: "MD Preview - Instant Markdown & MDX HTML Exporter",
    description: "Free client-side Markdown & MDX viewer and HTML exporter. / Visualiseur Markdown et MDX 100% local.",
    url: "https://mdpreview.io/",
    siteName: "MD Preview",
    type: "website",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: 'icon.png',
    apple: 'apple-icon.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-LXY95XZC5Z"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-LXY95XZC5Z');
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
