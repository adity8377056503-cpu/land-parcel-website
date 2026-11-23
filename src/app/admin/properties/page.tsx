"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  Copy,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
} from "lucide-react";
import { usePropertyStore } from "@/lib/property-store";
import { Property, ListingStatus, PropertyCategory } from "@/types";
import { formatPrice, formatArea, getStatusColor, getStatusLabel, getSourceColor, getSourceLabel } from "@/lib/utils";
import toast from "react-hot-toast";

const TAB_CONFIGS = [
  { id: "all", label: "All Properties" },
  { id: "my-uploaded", label: "My Uploads" },
  { id: "client-submissions", label: "Client Submissions" },
  { id: "pending", label: "Pending Approval" },
  { id: "published", label: "Published" },
  { id: "sold-rented", label: "Sold / Rented" },
  { id: "under-negotiation", label: "Under Negotiation" },
  { id: "drafts", label: "Drafts" },
  { id: "rejected", label: "Rejected" },
];

const CATEGORIES_LIST = [
  { value: "all", label: "All Categories" },
  { value: "residential", label: "Residential Properties" },
  { value: "commercial", label: "Commercial Properties" },
  { value: "industrial", label: "Industrial Properties" },
  { value: "agricultural", label: "Agricultural Land" },
  { value: "plots-land", label: "Plots and Land" },
  { value: "warehouses", label: "Warehouses" },
  { value: "shops-offices", label: "Shops and Offices" },
  { value: "institutional", label: "Institutional Properties" },
  { value: "large-land", label: "Large Land Parcels" },
];

function AdminPropertiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "all";

  const {
    properties,
    updateStatus,
    deleteProperty,
    duplicateProperty,
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals state
  const [deleteModalProperty, setDeleteModalProperty] = useState<Property | null>(null);
  const [previewProperty, setPreviewProperty] = useState<Property | null>(null);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);

  // Tab Filtering
  let tabFiltered: Property[] = allProperties;
  if (activeTab === "my-uploaded") tabFiltered = myUploaded;
  else if (activeTab === "client-submissions") tabFiltered = clientSubmissions;
  else if (activeTab === "pending") tabFiltered = pendingApproval;
  else if (activeTab === "published") tabFiltered = publishedProperties;
  else if (activeTab === "sold-rented") tabFiltered = soldOrRented;
  else if (activeTab === "under-negotiation") tabFiltered = allProperties.filter((p) => p.availability_status === "under-negotiation");
  else if (activeTab === "drafts") tabFiltered = drafts;
  else if (activeTab === "rejected") tabFiltered = rejected;

  // Search & Category Filtering
  const finalFiltered = tabFiltered.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(q) ||
      p.listing_id.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      (p.locality || "").toLowerCase().includes(q) ||
      (p.seller_name || "").toLowerCase().includes(q);
    const matchesCategory =
      selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(finalFiltered.length / itemsPerPage));
  const paginatedProperties = finalFiltered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleQuickStatus = (id: string, newStatus: ListingStatus) => {
    updateStatus(id, newStatus, "admin@landparcel.in", `Quick status transition to ${newStatus}`);
    toast.success(`Property updated to status: ${getStatusLabel(newStatus)}`);
  };

  const handleConfirmDelete = () => {
    if (!deleteModalProperty) return;
    deleteProperty(deleteModalProperty.id);
    toast.success(`Listing ${deleteModalProperty.listing_id} permanently removed`);
    setDeleteModalProperty(null);
  };

  const handleDuplicate = async (property: Property) => {
    setIsDuplicating(property.id);
    const toastId = toast.loading(`Cloning listing ${property.listing_id}...`);
    try {
      const duplicated = await duplicateProperty(property.id);
      if (duplicated) {
        toast.success(`Duplicated as Draft: ${duplicated.listing_id}`, { id: toastId });
        router.push(`/admin/properties/${duplicated.id}/edit`);
      } else {
        toast.error("Failed to duplicate listing", { id: toastId });
      }
    } catch {
      toast.error("Error duplicating property", { id: toastId });
    } finally {
      setIsDuplicating(null);
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
      case "under-negotiation": return allProperties.filter((p) => p.availability_status === "under-negotiation").length;
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
            Manage all property lifecycle stages, duplicate listings, preview live pages, and upload verified inventory.
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

      {/* Tab Navigation Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#E2E8F0]">
        {TAB_CONFIGS.map((tab) => {
          const active = activeTab === tab.id;
          const count = getTabCount(tab.id);
          const isPending = tab.id === "pending" && count > 0;

          return (
            <button
              key={tab.id}
              onClick={() => {
                router.push(`/admin/properties?tab=${tab.id}`);
                setCurrentPage(1);
              }}
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
            placeholder="Search by Title, Listing ID, Locality, City, or Submitter..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="input-field pl-9 py-2 text-xs"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}
          className="input-field py-2 text-xs md:w-56"
        >
          {CATEGORIES_LIST.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
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
                <th className="py-3 px-4">Status & Availability</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {paginatedProperties.map((property) => (
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
                      {property.availability_status === "under-negotiation" && (
                        <span className="badge bg-purple-100 text-purple-800 text-[9px] py-0">Under Negotiation</span>
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
                    <div className="text-[11px] text-[#64748B]">{property.locality ? `${property.locality}, ` : ""}{property.city}</div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <span className={`badge border text-[10px] capitalize font-semibold ${getStatusColor(property.status)}`}>
                        {getStatusLabel(property.status)}
                      </span>
                      {property.availability_status && property.availability_status !== "available" && (
                        <div className="text-[10px] text-slate-500 capitalize">
                          {property.availability_status.replace("-", " ")}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      {/* Review & Edit */}
                      <Link
                        href={`/admin/properties/${property.id}/edit`}
                        className="px-2 py-1 text-xs font-semibold bg-[#EAF3FA] text-[#172B4D] hover:bg-[#172B4D] hover:text-white rounded-lg transition-colors inline-flex items-center gap-1"
                        title="Review / Edit Property"
                      >
                        <Edit className="w-3 h-3" /> Edit
                      </Link>

                      {/* Preview Button */}
                      <button
                        type="button"
                        onClick={() => setPreviewProperty(property)}
                        className="p-1.5 text-slate-600 hover:text-[#172B4D] hover:bg-slate-100 rounded-lg transition-colors"
                        title="Preview Property"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Duplicate Button */}
                      <button
                        type="button"
                        onClick={() => handleDuplicate(property)}
                        disabled={isDuplicating === property.id}
                        className="p-1.5 text-[#C6A66B] hover:bg-[#C6A66B]/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Duplicate Listing as Draft"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

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

                      {/* Quick Mark Sold / Rented / Unpublish */}
                      {property.status === "published" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleQuickStatus(property.id, "sold")}
                            className="px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Mark Sold"
                          >
                            Sold
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickStatus(property.id, "unpublished")}
                            className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            title="Unpublish"
                          >
                            Unpublish
                          </button>
                        </>
                      )}

                      {(property.status === "sold" || property.status === "rented" || property.status === "unpublished") && (
                        <button
                          type="button"
                          onClick={() => handleQuickStatus(property.id, "published")}
                          className="px-2 py-1 text-[11px] font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                          title="Relist / Publish Live"
                        >
                          Relist
                        </button>
                      )}

                      {property.status === "draft" && (
                        <button
                          type="button"
                          onClick={() => handleQuickStatus(property.id, "published")}
                          className="px-2 py-1 text-[11px] font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                          title="Publish Immediately"
                        >
                          Publish
                        </button>
                      )}

                      {/* Delete Modal Trigger */}
                      <button
                        type="button"
                        onClick={() => setDeleteModalProperty(property)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Property Permanently"
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
              <div className="font-semibold text-[#172B4D] text-base">No Properties Found</div>
              <p className="text-xs max-w-md mx-auto">
                {search || selectedCategory !== "all"
                  ? "Try resetting search query or category filters."
                  : "All demo properties have been cleared. Click Add New Property to list genuine inventory."}
              </p>
              <Link href="/admin/properties/new" className="btn-primary text-xs py-2 px-4 mt-3 inline-flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add New Property
              </Link>
            </div>
          )}
        </div>

        {/* Pagination Strip */}
        {totalPages > 1 && (
          <div className="p-3 bg-slate-50 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
            <div>
              Showing {Math.min(finalFiltered.length, (currentPage - 1) * itemsPerPage + 1)} to{" "}
              {Math.min(finalFiltered.length, currentPage * itemsPerPage)} of {finalFiltered.length} listings
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-[#E2E8F0] bg-white text-[#172B4D] disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold font-mono text-[#172B4D]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-[#E2E8F0] bg-white text-[#172B4D] disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Permanent Delete Confirmation */}
      {deleteModalProperty && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-red-200">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#172B4D]">Confirm Permanent Deletion</h3>
                <p className="text-xs text-red-600 font-medium">This action cannot be undone.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-[#172B4D] line-clamp-1">{deleteModalProperty.title}</div>
              <div className="text-[11px] text-[#64748B]">
                ID: <span className="font-mono font-semibold">{deleteModalProperty.listing_id}</span> · {deleteModalProperty.city}
              </div>
              <div className="text-[11px] text-[#C6A66B] font-bold">
                {formatPrice(deleteModalProperty.price)}
              </div>
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed">
              Are you sure you want to permanently delete this listing? All associated photos, videos, and private documents will be removed from the database.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalProperty(null)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="btn-primary text-xs py-2 px-4 bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Property Quick Preview */}
      {previewProperty && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <span className="badge bg-[#172B4D] text-[#C6A66B] text-xs font-mono font-bold">
                  {previewProperty.listing_id}
                </span>
                <span className={`badge text-xs capitalize ${getStatusColor(previewProperty.status)}`}>
                  {getStatusLabel(previewProperty.status)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewProperty(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cover image preview if any */}
            {previewProperty.images && previewProperty.images.length > 0 ? (
              <div className="relative h-64 w-full rounded-xl overflow-hidden bg-slate-100">
                <img
                  src={previewProperty.images.find((i) => i.is_cover)?.url || previewProperty.images[0].url}
                  alt={previewProperty.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-lg">
                  {previewProperty.images.length} Photo(s)
                </div>
              </div>
            ) : (
              <div className="h-36 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs">
                No images attached
              </div>
            )}

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-[#172B4D] font-display">{previewProperty.title}</h2>
              <div className="flex items-center gap-2 text-xs text-[#64748B]">
                <MapPin className="w-3.5 h-3.5 text-[#C6A66B]" />
                <span>{previewProperty.address}, {previewProperty.locality ? `${previewProperty.locality}, ` : ""}{previewProperty.city}, {previewProperty.state}</span>
              </div>
              <div className="text-xl font-bold text-[#172B4D] font-mono">
                {formatPrice(previewProperty.price)}
                <span className="text-xs font-normal text-[#64748B] ml-2">
                  ({formatArea(previewProperty.total_area, previewProperty.area_unit)})
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-2 text-slate-700 leading-relaxed border border-slate-100">
              <div className="font-bold text-[#172B4D]">Description:</div>
              <p className="whitespace-pre-line">{previewProperty.description || "No description provided."}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
              <Link
                href={`/admin/properties/${previewProperty.id}/edit`}
                className="btn-primary text-xs py-2 px-4"
              >
                <Edit className="w-3.5 h-3.5" /> Full Edit
              </Link>
              {previewProperty.status === "published" && (
                <Link
                  href={`/properties/${previewProperty.slug}`}
                  target="_blank"
                  className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Public Page
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
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
