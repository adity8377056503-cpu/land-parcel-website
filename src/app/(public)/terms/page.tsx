import type { Metadata } from "next";
import { generateSEO } from "@/lib/seo";
import { FileText } from "lucide-react";

export const metadata: Metadata = generateSEO({
  title: "Terms & Conditions",
  description: "Land Parcel Terms and Conditions for property listing, discovery and user interactions.",
  canonical: "/terms",
});

export default function TermsPage() {
  return (
    <div className="bg-[#F5F7FA] min-h-screen py-16">
      <div className="container-custom max-w-4xl">
        <div className="bg-white rounded-2xl shadow-card p-8 md:p-12 border border-[#E2E8F0]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#EAF3FA] rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#172B4D]" />
            </div>
            <h1 className="text-3xl font-bold text-[#172B4D] font-display">Terms & Conditions</h1>
          </div>
          <p className="text-sm text-[#64748B] mb-8">Effective Date: November 2026</p>

          <div className="space-y-6 text-[#64748B] text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-[#172B4D] mb-2 font-display">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Land Parcel, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree, please refrain from using our marketplace.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#172B4D] mb-2 font-display">2. Role of the Platform</h2>
              <p>
                Land Parcel functions as an online marketplace facilitating discovery and connecting property seekers with landowners, sellers, authorized brokers, and developers. Land Parcel does not act as a title insurer or legal guarantor of property ownership.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#172B4D] mb-2 font-display">3. Property Submission & Accuracy</h2>
              <p>
                Anyone submitting a listing warrants that they are the legal owner or duly authorized agent with power of attorney to advertise the parcel. Fraudulent, speculative, or duplicate submissions will be rejected or purged immediately.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#172B4D] mb-2 font-display">4. Independent Verification</h2>
              <p>
                Buyers and investors are solely responsible for conducting independent title diligence, encumbrance searches, physical boundary measurements, and municipal approval checks prior to executing financial commitments.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
