import type { Metadata } from "next";
import { generateSEO } from "@/lib/seo";
import PropertyCategories from "@/components/home/PropertyCategories";
import Link from "next/link";
import Image from "next/image";
import { Home, Building2, MapPin } from "lucide-react";
import CategoryPropertiesList from "@/components/property/CategoryPropertiesList";

export const metadata: Metadata = generateSEO({
  title: "Residential Properties for Sale in Delhi NCR",
  description:
    "Find residential properties in Delhi NCR - Independent Houses, Builder Floors, Apartments, Villas and Plots in Dwarka, Najafgarh, West Delhi and more.",
  keywords: ["residential property Delhi", "houses for sale Delhi NCR", "flats in Delhi"],
  canonical: "/residential",
});

const RESIDENTIAL_TYPES = [
  { label: "Independent Houses", value: "independent-house", icon: "🏠" },
  { label: "Builder Floors", value: "builder-floor", icon: "🏗️" },
  { label: "Apartments / Flats", value: "apartment", icon: "🏢" },
  { label: "Villas", value: "villa", icon: "🏡" },
  { label: "Duplex Houses", value: "duplex-house", icon: "🏘️" },
  { label: "Residential Plots", value: "residential-plot", icon: "📐" },
];

export default function ResidentialPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 bg-[#172B4D] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80"
            alt="Residential properties"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative container-custom text-center text-white">
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-sm text-slate-300 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#C6A66B]">Residential Properties</span>
          </div>
          <div className="w-12 h-12 bg-[#C6A66B]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Home className="w-6 h-6 text-[#C6A66B]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
            Residential Properties
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Find your dream home across Delhi NCR — houses, apartments, villas, plots and more.
          </p>
        </div>
      </section>

      {/* Property Types */}
      <section className="py-10 bg-white border-b border-[#E2E8F0]">
        <div className="container-custom">
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/properties?category=residential"
              className="px-5 py-2.5 bg-[#172B4D] text-white text-sm font-medium rounded-full hover:bg-[#1e3a6e] transition-colors"
            >
              All Residential
            </Link>
            {RESIDENTIAL_TYPES.map((type) => (
              <Link
                key={type.value}
                href={`/properties?category=residential&type=${type.value}`}
                className="flex items-center gap-2 px-5 py-2.5 border border-[#E2E8F0] text-sm font-medium rounded-full hover:border-[#172B4D] hover:text-[#172B4D] transition-colors text-[#64748B] bg-white"
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
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-[#172B4D] font-display">
              Residential Listings
            </h2>
            <Link href="/properties?category=residential" className="text-sm text-[#172B4D] font-medium hover:underline">
              View All →
            </Link>
          </div>

          <CategoryPropertiesList
            category="residential"
            emptyTitle="No Residential Properties Listed Yet"
            emptySubtitle="Be the first to list an independent house, flat, builder floor, or villa, or contact us for private inventory."
          />

          <div className="text-center mt-10">
            <Link href="/properties?category=residential" className="btn-primary">
              <Building2 className="w-4 h-4" />
              View All Residential Properties
            </Link>
          </div>
        </div>
      </section>

      {/* Key Locations */}
      <section className="py-14 bg-white">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-[#172B4D] font-display mb-6">
            Key Residential Locations in Delhi NCR
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              "Dwarka", "Najafgarh", "West Delhi", "South West Delhi",
              "Rohini", "Janakpuri", "Palam", "Uttam Nagar",
            ].map((loc) => (
              <Link
                key={loc}
                href={`/properties?category=residential&city=${loc}`}
                className="flex items-center gap-2 p-4 border border-[#E2E8F0] rounded-xl hover:border-[#172B4D]/40 hover:bg-[#EAF3FA] transition-all group"
              >
                <MapPin className="w-4 h-4 text-[#C6A66B] flex-shrink-0" />
                <span className="text-sm font-medium text-[#172B4D] group-hover:text-[#172B4D]">{loc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
