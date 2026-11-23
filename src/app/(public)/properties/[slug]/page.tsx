import { Suspense } from "react";
import type { Metadata } from "next";
import PropertyDetailClient from "./PropertyDetailClient";
import { generateSEO } from "@/lib/seo";

interface PropertyDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PropertyDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  return generateSEO({
    title: "Verified Property Details | Land Parcel",
    description:
      "Explore verified residential, commercial, industrial and agricultural land parcel deals in Delhi NCR.",
    canonical: `/properties/${slug}`,
  });
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { slug } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="animate-spin w-8 h-8 border-4 border-[#172B4D] border-t-transparent rounded-full" />
        </div>
      }
    >
      <PropertyDetailClient slug={slug} />
    </Suspense>
  );
}
