import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { API_URL } from "@/lib/api";
import {
  adminCookieName,
  adminSessionDuration,
  createAdminSession,
  isAdminSessionValid,
  verifyAdminPassword,
} from "@/lib/admin-session";

export const runtime = "nodejs";

function jsonError(message, status) {
  return NextResponse.json({ success: false, message }, { status });
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/admin",
    maxAge: adminSessionDuration,
  };
}

async function handleLogin(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("A valid password is required.", 400);
  }

  if (typeof body.password !== "string" || !body.password) {
    return jsonError("A valid password is required.", 400);
  }

  try {
    if (!verifyAdminPassword(body.password)) return jsonError("Incorrect password.", 401);
    const response = NextResponse.json({ success: true });
    response.cookies.set(adminCookieName, createAdminSession(), cookieOptions());
    return response;
  } catch (error) {
    return jsonError(error.message, 503);
  }
}

function handleLogout() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(adminCookieName, "", { ...cookieOptions(), maxAge: 0 });
  return response;
}

function backendPath(path, method) {
  const [resource, id, extra] = path;
  if (extra) return null;

  if (resource === "blogs") {
    if (method === "GET" && id === undefined) return "/blogs/admin";
    if (method === "GET" && id === "categories") return "/categories";
    if (method === "GET" && id === "admin") return "/blogs/admin";
    if (method === "POST" && id === undefined) return "/blogs";
    if (method === "GET" && id && id !== "admin") return `/blogs/admin/${encodeURIComponent(id)}`;
    if ((method === "PUT" || method === "DELETE") && id) return `/blogs/${encodeURIComponent(id)}`;
  }

  if (resource === "categories") {
    if (method === "GET" && id === undefined) return "/categories";
    if (method === "POST" && id === undefined) return "/categories/admin";
    if ((method === "PUT" || method === "DELETE") && id) {
      return `/categories/admin/${encodeURIComponent(id)}`;
    }
  }
  return null;
}

async function proxyAdminRequest(request, path) {
  const token = process.env.ADMIN_API_TOKEN;
  if (!token) return jsonError("ADMIN_API_TOKEN is not configured.", 503);

  const targetPath = backendPath(path, request.method);
  if (!targetPath) return jsonError("Admin endpoint not found.", 404);

  const target = new URL(`${API_URL}${targetPath}`);
  target.search = new URL(request.url).search;
  const headers = new Headers({ Authorization: `Bearer ${token}` });
  let body;
  if (request.method === "POST" || request.method === "PUT") {
    headers.set("Content-Type", "application/json");
    body = await request.text();
  }

  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });
  if (upstream.ok && ["POST", "PUT", "DELETE"].includes(request.method)) {
    revalidateTag("blogs", "max");
    revalidateTag("categories", "max");
    revalidatePath("/sitemap.xml");
  }
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") || "application/json" },
  });
}

async function handle(request, context) {
  const { path = [] } = await context.params;
  if (path.length === 1 && path[0] === "login" && request.method === "POST") {
    return handleLogin(request);
  }
  if (path.length === 1 && path[0] === "logout" && request.method === "POST") {
    return handleLogout();
  }
  if (path.length === 1 && path[0] === "session" && request.method === "GET") {
    try {
      return NextResponse.json({
        authenticated: isAdminSessionValid(request.cookies.get(adminCookieName)?.value),
      });
    } catch (error) {
      return jsonError(error.message, 503);
    }
  }

  try {
    if (!isAdminSessionValid(request.cookies.get(adminCookieName)?.value)) {
      return jsonError("Admin authentication required.", 401);
    }
  } catch (error) {
    return jsonError(error.message, 503);
  }
  return proxyAdminRequest(request, path);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
