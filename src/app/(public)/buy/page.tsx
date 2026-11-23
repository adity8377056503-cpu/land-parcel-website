import type { Metadata } from "next";
import { generateSEO } from "@/lib/seo";
import Link from "next/link";
import { Building2, Search, ArrowRight, Home, Warehouse, Sprout, Store, Layers } from "lucide-react";
import HeroSearch from "@/components/home/HeroSearch";
import PropertyCard from "@/components/property/PropertyCard";
import { DEMO_PROPERTIES } from "@/lib/demo-data";

export const metadata: Metadata = generateSEO({
  title: "Buy Property in Delhi NCR - Residential, Commercial, Land & Industrial",
  description:
    "Explore genuine property listings for sale across Delhi NCR. Compare verified opportunities in Dwarka, Najafgarh, Gurugram, Manesar and surrounding regions.",
  keywords: ["buy property Delhi", "property for sale NCR", "buy land", "buy house Delhi"],
  canonical: "/buy",
});

const SECTORS = [
  { title: "Residential", href: "/residential", icon: Home, count: "Houses, Floors, Plots", desc: "Discover family homes and prime plots." },
  { title: "Commercial", href: "/commercial", icon: Store, count: "Shops, Offices, SCOs", desc: "High-yield commercial spaces." },
  { title: "Industrial", href: "/industrial", icon: Warehouse, count: "Warehouses, Factories", desc: "Strategic logistics & industrial hubs." },
  { title: "Agricultural", href: "/agricultural", icon: Sprout, count: "Farm land, Farmhouses", desc: "Fertile land and countryside retreats." },
  { title: "Large Land Parcels", href: "/properties?category=large-land", icon: Layers, count: "Townships, Bulk Acreage", desc: "Institutional & developer acreage." },
];

export default function BuyPage() {
  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      {/* Hero */}
      <section className="bg-[#172B4D] py-16 text-white text-center">
        <div className="container-custom">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-300 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#C6A66B]">Buy Property</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
            Buy Verified Properties in Delhi NCR
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-10">
            Find the right property matching your criteria across residential, commercial, industrial and land sectors.
          </p>

          <div className="max-w-4xl mx-auto text-left">
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-14 bg-white border-b border-[#E2E8F0]">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-[#172B4D] font-display mb-8 text-center">
            Browse by Asset Class
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {SECTORS.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.title}
                  href={s.href}
                  className="p-5 rounded-2xl border border-[#E2E8F0] hover:border-[#172B4D]/30 hover:shadow-card transition-all group bg-[#F5F7FA] hover:bg-white"
                >
                  <div className="w-10 h-10 bg-[#EAF3FA] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#172B4D] transition-colors">
                    <Icon className="w-5 h-5 text-[#172B4D] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-[#172B4D] mb-1 font-display">{s.title}</h3>
                  <div className="text-xs font-semibold text-[#C6A66B] mb-2">{s.count}</div>
                  <p className="text-xs text-[#64748B]">{s.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured for Sale */}
      <section className="py-14">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#172B4D] font-display">
                Latest Properties for Sale
              </h2>
              <p className="text-[#64748B] text-sm mt-1">Curated listings ready for inspection</p>
            </div>
            <Link href="/properties" className="btn-secondary text-sm py-2 px-4">
              Explore All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DEMO_PROPERTIES.slice(0, 6).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
