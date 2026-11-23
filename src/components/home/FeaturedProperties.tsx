"use client";

import Link from "next/link";
import { ArrowRight, Building2, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import PropertyCard from "@/components/property/PropertyCard";
import { usePropertyStore } from "@/lib/property-store";
import { OFFICIAL_BUSINESS, getWhatsAppUrl } from "@/lib/utils";

export default function FeaturedProperties() {
  const { properties } = usePropertyStore();

  const featured = properties.filter((p) => p.status === "published" && p.is_featured).slice(0, 6);

  const whatsappUrl = getWhatsAppUrl(
    OFFICIAL_BUSINESS.whatsapp_link_number,
    "Hello Suraj Prakash, I am inquiring about verified property deals and upcoming listings at Land Parcel."
  );

  return (
    <section className="py-16 bg-[#F5F7FA]">
      <div className="container-custom">
        {/* Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#C6A66B]" />
              <span className="text-xs font-bold tracking-wider uppercase text-[#C6A66B]">
                Curated Marketplace
              </span>
            </div>
            <h2 className="section-heading">Featured Properties</h2>
            <p className="text-[#64748B] mt-2">
              Legally vetted property listings across Delhi NCR.
            </p>
          </div>
          <Link href="/properties" className="btn-secondary text-sm py-2.5 px-5 whitespace-nowrap">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Listings or Professional Empty State */}
        {featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 md:p-14 text-center max-w-3xl mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#EAF3FA] flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-[#172B4D]" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-[#172B4D] font-display mb-2">
              Verified Delhi NCR Listings Coming Soon
            </h3>
            <p className="text-[#64748B] text-sm md:text-base max-w-xl mx-auto mb-6 leading-relaxed">
              Our acquisitions team is conducting on-site inspections and title diligence for prime properties across Dwarka, West Delhi, Gurugram, and Jhajjar.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/list-property" className="btn-primary text-sm py-2.5 px-5">
                List Your Property
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp text-sm py-2.5 px-5"
              >
                <MessageCircle className="w-4 h-4" />
                Contact on WhatsApp
              </a>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-[#E2E8F0] text-xs text-[#64748B]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Title Diligence
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#C6A66B]" /> Zero Fake Listings
              </span>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        {featured.length > 0 && (
          <div className="text-center mt-10">
            <Link href="/properties" className="btn-primary inline-flex">
              <Building2 className="w-4 h-4" />
              Explore All Properties
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
