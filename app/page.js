// app/page.js

import { getBlogs, getCategories } from "@/lib/api";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import BlogPagination from "@/Components/BlogPagination";
import { siteUrl } from "@/lib/site";

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const requestedPage = Number.parseInt(params?.page, 10) || 1;
  const page = Math.max(1, requestedPage);
  const category = params?.category?.trim();
  const query = new URLSearchParams();
  if (category) query.set("category", category);
  if (page > 1) query.set("page", String(page));
  const canonical = `${siteUrl}/${query.size ? `?${query}` : ""}`;
  const title = category
    ? `${category} Cricket News${page > 1 ? ` – Page ${page}` : ""}`
    : `Latest Sports News & Match Analysis${page > 1 ? ` – Page ${page}` : ""}`;
  const description =
    "Stay up to date with sports news, cricket coverage, match analysis, series previews and player insights from SportsBud.";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { type: "website", title, description, url: canonical },
  };
}

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
  const params = await searchParams;
  const category = params?.category || "";
  const requestedPage = Number.parseInt(params?.page, 10) || 1;
  const page = Math.max(1, requestedPage);
  if (requestedPage < 1) redirect("/");

  let blogs = [];
  let categories = [];
  let totalPages = 1;
  let total = 0;
  let blogLoadFailed = false;

  try {
    const result = await getBlogs({ category, page, limit: 15 });
    blogs = result.data || [];
    totalPages = Math.max(1, Number(result.totalPages) || 1);
    total = result.total || 0;
  } catch (err) {
    blogLoadFailed = true;
    console.error("Failed to fetch blogs:", err.message);
  }
  if (!blogLoadFailed && page > totalPages) {
    if (total > 0) {
      const query = new URLSearchParams();
      if (category) query.set("category", category);
      if (totalPages > 1) query.set("page", String(totalPages));
      redirect(`/${query.size ? `?${query}` : ""}`);
    }
    notFound();
  }
  try {
    const result = await getCategories();
    categories = result.data || [];
  } catch (err) {
    console.error("Failed to fetch categories:", err.message);
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

        .page-title {
          font-size: clamp(26px, 4vw, 36px);
          line-height: 1.2;
          margin: 0 0 24px;
          color: #111827;
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
            <h1 className="page-title">Latest Sports News &amp; Cricket Analysis</h1>
            <nav aria-label="Article categories" className="mb-7 flex flex-wrap gap-2">
              <Link href="/" className="rounded-full border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:border-emerald-700 hover:text-emerald-800">All stories</Link>
              {categories.filter((item) => !item.parent).map((item) => (
                <Link key={item._id} href={`/category/${item.slug}`} className="rounded-full border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:border-emerald-700 hover:text-emerald-800">{item.name}</Link>
              ))}
            </nav>
            {blogs.length === 0 ? (
              <p>No articles found</p>
            ) : (
              <>
                {featured && (
                  <>
                    <p className="section-head">Top Story</p>
                    <Link href={`/Blog/${featured.slug}`} className="hero-card">
                      {featured.coverImage && <img src={featured.coverImage} alt={featured.coverImageAlt || featured.title} className="hero-img" />}
                      <div className="hero-body">
                        <div className="hero-title">{featured.title}</div>
                        <p>{featured.excerpt}</p>
                      </div>
                    </Link>
                  </>
                )}

                {rest.map((blog) => (
                  <Link key={blog._id} href={`/Blog/${blog.slug}`} className="feed-item">
                    {blog.coverImage && <img src={blog.coverImage} alt={blog.coverImageAlt || blog.title} className="feed-thumb" />}
                    <div>
                      <div className="feed-title">{blog.title}</div>
                      <p>{blog.excerpt}</p>
                    </div>
                  </Link>
                ))}

                <BlogPagination basePath={category ? `/?category=${encodeURIComponent(category)}` : "/"} currentPage={page} totalPages={totalPages} />
              </>
            )}
          </div>

        </div>
      </div>
    </>
  );
}