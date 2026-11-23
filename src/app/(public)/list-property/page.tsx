import type { Metadata } from "next";
import { generateSEO } from "@/lib/seo";
import ListPropertyForm from "@/components/forms/ListPropertyForm";
import { Building2, CheckCircle } from "lucide-react";

export const metadata: Metadata = generateSEO({
  title: "List Your Property - Sell Your Property with Land Parcel",
  description:
    "List your residential, commercial, industrial or agricultural property with Land Parcel. Reach genuine buyers across Delhi NCR.",
  canonical: "/list-property",
});

export default function ListPropertyPage() {
  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      {/* Hero */}
      <section className="bg-[#172B4D] py-16">
        <div className="container-custom">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-6 h-6 text-[#C6A66B]" />
              <span className="text-[#C6A66B] text-sm font-semibold uppercase tracking-wide">
                List Your Property
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white font-display mb-4">
              Reach Genuine Buyers Across Delhi NCR
            </h1>
            <p className="text-slate-300 text-lg mb-6">
              Submit your property details and our team will help connect you with interested buyers.
            </p>
            <div className="flex flex-wrap gap-4">
              {[
                "Free Property Listing",
                "Buyer Enquiry Notifications",
                "Site Visit Assistance",
                "Zero Hidden Charges",
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-sm text-slate-200">
                  <CheckCircle className="w-4 h-4 text-[#C6A66B]" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-14">
        <div className="container-custom">
          <div className="bg-white rounded-2xl shadow-card p-8 max-w-2xl mx-auto">
            <ListPropertyForm />
          </div>
        </div>
      </section>
    </div>
  );
}
