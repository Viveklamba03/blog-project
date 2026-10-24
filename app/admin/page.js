"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import QuillEditor from "@/Components/QuillEditor";
import {
  createBlog,
  createCategory,
  deleteBlog,
  deleteCategory,
  getAdminBlogById,
  getAdminBlogs,
  getAdminCategories,
  getAdminSession,
  loginAdmin,
  logoutAdmin,
  updateBlog,
  updateCategory,
} from "@/lib/api";

const emptyBlog = {
  title: "",
  excerpt: "",
  content: "",
  categoryId: "",
  subcategoryId: "",
  tags: "",
  author: "",
  coverImage: "",
  coverImageAlt: "",
  seoTitle: "",
  seoDescription: "",
  noIndex: false,
  published: true,
};

const emptyCategory = { name: "", parentId: "", description: "", seoTitle: "", seoDescription: "" };

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString();
}

function slugPreview(title) {
  return (
    title
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "article"
  );
}

function getParentId(category) {
  return typeof category?.parent === "object" ? category.parent?._id : category?.parent;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(null);
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [blogTotal, setBlogTotal] = useState(0);
  const [blogPage, setBlogPage] = useState(1);
  const [blogTotalPages, setBlogTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyBlog);
  const [editorResetKey, setEditorResetKey] = useState(0);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [editingId, setEditingId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const topLevelCategories = useMemo(
    () => categories.filter((category) => !getParentId(category)),
    [categories]
  );
  const subcategories = useMemo(
    () => categories.filter((category) => getParentId(category) === form.categoryId),
    [categories, form.categoryId]
  );

  const loadDashboard = useCallback(async (page = blogPage) => {
    setLoadingBlogs(true);
    try {
      const [blogResult, categoryResult] = await Promise.all([
        getAdminBlogs({ page }),
        getAdminCategories(),
      ]);
      setBlogs(blogResult.data || []);
      setBlogTotal(blogResult.total || 0);
      setBlogTotalPages(blogResult.totalPages || 1);
      setCategories(categoryResult.data || []);
      setError("");
    } catch (loadError) {
      setError(loadError.message || "Failed to load the dashboard.");
    } finally {
      setLoadingBlogs(false);
    }
  }, [blogPage]);

  useEffect(() => {
    getAdminSession()
      .then((session) => setAuthenticated(session.authenticated))
      .catch((sessionError) => {
        setError(sessionError.message || "Unable to verify the admin session.");
        setAuthenticated(false);
      });
  }, []);

  useEffect(() => {
    if (authenticated) loadDashboard();
  }, [authenticated, loadDashboard]);

  function resetBlogForm() {
    setForm(emptyBlog);
    setEditingId(null);
    setEditorResetKey((key) => key + 1);
  }

  function resetCategoryForm() {
    setCategoryForm(emptyCategory);
    setEditingCategoryId(null);
  }

  async function handleLogin(event) {
    event.preventDefault();
    setSigningIn(true);
    setError("");
    try {
      await loginAdmin(password);
      setPassword("");
      setAuthenticated(true);
    } catch (loginError) {
      setError(loginError.message || "Sign in failed.");
    } finally {
      setSigningIn(false);
    }
  }

  async function handleLogout() {
    try {
      await logoutAdmin();
      setAuthenticated(false);
      setBlogs([]);
      setBlogTotal(0);
      setCategories([]);
      setBlogPage(1);
      setBlogTotalPages(1);
      resetBlogForm();
    } catch (logoutError) {
      setError(logoutError.message || "Sign out failed.");
    }
  }

  async function editBlog(blog) {
    setLoadingEdit(blog._id);
    setError("");
    setNotice("");
    try {
      const result = await getAdminBlogById(blog._id);
      if (!result?.data) throw new Error("Could not load this article for editing.");
      const fullBlog = result.data;
      const category = categories.find(
        (item) => !getParentId(item) && (item.slug === fullBlog.categorySlug || item.name === fullBlog.category)
      );
      const subcategory = categories.find(
        (item) =>
          getParentId(item) === category?._id &&
          (item.slug === fullBlog.subcategorySlug || item.name === fullBlog.subcategory)
      );
      setForm({
        ...emptyBlog,
        title: fullBlog.title || "",
        excerpt: fullBlog.excerpt || "",
        content: fullBlog.content || "",
        categoryId: category?._id || "",
        subcategoryId: subcategory?._id || "",
        tags: Array.isArray(fullBlog.tags) ? fullBlog.tags.join(", ") : "",
        author: fullBlog.author || "",
        coverImage: fullBlog.coverImage || "",
        coverImageAlt: fullBlog.coverImageAlt || "",
        seoTitle: fullBlog.seoTitle || "",
        seoDescription: fullBlog.seoDescription || "",
        noIndex: Boolean(fullBlog.noIndex),
        published: fullBlog.published !== false,
      });
      setEditingId(fullBlog._id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (editError) {
      setError(editError.message || "Failed to load article.");
    } finally {
      setLoadingEdit(null);
    }
  }

  async function handleBlogSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    const { tags, ...fields } = form;
    const blogData = {
      ...fields,
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    };

    try {
      if (editingId) {
        await updateBlog(editingId, blogData);
        setNotice("Article updated successfully.");
      } else {
        await createBlog(blogData);
        setNotice("Article created successfully.");
      }
      resetBlogForm();
      setBlogPage(1);
      await loadDashboard(1);
    } catch (saveError) {
      setError(saveError.message || "Failed to save article.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteBlog(blog) {
    if (!window.confirm(`Delete "${blog.title}"? This cannot be undone.`)) return;
    setDeletingId(blog._id);
    setError("");
    setNotice("");
    try {
      await deleteBlog(blog._id);
      if (editingId === blog._id) resetBlogForm();
      setBlogs((current) => current.filter((item) => item._id !== blog._id));
      setNotice("Article deleted successfully.");
      const nextPage = blogs.length === 1 && blogPage > 1 ? blogPage - 1 : blogPage;
      if (nextPage !== blogPage) setBlogPage(nextPage);
      await loadDashboard(nextPage);
    } catch (deleteError) {
      setError(deleteError.message || "Failed to delete article.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleCategorySubmit(event) {
    event.preventDefault();
    setSavingCategory(true);
    setError("");
    setNotice("");
    try {
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, categoryForm);
        setNotice("Category updated successfully.");
      } else {
        await createCategory(categoryForm);
        setNotice(categoryForm.parentId ? "Subcategory created successfully." : "Category created successfully.");
      }
      resetCategoryForm();
      await loadDashboard();
    } catch (categoryError) {
      setError(categoryError.message || "Failed to save category.");
    } finally {
      setSavingCategory(false);
    }
  }

  function editCategory(category) {
    setEditingCategoryId(category._id);
    setCategoryForm({
      name: category.name || "",
      parentId: getParentId(category) || "",
      description: category.description || "",
      seoTitle: category.seoTitle || "",
      seoDescription: category.seoDescription || "",
    });
  }

  async function handleDeleteCategory(category) {
    if (!window.confirm(`Delete "${category.name}"? Categories with articles or subcategories cannot be deleted.`)) return;
    setError("");
    try {
      await deleteCategory(category._id);
      setNotice("Category deleted successfully.");
      await loadDashboard();
    } catch (deleteError) {
      setError(deleteError.message || "Failed to delete category.");
    }
  }

  function updateBlogField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "categoryId" ? { subcategoryId: "" } : {}),
    }));
  }

  if (authenticated === null) {
    return <div className="mx-auto max-w-lg px-6 py-24 text-center text-slate-600">Checking admin session…</div>;
  }

  if (!authenticated) {
    return (
      <section className="mx-auto max-w-md px-5 py-20">
        <form onSubmit={handleLogin} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">SportsJira Studio</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Admin sign in</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Sign in to manage articles, categories, and search metadata.</p>
          {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
          <label className="mt-6 block text-sm font-semibold text-slate-700">
            Admin password
            <input
              autoComplete="current-password"
              autoFocus
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={fieldClass}
            />
          </label>
          <button disabled={signingIn} className="mt-5 w-full rounded-lg bg-emerald-800 px-4 py-3 font-semibold text-white hover:bg-emerald-900 disabled:opacity-60">
            {signingIn ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">SportsJira Studio</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Editorial dashboard</h1>
          <p className="mt-2 text-slate-600">Publish, organize, and optimize your cricket coverage.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-semibold text-emerald-800 hover:text-emerald-950">View website →</Link>
          <button onClick={handleLogout} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white">Sign out</button>
        </div>
      </header>

      {error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{notice}</p>}

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-950">Content taxonomy</h2>
          <p className="mt-1 text-sm text-slate-600">Create SEO-ready categories and nested subcategories for your articles.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <form onSubmit={handleCategorySubmit} className="space-y-4 rounded-xl bg-slate-50 p-4">
            <h3 className="font-semibold text-slate-900">{editingCategoryId ? "Edit category" : "Add a category or subcategory"}</h3>
            <label className="block text-sm font-medium text-slate-700">
              Name
              <input required maxLength={80} value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} className={fieldClass} />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Parent category <span className="font-normal text-slate-500">{editingCategoryId ? "(fixed after creation)" : "(leave empty for a top-level category)"}</span>
              <select disabled={Boolean(editingCategoryId)} value={categoryForm.parentId} onChange={(event) => setCategoryForm({ ...categoryForm, parentId: event.target.value })} className={fieldClass}>
                <option value="">Top-level category</option>
                {topLevelCategories.filter((item) => item._id !== editingCategoryId).map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Description
              <textarea maxLength={300} rows={2} value={categoryForm.description} onChange={(event) => setCategoryForm({ ...categoryForm, description: event.target.value })} className={fieldClass} />
            </label>
            <label className="block text-sm font-medium text-slate-700">SEO title <span className="font-normal text-slate-500">(up to 70 characters)</span>
              <input maxLength={70} value={categoryForm.seoTitle} onChange={(event) => setCategoryForm({ ...categoryForm, seoTitle: event.target.value })} className={fieldClass} />
            </label>
            <label className="block text-sm font-medium text-slate-700">Meta description <span className="font-normal text-slate-500">(up to 160 characters)</span>
              <textarea maxLength={160} rows={2} value={categoryForm.seoDescription} onChange={(event) => setCategoryForm({ ...categoryForm, seoDescription: event.target.value })} className={fieldClass} />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <button disabled={savingCategory} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
                {savingCategory ? "Saving…" : editingCategoryId ? "Save category" : "Create category"}
              </button>
              {editingCategoryId && <button type="button" onClick={resetCategoryForm} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">Cancel edit</button>}
            </div>
          </form>

          <div className="divide-y divide-slate-100">
            {categories.length === 0 ? <p className="py-6 text-sm text-slate-500">No categories yet.</p> : categories.map((category) => (
              <div key={category._id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{getParentId(category) ? "↳ " : ""}{category.name}</p>
                  <p className="truncate text-xs text-slate-500">/{category.slug}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => editCategory(category)} className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700">Edit</button>
                  <button onClick={() => handleDeleteCategory(category)} className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <form onSubmit={handleBlogSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">{editingId ? "Update article" : "New article"}</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">{editingId ? "Edit your story" : "Write a story"}</h2>
            </div>
            {editingId && <button type="button" onClick={resetBlogForm} className="text-sm font-semibold text-slate-600 hover:text-slate-950">Cancel edit</button>}
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Headline
              <input required maxLength={200} name="title" value={form.title} onChange={updateBlogField} className={fieldClass} />
            </label>
            <p className="-mt-2 text-xs text-slate-500">
              Article URL: <code className="font-mono text-slate-700">/Blog/{slugPreview(form.title)}</code>
              <span className="ml-1">(generated from the headline)</span>
            </p>
            <label className="block text-sm font-medium text-slate-700">Excerpt
              <textarea required maxLength={500} rows={3} name="excerpt" value={form.excerpt} onChange={updateBlogField} className={fieldClass} />
            </label>
            <div>
              <label className="block text-sm font-medium text-slate-700" id="article-content-label">Article content</label>
              <QuillEditor
                key={editingId || `new-${editorResetKey}`}
                initialContent={form.content}
                onChange={(content) => setForm((current) => ({ ...current, content }))}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">Category
                <select required name="categoryId" value={form.categoryId} onChange={updateBlogField} className={fieldClass}>
                  <option value="">Choose category</option>
                  {topLevelCategories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700">Subcategory <span className="font-normal text-slate-500">(optional)</span>
                <select name="subcategoryId" value={form.subcategoryId} onChange={updateBlogField} disabled={!form.categoryId || subcategories.length === 0} className={fieldClass}>
                  <option value="">No subcategory</option>
                  {subcategories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
                </select>
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">Author
                <input required name="author" value={form.author} onChange={updateBlogField} className={fieldClass} />
              </label>
              <label className="block text-sm font-medium text-slate-700">Tags <span className="font-normal text-slate-500">(comma-separated)</span>
                <input name="tags" value={form.tags} onChange={updateBlogField} placeholder="Cricket, India, Match report" className={fieldClass} />
              </label>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900">Search and social preview</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">Optional overrides. The article headline and excerpt are used when these fields are blank.</p>
              <div className="mt-3 space-y-3">
                <label className="block text-sm font-medium text-slate-700">SEO title <span className="font-normal text-slate-500">(up to 70 characters)</span>
                  <input maxLength={70} name="seoTitle" value={form.seoTitle} onChange={updateBlogField} className={fieldClass} />
                </label>
                <label className="block text-sm font-medium text-slate-700">Meta description <span className="font-normal text-slate-500">(up to 160 characters)</span>
                  <textarea maxLength={160} rows={2} name="seoDescription" value={form.seoDescription} onChange={updateBlogField} className={fieldClass} />
                </label>
                <p className="text-xs leading-5 text-slate-500">Canonical URL is generated automatically from your site URL and this article’s title-based slug. It updates automatically if the headline changes.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">Cover image URL <span className="font-normal text-slate-500">(optional)</span>
                <input type="url" name="coverImage" value={form.coverImage} onChange={updateBlogField} className={fieldClass} />
              </label>
              <label className="block text-sm font-medium text-slate-700">Image alt text
                <input maxLength={250} name="coverImageAlt" value={form.coverImageAlt} onChange={updateBlogField} className={fieldClass} />
              </label>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3 rounded-lg bg-slate-50 p-3 text-sm">
              <label className="flex items-center gap-2 font-medium text-slate-700"><input type="checkbox" name="published" checked={form.published} onChange={updateBlogField} className="accent-emerald-800" /> Published</label>
              <label className="flex items-center gap-2 font-medium text-slate-700"><input type="checkbox" name="noIndex" checked={form.noIndex} onChange={updateBlogField} className="accent-emerald-800" /> Exclude from search engines</label>
            </div>
          </div>

          <button type="submit" disabled={saving || loadingEdit !== null || topLevelCategories.length === 0} className="mt-6 w-full rounded-lg bg-emerald-800 px-4 py-3 font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? "Saving…" : editingId ? "Save article" : "Create article"}
          </button>
          {topLevelCategories.length === 0 && <p className="mt-3 text-sm text-amber-800">Create a category before publishing an article.</p>}
        </form>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-xl font-bold text-slate-950">Articles</h2>
              <p className="mt-1 text-sm text-slate-500">{blogTotal} {blogTotal === 1 ? "story" : "stories"}</p>
            </div>
            <button type="button" onClick={() => loadDashboard(blogPage)} disabled={loadingBlogs} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
              {loadingBlogs ? "Loading…" : "Refresh"}
            </button>
          </div>
          {loadingBlogs ? <p className="px-6 py-10 text-center text-sm text-slate-500">Loading articles…</p> : blogs.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-slate-500">No articles yet. Create your first story with the editor.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {blogs.map((blog) => (
                <li key={blog._id} className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-slate-900">{blog.title || "Untitled article"}</h3>
                    <p className="mt-1 text-sm text-slate-500">{[blog.category, blog.subcategory].filter(Boolean).join(" / ")} · {blog.published === false ? "Draft" : "Published"} · {formatDate(blog.updatedAt || blog.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => editBlog(blog)} disabled={loadingEdit !== null || deletingId !== null} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">{loadingEdit === blog._id ? "Loading…" : "Edit"}</button>
                    <button type="button" onClick={() => handleDeleteBlog(blog)} disabled={deletingId !== null || loadingEdit !== null} aria-label={`Delete ${blog.title || "article"}`} className="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60">{deletingId === blog._id ? "Deleting…" : "Delete"}</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {blogTotalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
              <button type="button" onClick={() => setBlogPage((page) => Math.max(1, page - 1))} disabled={blogPage === 1 || loadingBlogs} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50">Previous</button>
              <span className="text-sm text-slate-600">Page {blogPage} of {blogTotalPages}</span>
              <button type="button" onClick={() => setBlogPage((page) => Math.min(blogTotalPages, page + 1))} disabled={blogPage === blogTotalPages || loadingBlogs} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50">Next</button>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
