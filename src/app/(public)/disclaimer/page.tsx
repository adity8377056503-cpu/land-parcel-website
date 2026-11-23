import type { Metadata } from "next";
import { generateSEO } from "@/lib/seo";
import { AlertTriangle } from "lucide-react";

export const metadata: Metadata = generateSEO({
  title: "Disclaimer",
  description: "Land Parcel Property Discovery and Legal Disclaimer.",
  canonical: "/disclaimer",
});

export default function DisclaimerPage() {
  return (
    <div className="bg-[#F5F7FA] min-h-screen py-16">
      <div className="container-custom max-w-4xl">
        <div className="bg-white rounded-2xl shadow-card p-8 md:p-12 border border-[#E2E8F0]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold text-[#172B4D] font-display">Disclaimer</h1>
          </div>
          <p className="text-sm text-[#64748B] mb-8">Important Regulatory & Information Notice</p>

          <div className="space-y-6 text-[#64748B] text-sm leading-relaxed">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-orange-800 font-medium">
              Land Parcel does not make unverified legal verification or guaranteed-return claims on real estate assets.
            </div>

            <section>
              <h2 className="text-lg font-bold text-[#172B4D] mb-2 font-display">General Information Only</h2>
              <p>
                All property details, measurements, pricing estimates, road connectivity descriptions, and landmark indications presented on Land Parcel are provided for informational and preliminary discovery purposes only.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#172B4D] mb-2 font-display">Demonstration & Sample Data</h2>
              <p>
                Listings tagged with the <strong>DEMO</strong> badge are developmental placeholders used to showcase platform capability and must not be treated as active marketplace inventory.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#172B4D] mb-2 font-display">No Financial or Legal Counsel</h2>
              <p>
                Nothing on this website constitutes legal, financial, architectural, or investment advice. Users must seek certified legal advice, revenue record verification, and RERA compliance verification where applicable.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
