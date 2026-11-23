"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  Shield,
  Phone,
  Mail,
  Building,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Plus,
  Edit,
  ExternalLink,
  ChevronRight,
  UserCheck,
  UserX,
  Clock,
  Save,
  MessageSquare,
} from "lucide-react";
import { ClientAccount, CustomerAccountType, Subscription, PaymentTransaction, Property } from "@/types";
import { formatPrice, formatDate, formatDateTime } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<ClientAccount[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [selectedCustomer, setSelectedCustomer] = useState<ClientAccount | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "properties" | "subscriptions" | "notes">("profile");

  // Credit adjustment state
  const [addPaidCredits, setAddPaidCredits] = useState("");
  const [freeCreditsTotal, setFreeCreditsTotal] = useState("");
  const [isAdjustingCredits, setIsAdjustingCredits] = useState(false);

  // Internal note state
  const [newNote, setNewNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [custRes, propRes] = await Promise.all([
        fetch("/api/admin/customers", { cache: "no-store" }),
        fetch("/api/properties", { cache: "no-store" }),
      ]);

      if (custRes.ok) {
        const json = await custRes.json();
        setCustomers(Array.isArray(json.customers) ? json.customers : []);
        setSubscriptions(Array.isArray(json.subscriptions) ? json.subscriptions : []);
      }

      if (propRes.ok) {
        const json = await propRes.json();
        setProperties(Array.isArray(json.properties) ? json.properties : []);
      }
    } catch {
      toast.error("Failed to load customer directory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered customer list
  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      (c.company_name || "").toLowerCase().includes(q);

    const matchesRole = roleFilter === "all" || c.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && c.status !== "suspended") ||
      (statusFilter === "suspended" && c.status === "suspended");

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get customer properties
  const getCustomerProperties = (customer: ClientAccount) => {
    return properties.filter(
      (p) =>
        p.customer_id === customer.id ||
        (p.seller_mobile && p.seller_mobile.includes(customer.mobile.slice(-10)))
    );
  };

  // Get customer subscriptions
  const getCustomerSubscriptions = (customerId: string) => {
    return subscriptions.filter((s) => s.client_id === customerId);
  };

  const handleSelectCustomer = (customer: ClientAccount) => {
    setSelectedCustomer(customer);
    setFreeCreditsTotal(customer.free_credits_total.toString());
    setAddPaidCredits("");
    setNewNote("");
    setActiveTab("profile");
  };

  const handleToggleSuspend = async (customer: ClientAccount) => {
    const isSuspended = customer.status === "suspended";
    const action = isSuspended ? "reactivate_customer" : "suspend_customer";
    const confirmMsg = isSuspended
      ? `Reactivate account for ${customer.name}?`
      : `Suspend account for ${customer.name}? This will prevent them from submitting new listings.`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch("/api/admin/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, customerId: customer.id }),
      });

      if (!res.ok) throw new Error();
      const json = await res.json();
      toast.success(json.message || "Customer status updated");

      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? { ...c, status: isSuspended ? "active" : "suspended" } : c))
      );
      if (selectedCustomer?.id === customer.id) {
        setSelectedCustomer((prev) => (prev ? { ...prev, status: isSuspended ? "active" : "suspended" } : null));
      }
    } catch {
      toast.error("Failed to update account status");
    }
  };

  const handleAdjustCredits = async () => {
    if (!selectedCustomer) return;
    setIsAdjustingCredits(true);

    try {
      const res = await fetch("/api/admin/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "adjust_credits",
          customerId: selectedCustomer.id,
          free_credits_total: freeCreditsTotal ? Number(freeCreditsTotal) : undefined,
          add_paid_credits: addPaidCredits ? Number(addPaidCredits) : 0,
        }),
      });

      if (!res.ok) throw new Error();
      const json = await res.json();
      toast.success(json.message || "Credits adjusted");

      if (json.customer) {
        setCustomers((prev) => prev.map((c) => (c.id === selectedCustomer.id ? json.customer : c)));
        setSelectedCustomer(json.customer);
      }
      setAddPaidCredits("");
    } catch {
      toast.error("Failed to adjust credits");
    } finally {
      setIsAdjustingCredits(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedCustomer || !newNote.trim()) return;
    setIsSavingNote(true);

    try {
      const res = await fetch("/api/admin/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_internal_note",
          customerId: selectedCustomer.id,
          note: newNote.trim(),
        }),
      });

      if (!res.ok) throw new Error();
      const json = await res.json();
      toast.success("Internal note added");

      if (json.customer) {
        setCustomers((prev) => prev.map((c) => (c.id === selectedCustomer.id ? json.customer : c)));
        setSelectedCustomer(json.customer);
      }
      setNewNote("");
    } catch {
      toast.error("Failed to save note");
    } finally {
      setIsSavingNote(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172B4D] font-display">
            Customer Accounts Management
          </h1>
          <p className="text-xs text-[#64748B]">
            Verified directory of property owners, dealers, agents, builders, and developers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#172B4D] text-[#C6A66B]">
            {customers.length} Registered Clients
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-4 border border-[#E2E8F0] flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client name, mobile number, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 py-2 text-xs"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="input-field py-2 text-xs md:w-44"
        >
          <option value="all">All Account Types</option>
          <option value="owner">Property Owner</option>
          <option value="dealer">Dealer</option>
          <option value="agent">Agent / Broker</option>
          <option value="builder">Builder</option>
          <option value="developer">Developer</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field py-2 text-xs md:w-36"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Main Grid: List & Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List (2 Cols) */}
        <div className="lg:col-span-2 card border border-[#E2E8F0] overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-[#64748B]">
              <div className="animate-spin w-8 h-8 border-4 border-[#172B4D] border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-xs">Loading customer directory...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-16 text-center text-[#64748B] space-y-2">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-1" />
              <div className="font-bold text-sm text-[#172B4D]">No Customer Accounts Found</div>
              <p className="text-xs max-w-sm mx-auto">
                {search || roleFilter !== "all" || statusFilter !== "all"
                  ? "Try clearing filters to see all registered customers."
                  : "Customers who register or verify via mobile OTP will appear here automatically."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F7FA] text-[#64748B] border-b border-[#E2E8F0] font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Client Name / Contact</th>
                    <th className="py-3 px-4">Account Type</th>
                    <th className="py-3 px-4">Listing Credits</th>
                    <th className="py-3 px-4">Subscription</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredCustomers.map((c) => {
                    const isSelected = selectedCustomer?.id === c.id;
                    const freeRemaining = Math.max(0, c.free_credits_total - c.free_credits_used);
                    const paidRemaining = Math.max(0, c.paid_credits_total - c.paid_credits_used);
                    const totalRemaining = freeRemaining + paidRemaining;

                    return (
                      <tr
                        key={c.id}
                        onClick={() => handleSelectCustomer(c)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-[#EAF3FA]" : "hover:bg-[#F5F7FA]/70"
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#172B4D]">{c.name}</div>
                          <div className="text-[11px] text-[#64748B] font-mono mt-0.5">
                            +91 {c.mobile}
                          </div>
                          {c.company_name && (
                            <div className="text-[10px] text-slate-500 italic mt-0.5">
                              {c.company_name}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 capitalize">
                          <span className="badge bg-slate-100 text-[#172B4D] text-[10px]">
                            {c.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#172B4D]">
                            {totalRemaining} available
                          </div>
                          <div className="text-[10px] text-[#64748B]">
                            {freeRemaining} free · {paidRemaining} paid
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`badge text-[10px] capitalize ${
                              c.subscription_status === "active"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : c.subscription_status === "expired"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {c.subscription_status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`badge text-[10px] ${
                              c.status === "suspended"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-green-50 text-green-700 border-green-200"
                            }`}
                          >
                            {c.status === "suspended" ? "Suspended" : "Active"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <ChevronRight className="w-4 h-4 text-[#64748B] ml-auto" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Customer Detail Drawer / Panel (1 Col) */}
        <div className="space-y-4">
          {selectedCustomer ? (
            <div className="card p-5 border border-[#E2E8F0] space-y-4">
              {/* Profile Card Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="font-bold text-base text-[#172B4D] font-display">
                    {selectedCustomer.name}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="badge bg-[#172B4D] text-[#C6A66B] text-[10px] capitalize">
                      {selectedCustomer.role}
                    </span>
                    <span
                      className={`badge text-[10px] ${
                        selectedCustomer.status === "suspended"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-green-50 text-green-700 border-green-200"
                      }`}
                    >
                      {selectedCustomer.status === "suspended" ? "Suspended" : "Active"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleSuspend(selectedCustomer)}
                  className={`btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1 ${
                    selectedCustomer.status === "suspended"
                      ? "text-green-700 border-green-300 hover:bg-green-50"
                      : "text-red-600 border-red-300 hover:bg-red-50"
                  }`}
                  title={selectedCustomer.status === "suspended" ? "Reactivate" : "Suspend"}
                >
                  {selectedCustomer.status === "suspended" ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" /> Reactivate
                    </>
                  ) : (
                    <>
                      <UserX className="w-3.5 h-3.5" /> Suspend
                    </>
                  )}
                </button>
              </div>

              {/* Sub-Tabs: Profile / Properties / Subscriptions / Notes */}
              <div className="flex items-center gap-1 border-b border-[#E2E8F0] pb-1 text-xs">
                {[
                  { id: "profile", label: "Profile" },
                  { id: "properties", label: `Properties (${getCustomerProperties(selectedCustomer).length})` },
                  { id: "subscriptions", label: `Plans (${getCustomerSubscriptions(selectedCustomer.id).length})` },
                  { id: "notes", label: `Notes (${(selectedCustomer.internal_notes || []).length})` },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${
                      activeTab === t.id
                        ? "bg-[#172B4D] text-white"
                        : "text-[#64748B] hover:text-[#172B4D] hover:bg-slate-100"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: Profile & Credit Adjuster */}
              {activeTab === "profile" && (
                <div className="space-y-4 text-xs">
                  {/* Contact info */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                    <div className="flex items-center gap-2 text-[#172B4D]">
                      <Phone className="w-3.5 h-3.5 text-[#C6A66B]" />
                      <a href={`tel:${selectedCustomer.mobile}`} className="font-mono font-bold hover:underline">
                        +91 {selectedCustomer.mobile}
                      </a>
                    </div>
                    {selectedCustomer.email && (
                      <div className="flex items-center gap-2 text-[#64748B]">
                        <Mail className="w-3.5 h-3.5 text-[#C6A66B]" />
                        <span>{selectedCustomer.email}</span>
                      </div>
                    )}
                    <div className="text-[11px] text-slate-400 pt-1">
                      Registered: {formatDate(selectedCustomer.created_at)}
                    </div>
                  </div>

                  {/* Credit Breakdown */}
                  <div className="border border-[#E2E8F0] p-3 rounded-xl space-y-2">
                    <div className="font-bold text-[#172B4D] flex items-center justify-between">
                      <span>Listing Credits Status</span>
                      <span className="font-mono text-[#C6A66B]">
                        {Math.max(0, selectedCustomer.free_credits_total - selectedCustomer.free_credits_used) +
                          Math.max(0, selectedCustomer.paid_credits_total - selectedCustomer.paid_credits_used)}{" "}
                        Total
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <div className="text-[#64748B]">Free Credits:</div>
                        <div className="font-bold text-[#172B4D] mt-0.5">
                          {Math.max(0, selectedCustomer.free_credits_total - selectedCustomer.free_credits_used)} / {selectedCustomer.free_credits_total} left
                        </div>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <div className="text-[#64748B]">Paid Credits:</div>
                        <div className="font-bold text-[#172B4D] mt-0.5">
                          {Math.max(0, selectedCustomer.paid_credits_total - selectedCustomer.paid_credits_used)} / {selectedCustomer.paid_credits_total} left
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Adjust Credits Form */}
                  <div className="border border-amber-200 bg-amber-50/20 p-3 rounded-xl space-y-3">
                    <div className="font-bold text-xs text-[#172B4D]">
                      Adjust Listing Credits (Super Admin)
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-[#64748B] block mb-1">Add Paid Credits</label>
                        <input
                          type="number"
                          placeholder="+20"
                          value={addPaidCredits}
                          onChange={(e) => setAddPaidCredits(e.target.value)}
                          className="input-field text-xs py-1.5"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#64748B] block mb-1">Free Credits Quota</label>
                        <input
                          type="number"
                          value={freeCreditsTotal}
                          onChange={(e) => setFreeCreditsTotal(e.target.value)}
                          className="input-field text-xs py-1.5"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAdjustCredits}
                      disabled={isAdjustingCredits}
                      className="btn-primary w-full py-1.5 text-xs justify-center"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Adjusted Credits
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: Properties */}
              {activeTab === "properties" && (
                <div className="space-y-2 text-xs">
                  {getCustomerProperties(selectedCustomer).map((p) => (
                    <div key={p.id} className="p-2.5 rounded-xl border border-[#E2E8F0] space-y-1">
                      <div className="font-bold text-[#172B4D] line-clamp-1">{p.title}</div>
                      <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                        <span>{p.city} · {formatPrice(p.price)}</span>
                        <span className="badge text-[9px] capitalize border">{p.status}</span>
                      </div>
                      <div className="pt-1 flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/properties/${p.id}/edit`}
                          className="text-[11px] font-semibold text-[#172B4D] hover:underline flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" /> Review / Edit
                        </Link>
                      </div>
                    </div>
                  ))}

                  {getCustomerProperties(selectedCustomer).length === 0 && (
                    <div className="py-6 text-center text-[#64748B]">
                      No properties submitted by this customer yet.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Subscriptions */}
              {activeTab === "subscriptions" && (
                <div className="space-y-2 text-xs">
                  {getCustomerSubscriptions(selectedCustomer.id).map((s) => (
                    <div key={s.id} className="p-2.5 rounded-xl border border-[#E2E8F0] space-y-1">
                      <div className="font-bold text-[#172B4D]">{s.plan_name}</div>
                      <div className="text-[11px] text-[#64748B]">
                        Amount: ₹{s.amount} · Credits: +{s.listing_credits}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Valid: {formatDate(s.start_date)} to {formatDate(s.end_date)}
                      </div>
                    </div>
                  ))}

                  {getCustomerSubscriptions(selectedCustomer.id).length === 0 && (
                    <div className="py-6 text-center text-[#64748B]">
                      No subscription purchase history for this customer.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: Internal Notes */}
              {activeTab === "notes" && (
                <div className="space-y-3 text-xs">
                  <div className="space-y-1.5">
                    <textarea
                      rows={2}
                      placeholder="Add confidential internal note regarding this client..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="input-field text-xs resize-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddNote}
                      disabled={isSavingNote || !newNote.trim()}
                      className="btn-primary w-full py-1 text-xs justify-center"
                    >
                      <Plus className="w-3 h-3" /> Add Note
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {(selectedCustomer.internal_notes || []).map((note, idx) => (
                      <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-700">
                        {note}
                      </div>
                    ))}

                    {(!selectedCustomer.internal_notes || selectedCustomer.internal_notes.length === 0) && (
                      <div className="py-4 text-center text-slate-400 text-xs">
                        No internal notes recorded yet.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card p-8 border border-[#E2E8F0] text-center text-[#64748B]">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <div className="font-semibold text-xs text-[#172B4D]">Select a customer</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Click any customer on the left to view profile details, adjust credits, or add internal notes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
