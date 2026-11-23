"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Clock,
  Crown,
  FileText,
  HelpCircle,
  MessageCircle,
} from "lucide-react";
import { useSubscriptionStore } from "@/lib/subscription-store";
import { useCustomerAuth } from "@/lib/customer-auth";
import SubscriptionModal from "@/components/subscription/SubscriptionModal";
import { SubscriptionPlan } from "@/types";
import { OFFICIAL_BUSINESS, getWhatsAppUrl } from "@/lib/utils";

export default function PricingPage() {
  const { plans } = useSubscriptionStore();
  const { customer } = useCustomerAuth();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChoosePlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const whatsappInquiryUrl = getWhatsAppUrl(
    OFFICIAL_BUSINESS.whatsapp_link_number,
    "Hello Land Parcel team, I have a question about the Monthly (₹599) and Quarterly (₹999) listing subscription plans."
  );

  const FAQS = [
    {
      q: "How do the 5 Lifetime Free Listing Credits work?",
      a: "Every new customer account (Property Owner, Dealer, Agent, Builder, or Developer) receives 5 free listing credits available once for their lifetime. Free credits never reset monthly. Once used, a Monthly or Quarterly subscription is required to submit additional listings.",
    },
    {
      q: "Do pending or rejected listings consume credits?",
      a: "No. Pending, draft, or rejected listings never consume a credit. Credits are deducted only when your submitted property is verified and published on Land Parcel.",
    },
    {
      q: "When are purchased subscription credits added?",
      a: "Purchased credits (20 for Monthly or 50 for Quarterly) are added immediately after Super Admin payment verification. We never simulate fake successful payments.",
    },
    {
      q: "What happens to published listings when a subscription expires?",
      a: "All existing published listings remain live and visible on Land Parcel even after your subscription expires. Expired subscriptions simply cannot be used to submit new listings until renewed.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] pt-24 pb-20">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF3FA] border border-blue-200 text-[#172B4D] text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#C6A66B]" />
            <span>Official Customer Plans · Delhi NCR</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#172B4D] font-display tracking-tight mb-4">
            Land Parcel Listing Subscription Plans
          </h1>
          <p className="text-base text-[#64748B] leading-relaxed">
            Every registered customer receives <strong className="text-[#172B4D]">5 lifetime free listing credits</strong>.
            Upgrade to a Monthly or Quarterly plan whenever you need more property listing capacity.
          </p>
        </div>

        {/* Free Tier Hero Banner */}
        <div className="bg-gradient-to-r from-[#172B4D] to-[#1f3a68] text-white rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto mb-12 shadow-card flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/10">
          <div className="space-y-1 text-center sm:text-left">
            <span className="bg-[#C6A66B] text-[#172B4D] text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Free Starter Policy
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-display mt-2">
              5 Lifetime Free Listing Credits for New Customers
            </h3>
            <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
              Register with your verified mobile number as a Property Owner, Dealer, Agent, Builder, or Developer to receive 5 free lifetime listing credits.
            </p>
          </div>
          <Link
            href={customer ? "/list-property" : "/login"}
            className="btn-primary bg-[#C6A66B] text-[#172B4D] hover:bg-[#b89556] font-bold text-xs py-3 px-6 rounded-xl flex-shrink-0 flex items-center gap-2"
          >
            <span>{customer ? "List Property Now" : "Register Free (5 Credits)"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
          {plans.map((plan) => {
            const isQuarterly = plan.billing_period === "quarterly" || plan.validity_months === 3;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-8 transition-all duration-300 relative flex flex-col justify-between ${
                  isQuarterly
                    ? "bg-[#172B4D] text-white shadow-2xl scale-[1.02] border-2 border-[#C6A66B]"
                    : "bg-white text-[#172B4D] shadow-card border border-[#E2E8F0] hover:shadow-card-hover"
                }`}
              >
                {isQuarterly && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#C6A66B] text-[#172B4D] text-xs font-extrabold px-4 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                    <Crown className="w-3.5 h-3.5" />
                    <span>Best Value · 3 Months</span>
                  </div>
                )}

                <div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-2xl font-bold font-display ${isQuarterly ? "text-white" : "text-[#172B4D]"}`}>
                        {plan.name}
                      </h3>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          isQuarterly ? "bg-white/15 text-[#C6A66B]" : "bg-[#EAF3FA] text-[#172B4D]"
                        }`}
                      >
                        {plan.validity_months} {plan.validity_months > 1 ? "Months" : "Month"} Validity
                      </span>
                    </div>
                    <p className={`text-xs mt-2 leading-relaxed ${isQuarterly ? "text-slate-300" : "text-[#64748B]"}`}>
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-6 pb-6 border-b border-slate-200/20">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl md:text-5xl font-extrabold font-display">
                        ₹{plan.price.toLocaleString("en-IN")}
                      </span>
                      <span className={`text-xs font-semibold ${isQuarterly ? "text-slate-300" : "text-[#64748B]"}`}>
                        / {plan.validity_months > 1 ? `${plan.validity_months} months` : "month"}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md ${
                          isQuarterly ? "bg-[#C6A66B] text-[#172B4D]" : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {plan.listing_credits} Listing Credits
                      </span>
                      <span className={`text-[11px] ${isQuarterly ? "text-slate-300" : "text-[#64748B]"}`}>
                        Added after verification
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider block ${
                        isQuarterly ? "text-slate-300" : "text-[#64748B]"
                      }`}
                    >
                      Plan Highlights:
                    </span>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs">
                        <CheckCircle2
                          className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                            isQuarterly ? "text-[#C6A66B]" : "text-emerald-600"
                          }`}
                        />
                        <span className={isQuarterly ? "text-slate-200" : "text-[#64748B]"}>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleChoosePlan(plan)}
                  className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md ${
                    isQuarterly
                      ? "bg-[#C6A66B] hover:bg-[#b5955a] text-[#172B4D]"
                      : "bg-[#172B4D] hover:bg-[#1e3a6e] text-white"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Purchase {plan.name} (₹{plan.price})</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Policy Highlights */}
        <div className="bg-white rounded-3xl p-8 shadow-card border border-[#E2E8F0] max-w-4xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#172B4D]">Verified Activations Only</h4>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Subscription credits are activated strictly after genuine payment verification.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#172B4D]">Live Listings Stay Visible</h4>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Your already published properties remain live even if your plan expires later.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#172B4D]">Transparent Payment History</h4>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Track every purchase, verification status, and invoice inside your Customer Dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#172B4D] font-display">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs">
                <h4 className="text-sm font-bold text-[#172B4D] flex items-center gap-2 mb-1.5">
                  <HelpCircle className="w-4 h-4 text-[#C6A66B] flex-shrink-0" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs text-[#64748B] leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href={whatsappInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp text-xs py-2.5 px-6 inline-flex"
            >
              <MessageCircle className="w-4 h-4" />
              Questions? Contact Land Parcel on WhatsApp
            </a>
          </div>
        </div>
      </div>

      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedPlan={selectedPlan}
        client={customer}
      />
    </div>
  );
}
