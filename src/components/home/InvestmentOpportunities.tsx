import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import PropertyCard from "@/components/property/PropertyCard";
import { DEMO_PROPERTIES } from "@/lib/demo-data";

export default function InvestmentOpportunities() {
  // Show industrial, commercial and large land
  const investments = DEMO_PROPERTIES.filter((p) =>
    ["industrial", "commercial", "large-land"].includes(p.category)
  ).slice(0, 3);

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        {/* Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[#C6A66B]/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#C6A66B]" />
              </div>
              <span className="text-sm font-semibold text-[#C6A66B] uppercase tracking-wide">
                Investment
              </span>
            </div>
            <h2 className="section-heading">Investment Opportunities</h2>
            <p className="text-[#64748B] mt-2">
              Commercial, industrial and land opportunities for investors and developers.
            </p>
          </div>
          <Link href="/properties?category=commercial" className="btn-secondary text-sm py-2.5 px-5 whitespace-nowrap">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {investments.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}
