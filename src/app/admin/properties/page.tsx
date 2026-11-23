"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Plus,
  Tag,
  MapPin,
  ExternalLink,
  Edit,
  FileText,
  Clock,
  Inbox,
  FolderUp,
  BadgeCheck,
  FileEdit,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { usePropertyStore } from "@/lib/property-store";
import { Property, ListingStatus, PropertyCategory } from "@/types";
import { formatPrice, formatArea, getStatusColor, getStatusLabel, getSourceColor, getSourceLabel } from "@/lib/utils";
import toast from "react-hot-toast";

const TAB_CONFIGS = [
  { id: "all", label: "All Properties" },
  { id: "my-uploaded", label: "My Uploaded Properties" },
  { id: "client-submissions", label: "Client Submissions" },
  { id: "pending", label: "Pending Approval" },
  { id: "published", label: "Published Properties" },
  { id: "sold-rented", label: "Sold / Rented" },
  { id: "drafts", label: "Draft Listings" },
  { id: "rejected", label: "Rejected Listings" },
];

function AdminPropertiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "all";

  const {
    properties,
    updateStatus,
    deleteProperty,
    allProperties,
    myUploaded,
    clientSubmissions,
    pendingApproval,
    publishedProperties,
    soldOrRented,
    drafts,
    rejected,
    counts,
  } = usePropertyStore();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Filter based on active tab
  let tabFiltered: Property[] = allProperties;
  if (activeTab === "my-uploaded") tabFiltered = myUploaded;
  else if (activeTab === "client-submissions") tabFiltered = clientSubmissions;
  else if (activeTab === "pending") tabFiltered = pendingApproval;
  else if (activeTab === "published") tabFiltered = publishedProperties;
  else if (activeTab === "sold-rented") tabFiltered = soldOrRented;
  else if (activeTab === "drafts") tabFiltered = drafts;
  else if (activeTab === "rejected") tabFiltered = rejected;

  // Search & category filters
  const finalFiltered = tabFiltered.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.listing_id.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase()) ||
      (p.seller_name || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleQuickStatus = (id: string, newStatus: ListingStatus) => {
    updateStatus(id, newStatus, "admin@landparcel.in", `Quick status transition to ${newStatus}`);
    toast.success(`Property updated to status: ${getStatusLabel(newStatus)}`);
  };

  const handleDelete = (id: string, listingId: string) => {
    if (confirm(`Are you sure you want to delete listing ${listingId}?`)) {
      deleteProperty(id);
      toast.success("Listing removed permanently");
    }
  };

  const getTabCount = (tabId: string) => {
    switch (tabId) {
      case "all": return counts.all;
      case "my-uploaded": return counts.myUploaded;
      case "client-submissions": return counts.clientSubmissions;
      case "pending": return counts.pending;
      case "published": return counts.published;
      case "sold-rented": return counts.soldOrRented;
      case "drafts": return counts.drafts;
      case "rejected": return counts.rejected;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172B4D] font-display">
            Central Property Inventory Registry
          </h1>
          <p className="text-xs text-[#64748B]">
            Manage all 9 property lifecycle sections, review client submissions, and upload verified inventory.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/properties/new"
            className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#C6A66B]" /> + Add New Property
          </Link>
        </div>
      </div>

      {/* 9-Section Tab Navigation Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#E2E8F0]">
        {TAB_CONFIGS.map((tab) => {
          const active = activeTab === tab.id;
          const count = getTabCount(tab.id);
          const isPending = tab.id === "pending" && count > 0;

          return (
            <button
              key={tab.id}
              onClick={() => router.push(`/admin/properties?tab=${tab.id}`)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                active
                  ? "bg-[#172B4D] text-white shadow-sm"
                  : "bg-white text-[#64748B] hover:text-[#172B4D] hover:bg-slate-100 border border-[#E2E8F0]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  active
                    ? "bg-white/20 text-white"
                    : isPending
                    ? "bg-amber-400 text-[#172B4D] font-bold"
                    : "bg-slate-100 text-[#64748B]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Controls */}
      <div className="card p-4 border border-[#E2E8F0] flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Title, Listing ID, City, or Submitter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 py-2 text-xs"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input-field py-2 text-xs md:w-48"
        >
          <option value="all">All Asset Classes</option>
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
          <option value="industrial">Industrial</option>
          <option value="agricultural">Agricultural</option>
          <option value="institutional">Institutional</option>
          <option value="large-land">Large Land</option>
        </select>
      </div>

      {/* Properties Table */}
      <div className="card border border-[#E2E8F0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7FA] text-[#64748B] border-b border-[#E2E8F0] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Property / ID</th>
                <th className="py-3 px-4">Origin / Submitter</th>
                <th className="py-3 px-4">Area & Price</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {finalFiltered.map((property) => (
                <tr key={property.id} className="hover:bg-[#F5F7FA]/70 transition-colors">
                  {/* Title & ID */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-bold text-[#172B4D] line-clamp-1">
                      {property.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[11px] text-[#64748B] font-semibold">
                        {property.listing_id}
                      </span>
                      {property.is_featured && (
                        <span className="badge bg-[#C6A66B] text-white text-[9px] py-0">Featured</span>
                      )}
                      {property.is_demo && (
                        <span className="badge badge-demo text-[9px] py-0">DEMO</span>
                      )}
                    </div>
                  </td>

                  {/* Origin & Submitter */}
                  <td className="py-3.5 px-4">
                    <span className={`badge border text-[10px] capitalize ${getSourceColor(property.source)}`}>
                      {getSourceLabel(property.source)}
                    </span>
                    {property.seller_name && (
                      <div className="text-[11px] text-[#172B4D] mt-1 font-medium">
                        {property.seller_name} ({property.seller_mobile || "No phone"})
                      </div>
                    )}
                  </td>

                  {/* Area & Price */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#172B4D]">
                      {formatPrice(property.price)}
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      {formatArea(property.total_area, property.area_unit)}
                    </div>
                  </td>

                  {/* Category & City */}
                  <td className="py-3.5 px-4 capitalize">
                    <div className="font-medium text-[#172B4D]">{property.category.replace("-", " ")}</div>
                    <div className="text-[11px] text-[#64748B]">{property.city}</div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    <span className={`badge border text-[10px] capitalize font-semibold ${getStatusColor(property.status)}`}>
                      {getStatusLabel(property.status)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Review & Edit */}
                      <Link
                        href={`/admin/properties/${property.id}/edit`}
                        className="px-2.5 py-1 text-xs font-semibold bg-[#EAF3FA] text-[#172B4D] hover:bg-[#172B4D] hover:text-white rounded-lg transition-colors inline-flex items-center gap-1"
                        title="Review / Edit Property"
                      >
                        <Edit className="w-3 h-3" /> Edit
                      </Link>

                      {/* Quick Approve / Reject for Pending */}
                      {property.status === "pending" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleQuickStatus(property.id, "published")}
                            className="p-1.5 text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                            title="Approve & Publish"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickStatus(property.id, "rejected")}
                            className="p-1.5 text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            title="Reject Listing"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* Quick Mark Sold */}
                      {property.status === "published" && (
                        <button
                          type="button"
                          onClick={() => handleQuickStatus(property.id, "sold")}
                          className="px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Mark Sold"
                        >
                          Sold
                        </button>
                      )}

                      {/* Quick Publish if in Draft */}
                      {property.status === "draft" && (
                        <button
                          type="button"
                          onClick={() => handleQuickStatus(property.id, "published")}
                          className="px-2 py-1 text-[11px] font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                          title="Publish Directly"
                        >
                          Publish
                        </button>
                      )}

                      {/* Public view if published */}
                      {property.status === "published" && (
                        <Link
                          href={`/properties/${property.slug}`}
                          target="_blank"
                          className="p-1.5 text-[#64748B] hover:text-[#172B4D] hover:bg-slate-100 rounded-lg transition-colors"
                          title="View on Public Marketplace"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(property.id, property.listing_id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {finalFiltered.length === 0 && (
            <div className="p-10 text-center text-[#64748B] space-y-2">
              <Building className="w-8 h-8 text-[#64748B] mx-auto opacity-40" />
              <div className="font-semibold text-[#172B4D]">No properties found in this section</div>
              <p className="text-xs">
                {activeTab === "pending"
                  ? "There are no pending submissions awaiting review right now."
                  : activeTab === "drafts"
                  ? "You have no saved draft listings."
                  : "Try clearing filters or search term."}
              </p>
              {activeTab !== "all" && (
                <button
                  onClick={() => router.push("/admin/properties?tab=all")}
                  className="btn-secondary text-xs py-1.5 px-3 mt-2 inline-flex"
                >
                  View All Properties
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#172B4D] border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-xs text-[#64748B]">Loading properties registry...</p>
        </div>
      }
    >
      <AdminPropertiesContent />
    </Suspense>
  );
}
