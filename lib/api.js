const API_URL = "https://blog-project-backend-omega.vercel.app/api/" || "http://localhost:5000/api";

// Fetch all blogs (with optional category filter and pagination)
export async function getBlogs({ category = "", page = 1, limit = 9 } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (category) params.append("category", category);

  const res = await fetch(`${API_URL}/blogs?${params}`, {
    next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
  });

  if (!res.ok) throw new Error("Failed to fetch blogs");
  return res.json();
}

// Fetch single blog by slug
export async function getBlogBySlug(slug) {
  const res = await fetch(`${API_URL}/blogs/${slug}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return null;
  return res.json();
}

// Create a new blog (admin)
export async function createBlog(blogData) {
  const res = await fetch(`${API_URL}/blogs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(blogData),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to create blog");
  }
  return res.json();
}

// Delete a blog (admin)
export async function deleteBlog(id) {
  const res = await fetch(`${API_URL}/blogs/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete blog");
  return res.json();
}