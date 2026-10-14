// app/page.js — SportsBud Homepage
import { getBlogs } from "@/lib/api";
import Link from "next/link";

export const metadata = {
  title: "SportsBud — Latest Sports News & Analysis",
  description: "Your daily dose of sports news, match analysis & player insights.",
};

const categoryColors = {
  "Match Analysis": { bg: "#dbeafe", text: "#1d4ed8" },
  "News":           { bg: "#dcfce7", text: "#15803d" },
  "Player Spotlight": { bg: "#fef9c3", text: "#a16207" },
  "Series Preview": { bg: "#ede9fe", text: "#7c3aed" },
  "Opinion":        { bg: "#fee2e2", text: "#b91c1c" },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default async function HomePage({ searchParams }) {
  const page = parseInt(searchParams?.page || "1");
  let blogs = [];
  let totalPages = 1;
  let total = 0;

  try {
    const result = await getBlogs({ page, limit: 10 });
    blogs = result.data || [];
    totalPages = result.totalPages || 1;
    total = result.total || 0;
  } catch (err) {
    console.error("Failed to fetch blogs:", err.message);
  }

  const featured = blogs[0] || null;
  const rest = blogs.slice(1);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,700;0,900;1,700&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }

        .sb-page { font-family: 'Inter', sans-serif; background: #f9fafb; min-height: 100vh; }

        .sb-hero-banner {
          background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
          padding: 48px 24px; text-align: center; color: #fff;
        }
        .sb-hero-banner h1 {
          font-family: 'Merriweather', Georgia, serif;
          font-size: clamp(28px, 5vw, 48px); font-weight: 900;
          margin: 0 0 12px; line-height: 1.15;
        }
        .sb-hero-banner p { font-size: 16px; color: #bfdbfe; margin: 0; }

        .sb-layout {
          max-width: 1200px; margin: 0 auto; padding: 40px 24px;
          display: grid; grid-template-columns: 1fr 320px; gap: 48px;
        }
        @media (max-width: 900px) {
          .sb-layout { grid-template-columns: 1fr; }
          .sb-sidebar { display: none; }
        }

        .sb-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: #9ca3af; margin-bottom: 16px;
          display: flex; align-items: center; gap: 8px;
        }
        .sb-label::after { content: ''; flex: 1; height: 1px; background: #e5e7eb; }

        .sb-featured {
          background: #fff; border-radius: 12px; overflow: hidden;
          border: 1px solid #e5e7eb; text-decoration: none; display: block;
          margin-bottom: 40px; transition: box-shadow 0.2s, transform 0.2s;
        }
        .sb-featured:hover { box-shadow: 0 12px 40px rgba(29,78,216,0.12); transform: translateY(-2px); }
        .sb-featured:hover .sb-featured-title { color: #1d4ed8; }
        .sb-featured-img { width: 100%; height: 320px; object-fit: cover; display: block; }
        .sb-featured-placeholder {
          width: 100%; height: 320px;
          background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
          display: flex; align-items: center; justify-content: center; font-size: 64px;
        }
        .sb-featured-body { padding: 24px 28px 28px; }
        .sb-cat-pill {
          font-size: 11px; font-weight: 700; letter-spacing: 0.07em;
          text-transform: uppercase; padding: 4px 10px; border-radius: 20px;
          display: inline-block; margin-bottom: 12px;
        }
        .sb-featured-title {
          font-family: 'Merriweather', Georgia, serif;
          font-size: 26px; font-weight: 900; line-height: 1.3;
          color: #111827; margin-bottom: 10px; transition: color 0.2s;
        }
        .sb-featured-excerpt { font-size: 15px; color: #6b7280; line-height: 1.7; margin-bottom: 16px; }
        .sb-featured-meta { font-size: 12px; color: #9ca3af; display: flex; gap: 16px; align-items: center; }
        .sb-featured-meta strong { color: #374151; }

        .sb-feed { display: flex; flex-direction: column; }
        .sb-feed-item {
          display: flex; gap: 16px; padding: 18px 8px;
          border-bottom: 1px solid #f3f4f6; text-decoration: none;
          align-items: flex-start; transition: background 0.15s; border-radius: 8px;
        }
        .sb-feed-item:last-child { border-bottom: none; }
        .sb-feed-item:hover { background: #eff6ff; }
        .sb-feed-item:hover .sb-feed-title { color: #1d4ed8; }
        .sb-feed-thumb { width: 110px; height: 74px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }
        .sb-feed-placeholder {
          width: 110px; height: 74px;
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: 24px;
        }
        .sb-feed-body { flex: 1; min-width: 0; }
        .sb-feed-cat { font-size: 10px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 4px; display: inline-block; }
        .sb-feed-title {
          font-family: 'Merriweather', Georgia, serif;
          font-size: 15px; font-weight: 700; line-height: 1.4; color: #111827;
          margin-bottom: 6px; transition: color 0.2s;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .sb-feed-meta { font-size: 11px; color: #9ca3af; display: flex; gap: 8px; }

        .sb-sidebar-card {
          background: #fff; border: 1px solid #e5e7eb;
          border-radius: 12px; padding: 20px; margin-bottom: 24px;
        }
        .sb-sidebar-title {
          font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: #9ca3af; margin-bottom: 16px;
          padding-bottom: 10px; border-bottom: 1px solid #f3f4f6;
        }
        .sb-trending-item {
          display: flex; gap: 12px; align-items: flex-start;
          padding: 10px 0; border-bottom: 1px solid #f9fafb; text-decoration: none;
        }
        .sb-trending-item:last-child { border-bottom: none; }
        .sb-trending-item:hover .sb-trending-title { color: #1d4ed8; }
        .sb-trending-num { font-size: 18px; font-weight: 800; color: #e5e7eb; min-width: 24px; line-height: 1; }
        .sb-trending-title { font-size: 13px; font-weight: 600; color: #1f2937; line-height: 1.4; transition: color 0.2s; }

        .sb-pagination { display: flex; gap: 6px; justify-content: center; margin-top: 32px; }
        .sb-page-btn {
          width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
          border-radius: 8px; border: 1px solid #e5e7eb; font-size: 13px; font-weight: 600;
          text-decoration: none; color: #6b7280; background: #fff; transition: all 0.15s;
        }
        .sb-page-btn:hover { border-color: #1d4ed8; color: #1d4ed8; background: #eff6ff; }
        .sb-page-btn.active { background: #1d4ed8; border-color: #1d4ed8; color: #fff; }
      `}</style>

      <div className="sb-page">

        {/* Hero */}
        <div className="sb-hero-banner">
          <h1>Your Sports, Your Way 🏆</h1>
          <p>Latest cricket news, match analysis & player insights — all in one place</p>
        </div>

        <div className="sb-layout">

          {/* Main feed */}
          <div>
            {blogs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🏆</div>
                <p>No articles yet. Check back soon!</p>
              </div>
            ) : (
              <>
                {featured && (
                  <>
                    <p className="sb-label">Top Story</p>
                    <Link href={`/Blog/${featured.slug}`} className="sb-featured">
                      {featured.coverImage ? (
                        <img src={featured.coverImage} alt={featured.title} className="sb-featured-img" />
                      ) : (
                        <div className="sb-featured-placeholder">🏆</div>
                      )}
                      <div className="sb-featured-body">
                        {(() => {
                          const c = categoryColors[featured.category] || { bg: "#f3f4f6", text: "#374151" };
                          return <span className="sb-cat-pill" style={{ background: c.bg, color: c.text }}>{featured.category}</span>;
                        })()}
                        <div className="sb-featured-title">{featured.title}</div>
                        <div className="sb-featured-excerpt">{featured.excerpt}</div>
                        <div className="sb-featured-meta">
                          <span><strong>{featured.author}</strong></span>
                          <span>·</span>
                          <span>{timeAgo(featured.createdAt)}</span>
                          <span>·</span>
                          <span>👁 {featured.views} views</span>
                        </div>
                      </div>
                    </Link>
                  </>
                )}

                {rest.length > 0 && (
                  <>
                    <p className="sb-label">Latest · {total} articles</p>
                    <div className="sb-feed">
                      {rest.map((blog) => {
                        const c = categoryColors[blog.category] || { bg: "#f3f4f6", text: "#374151" };
                        return (
                          <Link key={blog._id} href={`/Blog/${blog.slug}`} className="sb-feed-item">
                            {blog.coverImage ? (
                              <img src={blog.coverImage} alt={blog.title} className="sb-feed-thumb" />
                            ) : (
                              <div className="sb-feed-placeholder">🏆</div>
                            )}
                            <div className="sb-feed-body">
                              <span className="sb-feed-cat" style={{ color: c.text }}>{blog.category}</span>
                              <div className="sb-feed-title">{blog.title}</div>
                              <div className="sb-feed-meta">
                                <span>{blog.author}</span>
                                <span>·</span>
                                <span>{timeAgo(blog.createdAt)}</span>
                                <span>·</span>
                                <span>{blog.views} views</span>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}

                {totalPages > 1 && (
                  <div className="sb-pagination">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Link key={p} href={`/?page=${p}`} className={`sb-page-btn${p === page ? " active" : ""}`}>{p}</Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="sb-sidebar">
            <div className="sb-sidebar-card">
              <div className="sb-sidebar-title">🔥 Trending Now</div>
              {[...blogs].sort((a, b) => b.views - a.views).slice(0, 5).map((blog, i) => (
                <Link key={blog._id} href={`/Blog/${blog.slug}`} className="sb-trending-item">
                  <span className="sb-trending-num">{i + 1}</span>
                  <span className="sb-trending-title">{blog.title}</span>
                </Link>
              ))}
            </div>

            <div className="sb-sidebar-card">
              <div className="sb-sidebar-title">📂 Categories</div>
              {Object.entries(categoryColors).map(([cat, c]) => {
                const count = blogs.filter((b) => b.category === cat).length;
                return (
                  <div key={cat} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f9fafb" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>{cat}</span>
                    <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "20px", background: c.bg, color: c.text }}>{count}</span>
                  </div>
                );
              })}
            </div>

            <div className="sb-sidebar-card" style={{ background: "linear-gradient(135deg, #1d4ed8, #1e40af)", border: "none" }}>
              <div style={{ color: "#bfdbfe", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>About SportsBud</div>
              <p style={{ color: "#fff", fontSize: "13px", lineHeight: 1.6, margin: "0 0 14px" }}>Your go-to destination for cricket news, match analysis and player insights.</p>
              <Link href="/subscribe" style={{ display: "inline-block", background: "#fff", color: "#1d4ed8", fontSize: "12px", fontWeight: 700, padding: "8px 16px", borderRadius: "6px", textDecoration: "none" }}>
                Subscribe Free →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}