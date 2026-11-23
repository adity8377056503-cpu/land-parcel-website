import Link from "next/link";
import { ArrowRight, Building2, TrendingUp } from "lucide-react";
import PropertyCard from "@/components/property/PropertyCard";
import { DEMO_PROPERTIES } from "@/lib/demo-data";

export default function FeaturedProperties() {
  const featured = DEMO_PROPERTIES.filter((p) => p.is_featured).slice(0, 6);

  return (
    <section className="py-16 bg-[#F5F7FA]">
      <div className="container-custom">
        {/* Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="section-heading">Featured Properties</h2>
            <p className="text-[#64748B] mt-2">
              Handpicked property listings across Delhi NCR.
            </p>
          </div>
          <Link href="/properties" className="btn-secondary text-sm py-2.5 px-5 whitespace-nowrap">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Demo Notice */}
        <div className="mb-6 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3">
          <span className="text-orange-500 text-lg">⚠️</span>
          <p className="text-sm text-orange-700">
            <strong>Demo Mode:</strong> The listings below are sample data for demonstration only.
            Real property listings will appear here once the platform is live and connected to Supabase.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-10">
          <Link href="/properties" className="btn-primary inline-flex">
            <Building2 className="w-4 h-4" />
            Explore All Properties
          </Link>
        </div>
      </div>
    </section>
  );
}
