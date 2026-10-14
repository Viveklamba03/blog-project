// app/Blog/[slug]/page.js — Server Component

import { getBlogBySlug, getBlogs } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  try {
     const { slug } = await params;
    const result = await getBlogBySlug(slug);
    if (!result?.data) return { title: "Cricket Chronicles" };
    return {
      title: `${result.data.title} | Cricket Chronicles`,
      description: result.data.excerpt,
    };
  } catch { return { title: "Cricket Chronicles" }; }
}

function renderContent(content) {
  const lines = content.trim().split("\n");
  const html = [];
  let inList = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("## ")) {
      if (inList) { html.push("</ul>"); inList = false; }
      html.push(`<h2>${line.slice(3)}</h2>`);
    } else if (line.startsWith("### ")) {
      if (inList) { html.push("</ul>"); inList = false; }
      html.push(`<h3>${line.slice(4)}</h3>`);
    } else if (line.startsWith("- ")) {
      if (!inList) { html.push("<ul>"); inList = true; }
      html.push(`<li>${line.slice(2)}</li>`);
    } else if (line === "") {
      if (inList) { html.push("</ul>"); inList = false; }
      html.push("<br/>");
    } else {
      if (inList) { html.push("</ul>"); inList = false; }
      html.push(`<p>${line}</p>`);
    }
  }
  if (inList) html.push("</ul>");
  return html.join("\n");
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default async function BlogDetailPage({ params }) {
  let blog = null;
  let related = [];

  try {
     const { slug } = await params;
    const result = await getBlogBySlug(slug);
    blog = result?.data;
  } catch (err) { console.error(err.message); }

  if (!blog) notFound();

  try {
    const result = await getBlogs({ category: blog.category, limit: 4 });
    related = (result.data || []).filter((b) => b.slug !== blog.slug).slice(0, 3);
  } catch {}

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Source+Serif+4:wght@400;600&display=swap');
        .article-page { font-family: 'Source Serif 4', Georgia, serif; background: #f7f5f0; min-height: 100vh; }
        .article-hero { width: 100%; max-height: 420px; object-fit: cover; display: block; }
        .article-hero-placeholder {
          width: 100%; height: 280px;
          background: linear-gradient(135deg, #14532d 0%, #166534 100%);
          display: flex; align-items: center; justify-content: center; font-size: 72px;
        }
        .article-wrap {
          max-width: 1100px; margin: 0 auto; padding: 32px 20px;
          display: grid; grid-template-columns: 1fr 280px; gap: 48px;
        }
        @media (max-width: 860px) { .article-wrap { grid-template-columns: 1fr; } .article-sidebar { display: none; } }
        .breadcrumb { font-size: 12px; color: #9ca3af; display: flex; gap: 6px; align-items: center; margin-bottom: 20px; flex-wrap: wrap; }
        .breadcrumb a { color: #6b7280; text-decoration: none; }
        .breadcrumb a:hover { color: #15803d; }
        .breadcrumb-sep { color: #d1d5db; }
        .cat-pill { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 4px 10px; border-radius: 2px; margin-bottom: 14px; }
        .article-title { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(26px, 4vw, 38px); font-weight: 900; line-height: 1.2; color: #0f1a10; margin-bottom: 16px; }
        .article-standfirst { font-size: 18px; color: #4b5563; line-height: 1.65; border-left: 4px solid #16a34a; padding-left: 16px; margin-bottom: 20px; font-style: italic; }
        .meta-bar { display: flex; gap: 20px; align-items: center; padding: 14px 0; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; margin-bottom: 32px; flex-wrap: wrap; }
        .meta-author { display: flex; gap: 10px; align-items: center; }
        .meta-avatar { width: 36px; height: 36px; border-radius: 50%; background: #166534; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; flex-shrink: 0; }
        .meta-name { font-size: 13px; font-weight: 700; color: #1f2937; }
        .meta-info { font-size: 12px; color: #9ca3af; }
        .meta-stat { font-size: 12px; color: #9ca3af; }
        .article-body h2 { font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 900; color: #0f1a10; margin: 32px 0 12px; border-bottom: 2px solid #dcfce7; padding-bottom: 8px; }
        .article-body h3 { font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 700; color: #1f2937; margin: 24px 0 10px; }
        .article-body p { font-size: 17px; line-height: 1.8; color: #374151; margin-bottom: 16px; }
        .article-body ul { margin: 0 0 16px 20px; list-style: disc; }
        .article-body li { font-size: 17px; line-height: 1.8; color: #374151; margin-bottom: 6px; }
        .tags-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
        .tag { font-size: 12px; background: #f3f4f6; color: #6b7280; padding: 4px 12px; border-radius: 20px; }
        .related-card { display: flex; gap: 12px; padding: 14px 0; border-bottom: 1px solid #e9e7e2; text-decoration: none; }
        .related-card:last-child { border-bottom: none; }
        .related-card:hover .related-title { color: #15803d; }
        .related-thumb { width: 72px; height: 52px; object-fit: cover; border-radius: 3px; flex-shrink: 0; }
        .related-thumb-placeholder { width: 72px; height: 52px; background: #dcfce7; border-radius: 3px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .related-title { font-family: 'Playfair Display', serif; font-size: 13px; font-weight: 700; color: #1f2937; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; transition: color 0.2s; }
        .back-link { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: #15803d; text-decoration: none; margin-bottom: 20px; }
        .back-link:hover { text-decoration: underline; }
        .section-head { font-family: 'Playfair Display', serif; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #9ca3af; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 16px; }
        .section-head span { color: #16a34a; margin-right: 6px; }
      `}</style>

      <div className="article-page">
        {blog.coverImage ? (
          <img src={blog.coverImage} alt={blog.title} className="article-hero" />
        ) : (
          <div className="article-hero-placeholder">🏏</div>
        )}

        <div className="article-wrap">
          <article>
            <nav className="breadcrumb">
              <Link href="/">Home</Link>
              <span className="breadcrumb-sep">›</span>
              <Link href="/">Cricket News</Link>
              <span className="breadcrumb-sep">›</span>
              <Link href={`/?category=${encodeURIComponent(blog.category)}`}>{blog.category}</Link>
            </nav>

            <Link href="/" className="back-link">← Back to all articles</Link>

            {(() => {
              const colors = {
                "Match Analysis": { bg: "#dcfce7", color: "#15803d" },
                "News":           { bg: "#dbeafe", color: "#1d4ed8" },
                "Player Spotlight": { bg: "#fef9c3", color: "#a16207" },
                "Series Preview": { bg: "#ede9fe", color: "#7c3aed" },
                "Opinion":        { bg: "#fee2e2", color: "#b91c1c" },
              };
              const c = colors[blog.category] || { bg: "#f3f4f6", color: "#374151" };
              return <span className="cat-pill" style={{ background: c.bg, color: c.color }}>{blog.category}</span>;
            })()}

            <h1 className="article-title">{blog.title}</h1>
            <p className="article-standfirst">{blog.excerpt}</p>

            <div className="meta-bar">
              <div className="meta-author">
                <div className="meta-avatar">{blog.author.charAt(0).toUpperCase()}</div>
                <div>
                  <div className="meta-name">{blog.author}</div>
                  <div className="meta-info">Cricket Chronicles</div>
                </div>
              </div>
              <span className="meta-stat">📅 {new Date(blog.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
              <span className="meta-stat">· {timeAgo(blog.createdAt)}</span>
              <span className="meta-stat">· 👁 {blog.views} views</span>
            </div>

            <div className="article-body" dangerouslySetInnerHTML={{ __html: renderContent(blog.content) }} />

            {blog.tags?.length > 0 && (
              <div className="tags-row">
                {blog.tags.map((tag) => <span key={tag} className="tag">#{tag}</span>)}
              </div>
            )}
          </article>

          <aside className="article-sidebar">
            {related.length > 0 && (
              <div>
                <p className="section-head"><span>●</span> Related Articles</p>
                {related.map((b) => (
                  <Link key={b._id} href={`/Blog/${b.slug}`} className="related-card">
                    {b.coverImage ? (
                      <img src={b.coverImage} alt={b.title} className="related-thumb" />
                    ) : (
                      <div className="related-thumb-placeholder">🏏</div>
                    )}
                    <span className="related-title">{b.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}