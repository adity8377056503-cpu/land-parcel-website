import type { Metadata } from "next";
import { generateSEO } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";
import { Building2, ShoppingBag, Briefcase, Store } from "lucide-react";
import CategoryPropertiesList from "@/components/property/CategoryPropertiesList";

export const metadata: Metadata = generateSEO({
  title: "Commercial Properties in Delhi NCR - Shops, Offices, SCO Plots & Buildings",
  description:
    "Explore verified commercial properties in Delhi NCR. Commercial shops, SCO plots, office spaces, showrooms, and retail buildings in Gurugram, Dwarka, and West Delhi.",
  keywords: [
    "commercial property Delhi NCR",
    "commercial shop for sale",
    "office space Gurugram",
    "SCO plots Delhi",
    "showroom for sale Delhi",
  ],
  canonical: "/commercial",
});

const COMMERCIAL_TYPES = [
  { label: "Commercial Shops", value: "commercial-shop", icon: "🏪" },
  { label: "Office Spaces", value: "office-space", icon: "🏢" },
  { label: "Commercial Buildings", value: "commercial-building", icon: "🏬" },
  { label: "SCO Plots", value: "sco-plot", icon: "📐" },
  { label: "Showrooms", value: "showroom", icon: "🏬" },
  { label: "Retail Spaces", value: "retail-space", icon: "🛍️" },
];

export default function CommercialPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 bg-[#172B4D] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80"
            alt="Commercial properties in Delhi NCR"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative container-custom text-center text-white">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-300 mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#C6A66B]">Commercial Properties</span>
          </div>
          <div className="w-12 h-12 bg-[#C6A66B]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-6 h-6 text-[#C6A66B]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
            Commercial Properties
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            High-yield commercial shops, corporate office floors, SCO plots and retail spaces across prime corridors in Delhi NCR.
          </p>
        </div>
      </section>

      {/* Property Types Filter */}
      <section className="py-10 bg-white border-b border-[#E2E8F0]">
        <div className="container-custom">
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/properties?category=commercial"
              className="px-5 py-2.5 bg-[#172B4D] text-white text-sm font-medium rounded-full hover:bg-[#1e3a6e] transition-colors"
            >
              All Commercial
            </Link>
            {COMMERCIAL_TYPES.map((type) => (
              <Link
                key={type.value}
                href={`/properties?category=commercial&type=${type.value}`}
                className="flex items-center gap-2 px-5 py-2.5 border border-[#E2E8F0] text-sm font-medium rounded-full hover:border-[#172B4D] hover:text-[#172B4D] transition-colors text-[#64748B] bg-white"
              >
                <span>{type.icon}</span>
                {type.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Commercial Listings */}
      <section className="py-14 bg-[#F5F7FA]">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-[#172B4D] font-display">
              Commercial Listings
            </h2>
            <Link
              href="/properties?category=commercial"
              className="text-sm text-[#172B4D] font-medium hover:underline"
            >
              View All →
            </Link>
          </div>

          <CategoryPropertiesList
            category="commercial"
            emptyTitle="No Commercial Properties Listed Yet"
            emptySubtitle="Be the first to list a commercial shop, SCO plot, or office floor, or contact us for private mandates."
          />

          <div className="text-center mt-10">
            <Link href="/list-property" className="btn-primary inline-flex">
              <Building2 className="w-4 h-4" />
              List Commercial Property
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
