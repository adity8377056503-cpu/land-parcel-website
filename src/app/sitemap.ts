import { MetadataRoute } from "next";
import { DEMO_PROPERTIES } from "@/lib/demo-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://landparcel.in";

  const staticRoutes = [
    "",
    "/buy",
    "/residential",
    "/commercial",
    "/industrial",
    "/agricultural",
    "/properties",
    "/list-property",
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/disclaimer",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  const locationRoutes = [
    "dwarka",
    "najafgarh",
    "gurugram",
    "manesar",
    "west-delhi",
    "south-west-delhi",
    "noida",
    "faridabad",
  ].map((slug) => ({
    url: `${baseUrl}/locations/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const propertyRoutes = DEMO_PROPERTIES.map((p) => ({
    url: `${baseUrl}/properties/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...locationRoutes, ...propertyRoutes];
}
