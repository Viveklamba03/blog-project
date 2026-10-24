export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://sportsjira.com"
).replace(/\/+$/, "");

export const siteName = "SportsJira";

export function serializeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
