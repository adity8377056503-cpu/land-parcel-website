import type { Metadata } from "next";
import { generateSEO } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";
import { Sprout, MapPin, Building2 } from "lucide-react";
import PropertyCard from "@/components/property/PropertyCard";
import { DEMO_PROPERTIES } from "@/lib/demo-data";

export const metadata: Metadata = generateSEO({
  title: "Agricultural Land for Sale - Farm Land, Farmhouses",
  description:
    "Find agricultural land, farmhouses and farm land for sale across Haryana, Delhi NCR and Uttarakhand. Explore fertile agricultural investment opportunities.",
  keywords: ["agricultural land for sale", "farm land Haryana", "farmhouse Delhi NCR"],
  canonical: "/agricultural",
});

export default function AgriculturalPage() {
  const agricultureProperties = DEMO_PROPERTIES.filter(
    (p) => p.category === "agricultural"
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 bg-[#172B4D] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80"
            alt="Agricultural land"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative container-custom text-center text-white">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-300 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#C6A66B]">Agricultural Land</span>
          </div>
          <div className="w-12 h-12 bg-[#C6A66B]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Sprout className="w-6 h-6 text-[#C6A66B]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
            Agricultural Land
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Fertile agricultural land, farmhouses and farm properties across Haryana, NCR and beyond.
          </p>
        </div>
      </section>

      {/* Types Filter */}
      <section className="py-10 bg-white border-b border-[#E2E8F0]">
        <div className="container-custom">
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { label: "All Agricultural", value: "", icon: "🌾" },
              { label: "Agricultural Land", value: "agricultural-land", icon: "🏡" },
              { label: "Farmhouses", value: "farmhouse", icon: "🏘️" },
              { label: "Farm Land", value: "farm-land", icon: "🌱" },
              { label: "Orchards", value: "orchard", icon: "🌳" },
            ].map((type) => (
              <Link
                key={type.value}
                href={`/properties?category=agricultural${type.value ? `&type=${type.value}` : ""}`}
                className="flex items-center gap-2 px-5 py-2.5 border border-[#E2E8F0] text-sm font-medium rounded-full hover:border-[#172B4D] hover:bg-[#EAF3FA] transition-colors text-[#64748B] bg-white first:bg-[#172B4D] first:text-white first:border-[#172B4D]"
              >
                <span>{type.icon}</span>
                {type.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="py-14 bg-[#F5F7FA]">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-[#172B4D] font-display mb-8">
            Agricultural Listings
          </h2>

          {agricultureProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {agricultureProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-[#64748B]">
              <Sprout className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No agricultural listings yet</p>
              <Link href="/list-property" className="btn-primary mt-6 inline-flex">
                List Your Property
              </Link>
            </div>
          )}

          <div className="text-center mt-10">
            <Link href="/properties?category=agricultural" className="btn-primary">
              <Building2 className="w-4 h-4" />
              View All Agricultural Properties
            </Link>
          </div>
        </div>
      </section>

      {/* Key Locations */}
      <section className="py-14 bg-white">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-[#172B4D] font-display mb-6">
            Key Agricultural Regions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              "Karnal (Haryana)", "Panipat (Haryana)", "Rohtak (Haryana)",
              "Jhajjar (Haryana)", "Sonipat (Haryana)", "Baghpat (UP)",
              "Muzaffarnagar (UP)", "Dehradun (Uttarakhand)",
            ].map((loc) => (
              <div
                key={loc}
                className="flex items-center gap-2 p-4 border border-[#E2E8F0] rounded-xl"
              >
                <MapPin className="w-4 h-4 text-[#C6A66B] flex-shrink-0" />
                <span className="text-sm font-medium text-[#172B4D]">{loc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
