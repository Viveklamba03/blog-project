export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://sportsjira.com"
).replace(/\/+$/, "");

export const siteName = "SportsJira";
export const organizationId = `${siteUrl}/#organization`;
export const websiteId = `${siteUrl}/#website`;
export const siteLogoPath = "/Sports%20Blog%20Brand%20Logo%20(4).png";
export const siteLogoUrl = `${siteUrl}${siteLogoPath}`;

export function toIsoDate(value) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function serializeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
