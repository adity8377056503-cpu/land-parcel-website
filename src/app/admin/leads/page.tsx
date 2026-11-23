"use client";

import { useState } from "react";
import {
  Users,
  Search,
  Download,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  ChevronDown,
  Check,
  FileSpreadsheet,
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

const INITIAL_LEADS: (Enquiry & { notes_list?: string[] })[] = [
  {
    id: "lead-01",
    lead_id: "LD8X19A",
    name: "Rajesh Sharma",
    mobile: "9810123456",
    email: "rajesh.sharma@example.com",
    property_title: "DEMO - 4 BHK Independent House in Sector 10, Dwarka",
    buyer_type: "individual",
    status: "new",
    source: "property_detail_page",
    consent: true,
    message: "Interested in visiting the house this Saturday morning with family.",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
    notes_list: ["Client is looking for ready-to-move residential floor in Sector 10."],
  },
  {
    id: "lead-02",
    lead_id: "LD9K20B",
    name: "Vikram Malhotra",
    mobile: "9958123890",
    email: "vikram@logisticsin.com",
    property_title: "DEMO - Industrial Warehouse, Sector 35, Begampur Khatola, Gurugram",
    buyer_type: "company",
    status: "site-visit-scheduled",
    source: "property_detail_page",
    consent: true,
    message: "We need 8,000+ sqft covered area warehouse with 3-phase power for auto parts distribution.",
    created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
    updated_at: new Date().toISOString(),
    notes_list: [
      "Initial call done. Scheduled physical inspection for Thursday 3 PM.",
    ],
  },
  {
    id: "lead-03",
    lead_id: "LD7P31C",
    name: "Suresh Chaudhry",
    mobile: "9871098765",
    buyer_type: "investor",
    status: "interested",
    property_title: "DEMO - Agricultural Land in Karnal Region, Haryana",
    source: "property_detail_page",
    consent: true,
    message: "Looking to acquire 5-10 acres for organic farming retreat.",
    created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
    updated_at: new Date().toISOString(),
    notes_list: ["Requested mutation and revenue documents before visit."],
  },
  {
    id: "lead-04",
    lead_id: "LD4M42D",
    name: "Anjali Verma",
    mobile: "9811234567",
    email: "anjali.v@capitalre.com",
    buyer_type: "developer",
    status: "contacted",
    property_title: "DEMO - Commercial Property in Gurugram",
    source: "contact_page",
    consent: true,
    message: "Seeking commercial high footfall space on MG Road.",
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    updated_at: new Date().toISOString(),
    notes_list: [],
  },
];

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
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [activeNoteLead, setActiveNoteLead] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");

  const filtered = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.mobile.includes(search) ||
      l.lead_id.toLowerCase().includes(search.toLowerCase()) ||
      (l.property_title || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || l.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = (id: string, status: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l))
    );
    toast.success("Lead status updated");
  };

  const addNote = (id: string) => {
    if (!newNote.trim()) return;
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, notes_list: [...(l.notes_list || []), newNote.trim()] }
          : l
      )
    );
    setNewNote("");
    toast.success("Internal note added");
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
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

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
            Buyer Inquiries & Leads Management
          </h1>
          <p className="text-sm text-[#64748B]">
            Track inquiries, update follow-up workflows, assign statuses, and record notes.
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="btn-secondary text-sm py-2.5 px-4 bg-white flex items-center gap-2"
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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F5F7FA] text-[#64748B] border-b border-[#E2E8F0] font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Lead ID / Date</th>
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Interested Property</th>
                <th className="py-3.5 px-4">Workflow Status</th>
                <th className="py-3.5 px-4 text-right">Notes & Actions</th>
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
                      <a href={`tel:${lead.mobile}`} className="hover:underline">{lead.mobile}</a>
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
                      {lead.property_title || "General Platform Inquiry"}
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
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${getStatusColor(lead.status)}`}
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
                      onClick={() =>
                        setActiveNoteLead(activeNoteLead === lead.id ? null : lead.id)
                      }
                      className="px-3 py-1.5 bg-[#EAF3FA] text-[#172B4D] hover:bg-[#172B4D] hover:text-white rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Notes ({lead.notes_list?.length || 0})
                    </button>

                    {/* Note Drawer inline */}
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
                            placeholder="Add client follow-up note..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            className="input-field text-xs py-1.5 flex-1"
                          />
                          <button
                            onClick={() => addNote(lead.id)}
                            className="btn-primary text-xs py-1.5 px-3"
                          >
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

          {filtered.length === 0 && (
            <div className="p-8 text-center text-[#64748B]">
              No leads found matching current filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
