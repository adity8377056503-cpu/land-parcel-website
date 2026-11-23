"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  Save,
  CheckCircle2,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Video,
  FileText,
  MapPin,
  Lock,
  Star,
  X,
  Globe,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { usePropertyStore } from "@/lib/property-store";
import {
  PropertyCategory,
  PropertyType,
  PropertyImage,
  PropertyDocument,
} from "@/types";
import toast from "react-hot-toast";

const STATES = ["Delhi", "Haryana", "Uttar Pradesh", "Uttarakhand", "Rajasthan", "Punjab"];
const AREA_UNITS = ["sqft", "sqm", "sqyd", "acre", "bigha", "kanal", "marla", "hectare"];
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

const PROPERTY_TYPES: Record<string, { label: string; value: PropertyType }[]> = {
  residential: [
    { label: "Independent House", value: "independent-house" },
    { label: "Builder Floor", value: "builder-floor" },
    { label: "Apartment / Flat", value: "apartment" },
    { label: "Villa", value: "villa" },
    { label: "Duplex House", value: "duplex-house" },
    { label: "Residential Plot", value: "residential-plot" },
  ],
  commercial: [
    { label: "Commercial Shop", value: "commercial-shop" },
    { label: "Office Space", value: "office-space" },
    { label: "Commercial Building", value: "commercial-building" },
    { label: "SCO Plot", value: "sco-plot" },
    { label: "Showroom", value: "showroom" },
    { label: "Retail Space", value: "retail-space" },
  ],
  industrial: [
    { label: "Industrial Plot", value: "industrial-plot" },
    { label: "Industrial Building", value: "industrial-building" },
    { label: "Warehouse", value: "warehouse" },
    { label: "Factory", value: "factory" },
    { label: "Manufacturing Unit", value: "manufacturing-unit" },
    { label: "Logistics Facility", value: "logistics-facility" },
  ],
  agricultural: [
    { label: "Agricultural Land", value: "agricultural-land" },
    { label: "Farmhouse", value: "farmhouse" },
    { label: "Farm Land", value: "farm-land" },
    { label: "Orchard", value: "orchard" },
  ],
  "plots-land": [
    { label: "Residential Plot", value: "residential-plot" },
    { label: "Commercial Land", value: "commercial-land" },
    { label: "Industrial Plot", value: "industrial-plot" },
    { label: "Investment Land", value: "investment-land" },
    { label: "Development Land", value: "development-land" },
  ],
  warehouses: [
    { label: "Warehouse", value: "warehouse" },
    { label: "Logistics Facility", value: "logistics-facility" },
    { label: "Industrial Building", value: "industrial-building" },
    { label: "Manufacturing Unit", value: "manufacturing-unit" },
  ],
  "shops-offices": [
    { label: "Commercial Shop", value: "commercial-shop" },
    { label: "Office Space", value: "office-space" },
    { label: "Showroom", value: "showroom" },
    { label: "Retail Space", value: "retail-space" },
    { label: "SCO Plot", value: "sco-plot" },
  ],
  institutional: [
    { label: "School", value: "school" },
    { label: "Hospital", value: "hospital" },
    { label: "College", value: "college" },
    { label: "Educational Building", value: "educational-building" },
    { label: "Institutional Land", value: "institutional-land" },
  ],
  "large-land": [
    { label: "Development Land", value: "development-land" },
    { label: "Investment Land", value: "investment-land" },
    { label: "Bulk Land Parcel", value: "bulk-land" },
    { label: "Township Land", value: "township-land" },
  ],
};

export default function AdminNewPropertyPage() {
  const router = useRouter();
  const { addProperty } = usePropertyStore();

  // Basic Details
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<PropertyCategory>("residential");
  const [propertyType, setPropertyType] = useState<PropertyType>("independent-house");
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  // Location
  const [state, setState] = useState("Delhi");
  const [city, setCity] = useState("Delhi");
  const [locality, setLocality] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [landmarks, setLandmarks] = useState("");
  const [roadConnectivity, setRoadConnectivity] = useState("");

  // Area & Price
  const [price, setPrice] = useState("");
  const [priceNegotiable, setPriceNegotiable] = useState(true);
  const [totalArea, setTotalArea] = useState("");
  const [areaUnit, setAreaUnit] = useState<any>("sqyd");
  const [builtUpArea, setBuiltUpArea] = useState("");
  const [roadWidth, setRoadWidth] = useState("");

  // Dynamic Specifications
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [furnishing, setFurnishing] = useState("semi-furnished");
  const [ceilingHeight, setCeilingHeight] = useState("");
  const [powerAvailability, setPowerAvailability] = useState("");
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [landType, setLandType] = useState("");
  const [waterAvailability, setWaterAvailability] = useState("");
  const [roadAccess, setRoadAccess] = useState("");

  // SEO
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  // Media
  const [videoUrl, setVideoUrl] = useState("");
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Private Documents
  const [documents, setDocuments] = useState<PropertyDocument[]>([]);
  const [docTitle, setDocTitle] = useState("");
  const [docUrl, setDocUrl] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    setIsUploadingMedia(true);
    const toastId = toast.loading("Uploading photos to secure storage...");

    try {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.media && Array.isArray(data.media)) {
          setImages((prev) => [
            ...prev,
            ...data.media.map((item: any, idx: number) => ({
              id: item.id || "img-" + Date.now() + "-" + idx,
              property_id: "",
              url: item.url,
              is_cover: prev.length === 0 && idx === 0,
              sort_order: prev.length + idx,
              created_at: new Date().toISOString(),
            })),
          ]);
          toast.success(`Successfully uploaded ${data.media.length} property photos!`, { id: toastId });
          return;
        }
      }
      throw new Error("Server upload returned non-200");
    } catch {
      // Resilient fallback: read as data URLs locally
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          const result = uploadEvent.target?.result as string;
          if (result) {
            setImages((prev) => [
              ...prev,
              {
                id: "img-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
                property_id: "",
                url: result,
                is_cover: prev.length === 0,
                sort_order: prev.length,
                created_at: new Date().toISOString(),
              },
            ]);
          }
        };
        reader.readAsDataURL(file);
      });
      toast.success("Photos added", { id: toastId });
    } finally {
      setIsUploadingMedia(false);
      e.target.value = "";
    }
  };

  const handleDocumentFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const docName = docTitle.trim() || file.name;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", docName);

    const toastId = toast.loading("Uploading confidential ownership document...");
    try {
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.document) {
          setDocuments((prev) => [...prev, json.document]);
          setDocTitle("");
          toast.success("Document attached to confidential registry", { id: toastId });
          return;
        }
      }
      throw new Error("Document upload failed");
    } catch {
      toast.error("Failed to upload document", { id: toastId });
    } finally {
      e.target.value = "";
    }
  };

  const handleAddImage = (url?: string) => {
    const target = url || imageUrlInput.trim();
    if (!target) return;
    setImages((prev) => [
      ...prev,
      {
        id: "img-" + Date.now(),
        property_id: "",
        url: target,
        is_cover: prev.length === 0,
        sort_order: prev.length,
        created_at: new Date().toISOString(),
      },
    ]);
    if (!url) setImageUrlInput("");
  };

  const handleSetCover = (id: string) => {
    setImages((prev) => prev.map((img) => ({ ...img, is_cover: img.id === id })));
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

  const handleAddDocument = () => {
    if (!docTitle.trim() || !docUrl.trim()) {
      toast.error("Provide document title and file URL");
      return;
    }
    setDocuments((prev) => [
      ...prev,
      {
        id: "doc-" + Date.now(),
        property_id: "",
        title: docTitle.trim(),
        file_url: docUrl.trim(),
        is_private: true, // Confidential
        created_at: new Date().toISOString(),
      },
    ]);
    setDocTitle("");
    setDocUrl("");
    toast.success("Document attached to confidential registry");
  };

  const handleRemoveDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSave = async (targetStatus: "draft" | "published") => {
    if (!title.trim()) {
      toast.error("Property Title is required");
      return;
    }
    if (!price || isNaN(Number(price))) {
      toast.error("Valid expected price is required");
      return;
    }
    if (!totalArea || isNaN(Number(totalArea))) {
      toast.error("Valid total area is required");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(
      targetStatus === "published" ? "Publishing property live..." : "Saving listing draft..."
    );

    try {
      const created = await addProperty({
        title: title.trim(),
        description: description.trim() || "Prime property listed by Land Parcel administrator.",
        category,
        property_type: propertyType,
        status: targetStatus,
        source: "admin", // Admin Added - permanently free & unlimited
        availability_status: "available",
        state,
        city: city.trim() || "Delhi",
        locality: locality.trim() || city,
        address: address.trim() || "Delhi NCR",
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        nearby_landmarks: landmarks,
        road_connectivity: roadConnectivity,
        price: parseFloat(price),
        price_negotiable: priceNegotiable,
        total_area: parseFloat(totalArea),
        area_unit: areaUnit,
        built_up_area: builtUpArea ? parseFloat(builtUpArea) : undefined,
        road_width: roadWidth ? parseFloat(roadWidth) : undefined,
        bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
        bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
        furnishing: furnishing as any,
        ceiling_height: ceilingHeight ? parseFloat(ceilingHeight) : undefined,
        power_availability: powerAvailability,
        loading_facilities: loadingFacilities,
        land_type: landType,
        water_availability: waterAvailability,
        road_access: roadAccess,
        is_featured: isFeatured,
        seo_title: seoTitle || `${title} | Land Parcel`,
        seo_description: seoDescription || description.slice(0, 160),
        video_url: videoUrl,
        images,
        documents,
      });

      if (targetStatus === "published") {
        toast.success(`Property published live with ID: ${created.listing_id}!`, { id: toastId });
      } else {
        toast.success(`Property saved as Draft with ID: ${created.listing_id}!`, { id: toastId });
      }

      router.push("/admin/properties");
    } catch (err: any) {
      toast.error("Failed to save property: " + (err?.message || "Unknown error"), { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/properties"
            className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#172B4D] mb-2 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Properties Registry
          </Link>
          <h1 className="text-2xl font-bold text-[#172B4D] font-display flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#C6A66B]" />
            Admin Property Upload
          </h1>
          <p className="text-xs text-[#64748B]">
            Upload verified residential, commercial, industrial, agricultural or bulk land parcels with direct publish authority.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSave("draft")}
            className="btn-secondary text-sm py-2.5 px-4 bg-white flex items-center gap-2"
          >
            <Save className="w-4 h-4 text-[#64748B]" /> Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave("published")}
            className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2 shadow-md"
          >
            <CheckCircle2 className="w-4 h-4 text-[#C6A66B]" /> Publish Immediately
          </button>
        </div>
      </div>

      {/* Main Form Sections */}
      <div className="space-y-6">
        {/* 1. Core Property Information */}
        <div className="card p-6 border border-[#E2E8F0] space-y-4">
          <h2 className="text-base font-bold text-[#172B4D] font-display flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#172B4D] text-white text-xs flex items-center justify-center">1</span>
            Core Property Information
          </h2>

          <div>
            <label className="label-field">Property Title *</label>
            <input
              type="text"
              placeholder="e.g. 5 Acres Agricultural Land Near Western Peripheral Expressway, Jhajjar"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Asset Category *</label>
              <select
                value={category}
                onChange={(e) => {
                  const cat = e.target.value as PropertyCategory;
                  setCategory(cat);
                  setPropertyType(PROPERTY_TYPES[cat][0].value);
                }}
                className="input-field text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-field">Property Type *</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                className="input-field text-sm"
              >
                {(PROPERTY_TYPES[category] || []).map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label-field">Detailed Property Description</label>
            <textarea
              rows={4}
              placeholder="Comprehensive architectural/land overview, zoning, boundary layout, legal status..."
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
            <span className="text-xs font-semibold text-[#172B4D] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C6A66B]" /> Mark as Curated / Featured Property on Homepage
            </span>
          </label>
        </div>

        {/* 2. Area, Pricing & Commercials */}
        <div className="card p-6 border border-[#E2E8F0] space-y-4">
          <h2 className="text-base font-bold text-[#172B4D] font-display flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#172B4D] text-white text-xs flex items-center justify-center">2</span>
            Area, Pricing & Road Access
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label-field">Total Area *</label>
              <input
                type="number"
                placeholder="e.g. 500"
                value={totalArea}
                onChange={(e) => setTotalArea(e.target.value)}
                className="input-field text-sm"
              />
            </div>

            <div>
              <label className="label-field">Measurement Unit *</label>
              <select
                value={areaUnit}
                onChange={(e) => setAreaUnit(e.target.value)}
                className="input-field text-sm"
              >
                {AREA_UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-field">Built-up / Covered Area (Optional)</label>
              <input
                type="number"
                placeholder="In sqft"
                value={builtUpArea}
                onChange={(e) => setBuiltUpArea(e.target.value)}
                className="input-field text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Asking Price (₹ Total) *</label>
              <input
                type="number"
                placeholder="e.g. 25000000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input-field text-sm font-semibold"
              />
              <span className="text-[11px] text-[#64748B] mt-1 block">
                {price && !isNaN(Number(price)) && `Display format: ₹${(Number(price) / 10000000).toFixed(2)} Cr`}
              </span>
            </div>

            <div>
              <label className="label-field">Road Frontage / Width (Ft)</label>
              <input
                type="number"
                placeholder="e.g. 60"
                value={roadWidth}
                onChange={(e) => setRoadWidth(e.target.value)}
                className="input-field text-sm"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={priceNegotiable}
              onChange={(e) => setPriceNegotiable(e.target.checked)}
              className="w-4 h-4 accent-[#172B4D]"
            />
            <span className="text-xs text-[#172B4D]">Price is open to discussion / negotiable</span>
          </label>
        </div>

        {/* 3. Dynamic Specifications by Category */}
        <div className="card p-6 border border-[#E2E8F0] space-y-4">
          <h2 className="text-base font-bold text-[#172B4D] font-display flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#172B4D] text-white text-xs flex items-center justify-center">3</span>
            Dynamic Specifications ({category.toUpperCase()})
          </h2>

          {category === "residential" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label-field">Bedrooms</label>
                <input
                  type="number"
                  placeholder="3"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="label-field">Bathrooms</label>
                <input
                  type="number"
                  placeholder="3"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="label-field">Furnishing Status</label>
                <select
                  value={furnishing}
                  onChange={(e) => setFurnishing(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="unfurnished">Unfurnished</option>
                  <option value="semi-furnished">Semi-Furnished</option>
                  <option value="furnished">Furnished</option>
                </select>
              </div>
            </div>
          )}

          {category === "industrial" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label-field">Ceiling Clear Height (Ft)</label>
                <input
                  placeholder="e.g. 32"
                  value={ceilingHeight}
                  onChange={(e) => setCeilingHeight(e.target.value)}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="label-field">Power Load (KVA)</label>
                <input
                  placeholder="e.g. 250 KVA Dedicated"
                  value={powerAvailability}
                  onChange={(e) => setPowerAvailability(e.target.value)}
                  className="input-field text-sm"
                />
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={loadingFacilities}
                    onChange={(e) => setLoadingFacilities(e.target.checked)}
                    className="w-4 h-4 accent-[#172B4D]"
                  />
                  <span className="text-xs font-semibold text-[#172B4D]">Docks / Heavy Bays</span>
                </label>
              </div>
            </div>
          )}

          {category === "agricultural" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label-field">Land / Soil Type</label>
                <input
                  placeholder="e.g. Alluvial / Fertile Cultivable"
                  value={landType}
                  onChange={(e) => setLandType(e.target.value)}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="label-field">Water / Irrigation</label>
                <input
                  placeholder="e.g. Canal Link + 2 Tube wells"
                  value={waterAvailability}
                  onChange={(e) => setWaterAvailability(e.target.value)}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="label-field">Road Access</label>
                <input
                  placeholder="e.g. Direct State Highway link"
                  value={roadAccess}
                  onChange={(e) => setRoadAccess(e.target.value)}
                  className="input-field text-sm"
                />
              </div>
            </div>
          )}

          {(category === "commercial" || category === "institutional" || category === "large-land") && (
            <div className="text-xs text-[#64748B] p-3 bg-slate-50 rounded-xl">
              Standard commercial and zoning specifications automatically configured for {category.replace("-", " ")}.
            </div>
          )}
        </div>

        {/* 4. Location & Map Coordinates */}
        <div className="card p-6 border border-[#E2E8F0] space-y-4">
          <h2 className="text-base font-bold text-[#172B4D] font-display flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#172B4D] text-white text-xs flex items-center justify-center">4</span>
            Location, Coordinates & Connectivity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label-field">State *</label>
              <select value={state} onChange={(e) => setState(e.target.value)} className="input-field text-sm">
                {STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">City *</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Gurugram" className="input-field text-sm" />
            </div>
            <div>
              <label className="label-field">Locality / Sector *</label>
              <input value={locality} onChange={(e) => setLocality(e.target.value)} placeholder="e.g. Sector 35" className="input-field text-sm" />
            </div>
          </div>

          <div>
            <label className="label-field">Full Physical Address</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Plot / Survey number, Sector, Road" className="input-field text-sm" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-field flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C6A66B]" /> Latitude (Map Coordinate)
              </label>
              <input value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="e.g. 28.4595" className="input-field text-sm font-mono" />
            </div>

            <div>
              <label className="label-field flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C6A66B]" /> Longitude (Map Coordinate)
              </label>
              <input value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="e.g. 77.0266" className="input-field text-sm font-mono" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Road Connectivity</label>
              <input value={roadConnectivity} onChange={(e) => setRoadConnectivity(e.target.value)} placeholder="e.g. 500m from NH-48 Express Corridor" className="input-field text-sm" />
            </div>
            <div>
              <label className="label-field">Nearby Key Landmarks</label>
              <input value={landmarks} onChange={(e) => setLandmarks(e.target.value)} placeholder="e.g. Metro Station, Hospital, Mandi" className="input-field text-sm" />
            </div>
          </div>
        </div>

        {/* 5. Photography & Video Tour */}
        <div className="card p-6 border border-[#E2E8F0] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#172B4D] font-display flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#172B4D] text-white text-xs flex items-center justify-center">5</span>
              Photography & Media ({images.length} photos)
            </h2>
            <span className="text-xs text-[#64748B]">Click star icon to designate cover photo</span>
          </div>

          {/* Photo File Upload Box */}
          <label className="border-2 border-dashed border-[#C6A66B]/50 hover:border-[#172B4D] rounded-xl p-5 text-center cursor-pointer bg-white transition-colors flex flex-col items-center justify-center gap-1.5 group">
            <Upload className="w-7 h-7 text-[#C6A66B] group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold text-[#172B4D]">Upload Real Photos from Device</span>
            <span className="text-xs text-[#64748B]">Click to browse multiple property photos (JPG, PNG, WebP)</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((img) => (
                <div key={img.id} className="relative h-28 rounded-xl overflow-hidden border border-[#E2E8F0] group">
                  <Image src={img.url} alt="Property Photo" fill className="object-cover" sizes="200px" />
                  {img.is_cover && (
                    <span className="absolute bottom-1.5 left-1.5 bg-[#C6A66B] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      Cover
                    </span>
                  )}
                  <div className="absolute top-1.5 right-1.5 flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleSetCover(img.id)}
                      className={`p-1 rounded text-white text-xs ${img.is_cover ? "bg-amber-500" : "bg-black/60 hover:bg-amber-500"}`}
                      title="Set Cover"
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.id)}
                      className="p-1 rounded bg-red-600/80 text-white text-xs hover:bg-red-700"
                      title="Remove Photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Or paste direct image URL (CDN / Cloud Storage)..."
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              className="input-field text-xs py-2 flex-1"
            />
            <button
              type="button"
              onClick={() => handleAddImage()}
              className="btn-secondary text-xs py-2 px-4 whitespace-nowrap"
            >
              + Add Image URL
            </button>
          </div>

          <div>
            <label className="label-field flex items-center gap-1.5">
              <Video className="w-4 h-4 text-[#C6A66B]" /> Property Video Walkthrough Link
            </label>
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="e.g. https://www.youtube.com/watch?v=..."
              className="input-field text-sm"
            />
          </div>
        </div>

        {/* 6. Confidential Ownership Documents (Private to Admin) */}
        <div className="card p-6 border border-amber-200 bg-amber-50/20 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold text-[#172B4D] font-display flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#172B4D] text-white text-xs flex items-center justify-center">6</span>
                Confidential Ownership Documents
                <span className="badge bg-amber-100 text-amber-800 text-[10px] ml-2 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> PRIVATE / ADMIN-ONLY
                </span>
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Attach registry deeds, mutations, survey maps or RERA approvals. These files are strictly shielded from public view.
              </p>
            </div>
          </div>

          {documents.length > 0 && (
            <div className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-xl bg-white overflow-hidden">
              {documents.map((doc) => (
                <div key={doc.id} className="p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="font-bold text-[#172B4D]">{doc.title}</div>
                      <div className="text-[10px] text-[#64748B] font-mono">{doc.file_url}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveDocument(doc.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <label className="border border-dashed border-amber-400 hover:border-amber-600 rounded-xl p-3 bg-white cursor-pointer flex items-center justify-center gap-2 text-xs font-semibold text-[#172B4D] transition-colors shrink-0">
              <Upload className="w-4 h-4 text-amber-600" />
              <span>Browse File (PDF / DOC / Image)</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,image/*"
                onChange={handleDocumentFileUpload}
                className="hidden"
              />
            </label>
            <input
              type="text"
              placeholder="Document Title (e.g. Sale Deed, Khata Certificate)"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="input-field text-xs py-2 bg-white flex-1"
            />
            <button
              type="button"
              onClick={handleAddDocument}
              className="btn-secondary text-xs py-2 px-3 bg-white whitespace-nowrap shrink-0"
            >
              + Add by URL
            </button>
          </div>
        </div>

        {/* 7. SEO Configuration */}
        <div className="card p-6 border border-[#E2E8F0] space-y-4">
          <h2 className="text-base font-bold text-[#172B4D] font-display flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#172B4D] text-white text-xs flex items-center justify-center">7</span>
            SEO Optimization & Social Metadata
          </h2>

          <div>
            <label className="label-field flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#C6A66B]" /> Custom SEO Page Title
            </label>
            <input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="e.g. 5 Acres Agricultural Land for Sale in Jhajjar | Land Parcel"
              className="input-field text-sm"
            />
          </div>

          <div>
            <label className="label-field">Meta Description for Search Engines</label>
            <textarea
              rows={2}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="Concise 150-160 character snippet for Google search ranking..."
              className="input-field text-sm resize-none"
            />
          </div>
        </div>

        {/* Bottom Floating-style Action Bar */}
        <div className="p-4 bg-white rounded-2xl shadow-card border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-4 z-10">
          <div className="text-xs text-[#64748B]">
            * <strong>Publish Immediately:</strong> listing is placed on public discovery.
            <br />* <strong>Save as Draft:</strong> remains visible only to admins in Drafts section.
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleSave("draft")}
              className="btn-secondary text-sm py-2.5 px-4 flex-1 sm:flex-none justify-center"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave("published")}
              className="btn-primary text-sm py-2.5 px-6 flex-1 sm:flex-none justify-center"
            >
              Publish Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
