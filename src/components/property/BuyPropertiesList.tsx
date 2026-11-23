"use client";

import Link from "next/link";
import { Building2, MessageCircle } from "lucide-react";
import PropertyCard from "@/components/property/PropertyCard";
import { usePropertyStore } from "@/lib/property-store";
import { OFFICIAL_BUSINESS, getWhatsAppUrl } from "@/lib/utils";

export default function BuyPropertiesList() {
  const { properties } = usePropertyStore();

  const published = properties.filter((p) => p.status === "published").slice(0, 6);

  const whatsappUrl = getWhatsAppUrl(
    OFFICIAL_BUSINESS.whatsapp_link_number,
    "Hello Suraj Prakash, I am looking to buy verified property in Delhi NCR through Land Parcel."
  );

  if (published.length > 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {published.map((property) => (
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
        Verified Listings Under Onboarding
      </h3>
      <p className="text-sm text-[#64748B] max-w-md mx-auto mb-6 leading-relaxed">
        Our acquisitions team is currently verifying titles for upcoming residential, commercial, industrial, and agricultural properties.
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
          Enquire on WhatsApp
        </a>
      </div>
    </div>
  );
}
