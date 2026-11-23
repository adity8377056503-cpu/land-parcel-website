import type { Metadata } from "next";
import { generateSEO } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";
import { Warehouse, MapPin, Building2 } from "lucide-react";
import PropertyCard from "@/components/property/PropertyCard";
import { DEMO_PROPERTIES } from "@/lib/demo-data";

export const metadata: Metadata = generateSEO({
  title: "Industrial Properties - Warehouses, Factories & Industrial Plots",
  description:
    "Find industrial properties in Delhi NCR - Warehouses, Industrial Plots, Factories, Manufacturing Units and Logistics Facilities in Gurugram, Manesar and more.",
  keywords: ["warehouse for sale Gurugram", "industrial property Delhi NCR", "factory for sale Haryana"],
  canonical: "/industrial",
});

const INDUSTRIAL_TYPES = [
  { label: "Warehouses", value: "warehouse", icon: "🏭" },
  { label: "Industrial Plots", value: "industrial-plot", icon: "📐" },
  { label: "Industrial Buildings", value: "industrial-building", icon: "🏗️" },
  { label: "Factories", value: "factory", icon: "⚙️" },
  { label: "Manufacturing Units", value: "manufacturing-unit", icon: "🔧" },
  { label: "Logistics Facilities", value: "logistics-facility", icon: "🚛" },
];

export default function IndustrialPage() {
  const industrialProperties = DEMO_PROPERTIES.filter(
    (p) => p.category === "industrial"
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 bg-[#172B4D] overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <Image
            src="https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1200&q=80"
            alt="Industrial properties"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative container-custom text-center text-white">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-300 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#C6A66B]">Industrial Properties</span>
          </div>
          <div className="w-12 h-12 bg-[#C6A66B]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Warehouse className="w-6 h-6 text-[#C6A66B]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
            Industrial Properties
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Warehouses, industrial plots, factories and manufacturing units across Delhi NCR and Haryana.
          </p>
        </div>
      </section>

      {/* Types Filter */}
      <section className="py-10 bg-white border-b border-[#E2E8F0]">
        <div className="container-custom">
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/properties?category=industrial"
              className="px-5 py-2.5 bg-[#172B4D] text-white text-sm font-medium rounded-full hover:bg-[#1e3a6e] transition-colors"
            >
              All Industrial
            </Link>
            {INDUSTRIAL_TYPES.map((type) => (
              <Link
                key={type.value}
                href={`/properties?category=industrial&type=${type.value}`}
                className="flex items-center gap-2 px-5 py-2.5 border border-[#E2E8F0] text-sm font-medium rounded-full hover:border-[#172B4D] hover:text-[#172B4D] transition-colors text-[#64748B] bg-white"
              >
                <span>{type.icon}</span>
                {type.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Key Specs Banner */}
      <section className="py-8 bg-[#EAF3FA]">
        <div className="container-custom">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Locations", value: "Gurugram, Manesar, Faridabad, NCR" },
              { label: "Facility Types", value: "Warehouses, Factories, Industrial Plots" },
              { label: "Power Availability", value: "Single & Three Phase" },
              { label: "Road Connectivity", value: "NH-48, NH-248A, State Highways" },
            ].map((spec) => (
              <div key={spec.label} className="p-4 bg-white rounded-xl text-center">
                <div className="font-semibold text-[#172B4D] text-sm">{spec.label}</div>
                <div className="text-[#64748B] text-xs mt-1">{spec.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="py-14 bg-[#F5F7FA]">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-[#172B4D] font-display">
              Industrial Listings
            </h2>
          </div>

          {industrialProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {industrialProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-[#64748B]">
              <Warehouse className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No industrial listings yet</p>
              <Link href="/list-property" className="btn-primary mt-6 inline-flex">
                List Your Property
              </Link>
            </div>
          )}

          <div className="text-center mt-10">
            <Link href="/properties?category=industrial" className="btn-primary">
              <Building2 className="w-4 h-4" />
              View All Industrial Properties
            </Link>
          </div>
        </div>
      </section>

      {/* Key Locations */}
      <section className="py-14 bg-white">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-[#172B4D] font-display mb-6">
            Key Industrial Locations
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              "Gurugram", "Manesar", "Faridabad", "Bawal",
              "IMT Manesar", "Rewari", "Kundli", "Sonipat",
            ].map((loc) => (
              <Link
                key={loc}
                href={`/properties?category=industrial&city=${loc}`}
                className="flex items-center gap-2 p-4 border border-[#E2E8F0] rounded-xl hover:border-[#172B4D]/40 hover:bg-[#EAF3FA] transition-all group"
              >
                <MapPin className="w-4 h-4 text-[#C6A66B] flex-shrink-0" />
                <span className="text-sm font-medium text-[#172B4D]">{loc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
