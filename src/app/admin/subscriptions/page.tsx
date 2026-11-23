"use client";

import { useState } from "react";
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  Search,
  Crown,
  Edit2,
  X,
  IndianRupee,
  FileText,
  Sliders,
  Ban,
  Check,
  RefreshCw,
} from "lucide-react";
import { useSubscriptionStore } from "@/lib/subscription-store";
import { useAdminAuth } from "@/lib/admin-auth";
import { ClientAccount, SubscriptionPlan, PaymentTransaction, UserRole } from "@/types";
import InvoiceModal from "@/components/subscription/InvoiceModal";
import toast from "react-hot-toast";

export default function AdminSubscriptionsPage() {
  const {
    clients,
    plans,
    payments,
    refresh,
    adminApprovePayment,
    adminRejectPayment,
    adminManualActivate,
    adminDeactivateSubscription,
    adminAdjustCredits,
    adminChangeRole,
    adminUpdatePlan,
  } = useSubscriptionStore({ adminMode: true });

  const { adminUser, isSuperAdmin } = useAdminAuth();

  const [activeTab, setActiveTab] = useState<"clients" | "payments" | "plans">("clients");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Invoice Modal
  const [selectedInvoiceTx, setSelectedInvoiceTx] = useState<PaymentTransaction | null>(null);

  // Manual Activation Modal
  const [activatingClient, setActivatingClient] = useState<ClientAccount | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || "plan-monthly-599");
  const [selectedMonths, setSelectedMonths] = useState<number>(1);
  const [creditsOverride, setCreditsOverride] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState("");

  // Credit Adjustment Modal
  const [adjustingClient, setAdjustingClient] = useState<ClientAccount | null>(null);
  const [adjFreeTotal, setAdjFreeTotal] = useState<number>(5);
  const [adjPaidTotal, setAdjPaidTotal] = useState<number>(0);

  // Plan Editor Modal
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [editPrice, setEditPrice] = useState<number>(599);
  const [editCredits, setEditCredits] = useState<number>(20);
  const [editValidity, setEditValidity] = useState<number>(1);

  // Reject Payment Modal
  const [rejectingTx, setRejectingTx] = useState<PaymentTransaction | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobile.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
        : c.subscription_status === "none" || c.subscription_status === "cancelled";

    return matchesSearch && matchesStatus;
  });

  const pendingPayments = payments.filter((p) => p.status === "pending_verification");
  const verifiedPayments = payments.filter((p) => p.status === "verified");
  const activeSubsCount = clients.filter((c) => c.subscription_status === "active").length;
  const expiredSubsCount = clients.filter((c) => c.subscription_status === "expired").length;
  const totalVerifiedRevenue = verifiedPayments.reduce((acc, curr) => acc + curr.amount, 0);

  const handleManualActivate = async () => {
    if (!activatingClient) return;
    try {
      await adminManualActivate(
        activatingClient.id,
        selectedPlanId,
        selectedMonths,
        adminNotes,
        creditsOverride !== "" ? Number(creditsOverride) : undefined
      );
      toast.success(`Subscription activated for ${activatingClient.name}!`);
      setActivatingClient(null);
      setAdminNotes("");
      setCreditsOverride("");
    } catch (err: any) {
      toast.error(err?.message || "Activation failed");
    }
  };

  const handleDeactivate = async (client: ClientAccount) => {
    try {
      await adminDeactivateSubscription(client.id);
      toast.success(`Subscription deactivated for ${client.name}. Published properties remain live.`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to deactivate subscription");
    }
  };

  const handleSaveCredits = async () => {
    if (!adjustingClient) return;
    try {
      await adminAdjustCredits(adjustingClient.id, {
        free_credits_total: adjFreeTotal,
        paid_credits_total: adjPaidTotal,
      });
      toast.success(`Listing credits updated for ${adjustingClient.name}!`);
      setAdjustingClient(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to adjust credits");
    }
  };

  const handleRoleChange = async (client: ClientAccount, role: UserRole) => {
    try {
      await adminChangeRole(client.id, role);
      toast.success(`Updated system role for ${client.name} to ${role}.`);
    } catch (err: any) {
      toast.error(err?.message || "Role change failed");
    }
  };

  const handleApproveTx = async (tx: PaymentTransaction) => {
    try {
      await adminApprovePayment(tx.id, `Verified manually by ${adminUser?.name || "Aditya Raj"}`);
      toast.success(`Payment verified & subscription activated for ${tx.client_name}!`);
    } catch (err: any) {
      toast.error(err?.message || "Approval failed");
    }
  };

  const handleConfirmRejectTx = async () => {
    if (!rejectingTx) return;
    try {
      await adminRejectPayment(
        rejectingTx.id,
        rejectReason.trim() || "Payment reference could not be verified."
      );
      toast.success("Transaction rejected. No credits were added.");
      setRejectingTx(null);
      setRejectReason("");
    } catch (err: any) {
      toast.error(err?.message || "Rejection failed");
    }
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;
    try {
      await adminUpdatePlan(editingPlan.id, {
        price: editPrice,
        listing_credits: editCredits,
        validity_months: editValidity,
      });
      toast.success(`${editingPlan.name} updated successfully!`);
      setEditingPlan(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update plan");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#172B4D] font-display">
              Customers, Roles &amp; Subscription Management
            </h1>
            <span className="bg-[#172B4D] text-[#C6A66B] text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <Crown className="w-3 h-3" /> Super Admin: {adminUser?.name || "Aditya Raj"}
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Verify customer payments, activate or deactivate plans, adjust listing credits, manage roles, and configure pricing.
          </p>
        </div>

        <button
          onClick={() => refresh()}
          className="btn-secondary text-xs py-2 px-3.5 bg-white flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Live Data
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-1 font-semibold">
            <span>Registered Customers</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-[#172B4D] font-display">{clients.length}</div>
          <div className="text-[11px] text-[#64748B] mt-1">Verified real accounts only</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-1 font-semibold">
            <span>Active / Expired Plans</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-display">{activeSubsCount}</div>
          <div className="text-[11px] text-[#64748B] mt-1">{expiredSubsCount} expired subscriptions</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-1 font-semibold">
            <span>Pending Payments</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600 font-display">{pendingPayments.length}</div>
          <div className="text-[11px] text-amber-700 mt-1 font-semibold">
            {pendingPayments.length > 0 ? "Requires Super Admin Verification" : "All cleared"}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-1 font-semibold">
            <span>Verified Revenue</span>
            <IndianRupee className="w-4 h-4 text-[#C6A66B]" />
          </div>
          <div className="text-2xl font-bold text-[#172B4D] font-display">
            ₹{totalVerifiedRevenue.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {verifiedPayments.length} verified transaction(s)
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E2E8F0] gap-4">
        <button
          onClick={() => setActiveTab("clients")}
          className={`pb-3 px-2 text-xs font-bold transition-all ${
            activeTab === "clients"
              ? "text-[#172B4D] border-b-2 border-[#172B4D]"
              : "text-[#64748B] hover:text-[#172B4D]"
          }`}
        >
          Customer Accounts &amp; Roles ({clients.length})
        </button>

        <button
          onClick={() => setActiveTab("payments")}
          className={`pb-3 px-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "payments"
              ? "text-[#172B4D] border-b-2 border-[#172B4D]"
              : "text-[#64748B] hover:text-[#172B4D]"
          }`}
        >
          <span>Payment Verification &amp; History ({payments.length})</span>
          {pendingPayments.length > 0 && (
            <span className="bg-amber-400 text-[#172B4D] text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {pendingPayments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("plans")}
          className={`pb-3 px-2 text-xs font-bold transition-all ${
            activeTab === "plans"
              ? "text-[#172B4D] border-b-2 border-[#172B4D]"
              : "text-[#64748B] hover:text-[#172B4D]"
          }`}
        >
          Subscription Plans &amp; Pricing ({plans.length})
        </button>
      </div>

      {/* TAB 1: CUSTOMER ACCOUNTS & ROLES */}
      {activeTab === "clients" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E2E8F0]">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search customer name, mobile, email..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#E2E8F0] focus:outline-none focus:border-[#172B4D]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-[#64748B] font-semibold">Subscription:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-2.5 py-1.5 text-[#172B4D] font-semibold"
              >
                <option value="all">All Customers</option>
                <option value="active">Active</option>
                <option value="pending">Pending Verification</option>
                <option value="expired">Expired</option>
                <option value="none">Free Tier / Inactive</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
            {filteredClients.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-[#172B4D]">No Registered Customers Yet</h3>
                <p className="text-xs text-[#64748B] max-w-md mx-auto mt-1">
                  Real customer accounts registered via Mobile OTP will appear here with their listing credits, role, and subscription details.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase tracking-wider">
                      <th className="py-3 pl-4">Customer &amp; Account Type</th>
                      <th className="py-3">Mobile &amp; Email</th>
                      <th className="py-3">System Role</th>
                      <th className="py-3">Free Credits</th>
                      <th className="py-3">Paid Credits</th>
                      <th className="py-3">Subscription &amp; Expiry</th>
                      <th className="py-3 pr-4 text-right">Super Admin Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {filteredClients.map((client) => {
                      const freeRem = Math.max(0, client.free_credits_total - client.free_credits_used);
                      const paidRem = Math.max(0, client.paid_credits_total - client.paid_credits_used);
                      const isActive = client.subscription_status === "active";

                      return (
                        <tr key={client.id} className="hover:bg-slate-50/70">
                          <td className="py-3.5 pl-4">
                            <div className="font-bold text-[#172B4D]">{client.name}</div>
                            <div className="text-[11px] text-[#64748B] capitalize mt-0.5 flex items-center gap-1.5">
                              <span className="bg-[#EAF3FA] text-[#172B4D] px-1.5 py-0.5 rounded font-semibold text-[10px]">
                                {client.role}
                              </span>
                              {client.company_name && <span>{client.company_name}</span>}
                            </div>
                          </td>

                          <td className="py-3.5">
                            <div className="font-mono font-semibold text-[#172B4D]">+91 {client.mobile}</div>
                            {client.email && <div className="text-[11px] text-[#64748B]">{client.email}</div>}
                          </td>

                          <td className="py-3.5">
                            {isSuperAdmin ? (
                              <select
                                value={client.system_role || "customer"}
                                onChange={(e) => handleRoleChange(client, e.target.value as UserRole)}
                                className="text-[11px] font-bold bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2 py-1 text-[#172B4D]"
                              >
                                <option value="customer">Customer</option>
                                <option value="admin">Admin</option>
                                <option value="super_admin">Super Admin</option>
                              </select>
                            ) : (
                              <span className="capitalize font-semibold">{client.system_role || "customer"}</span>
                            )}
                          </td>

                          <td className="py-3.5">
                            <div className="font-bold text-[#172B4D]">
                              {client.free_credits_used} / {client.free_credits_total}
                            </div>
                            <span className="text-[10px] text-emerald-700 font-semibold">{freeRem} left</span>
                          </td>

                          <td className="py-3.5">
                            <div className="font-bold text-[#172B4D]">
                              {client.paid_credits_used} / {client.paid_credits_total}
                            </div>
                            <span className="text-[10px] text-blue-700 font-semibold">{paidRem} left</span>
                          </td>

                          <td className="py-3.5">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                                isActive
                                  ? "bg-emerald-100 text-emerald-800"
                                  : client.subscription_status === "pending"
                                  ? "bg-amber-100 text-amber-800"
                                  : client.subscription_status === "expired"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {client.subscription_status}
                            </span>
                            {client.current_period_end && (
                              <div className="text-[10px] text-[#64748B] mt-0.5">
                                Exp:{" "}
                                {new Date(client.current_period_end).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 pr-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setAdjustingClient(client);
                                  setAdjFreeTotal(client.free_credits_total);
                                  setAdjPaidTotal(client.paid_credits_total);
                                }}
                                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#172B4D] font-semibold inline-flex items-center gap-1"
                                title="Adjust Listing Credits"
                              >
                                <Sliders className="w-3 h-3" /> Credits
                              </button>
                              <button
                                onClick={() => {
                                  setActivatingClient(client);
                                  setSelectedPlanId(plans[0]?.id || "plan-monthly-599");
                                  setSelectedMonths(plans[0]?.validity_months || 1);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#172B4D] hover:bg-[#1e3a6e] text-white font-semibold"
                              >
                                Activate
                              </button>
                              {isActive && (
                                <button
                                  onClick={() => handleDeactivate(client)}
                                  className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold inline-flex items-center gap-1"
                                  title="Deactivate Subscription"
                                >
                                  <Ban className="w-3 h-3" /> Stop
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
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENT VERIFICATIONS & HISTORY */}
      {activeTab === "payments" && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
          {payments.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[#172B4D]">No Payment Transactions Yet</h3>
              <p className="text-xs text-[#64748B] max-w-md mx-auto mt-1">
                When customers purchase Monthly (₹599) or Quarterly (₹999) plans and submit their UTR/reference number, they will appear here for your manual verification.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase tracking-wider">
                    <th className="py-3 pl-4">Customer &amp; Date</th>
                    <th className="py-3">Plan &amp; Amount</th>
                    <th className="py-3">Method &amp; UTR / Ref</th>
                    <th className="py-3">Status</th>
                    <th className="py-3 pr-4 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {payments.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 pl-4">
                        <div className="font-bold text-[#172B4D]">{tx.client_name}</div>
                        <div className="text-[11px] text-[#64748B] font-mono">+91 {tx.client_mobile}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(tx.submitted_at).toLocaleString("en-IN")}
                        </div>
                      </td>
                      <td className="py-3.5">
                        <div className="font-bold text-[#172B4D]">₹{tx.amount.toLocaleString("en-IN")}</div>
                        <div className="text-[11px] text-[#64748B]">{tx.plan_name}</div>
                      </td>
                      <td className="py-3.5">
                        <div className="font-mono font-bold text-[#172B4D]">{tx.reference_number}</div>
                        <div className="text-[10px] text-[#64748B] uppercase">
                          {tx.payment_method.replace(/_/g, " ")}
                        </div>
                        {tx.proof_notes && (
                          <div className="text-[10px] text-slate-500 italic mt-0.5 max-w-xs">{tx.proof_notes}</div>
                        )}
                      </td>
                      <td className="py-3.5">
                        {tx.status === "verified" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        ) : tx.status === "pending_verification" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                            <Clock className="w-3 h-3" /> Pending Review
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                            <XCircle className="w-3 h-3" /> Rejected
                          </span>
                        )}
                        {tx.verified_by && (
                          <div className="text-[10px] text-slate-400 mt-0.5">By: {tx.verified_by}</div>
                        )}
                      </td>
                      <td className="py-3.5 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {tx.status === "pending_verification" && (
                            <>
                              <button
                                onClick={() => handleApproveTx(tx)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold inline-flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" /> Verify &amp; Activate
                              </button>
                              <button
                                onClick={() => setRejectingTx(tx)}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setSelectedInvoiceTx(tx)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#172B4D] font-semibold"
                          >
                            Invoice
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MANAGE PLANS & PRICING */}
      {activeTab === "plans" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#172B4D] font-display">{plan.name}</h3>
                  <p className="text-xs text-[#64748B] mt-0.5">{plan.description}</p>
                </div>
                <button
                  onClick={() => {
                    setEditingPlan(plan);
                    setEditPrice(plan.price);
                    setEditCredits(plan.listing_credits);
                    setEditValidity(plan.validity_months);
                  }}
                  className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Plan
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
                <div>
                  <div className="text-[10px] font-bold uppercase text-[#64748B]">Price</div>
                  <div className="text-lg font-extrabold text-[#172B4D]">₹{plan.price}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-[#64748B]">Credits</div>
                  <div className="text-lg font-extrabold text-emerald-700">{plan.listing_credits}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-[#64748B]">Validity</div>
                  <div className="text-lg font-extrabold text-[#172B4D]">{plan.validity_months} mo</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manual Activate Subscription Modal */}
      {activatingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#172B4D]">Activate Subscription — {activatingClient.name}</h3>
              <button onClick={() => setActivatingClient(null)} className="text-slate-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="label-field">Select Plan</label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => {
                    const p = plans.find((x) => x.id === e.target.value);
                    setSelectedPlanId(e.target.value);
                    if (p) setSelectedMonths(p.validity_months);
                  }}
                  className="input-field text-xs"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{p.price} ({p.listing_credits} credits / {p.validity_months} mo)
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-field">Validity (Months)</label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={selectedMonths}
                    onChange={(e) => setSelectedMonths(Number(e.target.value))}
                    className="input-field text-xs"
                  />
                </div>
                <div>
                  <label className="label-field">Credits Override (Optional)</label>
                  <input
                    type="number"
                    min={1}
                    value={creditsOverride}
                    onChange={(e) => setCreditsOverride(e.target.value)}
                    placeholder="Plan default"
                    className="input-field text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="label-field">Verification Notes</label>
                <input
                  type="text"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Cash / UPI verified by Aditya Raj"
                  className="input-field text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setActivatingClient(null)} className="px-4 py-2 text-xs font-semibold text-[#64748B]">
                Cancel
              </button>
              <button onClick={handleManualActivate} className="btn-primary text-xs py-2 px-5">
                Confirm &amp; Activate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Credits Modal */}
      {adjustingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#172B4D]">Adjust Listing Credits — {adjustingClient.name}</h3>
              <button onClick={() => setAdjustingClient(null)} className="text-slate-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="label-field">Free Credits Total</label>
                <input
                  type="number"
                  min={0}
                  value={adjFreeTotal}
                  onChange={(e) => setAdjFreeTotal(Number(e.target.value))}
                  className="input-field text-xs"
                />
                <span className="text-[10px] text-[#64748B]">Used: {adjustingClient.free_credits_used}</span>
              </div>
              <div>
                <label className="label-field">Paid Credits Total</label>
                <input
                  type="number"
                  min={0}
                  value={adjPaidTotal}
                  onChange={(e) => setAdjPaidTotal(Number(e.target.value))}
                  className="input-field text-xs"
                />
                <span className="text-[10px] text-[#64748B]">Used: {adjustingClient.paid_credits_used}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setAdjustingClient(null)} className="px-4 py-2 text-xs font-semibold text-[#64748B]">
                Cancel
              </button>
              <button onClick={handleSaveCredits} className="btn-primary text-xs py-2 px-5">
                Save Credit Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Payment Modal */}
      {rejectingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-rose-700">Reject Payment Transaction</h3>
              <button onClick={() => setRejectingTx(null)} className="text-slate-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs space-y-2">
              <p className="text-[#64748B]">
                Rejecting payment <strong className="font-mono text-[#172B4D]">{rejectingTx.reference_number}</strong>{" "}
                for <strong>{rejectingTx.client_name}</strong>. No credits will be added.
              </p>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for rejection (shown to customer)"
                className="input-field text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setRejectingTx(null)} className="px-4 py-2 text-xs font-semibold text-[#64748B]">
                Cancel
              </button>
              <button
                onClick={handleConfirmRejectTx}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#172B4D]">Edit {editingPlan.name}</h3>
              <button onClick={() => setEditingPlan(null)} className="text-slate-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="label-field">Price (₹ INR)</label>
                <input
                  type="number"
                  min={1}
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="input-field text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-field">Listing Credits</label>
                  <input
                    type="number"
                    min={1}
                    value={editCredits}
                    onChange={(e) => setEditCredits(Number(e.target.value))}
                    className="input-field text-xs"
                  />
                </div>
                <div>
                  <label className="label-field">Validity (Months)</label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={editValidity}
                    onChange={(e) => setEditValidity(Number(e.target.value))}
                    className="input-field text-xs"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingPlan(null)} className="px-4 py-2 text-xs font-semibold text-[#64748B]">
                Cancel
              </button>
              <button onClick={handleSavePlan} className="btn-primary text-xs py-2 px-5">
                Save Plan Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Viewer */}
      <InvoiceModal
        isOpen={Boolean(selectedInvoiceTx)}
        onClose={() => setSelectedInvoiceTx(null)}
        transaction={selectedInvoiceTx}
      />
    </div>
  );
}
