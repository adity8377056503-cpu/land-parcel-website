"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  ArrowUpRight,
  PlusCircle,
  ShieldCheck,
  Phone,
  Mail,
  User,
  ChevronRight,
  FileText,
  Printer,
  LogOut,
  Edit3,
  Loader2,
  X,
  Save,
  BadgeCheck,
} from "lucide-react";
import { useCustomerAuth } from "@/lib/customer-auth";
import CustomerOtpAuthCard from "@/components/auth/CustomerOtpAuthCard";
import SubscriptionModal from "@/components/subscription/SubscriptionModal";
import InvoiceModal from "@/components/subscription/InvoiceModal";
import { formatPrice, formatArea, getStatusColor, getStatusLabel } from "@/lib/utils";
import {
  ClientAccount,
  CustomerAccountType,
  ListingEligibility,
  PaymentTransaction,
  Property,
  SubscriptionPlan,
} from "@/types";
import toast from "react-hot-toast";

export default function CustomerDashboardPage() {
  const { customer: authCustomer, isLoaded: authLoaded, logout, updateProfile, refreshCustomer } =
    useCustomerAuth();

  const [dashboardData, setDashboardData] = useState<{
    customer: ClientAccount;
    eligibility: ListingEligibility;
    properties: Property[];
    payments: PaymentTransaction[];
    plans: SubscriptionPlan[];
  } | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<SubscriptionPlan | null>(null);
  const [selectedInvoiceTx, setSelectedInvoiceTx] = useState<PaymentTransaction | null>(null);

  // Edit Profile Modal
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAccountType, setEditAccountType] = useState<CustomerAccountType>("owner");
  const [editCompany, setEditCompany] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Edit Eligible Property Modal
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [propTitle, setPropTitle] = useState("");
  const [propPrice, setPropPrice] = useState("");
  const [propArea, setPropArea] = useState("");
  const [propLocality, setPropLocality] = useState("");
  const [propCity, setPropCity] = useState("");
  const [propAddress, setPropAddress] = useState("");
  const [propDescription, setPropDescription] = useState("");
  const [savingProperty, setSavingProperty] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoadingDashboard(true);
    try {
      const res = await fetch("/api/customer/dashboard", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.authenticated && json.customer) {
          setDashboardData({
            customer: json.customer,
            eligibility: json.eligibility,
            properties: json.properties || [],
            payments: json.payments || [],
            plans: json.plans || [],
          });
        } else {
          setDashboardData(null);
        }
      } else {
        setDashboardData(null);
      }
    } catch {
      setDashboardData(null);
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  useEffect(() => {
    if (authLoaded && authCustomer) {
      loadDashboard();
    } else if (authLoaded && !authCustomer) {
      setDashboardData(null);
    }
  }, [authLoaded, authCustomer, loadDashboard]);

  const openProfileEditor = () => {
    if (!dashboardData?.customer) return;
    const c = dashboardData.customer;
    setEditName(c.name);
    setEditEmail(c.email || "");
    setEditAccountType(c.role);
    setEditCompany(c.company_name || "");
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        name: editName.trim(),
        email: editEmail.trim(),
        accountType: editAccountType,
        companyName: editCompany.trim(),
      });
      await loadDashboard();
      toast.success("Profile updated successfully.");
      setIsEditingProfile(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const openPropertyEditor = (p: Property) => {
    setEditingProperty(p);
    setPropTitle(p.title);
    setPropPrice(String(p.price));
    setPropArea(String(p.total_area));
    setPropLocality(p.locality || "");
    setPropCity(p.city || "");
    setPropAddress(p.address || "");
    setPropDescription(p.description || "");
  };

  const handleSavePropertyEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;

    setSavingProperty(true);
    try {
      const res = await fetch(`/api/customer/properties/${editingProperty.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: propTitle,
          price: Number(propPrice),
          total_area: Number(propArea),
          locality: propLocality,
          city: propCity,
          address: propAddress,
          description: propDescription,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update property");

      toast.success("Property listing updated!");
      setEditingProperty(null);
      await loadDashboard();
    } catch (err: any) {
      toast.error(err?.message || "Update failed.");
    } finally {
      setSavingProperty(false);
    }
  };

  if (!authLoaded || (authCustomer && loadingDashboard && !dashboardData)) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 text-[#172B4D] animate-spin" />
      </div>
    );
  }

  // Unauthenticated -> Show real Mobile OTP Login / Registration
  if (!authCustomer || !dashboardData) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] pt-28 pb-20 px-4">
        <div className="container-custom max-w-lg mx-auto">
          <CustomerOtpAuthCard
            title="Customer Dashboard Login"
            subtitle="Verify your mobile number via OTP to access your listing credits, subscription plans, payment history, and submitted properties."
            onSuccess={async () => {
              await refreshCustomer();
              await loadDashboard();
            }}
          />
        </div>
      </div>
    );
  }

  const { customer, eligibility, properties: clientProperties, payments: clientPayments, plans } = dashboardData;

  const freeRemaining = eligibility.freeCreditsRemaining;
  const paidRemaining = eligibility.paidCreditsRemaining;
  const isSubActive = eligibility.subscriptionStatus === "active";
  const isSubExpired = eligibility.subscriptionStatus === "expired";
  const isPendingVerification = eligibility.subscriptionStatus === "pending";

  return (
    <div className="min-h-screen bg-[#F5F7FA] pt-24 pb-16">
      <div className="container-custom">
        {/* Customer Profile Header */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E2E8F0] mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#172B4D] text-[#C6A66B] flex items-center justify-center font-bold flex-shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold text-[#172B4D] font-display">{customer.name}</h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#EAF3FA] text-[#172B4D] px-2.5 py-0.5 rounded-full border border-blue-200 capitalize">
                  {customer.role}
                </span>
                {customer.is_mobile_verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                    <BadgeCheck className="w-3 h-3" /> Mobile Verified
                  </span>
                )}
              </div>
              <div className="text-xs text-[#64748B] flex flex-wrap items-center gap-3 mt-1">
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3 text-[#C6A66B]" /> +91 {customer.mobile}
                </span>
                {customer.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#C6A66B]" /> {customer.email}
                  </span>
                )}
                {customer.company_name && <span>· {customer.company_name}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openProfileEditor}
              className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Profile
            </button>
            <button
              onClick={async () => {
                await logout();
                toast.success("Signed out successfully.");
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>

        {/* Quota & Subscription Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* Card 1: Free Lifetime Credits */}
          <div className="bg-white rounded-3xl p-6 shadow-card border border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                1. Free Lifetime Credits
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EAF3FA] text-[#172B4D]">
                {customer.free_credits_total} Lifetime
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-extrabold text-[#172B4D] font-display">
                {customer.free_credits_used}
              </span>
              <span className="text-sm font-semibold text-[#64748B]">
                / {customer.free_credits_total} Used
              </span>
              <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                {freeRemaining} Available
              </span>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  freeRemaining === 0 ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{
                  width: `${Math.min(100, (customer.free_credits_used / Math.max(1, customer.free_credits_total)) * 100)}%`,
                }}
              />
            </div>

            <p className="text-[11px] text-[#64748B] leading-relaxed">
              Every new customer receives 5 free listing credits once for their lifetime. Deducted only when approved &amp; published.
            </p>
          </div>

          {/* Card 2: Active Subscription Plan & Purchased Credits */}
          <div className="bg-white rounded-3xl p-6 shadow-card border border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                2. Subscription Plan
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

            <div className="text-lg font-bold text-[#172B4D] mb-1 line-clamp-1">
              {customer.current_plan_name || "No Purchased Plan"}
            </div>

            {isSubActive ? (
              <div className="space-y-1.5 mb-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-[#172B4D] font-display">
                    {paidRemaining}
                  </span>
                  <span className="text-xs font-semibold text-[#64748B]">
                    / {customer.paid_credits_total} Paid Credits Remaining
                  </span>
                </div>
                <div className="text-[11px] text-[#64748B]">
                  Expiry Date:{" "}
                  <strong className="text-[#172B4D]">
                    {customer.current_period_end
                      ? new Date(customer.current_period_end).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </strong>
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#64748B] mb-3 leading-relaxed">
                {isPendingVerification
                  ? "Payment submitted. Credits activate once verified by Super Admin Aditya Raj."
                  : isSubExpired
                  ? "Your subscription has expired. Existing published listings remain live; renew to submit new properties."
                  : "Monthly Plan (₹599 · 20 credits) or Quarterly Plan (₹999 · 50 credits)."}
              </div>
            )}

            <button
              onClick={() => {
                setSelectedPlanForModal(plans[0] || null);
                setIsSubModalOpen(true);
              }}
              className="w-full btn-secondary text-xs py-2 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C6A66B]" />
              <span>{isSubActive ? "Renew / Buy Additional Plan" : "Purchase Subscription Plan"}</span>
            </button>
          </div>

          {/* Card 3: Quick Actions */}
          <div className="bg-[#172B4D] text-white rounded-3xl p-6 shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#C6A66B] text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Total Available Credits</span>
              </div>
              <div className="text-3xl font-extrabold font-display mb-1">
                {freeRemaining + paidRemaining}{" "}
                <span className="text-sm font-normal text-slate-300">Credits Ready</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{eligibility.reason}</p>
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
                <span>Compare Monthly (₹599) &amp; Quarterly (₹999)</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* My Submitted Properties */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-[#E2E8F0] mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#172B4D] font-display">My Submitted Properties</h2>
              <p className="text-xs text-[#64748B]">
                Track approval status and edit eligible listings (Draft, Pending Review, or Rejected).
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
              <h4 className="text-sm font-bold text-[#172B4D]">No Properties Submitted Yet</h4>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1 mb-4">
                You have {freeRemaining + paidRemaining} listing credit(s) available to submit verified properties across Delhi NCR.
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
                    <th className="pb-3">Approval Status</th>
                    <th className="pb-3 pr-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {clientProperties.map((p) => {
                    const isPublished = p.status === "published";
                    const canEdit = ["draft", "pending", "rejected"].includes(p.status);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 pl-2">
                          <div className="font-bold text-[#172B4D] line-clamp-1">{p.title}</div>
                          <div className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
                            <span className="font-mono text-[#172B4D] font-semibold">{p.listing_id}</span>
                            <span>
                              · {p.locality}, {p.city}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 capitalize text-[#64748B]">{p.category.replace("-", " ")}</td>
                        <td className="py-3.5 font-semibold text-[#172B4D]">{formatPrice(p.price)}</td>
                        <td className="py-3.5 text-[#64748B]">{formatArea(p.total_area, p.area_unit)}</td>
                        <td className="py-3.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${getStatusColor(
                              p.status
                            )}`}
                          >
                            {getStatusLabel(p.status)}
                          </span>
                        </td>
                        <td className="py-3.5 pr-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {canEdit && (
                              <button
                                onClick={() => openPropertyEditor(p)}
                                className="px-2.5 py-1 rounded-lg bg-[#EAF3FA] text-[#172B4D] hover:bg-[#172B4D] hover:text-white font-semibold transition-colors inline-flex items-center gap-1"
                              >
                                <Edit3 className="w-3 h-3" /> Edit
                              </button>
                            )}
                            {isPublished && (
                              <Link
                                href={`/properties/${p.slug}`}
                                target="_blank"
                                className="text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1"
                              >
                                <span>View Live</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </Link>
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

        {/* Payment History & Verification Status */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-[#E2E8F0]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-[#172B4D] font-display">
                Payment History &amp; Verification Status
              </h2>
              <p className="text-xs text-[#64748B]">
                Every subscription payment submitted by your account and its current verification status.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedPlanForModal(plans[1] || plans[0] || null);
                setIsSubModalOpen(true);
              }}
              className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C6A66B]" /> Buy Plan
            </button>
          </div>

          {clientPayments.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#64748B] border-2 border-dashed border-[#E2E8F0] rounded-2xl">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-[#172B4D]">No Subscription Payments Recorded Yet</p>
              <p className="mt-1">
                Start with your 5 lifetime free listing credits or purchase a Monthly (₹599) / Quarterly (₹999) plan anytime.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Date &amp; Invoice</th>
                    <th className="pb-3">Plan</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Reference / UTR</th>
                    <th className="pb-3">Verification Status</th>
                    <th className="pb-3 pr-2 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {clientPayments.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70">
                      <td className="py-3 pl-2">
                        <div className="font-bold text-[#172B4D] font-mono">
                          {tx.invoice_number || tx.transaction_id}
                        </div>
                        <div className="text-[11px] text-[#64748B]">
                          {new Date(tx.submitted_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                      <td className="py-3 font-semibold text-[#172B4D]">{tx.plan_name}</td>
                      <td className="py-3 font-bold text-[#172B4D]">₹{tx.amount.toLocaleString("en-IN")}</td>
                      <td className="py-3 font-mono text-[#64748B]">{tx.reference_number}</td>
                      <td className="py-3">
                        {tx.status === "verified" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                            <CheckCircle2 className="w-3 h-3" /> Verified &amp; Active
                          </span>
                        ) : tx.status === "pending_verification" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                            <Clock className="w-3 h-3" /> Pending Admin Verification
                          </span>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px]">
                              <XCircle className="w-3 h-3" /> Rejected
                            </span>
                            {tx.admin_notes && (
                              <div className="text-[10px] text-rose-600 mt-0.5">{tx.admin_notes}</div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 pr-2 text-right">
                        <button
                          onClick={() => setSelectedInvoiceTx(tx)}
                          className="text-[#172B4D] hover:text-[#C6A66B] font-bold inline-flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" /> Invoice
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

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-4">
              <h3 className="text-base font-bold text-[#172B4D] font-display">Update Profile Details</h3>
              <button onClick={() => setIsEditingProfile(false)} className="text-slate-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="label-field">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="label-field">Email Address (Optional)</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="label-field">Account Type</label>
                <select
                  value={editAccountType}
                  onChange={(e) => setEditAccountType(e.target.value as CustomerAccountType)}
                  className="input-field text-sm"
                >
                  <option value="owner">Property Owner</option>
                  <option value="dealer">Dealer</option>
                  <option value="agent">Agent / Broker</option>
                  <option value="builder">Builder</option>
                  <option value="developer">Developer</option>
                </select>
              </div>
              <div>
                <label className="label-field">Company / Agency Name (Optional)</label>
                <input
                  type="text"
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  className="input-field text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5"
                >
                  {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Eligible Property Modal */}
      {editingProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-4">
              <div>
                <h3 className="text-base font-bold text-[#172B4D] font-display">Edit Property Listing</h3>
                <p className="text-[11px] text-[#64748B] font-mono">{editingProperty.listing_id}</p>
              </div>
              <button onClick={() => setEditingProperty(null)} className="text-slate-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSavePropertyEdit} className="space-y-3.5">
              <div>
                <label className="label-field">Property Title *</label>
                <input
                  type="text"
                  required
                  value={propTitle}
                  onChange={(e) => setPropTitle(e.target.value)}
                  className="input-field text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-field">Expected Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={propPrice}
                    onChange={(e) => setPropPrice(e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="label-field">Total Area ({editingProperty.area_unit}) *</label>
                  <input
                    type="number"
                    required
                    value={propArea}
                    onChange={(e) => setPropArea(e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-field">Locality</label>
                  <input
                    type="text"
                    value={propLocality}
                    onChange={(e) => setPropLocality(e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="label-field">City</label>
                  <input
                    type="text"
                    value={propCity}
                    onChange={(e) => setPropCity(e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="label-field">Full Address</label>
                <input
                  type="text"
                  value={propAddress}
                  onChange={(e) => setPropAddress(e.target.value)}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="label-field">Description</label>
                <textarea
                  rows={3}
                  value={propDescription}
                  onChange={(e) => setPropDescription(e.target.value)}
                  className="input-field text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProperty(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProperty}
                  className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5"
                >
                  {savingProperty ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  Save Listing Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscription Purchase Modal */}
      <SubscriptionModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        selectedPlan={selectedPlanForModal}
        client={customer}
        onSuccess={loadDashboard}
      />

      {/* Printable Invoice Modal */}
      <InvoiceModal
        isOpen={Boolean(selectedInvoiceTx)}
        onClose={() => setSelectedInvoiceTx(null)}
        transaction={selectedInvoiceTx}
      />
    </div>
  );
}
