import type { Metadata } from "next";
import { generateSEO } from "@/lib/seo";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = generateSEO({
  title: "Privacy Policy",
  description: "Land Parcel Privacy Policy - How we collect, handle and protect your property and personal data.",
  canonical: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#F5F7FA] min-h-screen py-16">
      <div className="container-custom max-w-4xl">
        <div className="bg-white rounded-2xl shadow-card p-8 md:p-12 border border-[#E2E8F0]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#EAF3FA] rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#172B4D]" />
            </div>
            <h1 className="text-3xl font-bold text-[#172B4D] font-display">Privacy Policy</h1>
          </div>
          <p className="text-sm text-[#64748B] mb-8">Last Updated: November 2026</p>

          <div className="space-y-6 text-[#64748B] text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-[#172B4D] mb-2 font-display">1. Overview</h2>
              <p>
                Land Parcel (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) respects your privacy and is dedicated to protecting the personal information you share with us through our real estate discovery and lead generation marketplace.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#172B4D] mb-2 font-display">2. Information We Collect</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Contact details:</strong> Name, phone number, email address, seller/buyer type.</li>
                <li><strong>Property information:</strong> Location, dimensions, asking price, images, videos, and specifications.</li>
                <li><strong>Inquiries & Preferences:</strong> Budget range, property categories of interest, scheduled site visits, and direct messages.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#172B4D] mb-2 font-display">3. How We Use Your Information</h2>
              <p>
                We use information gathered to connect property buyers and authorized sellers, facilitate scheduled property site visits, respond to inquiries via phone or WhatsApp (upon verified consent), and maintain platform security.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#172B4D] mb-2 font-display">4. Consent and Communication</h2>
              <p>
                We only communicate via WhatsApp or phone calls when you have submitted an inquiry or property listing form giving explicit consent. You can opt out of any notification or communication at any time by contacting our support team.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#172B4D] mb-2 font-display">5. Contact</h2>
              <p>
                If you have questions regarding this Privacy Policy, please email <a href="mailto:info@landparcel.in" className="text-[#172B4D] font-semibold underline">info@landparcel.in</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
