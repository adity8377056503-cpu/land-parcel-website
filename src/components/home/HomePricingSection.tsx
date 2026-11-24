"use client";

import Link from "next/link";
import { CheckCircle2, Sparkles, ShieldCheck, Crown, ArrowRight } from "lucide-react";
import { useCustomerAuth } from "@/lib/customer-auth";

export default function HomePricingSection() {
  const { customer } = useCustomerAuth();

  return (
    <section className="py-20 bg-gradient-to-b from-white to-[#F5F7FA] border-t border-[#E2E8F0]">
      <div className="container-custom">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF3FA] border border-blue-200 text-[#172B4D] text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#C6A66B]" />
            <span>Listing Plans · Delhi NCR</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#172B4D] font-display tracking-tight mb-4">
            Transparent Pricing &amp; Listing Subscription Plans
          </h2>
          <p className="text-base text-[#64748B] leading-relaxed">
            Every new customer account receives{" "}
            <strong className="text-[#172B4D]">5 lifetime free listing credits</strong>. Upgrade to an official
            Monthly or Quarterly plan whenever you need higher listing volume.
          </p>
        </div>

        {/* Free Starter Policy Banner */}
        <div className="bg-[#172B4D] text-white rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto mb-10 shadow-card flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/10">
          <div className="space-y-1 text-center sm:text-left">
            <span className="bg-[#C6A66B] text-[#172B4D] text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Free Starter Policy
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-display mt-2 text-white">
              5 Lifetime Free Listing Credits for All New Customers
            </h3>
            <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
              Register as a Property Owner, Dealer, Agent, Builder, or Developer. Free credits never reset or expire.
            </p>
          </div>
          <Link
            href={customer ? "/list-property" : "/login"}
            className="bg-[#C6A66B] hover:bg-[#b89556] text-[#172B4D] font-bold text-xs py-3 px-6 rounded-xl flex-shrink-0 flex items-center gap-2 transition-all shadow-md"
          >
            <span>{customer ? "Submit a Property" : "Register Free (5 Credits)"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Subscription Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {/* Monthly Plan */}
          <div className="bg-white rounded-3xl p-8 shadow-card border border-[#E2E8F0] hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold font-display text-[#172B4D]">Monthly Plan</h3>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#EAF3FA] text-[#172B4D]">
                  1 Month Validity
                </span>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed mb-6">
                Ideal for property owners, independent brokers, and individual sellers with active inventory.
              </p>

              <div className="mb-6 pb-6 border-b border-slate-100">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl md:text-5xl font-extrabold font-display text-[#172B4D]">₹599</span>
                  <span className="text-xs font-semibold text-[#64748B]">/ month</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    20 Listing Credits
                  </span>
                  <span className="text-[11px] text-[#64748B]">Active immediately after verification</span>
                </div>
              </div>

              <div className="space-y-2.5 mb-8 text-xs text-[#64748B]">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Post up to 20 verified property listings across Delhi NCR</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Multiple photos and full specification uploads</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Direct buyer lead alerts and enquiry management</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Existing live listings stay online even if plan expires</span>
                </div>
              </div>
            </div>

            <Link
              href="/pricing"
              className="w-full py-3.5 px-4 rounded-xl text-xs font-bold bg-[#172B4D] hover:bg-[#1e3a6e] text-white flex items-center justify-center gap-2 shadow-md transition-all text-center"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C6A66B]" />
              <span>View &amp; Choose Monthly Plan</span>
            </Link>
          </div>

          {/* Quarterly Plan */}
          <div className="bg-[#172B4D] text-white rounded-3xl p-8 shadow-2xl scale-[1.02] border-2 border-[#C6A66B] relative flex flex-col justify-between">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#C6A66B] text-[#172B4D] text-xs font-extrabold px-4 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-md">
              <Crown className="w-3.5 h-3.5" />
              <span>Best Value · 3 Months</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold font-display text-white">Quarterly Plan</h3>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/15 text-[#C6A66B]">
                  3 Months Validity
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                Designed for builders, real estate agencies, dealers, and corporate developers.
              </p>

              <div className="mb-6 pb-6 border-b border-white/10">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl md:text-5xl font-extrabold font-display text-white">₹999</span>
                  <span className="text-xs font-semibold text-slate-300">/ 3 months</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-[#C6A66B] text-[#172B4D]">
                    50 Listing Credits
                  </span>
                  <span className="text-[11px] text-slate-300">Save 44% vs monthly renewals</span>
                </div>
              </div>

              <div className="space-y-2.5 mb-8 text-xs text-slate-200">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C6A66B] flex-shrink-0 mt-0.5" />
                  <span>Post up to 50 verified property listings over 90 days</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C6A66B] flex-shrink-0 mt-0.5" />
                  <span>High-priority verification &amp; publication on the marketplace</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C6A66B] flex-shrink-0 mt-0.5" />
                  <span>Real-time buyer enquiry notifications via WhatsApp &amp; SMS</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C6A66B] flex-shrink-0 mt-0.5" />
                  <span>Comprehensive customer dashboard with lead tracking</span>
                </div>
              </div>
            </div>

            <Link
              href="/pricing"
              className="w-full py-3.5 px-4 rounded-xl text-xs font-bold bg-[#C6A66B] hover:bg-[#b5955a] text-[#172B4D] flex items-center justify-center gap-2 shadow-md transition-all text-center"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>View &amp; Choose Quarterly Plan</span>
            </Link>
          </div>
        </div>

        {/* Bottom Trust Guarantee */}
        <div className="text-center">
          <p className="text-xs text-[#64748B] flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              100% genuine verification by Land Parcel. Credits are deducted only upon publication.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
