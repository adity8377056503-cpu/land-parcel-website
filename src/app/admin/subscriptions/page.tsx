"use client";

import { useState } from "react";
import {
  CreditCard,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Crown,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Edit2,
  Check,
  X,
  IndianRupee,
  Calendar,
  FileText,
} from "lucide-react";
import { useSubscriptionStore } from "@/lib/subscription-store";
import { ClientAccount, SubscriptionPlan, PaymentTransaction } from "@/types";
import InvoiceModal from "@/components/subscription/InvoiceModal";
import { OFFICIAL_BUSINESS } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminSubscriptionsPage() {
  const {
    clients,
    plans,
    payments,
    adminApprovePayment,
    adminRejectPayment,
    adminManualActivate,
    adminSuspendSubscription,
    adminUpdatePlan,
  } = useSubscriptionStore();

  const [activeTab, setActiveTab] = useState<"clients" | "payments" | "plans" | "policy">("clients");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Selected invoice for viewing/printing
  const [selectedInvoiceTx, setSelectedInvoiceTx] = useState<PaymentTransaction | null>(null);

  // Manual Activation Modal State
  const [activatingClient, setActivatingClient] = useState<ClientAccount | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || "");
  const [selectedMonths, setSelectedMonths] = useState<number>(1);
  const [adminNotes, setAdminNotes] = useState("");

  // Edit Plan State
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editCredits, setEditCredits] = useState<number>(20);
  const [editValidity, setEditValidity] = useState<number>(1);

  // Filter clients
  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobile.includes(searchTerm) ||
      (c.company_name && c.company_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? c.subscription_status === "active"
        : statusFilter === "expired"
        ? c.subscription_status === "expired"
        : statusFilter === "pending"
        ? c.subscription_status === "pending"
        : c.subscription_status === "none";

    return matchesSearch && matchesStatus;
  });

  // Payments summary
  const pendingPayments = payments.filter((p) => p.status === "pending_verification");
  const verifiedPayments = payments.filter((p) => p.status === "verified");

  // Metrics
  const activeSubsCount = clients.filter((c) => c.subscription_status === "active").length;
  const expiredSubsCount = clients.filter((c) => c.subscription_status === "expired").length;
  const freeTierCount = clients.filter((c) => c.subscription_status === "none").length;
  const totalVerifiedRevenue = verifiedPayments.reduce((acc, curr) => acc + curr.amount, 0);

  const handleManualActivate = () => {
    if (!activatingClient) return;
    adminManualActivate(activatingClient.id, selectedPlanId, selectedMonths, adminNotes);
    toast.success(`Subscription activated for ${activatingClient.name}!`);
    setActivatingClient(null);
    setAdminNotes("");
  };

  const handleSavePlan = () => {
    if (!editingPlan) return;
    adminUpdatePlan(editingPlan.id, {
      price: editPrice,
      listing_credits: editCredits,
      validity_months: editValidity,
    });
    toast.success(`Plan ${editingPlan.name} updated successfully!`);
    setEditingPlan(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#172B4D] font-display">
              Official Subscriptions &amp; Listing Credits
            </h1>
            <span className="bg-[#172B4D] text-[#C6A66B] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              Owner: {OFFICIAL_BUSINESS.owner_name}
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Manage 5-credit free tier, Monthly (₹599 / 20 credits) &amp; Quarterly (₹999 / 50 credits) plans, and invoice verification.
          </p>
        </div>

        {/* Land Parcel Admin Privilege Badge */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2 flex items-center gap-2 text-xs text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            <strong>Land Parcel Business:</strong> Unlimited Free Listings Permanently Active
          </span>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-1 font-semibold">
            <span>Total Clients</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-[#172B4D] font-display">{clients.length}</div>
          <div className="text-[11px] text-[#64748B] mt-1">{freeTierCount} on Free 5-credit Tier</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-1 font-semibold">
            <span>Active Subscriptions</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-display">{activeSubsCount}</div>
          <div className="text-[11px] text-[#64748B] mt-1">{expiredSubsCount} expired / pending renewal</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-1 font-semibold">
            <span>Pending Verifications</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600 font-display">
            {pendingPayments.length}
          </div>
          <div className="text-[11px] text-amber-700 mt-1 font-semibold">
            {pendingPayments.length > 0 ? "Requires Admin Verification" : "All cleared"}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-1 font-semibold">
            <span>Verified Collections</span>
            <IndianRupee className="w-4 h-4 text-[#C6A66B]" />
          </div>
          <div className="text-2xl font-bold text-[#172B4D] font-display">
            ₹{totalVerifiedRevenue.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Verified Real Transactions</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E2E8F0] gap-2">
        <button
          onClick={() => setActiveTab("clients")}
          className={`pb-3 px-3 text-xs font-bold transition-all relative ${
            activeTab === "clients"
              ? "text-[#172B4D] border-b-2 border-[#172B4D]"
              : "text-[#64748B] hover:text-[#172B4D]"
          }`}
        >
          <span>Client Quota &amp; Accounts ({clients.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("payments")}
          className={`pb-3 px-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
            activeTab === "payments"
              ? "text-[#172B4D] border-b-2 border-[#172B4D]"
              : "text-[#64748B] hover:text-[#172B4D]"
          }`}
        >
          <span>Payment Approvals &amp; Invoices</span>
          {pendingPayments.length > 0 && (
            <span className="bg-amber-400 text-[#172B4D] text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {pendingPayments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("plans")}
          className={`pb-3 px-3 text-xs font-bold transition-all ${
            activeTab === "plans"
              ? "text-[#172B4D] border-b-2 border-[#172B4D]"
              : "text-[#64748B] hover:text-[#172B4D]"
          }`}
        >
          <span>Manage Plans &amp; Prices</span>
        </button>

        <button
          onClick={() => setActiveTab("policy")}
          className={`pb-3 px-3 text-xs font-bold transition-all ${
            activeTab === "policy"
              ? "text-[#172B4D] border-b-2 border-[#172B4D]"
              : "text-[#64748B] hover:text-[#172B4D]"
          }`}
        >
          <span>Official Business &amp; Rules</span>
        </button>
      </div>

      {/* TAB 1: CLIENTS & QUOTAS */}
      {activeTab === "clients" && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E2E8F0]">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by client name, mobile or company..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#E2E8F0] focus:outline-none focus:border-[#172B4D]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-[#64748B] font-semibold">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-2.5 py-1.5 text-[#172B4D] font-semibold focus:outline-none"
              >
                <option value="all">All Clients</option>
                <option value="active">Active Subscription</option>
                <option value="pending">Pending Approval</option>
                <option value="expired">Expired</option>
                <option value="none">Free Tier Only</option>
              </select>
            </div>
          </div>

          {/* Clients Table */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase tracking-wider">
                    <th className="py-3 pl-4">Client Name &amp; Role</th>
                    <th className="py-3">Mobile &amp; Email</th>
                    <th className="py-3">Free Credits (5 Lifetime)</th>
                    <th className="py-3">Subscription Credits</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Expiry Date</th>
                    <th className="py-3 pr-4 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredClients.map((client) => {
                    const remainingFree = Math.max(0, client.free_credits_total - client.free_credits_used);
                    const isSubActive = client.subscription_status === "active";
                    const isPending = client.subscription_status === "pending";
                    const isExpired = client.subscription_status === "expired";
                    const paidRemaining = Math.max(
                      0,
                      (client.paid_credits_total || 0) - (client.paid_credits_used || 0)
                    );

                    return (
                      <tr key={client.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 pl-4">
                          <div className="font-bold text-[#172B4D]">{client.name}</div>
                          <div className="text-[11px] text-[#64748B] capitalize flex items-center gap-1.5 mt-0.5">
                            <span className="bg-[#EAF3FA] text-[#172B4D] px-1.5 py-0.2 rounded font-semibold text-[10px]">
                              {client.role}
                            </span>
                            {client.company_name && <span>{client.company_name}</span>}
                          </div>
                        </td>

                        <td className="py-3.5">
                          <div className="font-mono font-semibold text-[#172B4D]">+91 {client.mobile}</div>
                          {client.email && <div className="text-[11px] text-[#64748B]">{client.email}</div>}
                        </td>

                        {/* Free Credits */}
                        <td className="py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#172B4D]">
                              {client.free_credits_used} / 5
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                client.free_credits_used >= 5
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {remainingFree} left
                            </span>
                          </div>
                        </td>

                        {/* Subscription Credits (Separate) */}
                        <td className="py-3.5">
                          {isSubActive ? (
                            <div>
                              <div className="font-bold text-[#172B4D]">
                                {client.paid_credits_used || 0} / {client.paid_credits_total || 0}
                              </div>
                              <span className="text-[10px] text-emerald-700 font-semibold">
                                {paidRemaining} remaining
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5">
                          {isSubActive ? (
                            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[11px] inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                          ) : isPending ? (
                            <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[11px] inline-flex items-center gap-1 animate-pulse">
                              <Clock className="w-3 h-3" /> Pending Verification
                            </span>
                          ) : isExpired ? (
                            <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full text-[11px] inline-flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> Expired
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-full text-[11px]">
                              Free Tier
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 text-[#64748B]">
                          {client.current_period_end ? (
                            new Date(client.current_period_end).toLocaleDateString("en-IN")
                          ) : (
                            <span className="text-slate-400">Lifetime Free</span>
                          )}
                        </td>

                        <td className="py-3.5 pr-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setActivatingClient(client);
                                setSelectedPlanId(client.current_plan_id || plans[0]?.id);
                              }}
                              className="px-2.5 py-1 bg-[#172B4D] hover:bg-[#1e3a6e] text-white rounded-lg text-[11px] font-bold transition-colors"
                            >
                              {isSubActive ? "Extend" : "Activate Plan"}
                            </button>

                            {isSubActive && (
                              <button
                                onClick={() => {
                                  adminSuspendSubscription(client.id);
                                  toast.error(`Subscription suspended for ${client.name}`);
                                }}
                                className="px-2 py-1 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-[11px] font-bold"
                              >
                                Suspend
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENT VERIFICATION & APPROVALS */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-sm mb-0.5">Payment Verification &amp; Invoice Center:</strong>
              Clients transfer to <strong>+91 {OFFICIAL_BUSINESS.whatsapp}</strong> (Suraj Prakash) via UPI/NEFT and submit their UTR. Confirm receipt before approving. Once approved, the client receives their purchased listing credits (20 or 50) and an official tax invoice.
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase tracking-wider">
                    <th className="py-3 pl-4">Invoice / UTR Ref</th>
                    <th className="py-3">Client Details</th>
                    <th className="py-3">Plan &amp; Amount</th>
                    <th className="py-3">Method</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Proof &amp; Notes</th>
                    <th className="py-3 pr-4 text-right">Verification &amp; Invoices</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {payments.map((p) => {
                    const isPending = p.status === "pending_verification";
                    const isVerified = p.status === "verified";

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70">
                        <td className="py-3.5 pl-4">
                          <div className="font-mono font-bold text-[#172B4D]">{p.reference_number}</div>
                          <div className="text-[10px] text-[#C6A66B] font-mono font-bold">
                            {p.invoice_number || `INV-LP-${p.id.slice(-6).toUpperCase()}`}
                          </div>
                          <div className="text-[10px] text-[#64748B]">
                            {new Date(p.submitted_at).toLocaleDateString("en-IN")}
                          </div>
                        </td>

                        <td className="py-3.5">
                          <div className="font-bold text-[#172B4D]">{p.client_name}</div>
                          <div className="font-mono text-[11px] text-[#64748B]">+91 {p.client_mobile}</div>
                        </td>

                        <td className="py-3.5">
                          <div className="font-bold text-[#172B4D]">{p.plan_name}</div>
                          <div className="font-extrabold text-emerald-700">₹{p.amount.toLocaleString("en-IN")}</div>
                        </td>

                        <td className="py-3.5 capitalize font-medium text-[#64748B]">
                          {p.payment_method.replace("_", " ")}
                        </td>

                        <td className="py-3.5">
                          {isVerified ? (
                            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[11px] inline-flex items-center gap-1">
                              <Check className="w-3 h-3" /> Verified
                            </span>
                          ) : isPending ? (
                            <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[11px] inline-flex items-center gap-1 animate-pulse">
                              <Clock className="w-3 h-3" /> Pending Verification
                            </span>
                          ) : (
                            <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full text-[11px] inline-flex items-center gap-1">
                              <X className="w-3 h-3" /> Rejected
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 text-[#64748B] max-w-xs">
                          {p.proof_notes || "Direct UTR submission"}
                        </td>

                        <td className="py-3.5 pr-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending && (
                              <>
                                <button
                                  onClick={() => {
                                    adminApprovePayment(p.id, "Verified on bank statement by Suraj Prakash");
                                    toast.success(`Payment verified and credits activated for ${p.client_name}!`);
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Verify &amp; Activate</span>
                                </button>
                                <button
                                  onClick={() => {
                                    adminRejectPayment(p.id, "Reference not verified");
                                    toast.error("Payment rejected");
                                  }}
                                  className="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => setSelectedInvoiceTx(p)}
                              className="px-2 py-1 border border-[#E2E8F0] hover:bg-slate-100 rounded-lg text-xs font-semibold text-[#172B4D] flex items-center gap-1"
                              title="Print / View Invoice"
                            >
                              <FileText className="w-3 h-3 text-[#C6A66B]" />
                              <span>Invoice</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MANAGE PLANS & PRICES */}
      {activeTab === "plans" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-[#172B4D]">{plan.name}</h3>
                    {plan.is_popular && (
                      <span className="text-[10px] font-bold bg-[#C6A66B] text-[#172B4D] px-2.5 py-0.5 rounded-full">
                        Best Value
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#64748B] mb-4 leading-relaxed">{plan.description}</p>

                  <div className="mb-4 pb-4 border-b border-[#E2E8F0]">
                    <div className="text-3xl font-extrabold text-[#172B4D]">
                      ₹{plan.price.toLocaleString("en-IN")}
                      <span className="text-xs font-normal text-[#64748B]">
                        {" "}
                        / {plan.validity_months === 3 ? "3 Months" : "1 Month"}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-emerald-700 mt-1">
                      +{plan.listing_credits} Property Credits Included
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    {plan.features.slice(0, 4).map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#64748B]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingPlan(plan);
                    setEditPrice(plan.price);
                    setEditCredits(plan.listing_credits);
                    setEditValidity(plan.validity_months);
                  }}
                  className="w-full btn-secondary text-xs py-2 flex items-center justify-center gap-1.5 font-bold"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Configure Price, Credits &amp; Validity</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: OFFICIAL BUSINESS & RULES */}
      {activeTab === "policy" && (
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm space-y-6 text-xs text-[#64748B]">
          <div>
            <h2 className="text-base font-bold text-[#172B4D]">Official Business Details</h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Verified credentials for Land Parcel marketplace operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#EAF3FA] rounded-xl border border-blue-200 space-y-1.5">
              <div className="font-bold text-[#172B4D] text-sm">Official Entity &amp; Owner</div>
              <div><strong>Brand Name:</strong> {OFFICIAL_BUSINESS.brand_name}</div>
              <div><strong>Business Owner:</strong> {OFFICIAL_BUSINESS.owner_name}</div>
              <div><strong>Official Email:</strong> {OFFICIAL_BUSINESS.email}</div>
              <div><strong>WhatsApp:</strong> +91 {OFFICIAL_BUSINESS.whatsapp}</div>
              <div><strong>Primary Market:</strong> {OFFICIAL_BUSINESS.primary_market}</div>
              <div><strong>Tagline:</strong> {OFFICIAL_BUSINESS.tagline}</div>
            </div>

            <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2">
              <div className="font-bold text-[#172B4D] text-sm">Subscription Rules &amp; Limits</div>
              <div>• <strong>Free Listing Policy:</strong> All external clients receive 5 lifetime free listing credits. Free credits never reset monthly.</div>
              <div>• <strong>Admin Listings:</strong> Land Parcel Admin gets unlimited free listings permanently (`source = &quot;admin&quot;`).</div>
              <div>• <strong>Credit Separation:</strong> Purchased listing credits (20 for Monthly, 50 for Quarterly) are tracked separately from free credits.</div>
              <div>• <strong>Non-Expiry:</strong> Existing published listings remain visible after subscription expiry.</div>
              <div>• <strong>Strict Verification:</strong> Never mark payments successful without gateway verification or statement confirmation.</div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Activation Modal */}
      {activatingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#172B4D]">
                Manual Subscription Activation
              </h3>
              <button onClick={() => setActivatingClient(null)} className="text-slate-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-[#64748B]">
              Activating subscription for <strong className="text-[#172B4D]">{activatingClient.name}</strong> (+91 {activatingClient.mobile})
            </div>

            <div>
              <label className="label-field text-xs">Select Plan *</label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="input-field text-xs"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (₹{p.price} · {p.listing_credits} Credits / {p.validity_months} Month{p.validity_months > 1 ? "s" : ""})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-field text-xs">Validity Months *</label>
              <select
                value={selectedMonths}
                onChange={(e) => setSelectedMonths(Number(e.target.value))}
                className="input-field text-xs"
              >
                <option value={1}>1 Month (Monthly Plan)</option>
                <option value={3}>3 Months (Quarterly Plan)</option>
                <option value={6}>6 Months</option>
                <option value={12}>12 Months (Annual)</option>
              </select>
            </div>

            <div>
              <label className="label-field text-xs">Admin Notes / Payment Reference</label>
              <input
                type="text"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Received via GPay to 8750442235 / Bank UTR"
                className="input-field text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActivatingClient(null)}
                className="btn-secondary flex-1 py-2 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleManualActivate}
                className="btn-primary flex-1 py-2 text-xs"
              >
                Confirm &amp; Activate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Edit Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <h3 className="font-bold text-base text-[#172B4D]">
              Configure {editingPlan.name}
            </h3>

            <div>
              <label className="label-field text-xs">Price (₹ INR)</label>
              <input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(Number(e.target.value))}
                className="input-field text-xs"
              />
            </div>

            <div>
              <label className="label-field text-xs">Listing Credits</label>
              <input
                type="number"
                value={editCredits}
                onChange={(e) => setEditCredits(Number(e.target.value))}
                className="input-field text-xs"
              />
            </div>

            <div>
              <label className="label-field text-xs">Validity in Months</label>
              <input
                type="number"
                value={editValidity}
                onChange={(e) => setEditValidity(Number(e.target.value))}
                className="input-field text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="btn-secondary flex-1 py-2 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePlan}
                className="btn-primary flex-1 py-2 text-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={!!selectedInvoiceTx}
        onClose={() => setSelectedInvoiceTx(null)}
        transaction={selectedInvoiceTx}
      />
    </div>
  );
}
