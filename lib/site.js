export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://sportsjira.com"
).replace(/\/+$/, "");

export const siteName = "SportsJira";
export const organizationId = `${siteUrl}/#organization`;
export const websiteId = `${siteUrl}/#website`;
export const siteLogoUrl = `${siteUrl}/android-chrome-512x512.png`;

export function toIsoDate(value) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function serializeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
