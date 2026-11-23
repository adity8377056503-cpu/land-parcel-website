"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  Tag,
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
  Upload,
  Plus,
  Star,
  Video,
  MapPin,
  MoveLeft,
  MoveRight,
  Eye,
  Copy,
  ChevronDown,
  X,
  FileCheck,
} from "lucide-react";
import { usePropertyStore } from "@/lib/property-store";
import {
  Property,
  ListingStatus,
  PropertyCategory,
  PropertyType,
  PropertyImage,
  PropertyDocument,
  AvailabilityStatus,
  AreaUnit,
  FurnishingStatus,
} from "@/types";
import {
  getStatusColor,
  getStatusLabel,
  getSourceLabel,
  getSourceColor,
  formatPrice,
  formatDateTime,
  OFFICIAL_BUSINESS,
} from "@/lib/utils";
import toast from "react-hot-toast";

const STATES = ["Delhi", "Haryana", "Uttar Pradesh", "Uttarakhand", "Rajasthan", "Punjab"];
const AREA_UNITS: AreaUnit[] = ["sqft", "sqm", "sqyd", "acre", "bigha", "kanal", "marla", "hectare"];

const CATEGORIES: { label: string; value: PropertyCategory }[] = [
  { label: "Residential Properties", value: "residential" },
  { label: "Commercial Properties", value: "commercial" },
  { label: "Industrial Properties", value: "industrial" },
  { label: "Agricultural Land", value: "agricultural" },
  { label: "Plots and Land", value: "plots-land" },
  { label: "Warehouses", value: "warehouses" },
  { label: "Shops and Offices", value: "shops-offices" },
  { label: "Institutional Properties", value: "institutional" },
  { label: "Large Land Parcel", value: "large-land" },
];

export default function AdminEditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params?.id as string;

  const { properties, updateProperty, deleteProperty, duplicateProperty, isLoaded } = usePropertyStore();
  const [property, setProperty] = useState<Property | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<PropertyCategory>("residential");
  const [propertyType, setPropertyType] = useState<PropertyType>("independent-house");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ListingStatus>("pending");
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>("available");
  const [isFeatured, setIsFeatured] = useState(false);
  const [statusNotes, setStatusNotes] = useState("");

  // Location Fields
  const [state, setState] = useState("Delhi");
  const [city, setCity] = useState("Delhi");
  const [locality, setLocality] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [landmarks, setLandmarks] = useState("");
  const [roadConnectivity, setRoadConnectivity] = useState("");

  // Area & Price
  const [price, setPrice] = useState("");
  const [priceNegotiable, setPriceNegotiable] = useState(true);
  const [priceUnit, setPriceUnit] = useState<"total" | "per-sqft" | "per-acre">("total");
  const [totalArea, setTotalArea] = useState("");
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("sqyd");
  const [builtUpArea, setBuiltUpArea] = useState("");
  const [roadWidth, setRoadWidth] = useState("");

  // Specifications
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [furnishing, setFurnishing] = useState<FurnishingStatus | "">("");
  const [ceilingHeight, setCeilingHeight] = useState("");
  const [powerAvailability, setPowerAvailability] = useState("");
  const [waterAvailability, setWaterAvailability] = useState("");

  // Media
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [documents, setDocuments] = useState<PropertyDocument[]>([]);
  const [docTitle, setDocTitle] = useState("");
  const [docUrl, setDocUrl] = useState("");

  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoaded && propertyId) {
      const found = properties.find((p) => p.id === propertyId || p.listing_id === propertyId);
      if (found) {
        setProperty(found);
        setTitle(found.title || "");
        setCategory(found.category || "residential");
        setPropertyType(found.property_type || "independent-house");
        setDescription(found.description || "");
        setStatus(found.status);
        setAvailabilityStatus(found.availability_status || "available");
        setIsFeatured(found.is_featured ?? false);

        setState(found.state || "Delhi");
        setCity(found.city || "Delhi");
        setLocality(found.locality || "");
        setAddress(found.address || "");
        setPincode(found.pincode || "");
        setLatitude(found.latitude ? found.latitude.toString() : "");
        setLongitude(found.longitude ? found.longitude.toString() : "");
        setLandmarks(found.nearby_landmarks || "");
        setRoadConnectivity(found.road_connectivity || "");

        setPrice(found.price ? found.price.toString() : "");
        setPriceNegotiable(found.price_negotiable ?? true);
        setPriceUnit(found.price_unit || "total");
        setTotalArea(found.total_area ? found.total_area.toString() : "");
        setAreaUnit(found.area_unit || "sqyd");
        setBuiltUpArea(found.built_up_area ? found.built_up_area.toString() : "");
        setRoadWidth(found.road_width ? found.road_width.toString() : "");

        setBedrooms(found.bedrooms ? found.bedrooms.toString() : "");
        setBathrooms(found.bathrooms ? found.bathrooms.toString() : "");
        setFurnishing(found.furnishing || "");
        setCeilingHeight(found.ceiling_height ? found.ceiling_height.toString() : "");
        setPowerAvailability(found.power_availability || "");
        setWaterAvailability(found.water_availability || "");

        setImages(found.images || []);
        setVideoUrl(found.video_url || "");
        setDocuments(found.documents || []);
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

  // Media Handlers
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingMedia(true);
    const toastId = toast.loading(`Uploading ${files.length} media file(s) to Supabase Storage...`);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("files", file));

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.uploads && Array.isArray(json.uploads)) {
          const newImages: PropertyImage[] = json.uploads.map((item: any, idx: number) => ({
            id: item.id || `img-${Date.now()}-${idx}`,
            property_id: property.id,
            url: item.url,
            is_cover: images.length === 0 && idx === 0,
            sort_order: images.length + idx,
            created_at: new Date().toISOString(),
          }));

          setImages((prev) => [...prev, ...newImages]);
          toast.success(`Successfully uploaded ${newImages.length} image(s)`, { id: toastId });
          return;
        }
      }
      throw new Error("Upload response failed");
    } catch {
      toast.error("Failed to upload media files to Supabase Storage", { id: toastId });
    } finally {
      setIsUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    setImages((prev) => [
      ...prev,
      {
        id: `img-${Date.now()}`,
        property_id: property.id,
        url,
        is_cover: prev.length === 0,
        sort_order: prev.length,
        created_at: new Date().toISOString(),
      },
    ]);
    setImageUrlInput("");
    toast.success("Image added to gallery");
  };

  const handleSetCover = (id: string) => {
    setImages((prev) => prev.map((img) => ({ ...img, is_cover: img.id === id })));
    toast.success("Cover image selected");
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      if (filtered.length > 0 && !filtered.some((img) => img.is_cover)) {
        filtered[0].is_cover = true;
      }
      return filtered;
    });
  };

  const handleMoveImage = (idx: number, direction: "left" | "right") => {
    if ((direction === "left" && idx === 0) || (direction === "right" && idx === images.length - 1)) return;
    const targetIdx = direction === "left" ? idx - 1 : idx + 1;
    const copy = [...images];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    setImages(copy.map((img, i) => ({ ...img, sort_order: i })));
  };

  // Document Handlers
  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDoc(true);
    const toastId = toast.loading("Uploading private document to secure storage...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", docTitle.trim() || file.name);

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.document) {
          setDocuments((prev) => [...prev, json.document]);
          setDocTitle("");
          toast.success("Private document securely stored", { id: toastId });
          return;
        }
      }
      throw new Error("Upload failed");
    } catch {
      toast.error("Failed to upload private document", { id: toastId });
    } finally {
      setIsUploadingDoc(false);
      if (docInputRef.current) docInputRef.current.value = "";
    }
  };

  const handleRemoveDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  // Main Save Handler
  const handleSave = async (targetStatus?: ListingStatus, targetAvailability?: AvailabilityStatus) => {
    if (!title.trim()) {
      toast.error("Property Title is required");
      return;
    }
    if (!price || isNaN(Number(price))) {
      toast.error("Valid expected price is required");
      return;
    }

    setIsSaving(true);
    const nextStatus = targetStatus || status;
    const nextAvailability = targetAvailability || availabilityStatus;
    const notes = statusNotes.trim() || `Admin updated property details (Status: ${nextStatus}, Availability: ${nextAvailability})`;

    const toastId = toast.loading("Saving property updates...");

    try {
      await updateProperty(
        property.id,
        {
          title: title.trim(),
          category,
          property_type: propertyType,
          description: description.trim(),
          status: nextStatus,
          availability_status: nextAvailability,
          is_featured: isFeatured,
          state,
          city: city.trim() || "Delhi",
          locality: locality.trim() || city,
          address: address.trim() || "Delhi NCR",
          pincode: pincode.trim() || undefined,
          latitude: latitude ? parseFloat(latitude) : undefined,
          longitude: longitude ? parseFloat(longitude) : undefined,
          nearby_landmarks: landmarks,
          road_connectivity: roadConnectivity,
          price: parseFloat(price),
          price_negotiable: priceNegotiable,
          price_unit: priceUnit,
          total_area: parseFloat(totalArea) || property.total_area,
          area_unit: areaUnit,
          built_up_area: builtUpArea ? parseFloat(builtUpArea) : undefined,
          road_width: roadWidth ? parseFloat(roadWidth) : undefined,
          bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
          bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
          furnishing: (furnishing || undefined) as any,
          ceiling_height: ceilingHeight ? parseFloat(ceilingHeight) : undefined,
          power_availability: powerAvailability || undefined,
          water_availability: waterAvailability || undefined,
          images,
          video_url: videoUrl.trim() || undefined,
          documents,
        },
        OFFICIAL_BUSINESS.email,
        notes
      );

      toast.success(`Property updated successfully! Status: ${getStatusLabel(nextStatus)}`, { id: toastId });
      setStatus(nextStatus);
      setAvailabilityStatus(nextAvailability);
      setStatusNotes("");
      router.push("/admin/properties");
    } catch {
      toast.error("Failed to update property", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicate = async () => {
    const toastId = toast.loading("Duplicating listing as draft...");
    try {
      const duplicated = await duplicateProperty(property.id);
      if (duplicated) {
        toast.success(`Duplicated: ${duplicated.listing_id}`, { id: toastId });
        router.push(`/admin/properties/${duplicated.id}/edit`);
      } else {
        toast.error("Failed to duplicate listing", { id: toastId });
      }
    } catch {
      toast.error("Error duplicating listing", { id: toastId });
    }
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to permanently delete listing ${property.listing_id}?`)) {
      deleteProperty(property.id);
      toast.success("Listing deleted permanently.");
      router.push("/admin/properties");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      {/* Top Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/properties"
            className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#172B4D] mb-1.5 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Properties Registry
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#172B4D] font-display">
              Edit Property Listing
            </h1>
            <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 rounded text-[#172B4D]">
              {property.listing_id}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`badge border text-xs capitalize ${getStatusColor(status)}`}>
              {getStatusLabel(status)}
            </span>
            <span className="badge border text-xs capitalize bg-slate-100 text-[#172B4D]">
              {availabilityStatus.replace("-", " ")}
            </span>
            <span className={`badge border text-xs capitalize ${getSourceColor(property.source)}`}>
              {getSourceLabel(property.source)}
            </span>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleDuplicate}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 bg-white shadow-sm"
            title="Duplicate listing"
          >
            <Copy className="w-3.5 h-3.5 text-[#C6A66B]" /> Duplicate
          </button>

          {status === "published" && (
            <Link
              href={`/properties/${property.slug}`}
              target="_blank"
              className="btn-secondary text-xs py-2 px-3 bg-white flex items-center gap-1 shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Live Link
            </Link>
          )}

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-4 h-4 text-[#C6A66B]" /> Save Changes
          </button>

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

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Fields (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Basic Details */}
          <div className="card p-6 border border-[#E2E8F0] space-y-4">
            <h2 className="text-base font-bold text-[#172B4D] font-display flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#C6A66B]" /> Basic Property Details
            </h2>

            <div>
              <label className="label-field">Property Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field text-sm font-semibold"
                placeholder="e.g. 500 Sq Yd Freehold Industrial Plot in Okhla Phase 3"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">Asset Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PropertyCategory)}
                  className="input-field text-xs font-semibold"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-field">Property Type / Sub-Type</label>
                <input
                  type="text"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                  className="input-field text-xs"
                  placeholder="e.g. industrial-plot, warehouse, villa"
                />
              </div>
            </div>

            <div>
              <label className="label-field">Detailed Description</label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field text-xs resize-none leading-relaxed"
                placeholder="Comprehensive description of the property, features, road access, and legal approvals..."
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 accent-[#172B4D]"
              />
              <span className="text-xs font-semibold text-[#172B4D]">
                Feature prominently on Homepage Highlights
              </span>
            </label>
          </div>

          {/* 2. Pricing & Area */}
          <div className="card p-6 border border-[#E2E8F0] space-y-4">
            <h2 className="text-base font-bold text-[#172B4D] font-display flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#C6A66B]" /> Pricing & Area Dimensions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label-field">Expected Price (₹) *</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="input-field text-xs font-semibold"
                />
                <span className="text-[10px] text-[#64748B] mt-1 block">
                  {price && `Display: ${formatPrice(Number(price))}`}
                </span>
              </div>

              <div>
                <label className="label-field">Price Calculation Unit</label>
                <select
                  value={priceUnit}
                  onChange={(e) => setPriceUnit(e.target.value as any)}
                  className="input-field text-xs"
                >
                  <option value="total">Total Price</option>
                  <option value="per-sqft">Per Sq Ft</option>
                  <option value="per-acre">Per Acre</option>
                </select>
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#172B4D]">
                  <input
                    type="checkbox"
                    checked={priceNegotiable}
                    onChange={(e) => setPriceNegotiable(e.target.checked)}
                    className="w-4 h-4 accent-[#172B4D]"
                  />
                  <span>Price Negotiable</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label-field">Total Area *</label>
                <input
                  type="number"
                  value={totalArea}
                  onChange={(e) => setTotalArea(e.target.value)}
                  className="input-field text-xs font-semibold"
                />
              </div>

              <div>
                <label className="label-field">Area Unit *</label>
                <select
                  value={areaUnit}
                  onChange={(e) => setAreaUnit(e.target.value as AreaUnit)}
                  className="input-field text-xs"
                >
                  {AREA_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-field">Built-up Area</label>
                <input
                  type="number"
                  placeholder="Optional"
                  value={builtUpArea}
                  onChange={(e) => setBuiltUpArea(e.target.value)}
                  className="input-field text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label-field">Front Road Width (Meters/Ft)</label>
                <input
                  type="number"
                  placeholder="e.g. 18 or 24"
                  value={roadWidth}
                  onChange={(e) => setRoadWidth(e.target.value)}
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="label-field">Bedrooms (Residential)</label>
                <input
                  type="number"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="label-field">Bathrooms</label>
                <input
                  type="number"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="input-field text-xs"
                />
              </div>
            </div>
          </div>

          {/* 3. Location Details */}
          <div className="card p-6 border border-[#E2E8F0] space-y-4">
            <h2 className="text-base font-bold text-[#172B4D] font-display flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#C6A66B]" /> Location &amp; Google Maps
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label-field">State *</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="input-field text-xs"
                >
                  {STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-field">City *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="input-field text-xs font-semibold"
                />
              </div>

              <div>
                <label className="label-field">Locality / Sector *</label>
                <input
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="input-field text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-3">
                <label className="label-field">Complete Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="label-field">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="input-field text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">Google Maps Latitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 28.5355"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="input-field text-xs font-mono"
                />
              </div>

              <div>
                <label className="label-field">Google Maps Longitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 77.3910"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="input-field text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* 4. Photos & Media Management */}
          <div className="card p-6 border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#172B4D] font-display flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#C6A66B]" /> Property Photos &amp; Video ({images.length})
              </h2>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingMedia}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" /> Upload Photos
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*,video/mp4"
              onChange={handleMediaUpload}
              className="hidden"
            />

            {/* Quick URL Adder */}
            <div className="flex items-center gap-2">
              <input
                type="url"
                placeholder="Or paste direct image URL (https://...)"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="input-field text-xs flex-1"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="btn-secondary text-xs py-2 px-3 whitespace-nowrap"
              >
                Add URL
              </button>
            </div>

            {/* Photos Preview Grid with Cover & Reorder Controls */}
            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <div
                    key={img.id || idx}
                    className={`relative rounded-xl overflow-hidden border-2 bg-slate-100 group aspect-video ${
                      img.is_cover ? "border-[#C6A66B] ring-2 ring-[#C6A66B]/30" : "border-slate-200"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`Property Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Cover badge */}
                    {img.is_cover && (
                      <span className="absolute top-1 left-1 bg-[#C6A66B] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                        Cover
                      </span>
                    )}

                    {/* Overlay controls on hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                      <div className="flex items-center justify-between">
                        {!img.is_cover ? (
                          <button
                            type="button"
                            onClick={() => handleSetCover(img.id)}
                            className="text-[10px] bg-white text-[#172B4D] px-1.5 py-0.5 rounded font-semibold hover:bg-[#C6A66B] hover:text-white"
                          >
                            Set Cover
                          </button>
                        ) : (
                          <span className="text-[10px] text-amber-300 font-bold">Main Photo</span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img.id)}
                          className="p-1 text-red-400 hover:text-red-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveImage(idx, "left")}
                          className="p-1 text-white hover:text-[#C6A66B] disabled:opacity-30"
                          title="Move earlier"
                        >
                          <MoveLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] text-white font-mono">{idx + 1}</span>
                        <button
                          type="button"
                          disabled={idx === images.length - 1}
                          onClick={() => handleMoveImage(idx, "right")}
                          className="p-1 text-white hover:text-[#C6A66B] disabled:opacity-30"
                          title="Move later"
                        >
                          <MoveRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center text-[#64748B] text-xs">
                No property photos attached yet. Upload real property photos or provide URLs.
              </div>
            )}

            {/* Video URL */}
            <div className="pt-2">
              <label className="label-field flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-[#C6A66B]" /> Property Video Walkthrough URL
              </label>
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=... or direct MP4 URL"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="input-field text-xs"
              />
            </div>
          </div>

          {/* 5. Confidential Documents (Admin-Only Private) */}
          <div className="card p-6 border border-amber-200 bg-amber-50/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <h2 className="text-base font-bold text-[#172B4D] font-display">
                  Confidential Ownership Documents
                </h2>
              </div>
              <span className="badge bg-amber-100 text-amber-800 text-[10px]">Strictly Admin Access</span>
            </div>

            <p className="text-xs text-[#64748B]">
              Upload title deeds, registry copies, or municipal sanctions. These files are kept in private storage and never exposed to public marketplace visitors.
            </p>

            <input
              type="file"
              ref={docInputRef}
              accept=".pdf,.doc,.docx,image/*"
              onChange={handleDocUpload}
              className="hidden"
            />

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Document Title (e.g. Sale Deed / Khatoni / Sanction Plan)"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="input-field text-xs flex-1"
              />
              <button
                type="button"
                onClick={() => docInputRef.current?.click()}
                disabled={isUploadingDoc}
                className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 whitespace-nowrap bg-white border-amber-300"
              >
                <Upload className="w-3.5 h-3.5" /> Upload File
              </button>
            </div>

            {documents.length > 0 ? (
              <div className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-xl bg-white overflow-hidden text-xs">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div className="font-bold text-[#172B4D]">{doc.title}</div>
                        <div className="text-[10px] text-[#64748B] font-mono">{doc.file_url}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(doc.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-[#64748B] italic">No confidential documents attached.</div>
            )}
          </div>
        </div>

        {/* Right Column: Status & Operational Controls (1 Col) */}
        <div className="space-y-6">
          {/* Status & Availability Transition Card */}
          <div className="card p-6 border border-[#E2E8F0] space-y-4">
            <h2 className="text-sm font-bold text-[#172B4D] uppercase tracking-wider">
              Marketplace Lifecycle
            </h2>

            <div>
              <label className="label-field text-xs">Listing Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ListingStatus)}
                className="input-field text-xs font-semibold"
              >
                <option value="draft">Draft (Hidden)</option>
                <option value="pending">Pending Review</option>
                <option value="published">Published (Live Marketplace)</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
                <option value="unpublished">Unpublished</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="label-field text-xs">Commercial Availability</label>
              <select
                value={availabilityStatus}
                onChange={(e) => setAvailabilityStatus(e.target.value as AvailabilityStatus)}
                className="input-field text-xs font-semibold"
              >
                <option value="available">Available</option>
                <option value="under-negotiation">Under Negotiation</option>
                <option value="sold">Sold Out</option>
                <option value="rented">Rented</option>
                <option value="ready-to-move">Ready to Move</option>
                <option value="under-construction">Under Construction</option>
              </select>
            </div>

            <div>
              <label className="label-field text-xs">Internal Audit Log Note</label>
              <textarea
                rows={2}
                placeholder="Reason for change / verification details..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                className="input-field text-xs resize-none"
              />
            </div>

            {/* Quick Status Buttons */}
            <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => handleSave("published", "available")}
                disabled={isSaving}
                className="btn-primary w-full py-2 text-xs justify-center bg-green-700 hover:bg-green-800"
              >
                <CheckCircle2 className="w-4 h-4" /> Publish Immediately
              </button>

              <button
                type="button"
                onClick={() => handleSave("draft")}
                disabled={isSaving}
                className="btn-secondary w-full py-2 text-xs justify-center bg-slate-50"
              >
                Save as Draft
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSave("sold", "sold")}
                  disabled={isSaving}
                  className="btn-secondary py-1.5 text-[11px] justify-center text-blue-700 border-blue-200"
                >
                  Mark Sold
                </button>
                <button
                  type="button"
                  onClick={() => handleSave("published", "under-negotiation")}
                  disabled={isSaving}
                  className="btn-secondary py-1.5 text-[11px] justify-center text-purple-700 border-purple-200"
                >
                  Under Negotiation
                </button>
              </div>

              {status === "published" && (
                <button
                  type="button"
                  onClick={() => handleSave("unpublished")}
                  disabled={isSaving}
                  className="btn-secondary w-full py-1.5 text-[11px] justify-center text-slate-700"
                >
                  Unpublish Listing
                </button>
              )}
            </div>
          </div>

          {/* Seller / Submitter Card */}
          <div className="card p-6 border border-[#E2E8F0] space-y-3">
            <h2 className="text-sm font-bold text-[#172B4D]">Submitter &amp; Ownership</h2>
            <div className="text-xs space-y-2 text-[#64748B]">
              <div>
                <span className="text-slate-400">Name:</span>{" "}
                <strong className="text-[#172B4D]">{property.seller_name || "Admin (Aditya Raj)"}</strong>
              </div>
              <div>
                <span className="text-slate-400">Mobile:</span>{" "}
                <strong className="text-[#172B4D]">{property.seller_mobile || "+91 8377056503"}</strong>
              </div>
              <div>
                <span className="text-slate-400">Source:</span>{" "}
                <span className="capitalize">{property.source}</span>
              </div>
              <div>
                <span className="text-slate-400">Created:</span>{" "}
                <span>{formatDateTime(property.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Listing Audit Trail */}
          <div className="card p-6 border border-[#E2E8F0] space-y-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#C6A66B]" />
              <h2 className="text-sm font-bold text-[#172B4D]">Audit Trail</h2>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(property.audit_logs || []).map((log) => (
                <div key={log.id} className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#172B4D]">{log.action}</span>
                    <span className="text-[10px] text-[#64748B]">{formatDateTime(log.timestamp)}</span>
                  </div>
                  <div className="text-slate-500 text-[11px]">By: {log.changed_by}</div>
                  {log.notes && <div className="text-slate-600 italic text-[11px]">&quot;{log.notes}&quot;</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
