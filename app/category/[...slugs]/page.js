import Link from "next/link";
import { getBlogs, getCategories } from "@/lib/api";
import { serializeJsonLd, siteName, siteUrl } from "@/lib/site";
import { notFound, redirect } from "next/navigation";
import BlogPagination from "@/Components/BlogPagination";

export const revalidate = 60;

async function resolveCategory(slugs) {
  const result = await getCategories();
  const categories = result.data || [];
  const parent = categories.find((category) => !category.parent && category.slug === slugs[0]);
  if (!parent) return null;
  const children = categories.filter((category) => {
    const parentId = typeof category.parent === "object" ? category.parent?._id : category.parent;
    return parentId === parent._id;
  });

  if (slugs.length === 1) return { category: parent, subcategory: null, children };
  if (slugs.length !== 2) return null;
  const subcategory = categories.find((category) => {
    const parentId = typeof category.parent === "object" ? category.parent?._id : category.parent;
    return parentId === parent._id && category.slug === slugs[1];
  });
  return subcategory ? { category: parent, subcategory, children } : null;
}

export async function generateMetadata({ params, searchParams }) {
  try {
    const [{ slugs }, query] = await Promise.all([params, searchParams]);
    const resolved = await resolveCategory(slugs);
    if (!resolved) return { title: "Category not found", robots: { index: false, follow: false } };

    const { category, subcategory } = resolved;
    const current = subcategory || category;
    const requestedPage = Number.parseInt(query?.page, 10) || 1;
    const page = Math.max(1, requestedPage);
    const canonical = `${siteUrl}/category/${category.slug}${subcategory ? `/${subcategory.slug}` : ""}${page > 1 ? `?page=${page}` : ""}`;
    const baseTitle = current.seoTitle || `${current.name} Cricket News & Analysis`;
    const title = page > 1 ? `${baseTitle} – Page ${page}` : baseTitle;
    const description =
      current.seoDescription ||
      current.description ||
      `Read the latest ${current.name.toLowerCase()} cricket articles, news, and expert analysis on ${siteName}.`;
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: { type: "website", title, description, url: canonical, siteName },
      twitter: { card: "summary", title, description },
    };
  } catch (error) {
    console.error("Failed to generate category metadata:", error.message);
    return { title: `${siteName} categories` };
  }
}

export default async function CategoryPage({ params, searchParams }) {
  const [{ slugs }, query] = await Promise.all([params, searchParams]);
  const resolved = await resolveCategory(slugs);
  if (!resolved) notFound();
  const requestedPage = Number.parseInt(query?.page, 10) || 1;
  const page = Math.max(1, requestedPage);
  const basePath = `/category/${resolved.category.slug}${resolved.subcategory ? `/${resolved.subcategory.slug}` : ""}`;
  if (requestedPage < 1) redirect(basePath);
  let result;
  let articleLoadFailed = false;
  try {
    result = await getBlogs({
      category: resolved.category.slug,
      subcategory: resolved.subcategory?.slug || "",
      page,
      limit: 15,
    });
  } catch (error) {
    articleLoadFailed = true;
    console.error("Failed to load category archive:", error.message);
    result = { data: [], total: 0, totalPages: 1 };
  }

  const { category, subcategory, children } = resolved;
  const current = subcategory || category;
  const articles = result.data || [];
  const totalPages = Math.max(1, Number(result.totalPages) || 1);
  if (!articleLoadFailed && page > totalPages) {
    if (result.total > 0) {
      redirect(`${basePath}${totalPages > 1 ? `?page=${totalPages}` : ""}`);
    }
    notFound();
  }
  const categoryUrl = `${siteUrl}${basePath}${page > 1 ? `?page=${page}` : ""}`;
  const breadcrumbs = [
    { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
    ...(
      subcategory
        ? [
            { "@type": "ListItem", position: 2, name: category.name, item: `${siteUrl}/category/${category.slug}` },
            { "@type": "ListItem", position: 3, name: subcategory.name, item: categoryUrl },
          ]
        : [{ "@type": "ListItem", position: 2, name: category.name, item: categoryUrl }]
    ),
  ];
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: current.seoTitle || `${current.name} Cricket News & Analysis`,
      description: current.seoDescription || current.description,
      url: categoryUrl,
      isPartOf: { "@type": "WebSite", name: siteName, url: siteUrl },
      mainEntity: {
        "@type": "ItemList",
        itemListElement: articles.map((article, index) => ({
          "@type": "ListItem",
          position: (page - 1) * 15 + index + 1,
          url: `${siteUrl}/Blog/${encodeURIComponent(article.slug)}`,
          name: article.title,
        })),
      },
    },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: breadcrumbs },
  ];

  return (
    <section className="mx-auto min-h-[60vh] max-w-6xl px-5 py-12 sm:px-8">
      {structuredData.map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
        />
      ))}
      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-slate-500">
        <Link href="/" className="hover:text-emerald-800">Home</Link>
        <span className="px-2">/</span>
        {subcategory && (
          <>
            <Link href={`/category/${category.slug}`} className="hover:text-emerald-800">{category.name}</Link>
            <span className="px-2">/</span>
          </>
        )}
        <span aria-current="page" className="text-slate-800">{current.name}</span>
      </nav>
      <header className="max-w-3xl border-b border-slate-200 pb-7">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">{subcategory ? category.name : siteName}</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">{current.name}</h1>
        <p className="mt-3 text-lg leading-7 text-slate-600">{current.description || `The latest ${current.name.toLowerCase()} cricket stories and expert analysis.`}</p>
      </header>

      {subcategory ? (
        <Link href={`/category/${category.slug}`} className="mt-5 inline-block text-sm font-semibold text-emerald-800 hover:underline">← All {category.name}</Link>
      ) : (
        <nav aria-label={`${category.name} subcategories`} className="mt-5 flex flex-wrap gap-2">
          {children.map((child) => (
            <Link key={child._id} href={`/category/${category.slug}/${child.slug}`} className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-emerald-700 hover:text-emerald-800">{child.name}</Link>
          ))}
        </nav>
      )}

      {articles.length === 0 ? (
        <p className="py-14 text-slate-600">No published articles in this category yet.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <article key={article._id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <Link href={`/Blog/${article.slug}`} className="block">
                {article.coverImage && <img src={article.coverImage} alt={article.coverImageAlt || article.title} className="h-48 w-full object-cover" />}
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">{article.subcategory || article.category}</p>
                  <h2 className="mt-2 text-xl font-bold leading-snug text-slate-950">{article.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{article.excerpt}</p>
                  <p className="mt-4 text-xs text-slate-500">{article.author} · {article.createdAt ? new Date(article.createdAt).toLocaleDateString("en-IN") : ""}</p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
      <BlogPagination basePath={basePath} currentPage={page} totalPages={totalPages} />
    </section>
  );
}
