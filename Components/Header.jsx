"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCategories } from "@/lib/api";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories()
      .then((result) => setCategories((result.data || []).filter((category) => !category.parent)))
      .catch((error) => console.error("Failed to load navigation categories:", error.message));
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    ...categories.map((category) => ({ label: category.name, href: `/category/${category.slug}` })),
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .sb-header {
          font-family: 'Inter', sans-serif;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 1px 8px rgba(0,0,0,0.06);
        }

        .sb-main-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          max-width: 1200px;
          margin: 0 auto;
          height: 64px;
        }

        .sb-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .sb-logo-badge {
          width: 36px;
          height: 36px;
          background: #1d4ed8;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 15px;
          color: #fff;
          letter-spacing: -0.5px;
          flex-shrink: 0;
        }

        .sb-logo-name {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          letter-spacing: -0.3px;
        }

        .sb-logo-name span {
          color: #1d4ed8;
        }

        .sb-nav {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .sb-nav a {
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          text-decoration: none;
          padding: 8px 14px;
          border-radius: 6px;
          transition: color 0.15s, background 0.15s;
        }

        .sb-nav a:hover {
          color: #1d4ed8;
          background: #eff6ff;
        }

        .sb-cta {
          background: #1d4ed8 !important;
          color: #fff !important;
          font-weight: 600 !important;
          padding: 8px 18px !important;
          border-radius: 6px !important;
          margin-left: 8px;
          transition: background 0.15s !important;
        }

        .sb-cta:hover {
          background: #1e40af !important;
          color: #fff !important;
        }

        .sb-hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          padding: 6px;
          background: none;
          border: none;
        }

        .sb-hamburger span {
          width: 22px;
          height: 2px;
          background: #6b7280;
          border-radius: 2px;
          transition: transform 0.3s, opacity 0.3s;
          display: block;
        }

        .sb-hamburger.open span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
          background: #1d4ed8;
        }

        .sb-hamburger.open span:nth-child(2) {
          opacity: 0;
        }

        .sb-hamburger.open span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
          background: #1d4ed8;
        }

        .sb-mobile-menu {
          display: none;
          flex-direction: column;
          background: #fff;
          border-top: 1px solid #f3f4f6;
          padding: 8px 24px 20px;
        }

        .sb-mobile-menu a {
          font-size: 15px;
          font-weight: 500;
          color: #374151;
          text-decoration: none;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .sb-mobile-menu a:hover {
          color: #1d4ed8;
        }

        .sb-mobile-menu a:last-child {
          border-bottom: none;
        }

        @media (max-width: 768px) {
          .sb-nav {
            display: none;
          }

          .sb-hamburger {
            display: flex;
          }

          .sb-mobile-menu {
            display: flex;
          }

          .sb-main-row {
            padding: 0 20px;
          }
        }
      `}</style>

      <header className="sb-header">
        <div className="sb-main-row">

          {/* Logo */}
          <Link href="/" className="sb-logo">
            <div className="sb-logo-badge">SJ</div>
            <div className="sb-logo-name">
              sports<span>jira</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="sb-nav" role="navigation">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
            <Link href="/admin" className="sb-cta">
              Admin
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            className={`sb-hamburger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="sb-mobile-menu">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/admin" onClick={() => setMenuOpen(false)} style={{ color: "#1d4ed8", fontWeight: 600 }}>
              Admin →
            </Link>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;