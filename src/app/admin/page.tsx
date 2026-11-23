"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  PlusCircle,
  FolderUp,
  Inbox,
  BadgeCheck,
  FileEdit,
  XCircle,
  Crown,
  CreditCard,
} from "lucide-react";
import { usePropertyStore } from "@/lib/property-store";
import { useSubscriptionStore } from "@/lib/subscription-store";
import { useAdminAuth } from "@/lib/admin-auth";
import { formatPrice, formatDate, getStatusColor } from "@/lib/utils";
import { Enquiry } from "@/types";

export default function AdminDashboardPage() {
  const { counts, pendingApproval } = usePropertyStore();
  const { clients, payments } = useSubscriptionStore({ adminMode: true });
  const { adminUser } = useAdminAuth();

  const [leads, setLeads] = useState<Enquiry[]>([]);

  useEffect(() => {
    fetch("/api/admin/leads", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.leads && Array.isArray(json.leads)) {
          setLeads(json.leads);
        }
      })
      .catch(() => {});
  }, []);

  const pendingPaymentsCount = payments.filter((p) => p.status === "pending_verification").length;

  return (
    <div className="space-y-8">
      {/* Super Admin Identity Banner */}
      <div className="bg-gradient-to-r from-[#172B4D] to-[#1f3a68] text-white rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#C6A66B]/20 border border-[#C6A66B]/40 flex items-center justify-center">
            <Crown className="w-6 h-6 text-[#C6A66B]" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-display">
              Welcome, {adminUser?.name || "Aditya Raj"} ({adminUser?.accountType || "Website Owner / Main Administrator"})
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Super Admin Role · Mobile +91 {adminUser?.mobile || "8377056503"} · Unlimited Free Property Uploads Enabled
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/properties/new"
            className="bg-[#C6A66B] hover:bg-[#b5955a] text-[#172B4D] font-bold text-xs py-2 px-4 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Upload Property Free
          </Link>
        </div>
      </div>

      {/* Pending Alerts */}
      {(counts.pending > 0 || pendingPaymentsCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {counts.pending > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-[#172B4D] flex items-center justify-center font-bold">
                  {counts.pending}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#172B4D]">Listings Awaiting Approval</h3>
                  <p className="text-xs text-amber-900">{counts.pending} customer submission(s) to review.</p>
                </div>
              </div>
              <Link
                href="/admin/properties?tab=pending"
                className="btn-primary text-xs py-2 px-3.5 whitespace-nowrap bg-amber-600 hover:bg-amber-700 text-white"
              >
                Review →
              </Link>
            </div>
          )}

          {pendingPaymentsCount > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#172B4D] text-[#C6A66B] flex items-center justify-center font-bold">
                  {pendingPaymentsCount}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#172B4D]">Subscription Payments Pending</h3>
                  <p className="text-xs text-[#64748B]">Verify customer UTR &amp; activate credits.</p>
                </div>
              </div>
              <Link
                href="/admin/subscriptions"
                className="btn-primary text-xs py-2 px-3.5 whitespace-nowrap"
              >
                Verify →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Dual Listing Pipeline Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#172B4D] uppercase tracking-wider">
            Property Lifecycle &amp; Dual Registry
          </h2>
          <Link
            href="/admin/properties/new"
            className="text-xs font-semibold text-[#C6A66B] hover:underline flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" /> + New Upload
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: "All Properties", tab: "all", count: counts.all, icon: Building, color: "bg-slate-50 text-slate-800" },
            { label: "My Uploads", tab: "my-uploaded", count: counts.myUploaded, icon: FolderUp, color: "bg-blue-50 text-blue-800" },
            { label: "Client Subs", tab: "client-submissions", count: counts.clientSubmissions, icon: Inbox, color: "bg-purple-50 text-purple-800" },
            { label: "Pending", tab: "pending", count: counts.pending, icon: Clock, color: counts.pending > 0 ? "bg-amber-100 text-amber-900 ring-2 ring-amber-400" : "bg-amber-50 text-amber-800" },
            { label: "Published", tab: "published", count: counts.published, icon: CheckCircle, color: "bg-green-50 text-green-800" },
            { label: "Sold/Rented", tab: "sold-rented", count: counts.soldOrRented, icon: BadgeCheck, color: "bg-indigo-50 text-indigo-800" },
            { label: "Drafts", tab: "drafts", count: counts.drafts, icon: FileEdit, color: "bg-slate-100 text-slate-700" },
            { label: "Rejected", tab: "rejected", count: counts.rejected, icon: XCircle, color: "bg-red-50 text-red-800" },
          ].map((sec) => {
            const Icon = sec.icon;
            return (
              <Link
                key={sec.label}
                href={`/admin/properties?tab=${sec.tab}`}
                className={`p-3 rounded-2xl border border-[#E2E8F0] ${sec.color} hover:scale-105 transition-all text-center block shadow-sm`}
              >
                <Icon className="w-4 h-4 mx-auto mb-1 opacity-70" />
                <div className="text-xl font-bold font-mono">{sec.count}</div>
                <div className="text-[10px] font-semibold truncate mt-0.5">{sec.label}</div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main KPI Stats (100% Real Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Central Inventory",
            value: counts.all,
            sub: `${counts.published} Live · ${counts.drafts} Drafts`,
            icon: Building,
            color: "text-blue-600 bg-blue-50",
          },
          {
            title: "Registered Customers",
            value: clients.length,
            sub: `${clients.filter((c) => c.subscription_status === "active").length} Active Subscriptions`,
            icon: CreditCard,
            color: "text-emerald-600 bg-emerald-50",
          },
          {
            title: "Buyer Leads & Enquiries",
            value: leads.length,
            sub: `${leads.filter((l) => l.status === "new").length} New Enquiries`,
            icon: Users,
            color: "text-purple-600 bg-purple-50",
          },
          {
            title: "Closed Deals",
            value: counts.soldOrRented,
            sub: "Sold / Rented transactions",
            icon: TrendingUp,
            color: "text-amber-600 bg-amber-50",
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="card p-5 border border-[#E2E8F0]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-[#172B4D] font-display mb-1">{card.value}</div>
              <div className="text-xs text-[#64748B]">{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Dual Stream: Pending Approvals & Real Buyer Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Submissions */}
        <div className="card p-5 border border-[#E2E8F0] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#172B4D] font-display flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Submissions Requiring Review ({pendingApproval.length})
            </h3>
            <Link href="/admin/properties?tab=pending" className="text-xs font-semibold text-[#C6A66B] hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {pendingApproval.slice(0, 5).map((p) => (
              <div key={p.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div className="max-w-[70%]">
                  <div className="font-bold text-xs text-[#172B4D] line-clamp-1">{p.title}</div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    By: <strong>{p.seller_name || "Customer"}</strong> · {p.city}
                  </div>
                  <div className="text-[11px] font-mono text-[#C6A66B] font-semibold mt-0.5">
                    {formatPrice(p.price)} · {p.listing_id}
                  </div>
                </div>
                <Link
                  href={`/admin/properties/${p.id}/edit`}
                  className="btn-primary text-xs py-1.5 px-3 whitespace-nowrap bg-amber-600 hover:bg-amber-700"
                >
                  Review
                </Link>
              </div>
            ))}

            {pendingApproval.length === 0 && (
              <div className="py-8 text-center text-xs text-[#64748B]">
                No pending customer submissions right now.
              </div>
            )}
          </div>
        </div>

        {/* Real Buyer Leads */}
        <div className="card p-5 border border-[#E2E8F0] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#172B4D] font-display flex items-center gap-2">
              <Users className="w-4 h-4 text-[#C6A66B]" />
              Recent Buyer Enquiries ({leads.length})
            </h3>
            <Link href="/admin/leads" className="text-xs font-semibold text-[#C6A66B] hover:underline">
              Lead Pipeline
            </Link>
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {leads.slice(0, 5).map((l) => (
              <div key={l.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#172B4D]">{l.name}</span>
                    <span className="text-[10px] font-mono text-[#64748B]">({l.lead_id})</span>
                  </div>
                  <div className="text-[11px] text-[#64748B] line-clamp-1 mt-0.5">
                    {l.property_title || "General Platform Enquiry"}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {formatDate(l.created_at)} · +91 {l.mobile}
                  </div>
                </div>
                <span className={`badge text-[10px] capitalize border ${getStatusColor(l.status)}`}>
                  {l.status.replace("-", " ")}
                </span>
              </div>
            ))}

            {leads.length === 0 && (
              <div className="py-8 text-center text-xs text-[#64748B]">
                No buyer enquiries submitted yet. Real customer enquiries will appear here automatically.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
