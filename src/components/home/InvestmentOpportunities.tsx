"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp, MessageCircle, Briefcase } from "lucide-react";
import PropertyCard from "@/components/property/PropertyCard";
import { usePropertyStore } from "@/lib/property-store";
import { OFFICIAL_BUSINESS, getWhatsAppUrl } from "@/lib/utils";

export default function InvestmentOpportunities() {
  const { properties } = usePropertyStore();

  const investments = properties
    .filter((p) => p.status === "published" && ["industrial", "commercial", "large-land"].includes(p.category))
    .slice(0, 3);

  const whatsappUrl = getWhatsAppUrl(
    OFFICIAL_BUSINESS.whatsapp_link_number,
    "Hello Suraj Prakash, I am interested in institutional investment opportunities and commercial/land parcels in Delhi NCR."
  );

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

        {/* Grid or Professional Empty State */}
        {investments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {investments.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="bg-[#F5F7FA] border border-[#E2E8F0] rounded-2xl p-8 md:p-12 text-center max-w-2xl mx-auto">
            <div className="w-14 h-14 bg-white rounded-xl shadow-xs flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-7 h-7 text-[#C6A66B]" />
            </div>
            <h3 className="text-xl font-bold text-[#172B4D] font-display mb-2">
              High-Value Investment Deals in Due Diligence
            </h3>
            <p className="text-sm text-[#64748B] max-w-lg mx-auto mb-6 leading-relaxed">
              Large land parcels, commercial floors, and warehousing hubs across Gurugram, Manesar, and Western Peripheral Expressway are currently undergoing title verification.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp text-sm py-2.5 px-5"
              >
                <MessageCircle className="w-4 h-4" />
                Enquire for Private Mandates
              </a>
              <Link href="/list-property" className="btn-secondary text-sm py-2.5 px-5 bg-white">
                Submit Commercial Property
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
