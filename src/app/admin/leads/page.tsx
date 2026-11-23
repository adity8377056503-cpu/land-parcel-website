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
} from "lucide-react";
import { Enquiry } from "@/types";
import { getStatusColor, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

type LeadStatus =
  | "new"
  | "contacted"
  | "interested"
  | "site-visit-scheduled"
  | "negotiation"
  | "converted"
  | "closed"
  | "not-interested";

const STATUS_OPTIONS: { label: string; value: LeadStatus }[] = [
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Interested", value: "interested" },
  { label: "Site Visit Scheduled", value: "site-visit-scheduled" },
  { label: "Negotiation", value: "negotiation" },
  { label: "Converted", value: "converted" },
  { label: "Closed", value: "closed" },
  { label: "Not Interested", value: "not-interested" },
];

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<(Enquiry & { notes_list?: string[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [activeNoteLead, setActiveNoteLead] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");

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
    const matchesSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.mobile.includes(search) ||
      l.lead_id.toLowerCase().includes(search.toLowerCase()) ||
      (l.property_title || "").toLowerCase().includes(search.toLowerCase());
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172B4D] font-display">
            Buyer Enquiries &amp; Leads Management
          </h1>
          <p className="text-sm text-[#64748B]">
            Real enquiries submitted through Land Parcel property pages and contact forms.
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={filtered.length === 0}
          className="btn-secondary text-sm py-2.5 px-4 bg-white flex items-center gap-2 disabled:opacity-50"
        >
          <Download className="w-4 h-4" /> Export Leads (CSV)
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
            className="input-field pl-9 py-2 text-sm"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="input-field py-2 text-sm md:w-56"
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
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#172B4D] mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-[#172B4D]">No Buyer Leads Yet</h3>
            <p className="text-xs text-[#64748B] mt-1">
              Genuine customer enquiries from property listings and the Contact Us page will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F7FA] text-[#64748B] border-b border-[#E2E8F0] font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Lead ID / Date</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Interested Property</th>
                  <th className="py-3.5 px-4">Workflow Status</th>
                  <th className="py-3.5 px-4 text-right">Notes &amp; Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#F5F7FA]/60 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-mono font-bold text-xs text-[#172B4D]">{lead.lead_id}</span>
                      <div className="text-xs text-[#64748B] mt-0.5">{formatDate(lead.created_at)}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-[#172B4D]">{lead.name}</div>
                      <div className="flex items-center gap-2 text-xs text-[#64748B] mt-1">
                        <Phone className="w-3 h-3 text-[#C6A66B]" />
                        <a href={`tel:${lead.mobile}`} className="hover:underline">
                          +91 {lead.mobile}
                        </a>
                      </div>
                      {lead.email && (
                        <div className="flex items-center gap-2 text-xs text-[#64748B] mt-0.5">
                          <Mail className="w-3 h-3 text-[#C6A66B]" />
                          <span>{lead.email}</span>
                        </div>
                      )}
                      <span className="badge bg-[#EAF3FA] text-[#172B4D] text-[10px] mt-1.5 capitalize">
                        {lead.buyer_type}
                      </span>
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <div className="text-xs font-semibold text-[#172B4D] line-clamp-2">
                        {lead.property_title || "General Platform Enquiry"}
                      </div>
                      {lead.message && (
                        <p className="text-xs text-[#64748B] italic mt-1 line-clamp-2 bg-slate-50 p-1.5 rounded">
                          &quot;{lead.message}&quot;
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${getStatusColor(
                          lead.status
                        )}`}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setActiveNoteLead(activeNoteLead === lead.id ? null : lead.id)}
                        className="px-3 py-1.5 bg-[#EAF3FA] text-[#172B4D] hover:bg-[#172B4D] hover:text-white rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Notes ({lead.notes_list?.length || 0})
                      </button>

                      {activeNoteLead === lead.id && (
                        <div className="mt-3 p-3 bg-white rounded-xl shadow-card border border-[#E2E8F0] text-left">
                          <div className="text-xs font-bold text-[#172B4D] mb-2">Internal Follow-up Notes:</div>
                          {lead.notes_list && lead.notes_list.length > 0 ? (
                            <ul className="text-xs text-[#64748B] space-y-1 mb-3">
                              {lead.notes_list.map((n, idx) => (
                                <li key={idx} className="bg-slate-50 p-1.5 rounded">
                                  • {n}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-xs text-slate-400 mb-2">No notes recorded yet.</div>
                          )}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Add follow-up note..."
                              value={newNote}
                              onChange={(e) => setNewNote(e.target.value)}
                              className="input-field text-xs py-1.5 flex-1"
                            />
                            <button onClick={() => addNote(lead.id)} className="btn-primary text-xs py-1.5 px-3">
                              Save
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
