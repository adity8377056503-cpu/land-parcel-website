import type { Metadata } from "next";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  image?: string;
  noIndex?: boolean;
}

export function generateSEO({
  title,
  description,
  keywords = [],
  canonical,
  image,
  noIndex = false,
}: SEOProps): Metadata {
  const siteName = "Land Parcel";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://landparcel.in";
  const defaultDescription =
    "Land Parcel - Your Trusted Partner in Premium Property Deals. Explore residential, commercial, industrial and agricultural properties across Delhi NCR.";
  const defaultImage = `${siteUrl}/images/og-image.jpg`;

  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} - Premium Real Estate in Delhi NCR`;
  const metaDescription = description || defaultDescription;
  const metaImage = image || defaultImage;
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : undefined;

  return {
    title: fullTitle,
    description: metaDescription,
    keywords: [
      "property for sale in Delhi",
      "real estate Delhi NCR",
      "land parcel",
      "property in Gurugram",
      "warehouse for sale",
      "agricultural land",
      ...keywords,
    ].join(", "),
    openGraph: {
      title: fullTitle,
      description: metaDescription,
      images: [{ url: metaImage }],
      siteName,
      type: "website",
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: metaDescription,
      images: [metaImage],
    },
    ...(canonicalUrl && {
      alternates: {
        canonical: canonicalUrl,
      },
    }),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}

export const LOCATION_SEO: Record<string, { title: string; description: string; keywords: string[] }> = {
  dwarka: {
    title: "Properties for Sale in Dwarka, Delhi",
    description:
      "Find residential, commercial and industrial properties for sale in Dwarka, Delhi. Explore flats, houses, plots and commercial spaces.",
    keywords: [
      "property in Dwarka",
      "flats for sale Dwarka",
      "houses in Dwarka Delhi",
      "Dwarka property price",
    ],
  },
  najafgarh: {
    title: "Properties for Sale in Najafgarh, Delhi",
    description:
      "Explore residential and commercial properties in Najafgarh, Delhi. Find houses, plots, builder floors and commercial spaces.",
    keywords: [
      "property in Najafgarh",
      "houses for sale Najafgarh",
      "plots in Najafgarh",
    ],
  },
  gurugram: {
    title: "Properties for Sale in Gurugram (Gurgaon)",
    description:
      "Discover premium commercial, industrial and residential properties in Gurugram. Warehouses, offices, flats and commercial spaces.",
    keywords: [
      "property in Gurugram",
      "warehouse Gurugram",
      "commercial property Gurgaon",
      "office space Gurugram",
    ],
  },
};
