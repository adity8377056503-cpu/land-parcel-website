"use client";

import Link from "next/link";
import { Building2, MessageCircle } from "lucide-react";
import PropertyCard from "@/components/property/PropertyCard";
import { usePropertyStore } from "@/lib/property-store";
import { PropertyCategory } from "@/types";
import { OFFICIAL_BUSINESS, getWhatsAppUrl } from "@/lib/utils";

interface CategoryPropertiesListProps {
  category?: PropertyCategory;
  locationName?: string;
  emptyTitle?: string;
  emptySubtitle?: string;
}

export default function CategoryPropertiesList({
  category,
  locationName,
  emptyTitle,
  emptySubtitle,
}: CategoryPropertiesListProps) {
  const { properties } = usePropertyStore();

  const filtered = properties.filter((p) => {
    if (p.status !== "published" && p.status !== "active") return false;
    if (category && p.category !== category) return false;
    if (locationName) {
      const loc = locationName.toLowerCase();
      const matches =
        p.city.toLowerCase().includes(loc) ||
        p.locality.toLowerCase().includes(loc) ||
        p.address.toLowerCase().includes(loc);
      if (!matches) return false;
    }
    return true;
  });

  const whatsappUrl = getWhatsAppUrl(
    OFFICIAL_BUSINESS.whatsapp_link_number,
    `Hello Suraj Prakash, I am inquiring about ${category ? category.replace("-", " ") : "verified"} properties ${locationName ? `in ${locationName}` : "in Delhi NCR"} at Land Parcel.`
  );

  if (filtered.length > 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 md:p-14 text-center max-w-2xl mx-auto shadow-sm">
      <div className="w-16 h-16 rounded-2xl bg-[#EAF3FA] flex items-center justify-center mx-auto mb-4">
        <Building2 className="w-8 h-8 text-[#172B4D]" />
      </div>
      <h3 className="text-xl font-bold text-[#172B4D] font-display mb-2">
        {emptyTitle || `No Verified ${category ? category.replace("-", " ") : ""} Properties Listed Yet`}
      </h3>
      <p className="text-sm text-[#64748B] max-w-md mx-auto mb-6 leading-relaxed">
        {emptySubtitle ||
          "Our acquisition team is currently vetting physical titles and legal clearances for upcoming inventory in this sector."}
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
          Inquire on WhatsApp
        </a>
      </div>
    </div>
  );
}
