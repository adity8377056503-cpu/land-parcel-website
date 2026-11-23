"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  PlusCircle,
  ShieldCheck,
  RefreshCw,
  Phone,
  Mail,
  User,
  ExternalLink,
  ChevronRight,
  FileText,
  Printer,
} from "lucide-react";
import { useSubscriptionStore } from "@/lib/subscription-store";
import { usePropertyStore } from "@/lib/property-store";
import SubscriptionModal from "@/components/subscription/SubscriptionModal";
import InvoiceModal from "@/components/subscription/InvoiceModal";
import { formatPrice, formatArea, getStatusColor, getStatusLabel, OFFICIAL_BUSINESS } from "@/lib/utils";
import { PaymentTransaction } from "@/types";

export default function ClientDashboardPage() {
  const { clients, activeClient, switchActiveClient, plans, payments } = useSubscriptionStore();
  const { properties } = usePropertyStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoiceTx, setSelectedInvoiceTx] = useState<PaymentTransaction | null>(null);

  // Filter client's submitted properties by matching mobile
  const normalizedMobile = activeClient.mobile.replace(/\D/g, "").slice(-10);
  const clientProperties = properties.filter((p) => {
    if (!p.seller_mobile) return false;
    return p.seller_mobile.replace(/\D/g, "").slice(-10) === normalizedMobile;
  });

  // Client's payments
  const clientPayments = payments.filter((p) => p.client_id === activeClient.id);

  // Separate Free vs Purchased Credits
  const freeRemaining = Math.max(0, activeClient.free_credits_total - activeClient.free_credits_used);
  const paidRemaining = Math.max(0, (activeClient.paid_credits_total || 0) - (activeClient.paid_credits_used || 0));

  const isSubActive =
    activeClient.subscription_status === "active" &&
    (!activeClient.current_period_end || new Date(activeClient.current_period_end) > new Date());
  const isSubExpired =
    activeClient.subscription_status === "expired" ||
    (activeClient.current_period_end && new Date(activeClient.current_period_end) <= new Date());
  const isPendingVerification = activeClient.subscription_status === "pending";

  return (
    <div className="min-h-screen bg-[#F5F7FA] pt-24 pb-16">
      <div className="container-custom">
        {/* Top bar with quick user switch (testing widget) */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E2E8F0] mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#172B4D] text-[#C6A66B] flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-[#172B4D] font-display">{activeClient.name}</h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#EAF3FA] text-[#172B4D] px-2 py-0.5 rounded-full border border-blue-200">
                  {activeClient.role}
                </span>
              </div>
              <div className="text-xs text-[#64748B] flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" /> +91 {activeClient.mobile}
                </span>
                {activeClient.company_name && <span>· {activeClient.company_name}</span>}
              </div>
            </div>
          </div>

          {/* Test Persona Switcher */}
          <div className="flex items-center gap-2 text-xs bg-[#F8FAFC] p-1.5 rounded-xl border border-[#E2E8F0]">
            <span className="text-[#64748B] font-semibold pl-1">Switch Client Persona:</span>
            <select
              value={activeClient.id}
              onChange={(e) => switchActiveClient(e.target.value)}
              className="bg-white border border-[#E2E8F0] text-[#172B4D] font-semibold text-xs rounded-lg px-2.5 py-1 focus:outline-none"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.role} · {c.subscription_status === "active" ? "Subscribed" : `${c.free_credits_used}/5 Free Used`})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quota & Subscription Status Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* Card 1: Free Lifetime Credits */}
          <div className="bg-white rounded-3xl p-6 shadow-card border border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                1. Free Lifetime Credits
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EAF3FA] text-[#172B4D]">
                5 Lifetime Credits
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-extrabold text-[#172B4D] font-display">
                {activeClient.free_credits_used}
              </span>
              <span className="text-sm font-semibold text-[#64748B]">/ 5 Used</span>
              <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                {freeRemaining} Free Remaining
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  activeClient.free_credits_used >= 5
                    ? "bg-amber-500"
                    : activeClient.free_credits_used >= 3
                    ? "bg-blue-600"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${(activeClient.free_credits_used / 5) * 100}%` }}
              />
            </div>

            <p className="text-[11px] text-[#64748B] leading-relaxed">
              * Policy: All new clients get 5 lifetime free listing credits. <strong>Free credits never reset monthly.</strong>
            </p>
          </div>

          {/* Card 2: Purchased Subscription Credits (Separate from Free Credits) */}
          <div className="bg-white rounded-3xl p-6 shadow-card border border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                2. Subscription Credits
              </span>
              {isSubActive ? (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              ) : isPendingVerification ? (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Pending Verification
                </span>
              ) : isSubExpired ? (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Expired
                </span>
              ) : (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  No Active Plan
                </span>
              )}
            </div>

            <div className="text-xl font-bold text-[#172B4D] mb-1 line-clamp-1">
              {activeClient.current_plan_name || "No Subscription"}
            </div>

            {isSubActive ? (
              <div className="space-y-2 mb-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-[#172B4D] font-display">
                    {activeClient.paid_credits_used || 0}
                  </span>
                  <span className="text-xs font-semibold text-[#64748B]">
                    / {activeClient.paid_credits_total || 0} Purchased Credits Used
                  </span>
                  <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {paidRemaining} Left
                  </span>
                </div>
                <div className="text-[11px] text-[#64748B]">
                  Valid until:{" "}
                  <strong className="text-[#172B4D]">
                    {activeClient.current_period_end
                      ? new Date(activeClient.current_period_end).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Renewal"}
                  </strong>
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#64748B] mb-3">
                {isPendingVerification ? (
                  <span className="text-amber-700 font-medium">
                    Payment reference submitted. Awaiting verification by Suraj Prakash.
                  </span>
                ) : isSubExpired ? (
                  <span className="text-rose-600 font-medium">
                    Subscription expired. Renew to submit additional properties.
                  </span>
                ) : (
                  <span>Purchase Monthly (₹599 / 20 credits) or Quarterly (₹999 / 50 credits) plan.</span>
                )}
              </div>
            )}

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full btn-secondary text-xs py-2 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C6A66B]" />
              <span>{isSubActive ? "Renew / Upgrade Plan" : "Purchase Subscription Plan"}</span>
            </button>
          </div>

          {/* Card 3: Business Identity & Submission Policy */}
          <div className="bg-[#172B4D] text-white rounded-3xl p-6 shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#C6A66B] text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Official Policy</span>
              </div>
              <h3 className="text-lg font-bold font-display mb-1">Listing Status</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {freeRemaining > 0 || (isSubActive && paidRemaining > 0)
                  ? `You have ${freeRemaining > 0 ? `${freeRemaining} free` : `${paidRemaining} subscription`} credits remaining to list properties.`
                  : "All listing credits used. An active subscription is required to submit additional properties."}
              </p>
            </div>

            <div className="pt-4 flex flex-col gap-2">
              <Link
                href="/list-property"
                className="w-full bg-[#C6A66B] hover:bg-[#b5955a] text-[#172B4D] font-bold text-xs py-2.5 px-4 rounded-xl text-center transition-colors flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit New Property</span>
              </Link>
              <Link
                href="/pricing"
                className="text-xs text-slate-300 hover:text-white text-center flex items-center justify-center gap-1"
              >
                <span>View Monthly (₹599) &amp; Quarterly (₹999) Plans</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* My Submitted Properties Table */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-[#E2E8F0] mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#172B4D] font-display">My Submitted Properties</h2>
              <p className="text-xs text-[#64748B]">
                All properties submitted under contact +91 {activeClient.mobile}
              </p>
            </div>
            <Link href="/list-property" className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>List Property</span>
            </Link>
          </div>

          {clientProperties.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-[#E2E8F0] rounded-2xl">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-[#172B4D]">No Properties Listed Yet</h4>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1 mb-4">
                You have {freeRemaining > 0 ? `${freeRemaining} free` : `${paidRemaining}`} listing credits available to submit across Delhi NCR.
              </p>
              <Link href="/list-property" className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1">
                <span>Submit Your First Property</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Listing</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Area</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Credit Type</th>
                    <th className="pb-3 pr-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {clientProperties.map((p) => {
                    const isPublished = p.status === "published";
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 pl-2">
                          <div className="font-bold text-[#172B4D] line-clamp-1">{p.title}</div>
                          <div className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
                            <span className="font-mono text-[#172B4D] font-semibold">{p.listing_id}</span>
                            <span>· {p.locality}, {p.city}</span>
                          </div>
                        </td>
                        <td className="py-3 capitalize text-[#64748B]">{p.category.replace("-", " ")}</td>
                        <td className="py-3 font-semibold text-[#172B4D]">{formatPrice(p.price)}</td>
                        <td className="py-3 text-[#64748B]">{formatArea(p.total_area, p.area_unit)}</td>
                        <td className="py-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${getStatusColor(p.status)}`}>
                            {getStatusLabel(p.status)}
                          </span>
                        </td>
                        <td className="py-3">
                          {isPublished ? (
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              ✓ 1 Credit Deducted
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#64748B] bg-slate-100 px-2 py-0.5 rounded-md">
                              0 (Pending Review)
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-2 text-right">
                          {isPublished ? (
                            <Link
                              href={`/properties/${p.slug}`}
                              target="_blank"
                              className="text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1"
                            >
                              <span>View Live</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Under Review</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Business rule reassurance */}
          <div className="mt-4 p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-950 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Guaranteed Visibility:</strong> Existing published listings remain visible on the Land Parcel marketplace permanently, even if a subscription later expires.
            </div>
          </div>
        </div>

        {/* Payment History & Official Invoices Table */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-[#E2E8F0]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#172B4D] font-display">
                Payment History &amp; Official Invoices
              </h2>
              <p className="text-xs text-[#64748B]">
                View receipts and print official tax invoices issued by Land Parcel (Suraj Prakash)
              </p>
            </div>
          </div>

          {clientPayments.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#64748B] border border-[#E2E8F0] rounded-2xl">
              No subscription payment transactions found. You are currently on the Free 5-Listing Tier.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Invoice / TXN ID</th>
                    <th className="pb-3">Plan</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Method</th>
                    <th className="pb-3">Reference / UTR</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 pr-2 text-right">Invoice Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {clientPayments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50/70">
                      <td className="py-3 pl-2">
                        <div className="font-mono font-bold text-[#172B4D]">
                          {pay.invoice_number || `INV-LP-${pay.id.slice(-6).toUpperCase()}`}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{pay.transaction_id}</div>
                      </td>
                      <td className="py-3 font-semibold text-[#172B4D]">{pay.plan_name}</td>
                      <td className="py-3 font-extrabold text-[#172B4D]">₹{pay.amount.toLocaleString("en-IN")}</td>
                      <td className="py-3 capitalize text-[#64748B]">{pay.payment_method.replace("_", " ")}</td>
                      <td className="py-3 font-mono text-[#64748B]">{pay.reference_number}</td>
                      <td className="py-3">
                        {pay.status === "verified" ? (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            ✓ Verified &amp; Active
                          </span>
                        ) : pay.status === "pending_verification" ? (
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                            ⏳ Pending Admin Verification
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                            ✕ Rejected
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-2 text-right">
                        <button
                          onClick={() => setSelectedInvoiceTx(pay)}
                          className="px-2.5 py-1.5 bg-[#172B4D] hover:bg-[#1e3a6e] text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#C6A66B]" />
                          <span>View Invoice</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Subscription Checkout Modal */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        client={activeClient}
        onSuccess={() => setIsModalOpen(false)}
      />

      {/* Official Tax Invoice Modal */}
      <InvoiceModal
        isOpen={!!selectedInvoiceTx}
        onClose={() => setSelectedInvoiceTx(null)}
        transaction={selectedInvoiceTx}
      />
    </div>
  );
}
