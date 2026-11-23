"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  Save,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Image as ImageIcon,
  FileText,
  Lock,
  History,
  Trash2,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import { usePropertyStore } from "@/lib/property-store";
import { Property, ListingStatus, PropertyCategory, PropertyType } from "@/types";
import { getStatusColor, getStatusLabel, getSourceLabel, getSourceColor, formatPrice, formatDateTime } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminEditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params?.id as string;

  const { properties, updateProperty, deleteProperty, isLoaded } = usePropertyStore();
  const [property, setProperty] = useState<Property | null>(null);

  // Editable Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<ListingStatus>("pending");
  const [statusNotes, setStatusNotes] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (isLoaded && propertyId) {
      const found = properties.find((p) => p.id === propertyId || p.listing_id === propertyId);
      if (found) {
        setProperty(found);
        setTitle(found.title);
        setDescription(found.description);
        setPrice(found.price.toString());
        setStatus(found.status);
        setIsFeatured(found.is_featured);
      }
    }
  }, [isLoaded, propertyId, properties]);

  if (!isLoaded || !property) {
    return (
      <div className="py-20 text-center text-[#64748B]">
        <div className="animate-spin w-8 h-8 border-4 border-[#172B4D] border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm">Loading listing details from central store...</p>
      </div>
    );
  }

  const handleUpdate = (targetStatus?: ListingStatus) => {
    const nextStatus = targetStatus || status;
    const notes = statusNotes.trim() || `Admin updated listing status to ${nextStatus}`;

    updateProperty(
      property.id,
      {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price) || property.price,
        status: nextStatus,
        is_featured: isFeatured,
      },
      OFFICIAL_BUSINESS.email,
      notes
    );

    toast.success(`Property updated successfully! Status: ${getStatusLabel(nextStatus)}`);
    router.push("/admin/properties");
  };

  const handleApproveAndPublish = () => {
    handleUpdate("published");
  };

  const handleReject = () => {
    const reason = rejectionReason.trim() || "Rejected due to unverified documentation or title discrepancy.";
    updateProperty(
      property.id,
      { status: "rejected" },
      OFFICIAL_BUSINESS.email,
      `Listing Rejected: ${reason}`
    );
    toast.error("Listing rejected and moved to Rejected Listings.");
    router.push("/admin/properties");
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to permanently delete listing ${property.listing_id}?`)) {
      deleteProperty(property.id);
      toast.success("Listing deleted permanently.");
      router.push("/admin/properties");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/properties"
            className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#172B4D] mb-2 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Properties Registry
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#172B4D] font-display">
              Review & Edit Property
            </h1>
            <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 rounded text-[#172B4D]">
              {property.listing_id}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`badge border text-xs capitalize ${getStatusColor(property.status)}`}>
              {getStatusLabel(property.status)}
            </span>
            <span className={`badge border text-xs capitalize ${getSourceColor(property.source)}`}>
              {getSourceLabel(property.source)}
            </span>
            {property.is_demo && <span className="badge badge-demo text-[10px]">DEMO</span>}
          </div>
        </div>

        {/* Quick Review Decisions */}
        <div className="flex items-center gap-2 flex-wrap">
          {property.status === "pending" && (
            <>
              <button
                type="button"
                onClick={handleApproveAndPublish}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 bg-green-700 hover:bg-green-800"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve & Publish
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="btn-secondary text-xs py-2 px-3 border-red-300 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4" /> Reject Listing
              </button>
            </>
          )}

          {property.status === "published" && (
            <Link
              href={`/properties/${property.slug}`}
              target="_blank"
              className="btn-secondary text-xs py-2 px-3 bg-white flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Public Page
            </Link>
          )}

          <button
            type="button"
            onClick={handleDelete}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
            title="Delete Listing"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rejection notice box if pending */}
      {property.status === "pending" && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed">
            <strong>Client Submission Requiring Diligence:</strong> This listing was submitted by an external seller/agent and is currently hidden from the public marketplace. Review the details and ownership documents below before approving.
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 border border-[#E2E8F0] space-y-4">
            <h2 className="text-base font-bold text-[#172B4D] font-display">Listing Details</h2>

            <div>
              <label className="label-field">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-field">Category</label>
                <input
                  type="text"
                  disabled
                  value={property.category}
                  className="input-field text-sm bg-slate-50 cursor-not-allowed capitalize"
                />
              </div>
              <div>
                <label className="label-field">Property Type</label>
                <input
                  type="text"
                  disabled
                  value={property.property_type}
                  className="input-field text-sm bg-slate-50 cursor-not-allowed capitalize"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-field">Expected Price (₹)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="input-field text-sm font-semibold"
                />
                <span className="text-[11px] text-[#64748B] mt-1 block">
                  {price && `Display: ${formatPrice(Number(price))}`}
                </span>
              </div>
              <div>
                <label className="label-field">Total Area</label>
                <input
                  type="text"
                  disabled
                  value={`${property.total_area} ${property.area_unit}`}
                  className="input-field text-sm bg-slate-50 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="label-field">Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field text-sm resize-none"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 accent-[#172B4D]"
              />
              <span className="text-xs font-semibold text-[#172B4D]">Feature on Homepage Carousel</span>
            </label>
          </div>

          {/* Attached Confidential Documents */}
          <div className="card p-6 border border-amber-200 bg-amber-50/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-bold text-[#172B4D]">Confidential Ownership Documents</h2>
              </div>
              <span className="badge bg-amber-100 text-amber-800 text-[10px]">Strictly Private</span>
            </div>

            {property.documents && property.documents.length > 0 ? (
              <div className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-xl bg-white overflow-hidden">
                {property.documents.map((doc) => (
                  <div key={doc.id} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-600" />
                      <div>
                        <div className="font-bold text-[#172B4D]">{doc.title}</div>
                        <div className="text-[10px] text-[#64748B] font-mono">{doc.file_url}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded font-semibold">
                      Verified
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#64748B] italic">No attached private documents for this listing.</p>
            )}
          </div>

          {/* Audit History Log */}
          <div className="card p-6 border border-[#E2E8F0] space-y-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#C6A66B]" />
              <h2 className="text-sm font-bold text-[#172B4D]">Listing Audit Trail & History</h2>
            </div>

            <div className="space-y-2">
              {(property.audit_logs || []).map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#172B4D]">{log.action}</span>
                    <span className="text-[10px] text-[#64748B]">{formatDateTime(log.timestamp)}</span>
                  </div>
                  <div className="text-slate-600">
                    By: <strong>{log.changed_by}</strong>
                  </div>
                  {log.notes && <div className="text-slate-500 italic text-[11px]">&quot;{log.notes}&quot;</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Workflow Status (1 col) */}
        <div className="space-y-6">
          {/* Status Transition Control */}
          <div className="card p-6 border border-[#E2E8F0] space-y-4">
            <h2 className="text-sm font-bold text-[#172B4D]">Transition Marketplace Status</h2>

            <div>
              <label className="label-field text-xs">Current Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ListingStatus)}
                className="input-field text-sm font-semibold"
              >
                <option value="draft">Draft (Admin Only)</option>
                <option value="pending">Pending Review</option>
                <option value="published">Published (Live)</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
                <option value="unpublished">Unpublished</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="label-field text-xs">Internal Audit Note</label>
              <textarea
                rows={2}
                placeholder="Reason for change / verification details..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                className="input-field text-xs resize-none"
              />
            </div>

            <button
              type="button"
              onClick={() => handleUpdate()}
              className="btn-primary w-full py-2.5 text-xs justify-center"
            >
              <Save className="w-4 h-4" /> Save Status & Updates
            </button>
          </div>

          {/* Seller / Contact Info */}
          <div className="card p-6 border border-[#E2E8F0] space-y-3">
            <h2 className="text-sm font-bold text-[#172B4D]">Seller / Submitter Info</h2>
            <div className="text-xs space-y-2 text-[#64748B]">
              <div>
                <span className="text-slate-400">Name:</span>{" "}
                <strong className="text-[#172B4D]">{property.seller_name || "Admin Generated"}</strong>
              </div>
              <div>
                <span className="text-slate-400">Phone:</span>{" "}
                <strong className="text-[#172B4D]">{property.seller_mobile || "Not specified"}</strong>
              </div>
              <div>
                <span className="text-slate-400">Role:</span>{" "}
                <span className="capitalize">{property.seller_type || property.source}</span>
              </div>
              <div>
                <span className="text-slate-400">Submission Date:</span>{" "}
                <span>{formatDateTime(property.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
