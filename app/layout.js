import "./globals.css";
import Header from "@/Components/Header";
import Link from "next/link";

export const metadata = {
  title: "Cricket Chronicle",
  description: "Latest Cricket News, Match Analysis & Player Insights",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#f7f5f0] text-gray-900">

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