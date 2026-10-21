export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:5000/api"
    : "https://blog-project-backend-omega.vercel.app/api")
).replace(/\/+$/, "");

async function readAdminResponse(res, fallback) {
  const result = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(result?.message || `${fallback} (${res.status})`);
  }
  return result;
}

// Fetch all blogs (with optional category filter and pagination)
export async function getBlogs({ category = "", subcategory = "", page = 1, limit = 9 } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (category) params.append("category", category);
  if (subcategory) params.append("subcategory", subcategory);

  const res = await fetch(`${API_URL}/blogs?${params}`, {
    next: { revalidate: 60, tags: ["blogs"] },
  });

  if (!res.ok) throw new Error(`Failed to fetch blogs: ${res.status} ${res.statusText}`);
  return res.json();
}

// Fetch all blogs for the admin dashboard, including drafts when the backend supports it.
export async function getAdminBlogs({ page = 1, limit = 50 } = {}) {
 const res = await fetch(`/api/admin/blogs?limit=${limit}&page=${page}`, { cache: "no-store" });
 return readAdminResponse(res, "Failed to fetch blogs");
}

// Fetch a full blog by ID for the admin dashboard
export async function getAdminBlogById(id) {
 const res = await fetch(`/api/admin/blogs/${encodeURIComponent(id)}`, { cache: "no-store" });
 return readAdminResponse(res, "Failed to fetch blog");
}

export async function getCategories() {
 const res = await fetch(`${API_URL}/categories`, { next: { revalidate: 60, tags: ["categories"] } });
 if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status} ${res.statusText}`);
 return res.json();
}

export async function getAdminCategories() {
 const res = await fetch("/api/admin/categories", { cache: "no-store" });
 return readAdminResponse(res, "Failed to fetch categories");
}

export async function createCategory(categoryData) {
 const res = await fetch("/api/admin/categories", {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(categoryData),
 });
 return readAdminResponse(res, "Failed to create category");
}

export async function updateCategory(id, categoryData) {
 const res = await fetch(`/api/admin/categories/${encodeURIComponent(id)}`, {
   method: "PUT",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(categoryData),
 });
 return readAdminResponse(res, "Failed to update category");
}

export async function deleteCategory(id) {
 const res = await fetch(`/api/admin/categories/${encodeURIComponent(id)}`, { method: "DELETE" });
 return readAdminResponse(res, "Failed to delete category");
}

export async function getAdminSession() {
 const res = await fetch("/api/admin/session", { cache: "no-store" });
 if (!res.ok) throw new Error("Could not verify admin session.");
 return res.json();
}

export async function loginAdmin(password) {
 const res = await fetch("/api/admin/login", {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify({ password }),
 });
 return readAdminResponse(res, "Failed to sign in");
}

export async function logoutAdmin() {
 const res = await fetch("/api/admin/logout", { method: "POST" });
 return readAdminResponse(res, "Failed to sign out");
}

// Fetch single blog by slug
export async function getBlogBySlug(slug) {
  const res = await fetch(`${API_URL}/blogs/${slug}`, {
    next: { revalidate: 60, tags: ["blogs", `blog-${slug}`] },
  });

  if (!res.ok) return null;
  return res.json();
}

// Create a new blog (admin)
export async function createBlog(blogData) {
  const res = await fetch("/api/admin/blogs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(blogData),
  });

  return readAdminResponse(res, "Failed to create blog");
}

// Update an existing blog (admin)
export async function updateBlog(id, blogData) {
  const res = await fetch(`/api/admin/blogs/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(blogData),
  });

  return readAdminResponse(res, "Failed to update blog");
}

// Delete a blog (admin)
export async function deleteBlog(id) {
  const res = await fetch(`/api/admin/blogs/${encodeURIComponent(id)}`, { method: "DELETE" });
  return readAdminResponse(res, "Failed to delete blog");
}