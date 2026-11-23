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
  IndianRupee,
  Activity,
  History,
  ShieldCheck,
  Calendar,
  Phone,
  ArrowRight,
} from "lucide-react";
import { usePropertyStore } from "@/lib/property-store";
import { useSubscriptionStore } from "@/lib/subscription-store";
import { useAdminAuth } from "@/lib/admin-auth";
import { formatPrice, formatDate, getStatusColor } from "@/lib/utils";
import { Enquiry } from "@/types";

interface AuditLogItem {
  id: string;
  action: string;
  performed_by: string;
  target_entity: string;
  target_id?: string;
  details?: Record<string, any>;
  created_at: string;
}

export default function AdminDashboardPage() {
  const { counts, pendingApproval, allProperties } = usePropertyStore();
  const { clients, payments } = useSubscriptionStore({ adminMode: true });
  const { adminUser } = useAdminAuth();

  const [leads, setLeads] = useState<Enquiry[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  useEffect(() => {
    // Fetch leads
    fetch("/api/admin/leads", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.leads && Array.isArray(json.leads)) {
          setLeads(json.leads);
        }
      })
      .catch(() => {});

    // Fetch audit logs
    fetch("/api/admin/audit-logs?limit=8", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.logs && Array.isArray(json.logs)) {
          setAuditLogs(json.logs);
        }
      })
      .catch(() => {});
  }, []);

  const pendingPayments = payments.filter((p) => p.status === "pending_verification");
  const verifiedPayments = payments.filter((p) => p.status === "verified");
  const totalVerifiedRevenue = verifiedPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

  const activeSubscriptionsCount = clients.filter((c) => c.subscription_status === "active").length;
  const expiredSubscriptionsCount = clients.filter((c) => c.subscription_status === "expired").length;

  const underNegotiationCount = allProperties.filter((p) => p.availability_status === "under-negotiation").length;

  return (
    <div className="space-y-8 pb-16">
      {/* Super Admin Identity Banner */}
      <div className="bg-gradient-to-r from-[#172B4D] via-[#1c355e] to-[#172B4D] text-white rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm border border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#C6A66B]/20 border border-[#C6A66B]/50 flex items-center justify-center">
            <Crown className="w-7 h-7 text-[#C6A66B]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-display">
                Welcome, {adminUser?.name || "Aditya Raj"}
              </h1>
              <span className="badge bg-[#C6A66B] text-[#172B4D] text-[10px] font-bold px-2 py-0.5">
                SUPER ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Website Owner &amp; Main Administrator · Mobile +91 {adminUser?.mobile || "8377056503"} · Unlimited Property Uploads
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/properties/new"
            className="bg-[#C6A66B] hover:bg-[#b5955a] text-[#172B4D] font-bold text-xs py-2.5 px-4 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" /> + Upload Property Free
          </Link>
        </div>
      </div>

      {/* Action Required Callout Banner */}
      {(counts.pending > 0 || pendingPayments.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {counts.pending > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-[#172B4D] flex items-center justify-center font-bold font-mono">
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
                Review Listings →
              </Link>
            </div>
          )}

          {pendingPayments.length > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#172B4D] text-[#C6A66B] flex items-center justify-center font-bold font-mono">
                  {pendingPayments.length}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#172B4D]">Pending Payment Verifications</h3>
                  <p className="text-xs text-[#64748B]">Verify customer UTR &amp; activate listing credits.</p>
                </div>
              </div>
              <Link
                href="/admin/subscriptions"
                className="btn-primary text-xs py-2 px-3.5 whitespace-nowrap"
              >
                Verify Payments →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 5-Column High-Level Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Properties */}
        <div className="card p-5 border border-[#E2E8F0] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              Total Properties
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#172B4D] font-display">{counts.all}</div>
          <div className="text-xs text-[#64748B] flex items-center justify-between pt-1">
            <span>{counts.published} Live</span>
            <span>{counts.drafts} Drafts</span>
          </div>
        </div>

        {/* Registered Customers */}
        <div className="card p-5 border border-[#E2E8F0] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              Registered Clients
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#172B4D] font-display">{clients.length}</div>
          <div className="text-xs text-[#64748B] flex items-center justify-between pt-1">
            <span>{clients.filter((c) => c.status !== "suspended").length} Active</span>
            <span>{clients.filter((c) => c.status === "suspended").length} Suspended</span>
          </div>
        </div>

        {/* Subscriptions */}
        <div className="card p-5 border border-[#E2E8F0] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              Subscriptions
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#172B4D] font-display">{activeSubscriptionsCount}</div>
          <div className="text-xs text-[#64748B] flex items-center justify-between pt-1">
            <span>Active Plans</span>
            <span>{expiredSubscriptionsCount} Expired</span>
          </div>
        </div>

        {/* Revenue */}
        <div className="card p-5 border border-[#E2E8F0] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              Verified Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#172B4D] font-display font-mono">
            ₹{totalVerifiedRevenue.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-[#64748B] flex items-center justify-between pt-1">
            <span>{verifiedPayments.length} Verified</span>
            <span>{pendingPayments.length} Pending</span>
          </div>
        </div>

        {/* Buyer Leads */}
        <div className="card p-5 border border-[#E2E8F0] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              Buyer Leads
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#172B4D] font-display">{leads.length}</div>
          <div className="text-xs text-[#64748B] flex items-center justify-between pt-1">
            <span>{leads.filter((l) => l.status === "new").length} New</span>
            <span>{underNegotiationCount} In Negot.</span>
          </div>
        </div>
      </div>

      {/* Property Pipeline Strip */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
            Property Pipeline &amp; Status Distribution
          </h2>
          <Link
            href="/admin/properties"
            className="text-xs font-semibold text-[#C6A66B] hover:underline flex items-center gap-1"
          >
            Manage Registry →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: "All Properties", tab: "all", count: counts.all, icon: Building, color: "bg-slate-50 text-slate-800" },
            { label: "My Uploads", tab: "my-uploaded", count: counts.myUploaded, icon: FolderUp, color: "bg-blue-50 text-blue-800" },
            { label: "Client Subs", tab: "client-submissions", count: counts.clientSubmissions, icon: Inbox, color: "bg-purple-50 text-purple-800" },
            { label: "Pending", tab: "pending", count: counts.pending, icon: Clock, color: counts.pending > 0 ? "bg-amber-100 text-amber-900 ring-2 ring-amber-400" : "bg-amber-50 text-amber-800" },
            { label: "Published", tab: "published", count: counts.published, icon: CheckCircle, color: "bg-green-50 text-green-800" },
            { label: "Sold / Rented", tab: "sold-rented", count: counts.soldOrRented, icon: BadgeCheck, color: "bg-indigo-50 text-indigo-800" },
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

      {/* Two-Column Activity & Enquiries Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Admin Audit Logs / Activity Stream */}
        <div className="card p-5 border border-[#E2E8F0] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#172B4D] font-display flex items-center gap-2">
              <History className="w-4 h-4 text-[#C6A66B]" />
              System Activity &amp; Audit Trail
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Logged Actions</span>
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {auditLogs.slice(0, 6).map((log) => (
              <div key={log.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-semibold text-[#172B4D]">
                    {log.action.replace(/_/g, " ")}
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    By: <strong>{log.performed_by}</strong> · Target: <span className="capitalize">{log.target_entity}</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                  {formatDate(log.created_at)}
                </div>
              </div>
            ))}

            {auditLogs.length === 0 && (
              <div className="py-8 text-center text-xs text-[#64748B]">
                Administrative actions will be recorded here automatically.
              </div>
            )}
          </div>
        </div>

        {/* Recent Buyer Enquiries */}
        <div className="card p-5 border border-[#E2E8F0] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#172B4D] font-display flex items-center gap-2">
              <Users className="w-4 h-4 text-[#C6A66B]" />
              Recent Buyer Leads ({leads.length})
            </h3>
            <Link href="/admin/leads" className="text-xs font-semibold text-[#C6A66B] hover:underline">
              View All Leads →
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
                    {l.property_title || "General Platform Inquiry"}
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
                No buyer enquiries submitted yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
