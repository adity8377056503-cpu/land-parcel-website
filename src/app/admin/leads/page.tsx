"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Download,
  Phone,
  Mail,
  MessageSquare,
  Users,
  Loader2,
  Calendar,
  Clock,
  ExternalLink,
  Plus,
  Save,
  CheckCircle,
} from "lucide-react";
import { Enquiry } from "@/types";
import { getStatusColor, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

type LeadStatus =
  | "new"
  | "contacted"
  | "interested"
  | "follow-up"
  | "site-visit-scheduled"
  | "negotiation"
  | "converted"
  | "closed"
  | "not-interested";

const STATUS_OPTIONS: { label: string; value: LeadStatus }[] = [
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Interested", value: "interested" },
  { label: "Follow-up", value: "follow-up" },
  { label: "Site Visit Scheduled", value: "site-visit-scheduled" },
  { label: "Negotiation", value: "negotiation" },
  { label: "Converted", value: "converted" },
  { label: "Closed", value: "closed" },
  { label: "Not Interested", value: "not-interested" },
];

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<(Enquiry & { notes_list?: string[]; follow_up_date?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [activeNoteLead, setActiveNoteLead] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");
  const [followUpDateInput, setFollowUpDateInput] = useState("");

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/leads", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setLeads(Array.isArray(json.leads) ? json.leads : []);
      }
    } catch {
      toast.error("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    const matchesSearch =
      l.name.toLowerCase().includes(q) ||
      l.mobile.includes(q) ||
      l.lead_id.toLowerCase().includes(q) ||
      (l.property_title || "").toLowerCase().includes(q);
    const matchesStatus = selectedStatus === "all" || l.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (id: string, status: LeadStatus) => {
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error();
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
      toast.success("Lead status updated");
    } catch {
      toast.error("Failed to update lead status");
    }
  };

  const updateFollowUpDate = async (id: string, date: string) => {
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, follow_up_date: date }),
      });
      if (!res.ok) throw new Error();
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, follow_up_date: date } : l)));
      toast.success("Follow-up date scheduled");
    } catch {
      toast.error("Failed to update follow-up date");
    }
  };

  const addNote = async (id: string) => {
    if (!newNote.trim()) return;
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, addNote: newNote.trim() }),
      });
      if (!res.ok) throw new Error();
      setLeads((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, notes_list: [...(l.notes_list || []), newNote.trim()] } : l
        )
      );
      setNewNote("");
      toast.success("Internal note saved");
    } catch {
      toast.error("Failed to save note");
    }
  };

  const exportCSV = () => {
    const headers = [
      "Lead ID",
      "Customer Name",
      "Mobile",
      "Email",
      "Buyer Type",
      "Status",
      "Follow-up Date",
      "Property Title",
      "Message",
      "Submission Date",
    ];

    const rows = filtered.map((l) => [
      l.lead_id,
      `"${l.name}"`,
      l.mobile,
      l.email || "",
      l.buyer_type,
      l.status,
      l.follow_up_date || "",
      `"${(l.property_title || "").replace(/"/g, '""')}"`,
      `"${(l.message || "").replace(/"/g, '""')}"`,
      formatDate(l.created_at),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `land_parcel_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Leads exported to CSV");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172B4D] font-display">
            Buyer Enquiries &amp; Leads Management
          </h1>
          <p className="text-xs text-[#64748B]">
            Capture buyer leads from property pages, track follow-up dates, and chat via WhatsApp.
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={filtered.length === 0}
          className="btn-secondary text-xs py-2.5 px-4 bg-white flex items-center gap-2 disabled:opacity-50 shadow-sm"
        >
          <Download className="w-4 h-4 text-[#C6A66B]" /> Export Leads (CSV)
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 border border-[#E2E8F0] flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Lead ID, Customer Name, Mobile or Property..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 py-2 text-xs"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="input-field py-2 text-xs md:w-56"
        >
          <option value="all">All Follow-up Statuses</option>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Leads Table */}
      <div className="card border border-[#E2E8F0] overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-[#64748B]">
            <Loader2 className="w-8 h-8 animate-spin text-[#172B4D] mx-auto mb-2" />
            <p className="text-xs">Loading buyer leads...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-sm text-[#172B4D]">No Buyer Leads Found</h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              Real customer enquiries submitted via property listings and contact forms will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7FA] text-[#64748B] border-b border-[#E2E8F0] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Lead ID / Date</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Interested Property</th>
                  <th className="py-3 px-4">Status &amp; Follow-up</th>
                  <th className="py-3 px-4 text-right">Connect &amp; Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filtered.map((lead) => {
                  const whatsappMessage = encodeURIComponent(
                    `Hello ${lead.name}, thank you for your interest in ${lead.property_title || "Land Parcel properties"}. I am Aditya Raj from Land Parcel. How may I assist you with site visit and pricing details?`
                  );
                  const whatsappLink = `https://wa.me/91${lead.mobile.replace(/[^0-9]/g, "")}?text=${whatsappMessage}`;

                  return (
                    <tr key={lead.id} className="hover:bg-[#F5F7FA]/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-xs text-[#172B4D]">{lead.lead_id}</span>
                        <div className="text-[11px] text-[#64748B] mt-0.5">{formatDate(lead.created_at)}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#172B4D]">{lead.name}</div>
                        <div className="flex items-center gap-2 text-[11px] text-[#64748B] mt-1 font-mono">
                          <Phone className="w-3 h-3 text-[#C6A66B]" />
                          <a href={`tel:${lead.mobile}`} className="hover:underline">
                            +91 {lead.mobile}
                          </a>
                        </div>
                        {lead.email && (
                          <div className="flex items-center gap-2 text-[11px] text-[#64748B] mt-0.5">
                            <Mail className="w-3 h-3 text-[#C6A66B]" />
                            <span>{lead.email}</span>
                          </div>
                        )}
                        <span className="badge bg-slate-100 text-[#172B4D] text-[9px] mt-1 capitalize inline-block">
                          {lead.buyer_type}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-[#172B4D] line-clamp-1">
                          {lead.property_title || "General Platform Inquiry"}
                        </div>
                        {lead.message && (
                          <div className="text-[11px] text-[#64748B] line-clamp-2 mt-0.5 italic">
                            &quot;{lead.message}&quot;
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={lead.status}
                          onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                          className={`text-[11px] font-semibold py-1 px-2 rounded-lg border uppercase tracking-wider ${getStatusColor(
                            lead.status
                          )}`}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>

                        {/* Follow-up date picker */}
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <input
                            type="date"
                            defaultValue={lead.follow_up_date || ""}
                            onBlur={(e) => {
                              if (e.target.value !== (lead.follow_up_date || "")) {
                                updateFollowUpDate(lead.id, e.target.value);
                              }
                            }}
                            className="text-[10px] py-0.5 px-1.5 border border-slate-200 rounded text-slate-600 bg-white"
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Direct WhatsApp Chat */}
                          <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg inline-flex items-center gap-1 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-3 h-3" /> WhatsApp
                          </a>

                          {/* Direct Phone Call */}
                          <a
                            href={`tel:${lead.mobile}`}
                            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Call Customer"
                          >
                            <Phone className="w-3 h-3" />
                          </a>

                          {/* Toggle Note Drawer */}
                          <button
                            type="button"
                            onClick={() =>
                              setActiveNoteLead(activeNoteLead === lead.id ? null : lead.id)
                            }
                            className="p-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            title="Internal Notes"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Notes Section Accordion */}
                        {activeNoteLead === lead.id && (
                          <div className="mt-2 text-left bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-2">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                placeholder="Add follow-up note..."
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                className="input-field text-xs py-1 flex-1"
                              />
                              <button
                                type="button"
                                onClick={() => addNote(lead.id)}
                                className="btn-primary text-xs py-1 px-2.5"
                              >
                                Save
                              </button>
                            </div>

                            {lead.notes_list && lead.notes_list.length > 0 && (
                              <div className="space-y-1 max-h-24 overflow-y-auto pt-1">
                                {lead.notes_list.map((n, i) => (
                                  <div key={i} className="text-[10px] text-slate-600 bg-white p-1.5 rounded border border-slate-100">
                                    {n}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
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
  );
}
