"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Sparkles,
  Building2,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
  UserCheck,
  Clock,
  PhoneCall,
  Crown,
  FileText,
} from "lucide-react";
import { useSubscriptionStore } from "@/lib/subscription-store";
import SubscriptionModal from "@/components/subscription/SubscriptionModal";
import { SubscriptionPlan } from "@/types";
import { OFFICIAL_BUSINESS, getWhatsAppUrl } from "@/lib/utils";

export default function PricingPage() {
  const { plans, activeClient } = useSubscriptionStore();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChoosePlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const whatsappInquiryUrl = getWhatsAppUrl(
    OFFICIAL_BUSINESS.whatsapp_link_number,
    "Hi Suraj ji, I have an inquiry about Land Parcel subscription plans for Delhi NCR."
  );

  const FAQS = [
    {
      q: "How does the 5 Free Listing Policy work?",
      a: "All new property owners, dealers, and builders receive 5 lifetime free listing credits upon registration. Free credits never reset monthly and never expire. Once you use all 5 free credits, an active subscription is required to submit additional properties.",
    },
    {
      q: "Do unapproved or pending listings consume credits?",
      a: "No! Pending, rejected, or incomplete submissions never consume a credit. Credits are deducted solely when an administrator reviews and publishes your property on Land Parcel.",
    },
    {
      q: "What happens to my published properties when my subscription expires?",
      a: "All your existing published listings remain live and visible to buyers on Land Parcel even after subscription expiry. An active subscription is only required when submitting new properties.",
    },
    {
      q: "Are purchased credits separate from free credits?",
      a: "Yes. Your 5 lifetime free credits are tracked independently from purchased monthly (20 credits) or quarterly (50 credits) plan allowances.",
    },
    {
      q: "How do I pay and get an official invoice?",
      a: `You can transfer via instant UPI (Google Pay, PhonePe, Paytm to ${OFFICIAL_BUSINESS.whatsapp}) or Direct Bank Transfer. Submit your UTR/Reference number for instant admin verification. You receive an official tax invoice and receipt.`,
    },
    {
      q: "Can Land Parcel Admin list properties for free?",
      a: "Yes. All Land Parcel internal company properties have permanent unlimited free listings with zero quota deductions.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] pt-24 pb-20">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF3FA] border border-blue-200 text-[#172B4D] text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#C6A66B]" />
            <span>Official Plans · Delhi NCR</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#172B4D] font-display tracking-tight mb-4">
            Official Land Parcel Subscription Plans
          </h1>
          <p className="text-base text-[#64748B] leading-relaxed">
            Every client receives <strong className="text-[#172B4D]">5 lifetime free listing credits</strong>.
            Choose a high-value monthly or quarterly plan when you are ready to expand.
          </p>
        </div>

        {/* Free Tier Hero Banner */}
        <div className="bg-gradient-to-r from-[#172B4D] to-[#1f3a68] text-white rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto mb-12 shadow-card flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/10">
          <div className="space-y-1 text-center sm:text-left">
            <span className="bg-[#C6A66B] text-[#172B4D] text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Free Listing Policy
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-display mt-2">
              5 Lifetime Free Listing Credits for Everyone
            </h3>
            <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
              New property owners, dealers, and builders can list their first 5 properties completely free.
              Free credits never reset monthly. Land Parcel Admin gets unlimited free listings permanently.
            </p>
          </div>
          <Link
            href="/list-property"
            className="btn-primary bg-[#C6A66B] text-[#172B4D] hover:bg-[#b89556] font-bold text-xs py-3 px-6 rounded-xl flex-shrink-0 flex items-center gap-2"
          >
            <span>Start Free (5 Credits)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Pricing Cards (Plan 1 & Plan 2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
          {plans.map((plan) => {
            const isQuarterly = plan.billing_period === "quarterly" || plan.validity_months === 3;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-8 transition-all duration-300 relative flex flex-col justify-between ${isQuarterly
                    ? "bg-[#172B4D] text-white shadow-2xl scale-[1.02] border-2 border-[#C6A66B]"
                    : "bg-white text-[#172B4D] shadow-card border border-[#E2E8F0] hover:shadow-card-hover"
                  }`}
              >
                {isQuarterly && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#C6A66B] text-[#172B4D] text-xs font-extrabold px-4 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                    <Crown className="w-3.5 h-3.5" />
                    <span>Best Value · Save ₹798</span>
                  </div>
                )}

                <div>
                  {/* Plan Name & Tagline */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-2xl font-bold font-display ${isQuarterly ? "text-white" : "text-[#172B4D]"}`}>
                        {plan.name}
                      </h3>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${isQuarterly ? "bg-white/15 text-[#C6A66B]" : "bg-[#EAF3FA] text-[#172B4D]"
                        }`}>
                        {plan.validity_months === 3 ? "3 Months Validity" : "1 Month Validity"}
                      </span>
                    </div>
                    <p className={`text-xs mt-2 leading-relaxed ${isQuarterly ? "text-slate-300" : "text-[#64748B]"}`}>
                      {plan.description}
                    </p>
                  </div>

                  {/* Pricing Display */}
                  <div className="mb-6 pb-6 border-b border-slate-200/20">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl md:text-5xl font-extrabold font-display">
                        ₹{plan.price.toLocaleString("en-IN")}
                      </span>
                      <span className={`text-xs font-semibold ${isQuarterly ? "text-slate-300" : "text-[#64748B]"}`}>
                        / {plan.validity_months === 3 ? "3 months" : "month"}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md ${isQuarterly ? "bg-[#C6A66B] text-[#172B4D]" : "bg-emerald-100 text-emerald-800"
                        }`}>
                        +{plan.listing_credits} Property Credits
                      </span>
                      <span className={`text-[11px] ${isQuarterly ? "text-slate-300" : "text-[#64748B]"}`}>
                        Separate from free credits
                      </span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    <span className={`text-xs font-bold uppercase tracking-wider block ${isQuarterly ? "text-slate-300" : "text-[#64748B]"}`}>
                      Included Privileges:
                    </span>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs">
                        <CheckCircle2
                          className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isQuarterly ? "text-[#C6A66B]" : "text-emerald-600"
                            }`}
                        />
                        <span className={isQuarterly ? "text-slate-200" : "text-[#64748B]"}>
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <div>
                  <button
                    onClick={() => handleChoosePlan(plan)}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md ${isQuarterly
                      ? "bg-[#C6A66B] hover:bg-[#b5955a] text-[#172B4D]"
                      : "bg-[#172B4D] hover:bg-[#1e3a6e] text-white"
                      }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Subscribe to {plan.name} (₹{plan.price})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reassurance Banner */}
        <div className="bg-white rounded-3xl p-8 shadow-card border border-[#E2E8F0] max-w-4xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#172B4D]">Fair Credit Policy</h4>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Credits are deducted only when approved. Rejected listings never cost you a credit.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#172B4D]">Permanent Visibility</h4>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Published properties stay live even if a monthly plan expires later on.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#172B4D]">Invoices & Receipts</h4>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Official computer-generated invoices issued for every verified subscription.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#172B4D] font-display">Frequently Asked Questions</h2>
            <p className="text-xs text-[#64748B] mt-1">Clear answers regarding property listings, credits and plans.</p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm">
                <h3 className="text-sm font-bold text-[#172B4D] mb-1.5 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#C6A66B] flex-shrink-0" />
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>

          {/* Bottom Help CTA */}
          <div className="text-center mt-12 bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm">
            <p className="text-xs text-[#64748B] mb-2">
              Have specific questions about listing bulk land parcels or township developments?
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-[#172B4D]">
              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary py-2 px-4 flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp: +91 {OFFICIAL_BUSINESS.whatsapp}</span>
              </a>
              <a
                href={`mailto:${OFFICIAL_BUSINESS.email}`}
                className="btn-primary py-2 px-4 flex items-center gap-1.5"
              >
                <span>Email: {OFFICIAL_BUSINESS.email}</span>
              </a>
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              Business Owner: {OFFICIAL_BUSINESS.owner_name} · Land Parcel (Delhi NCR)
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedPlan={selectedPlan}
        client={activeClient}
        onSuccess={() => setIsModalOpen(false)}
      />
    </div>
  );
}
