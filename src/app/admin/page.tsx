"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  MapPin,
  ArrowRight,
  PlusCircle,
  FolderUp,
  Inbox,
  AlertTriangle,
  BadgeCheck,
  FileEdit,
  XCircle,
  Edit,
} from "lucide-react";
import { usePropertyStore } from "@/lib/property-store";
import { formatPrice, formatDate, getStatusColor, getStatusLabel, getSourceColor, getSourceLabel } from "@/lib/utils";

// Demo leads for initial state
const INITIAL_LEADS = [
  {
    id: "lead-01",
    lead_id: "LD8X19A",
    name: "Rajesh Sharma",
    mobile: "9810123456",
    property_title: "DEMO - 4 BHK Independent House in Sector 10, Dwarka",
    buyer_type: "Individual Buyer",
    status: "new",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "lead-02",
    lead_id: "LD9K20B",
    name: "Vikram Malhotra",
    mobile: "9958123890",
    property_title: "DEMO - Industrial Warehouse, Sector 35, Gurugram",
    buyer_type: "Company",
    status: "site-visit-scheduled",
    created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
  },
  {
    id: "lead-03",
    lead_id: "LD7P31C",
    name: "Suresh Chaudhry",
    mobile: "9871098765",
    property_title: "DEMO - Agricultural Land in Karnal Region, Haryana",
    buyer_type: "Investor",
    status: "interested",
    created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
  },
  {
    id: "lead-04",
    lead_id: "LD4M42D",
    name: "Anjali Verma",
    mobile: "9811234567",
    property_title: "DEMO - Commercial Property in Gurugram",
    buyer_type: "Developer",
    status: "contacted",
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

export default function AdminDashboardPage() {
  const {
    properties,
    counts,
    pendingApproval,
    clientSubmissions,
    myUploaded,
    publishedProperties,
  } = usePropertyStore();

  const [leads] = useState(INITIAL_LEADS);

  return (
    <div className="space-y-8">
      {/* Pending Submissions Alert Banner */}
      {counts.pending > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-[#172B4D] flex items-center justify-center font-bold">
              {counts.pending}
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#172B4D]">
                Client Submissions Awaiting Approval
              </h3>
              <p className="text-xs text-amber-900">
                You have {counts.pending} submitted listing(s) awaiting verification and approval.
              </p>
            </div>
          </div>
          <Link
            href="/admin/properties?tab=pending"
            className="btn-primary text-xs py-2 px-4 whitespace-nowrap bg-amber-600 hover:bg-amber-700 text-white"
          >
            Review Pending Submissions →
          </Link>
        </div>
      )}

      {/* Dual Listing Pipeline Overview (9 Sections Grid) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#172B4D] uppercase tracking-wider">
            Property Lifecycle & Dual Registry
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

      {/* Main KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total Central Inventory",
            value: counts.all,
            sub: `${counts.published} Live on Marketplace · ${counts.drafts} Drafts`,
            icon: Building,
            color: "text-blue-600 bg-blue-50",
          },
          {
            title: "Pending Approval",
            value: counts.pending,
            sub: `${counts.clientSubmissions} Total client submitted`,
            icon: Clock,
            color: "text-amber-600 bg-amber-50",
          },
          {
            title: "Buyer Leads & Inquiries",
            value: leads.length,
            sub: `${leads.filter((l) => l.status === "new").length} New Action Required`,
            icon: Users,
            color: "text-purple-600 bg-purple-50",
          },
          {
            title: "Closed Deals",
            value: counts.soldOrRented,
            sub: "Sold / Rented transactions",
            icon: TrendingUp,
            color: "text-emerald-600 bg-emerald-50",
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
              <div className="text-2xl font-bold text-[#172B4D] font-display mb-1">
                {card.value}
              </div>
              <div className="text-xs text-[#64748B]">{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Dual Stream: Pending Approvals & Recent Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submissions Requiring Attention */}
        <div className="card p-5 border border-[#E2E8F0] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#172B4D] font-display flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Submissions Requiring Review ({pendingApproval.length})
            </h3>
            <Link
              href="/admin/properties?tab=pending"
              className="text-xs font-semibold text-[#C6A66B] hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {pendingApproval.slice(0, 4).map((p) => (
              <div key={p.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div className="max-w-[70%]">
                  <div className="font-bold text-xs text-[#172B4D] line-clamp-1">{p.title}</div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    By: <strong>{p.seller_name || "Client"}</strong> · {p.city}
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
                ✓ All submissions are up to date. No pending reviews.
              </div>
            )}
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="card p-5 border border-[#E2E8F0] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#172B4D] font-display flex items-center gap-2">
              <Users className="w-4 h-4 text-[#C6A66B]" />
              Recent Buyer Leads ({leads.length})
            </h3>
            <Link
              href="/admin/leads"
              className="text-xs font-semibold text-[#C6A66B] hover:underline"
            >
              Lead Pipeline
            </Link>
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {leads.map((l) => (
              <div key={l.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#172B4D]">{l.name}</span>
                    <span className="text-[10px] font-mono text-[#64748B]">({l.lead_id})</span>
                  </div>
                  <div className="text-[11px] text-[#64748B] line-clamp-1 mt-0.5">
                    {l.property_title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {formatDate(l.created_at)} · {l.mobile}
                  </div>
                </div>
                <div>
                  <span className={`badge text-[10px] capitalize border ${getStatusColor(l.status)}`}>
                    {l.status.replace("-", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
