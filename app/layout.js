import "./globals.css";
import Header from "@/Components/Header";
import Link from "next/link";
import { serializeJsonLd, siteName, siteUrl } from "@/lib/site";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sports News & Analysis",
    template: "%s | SportsBud",
  },
  description:
    "Read the latest sports news, cricket coverage, match analysis, series previews and player insights on SportsBud.",
  applicationName: siteName,
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  category: "sports",
  keywords: [
    "sports news",
    "cricket news",
    "cricket analysis",
    "match analysis",
    "player insights",
    "series previews",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName,
    title: "Sports News & Analysis | SportsBud",
    description:
      "The latest sports news, cricket coverage, match analysis and player insights.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sports News & Analysis | SportsBud",
    description:
      "The latest sports news, cricket coverage, match analysis and player insights.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }) {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
      logo: `${siteUrl}/favicon.ico`,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteName,
      url: siteUrl,
      inLanguage: "en-IN",
    },
  ];

  return (
    <html lang="en">
      <body className="bg-[#f7f5f0] text-gray-900">
        {structuredData.map((data) => (
          <script
            key={data["@type"]}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
          />
        ))}

        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-6xl mx-auto px-6 py-10">

            {/* Top Row */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">

              {/* Brand */}
              <div className="text-center md:text-left">
                <h2 className="text-xl font-extrabold tracking-tight font-serif">
                  SportsBud
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Stories. Analysis. Cricket.
                </p>
              </div>

              {/* Navigation */}
              <div className="flex gap-6 text-sm font-semibold text-gray-600">
                <Link href="/" className="hover:text-green-700">Home</Link>
                <Link href="/?category=News" className="hover:text-green-700">News</Link>
                <Link href="/?category=Match%20Analysis" className="hover:text-green-700">Analysis</Link>
                <Link href="/?category=Opinion" className="hover:text-green-700">Opinion</Link>
              </div>

            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mt-8 pt-6 text-center text-xs text-gray-400">
              © {new Date().getFullYear()} SportsBud. All rights reserved.
            </div>

          </div>
        </footer>

      </body>
    </html>
  );
}