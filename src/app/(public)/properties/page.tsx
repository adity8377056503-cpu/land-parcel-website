import type { Metadata } from "next";
import { Suspense } from "react";
import { generateSEO } from "@/lib/seo";
import PropertiesClient from "./PropertiesClient";

export const metadata: Metadata = generateSEO({
  title: "Browse Properties for Sale in Delhi NCR",
  description:
    "Search and browse residential, commercial, industrial and agricultural properties for sale across Delhi NCR. Filter by location, type, budget and more.",
  keywords: ["property for sale Delhi NCR", "browse properties", "land parcel listings"],
  canonical: "/properties",
});

export default function PropertiesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-[#172B4D] border-t-transparent rounded-full" />
      </div>
    }>
      <PropertiesClient />
    </Suspense>
  );
}
