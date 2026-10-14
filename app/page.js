// app/page.js

import { getBlogs } from "@/lib/api";
import Link from "next/link";

export const metadata = {
  title: "Cricket News | Cricket Chronicles",
  description: "Latest cricket news, match analysis and player insights",
};

const categoryColors = {
  "Match Analysis": { bg: "#dcfce7", text: "#15803d", border: "#16a34a" },
  "News":           { bg: "#dbeafe", text: "#1d4ed8", border: "#2563eb" },
  "Player Spotlight": { bg: "#fef9c3", text: "#a16207", border: "#ca8a04" },
  "Series Preview": { bg: "#ede9fe", text: "#7c3aed", border: "#7c3aed" },
  "Opinion":        { bg: "#fee2e2", text: "#b91c1c", border: "#dc2626" },
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

export default async function BlogPage({ searchParams }) {
  const category = searchParams?.category || "";
  const page = parseInt(searchParams?.page || "1");

  let blogs = [];
  let totalPages = 1;
  let total = 0;

  try {
    const result = await getBlogs({ category, page, limit: 15 });
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
        .news-page { font-family: Georgia, serif; background: #fff; min-height: 100vh; }

        .news-layout {
          max-width: 1100px;
          margin: 0 auto;
          padding: 28px 20px;
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 40px;
        }

        @media (max-width: 900px) {
          .news-layout { grid-template-columns: 1fr; }
          .news-sidebar { display: none; }
        }

        .section-head {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          color: #9ca3af;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }

        .hero-card {
          background: #fff;
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          text-decoration: none;
          display: block;
        }

        .hero-img { width: 100%; height: 300px; object-fit: cover; }

        .hero-body { padding: 20px; }

        .hero-title {
          font-size: 22px;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .feed-item {
          display: flex;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid #e9e7e2;
          text-decoration: none;
        }

        .feed-thumb {
          width: 120px;
          height: 80px;
          object-fit: cover;
        }

        .feed-title {
          font-size: 16px;
          font-weight: 600;
        }

        .pagination {
          display: flex;
          gap: 6px;
          justify-content: center;
          margin-top: 32px;
        }

        .page-btn {
          padding: 8px 12px;
          border: 1px solid #ccc;
          text-decoration: none;
        }
      `}</style>

      <div className="news-page">

        <div className="news-layout">

          {/* Left */}
          <div>
            {blogs.length === 0 ? (
              <p>No articles found</p>
            ) : (
              <>
                {featured && (
                  <>
                    <p className="section-head">Top Story</p>
                    <Link href={`/Blog/${featured.slug}`} className="hero-card">
                      <img src={featured.coverImage} className="hero-img" />
                      <div className="hero-body">
                        <div className="hero-title">{featured.title}</div>
                        <p>{featured.excerpt}</p>
                      </div>
                    </Link>
                  </>
                )}

                {rest.map((blog) => (
                  <Link key={blog._id} href={`/Blog/${blog.slug}`} className="feed-item">
                    <img src={blog.coverImage} className="feed-thumb" />
                    <div>
                      <div className="feed-title">{blog.title}</div>
                      <p>{blog.excerpt}</p>
                    </div>
                  </Link>
                ))}

                {totalPages > 1 && (
                  <div className="pagination">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Link key={p} href={`/?page=${p}`} className="page-btn">
                        {p}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </>
  );
}