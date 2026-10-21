import { getBlogs, getCategories } from "@/lib/api";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap() {
  const pages = [
    {
      url: siteUrl,
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  try {
    const firstPage = await getBlogs({ page: 1, limit: 100 });
    const blogs = [...(firstPage.data || [])];
    const totalPages = Number(firstPage.totalPages) || 1;

    for (let page = 2; page <= totalPages; page += 1) {
      const result = await getBlogs({ page, limit: 100 });
      blogs.push(...(result.data || []));
    }

    for (const blog of blogs) {
      if (!blog.slug || blog.noIndex) continue;

      const lastModified = blog.updatedAt || blog.createdAt;
      const parsedLastModified = lastModified ? new Date(lastModified) : null;

      pages.push({
        url: `${siteUrl}/Blog/${encodeURIComponent(blog.slug)}`,
        ...(parsedLastModified && !Number.isNaN(parsedLastModified.getTime())
          ? { lastModified: parsedLastModified }
          : {}),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch (error) {
    console.error("Failed to generate article sitemap entries:", error.message);
  }

  try {
    const result = await getCategories();
    for (const category of result.data || []) {
      const parent = typeof category.parent === "object" ? category.parent : null;
      const url = parent
        ? `${siteUrl}/category/${parent.slug}/${category.slug}`
        : `${siteUrl}/category/${category.slug}`;
      pages.push({
        url,
        ...(category.updatedAt ? { lastModified: new Date(category.updatedAt) } : {}),
        changeFrequency: "weekly",
        priority: parent ? 0.5 : 0.6,
      });
    }
  } catch (error) {
    console.error("Failed to generate category sitemap entries:", error.message);
  }

  return pages;
}
