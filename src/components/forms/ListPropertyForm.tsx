"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import {
  Upload,
  CheckCircle2,
  Loader2,
  Building2,
  User,
  FileText,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Image as ImageIcon,
  Video,
  X,
  Star,
  ShieldCheck,
} from "lucide-react";
import { usePropertyStore } from "@/lib/property-store";
import { PropertyCategory, PropertyType, PropertyImage } from "@/types";

const STATES = ["Delhi", "Haryana", "Uttar Pradesh", "Uttarakhand", "Rajasthan", "Punjab"];
const AREA_UNITS = ["sqft", "sqm", "sqyd", "acre", "bigha", "kanal", "marla", "hectare"];
const CATEGORIES: { label: string; value: PropertyCategory }[] = [
  { label: "Residential", value: "residential" },
  { label: "Commercial", value: "commercial" },
  { label: "Industrial", value: "industrial" },
  { label: "Agricultural", value: "agricultural" },
  { label: "Institutional", value: "institutional" },
  { label: "Large Land Parcel", value: "large-land" },
];

const PROPERTY_TYPES: Record<PropertyCategory, { label: string; value: PropertyType }[]> = {
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

const formSchema = z.object({
  // Contact
  seller_name: z.string().min(2, "Name must be at least 2 characters"),
  seller_mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  seller_email: z.string().email("Invalid email").optional().or(z.literal("")),
  seller_type: z.enum(["owner", "agent", "developer"]),

  // Core Property
  title: z.string().min(5, "Title must be at least 5 characters"),
  category: z.string().min(1, "Select a category"),
  property_type: z.string().min(1, "Select a property type"),
  state: z.string().min(1, "Select a state"),
  city: z.string().min(1, "Enter city"),
  locality: z.string().min(1, "Enter locality"),
  address: z.string().min(5, "Enter exact address"),
  description: z.string().min(20, "Description must be at least 20 characters"),

  // Area & Price
  total_area: z.string().min(1, "Enter total area"),
  area_unit: z.string().min(1, "Select area unit"),
  built_up_area: z.string().optional(),
  expected_price: z.string().min(1, "Enter expected price"),
  road_width: z.string().optional(),

  // Dynamic Residential
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  furnishing: z.string().optional(),

  // Dynamic Industrial
  ceiling_height: z.string().optional(),
  power_availability: z.string().optional(),
  loading_facilities: z.boolean().optional(),

  // Dynamic Agricultural
  land_type: z.string().optional(),
  water_availability: z.string().optional(),
  road_access: z.string().optional(),

  // Video URL
  video_url: z.string().optional(),

  // Consent & Authorization
  consent: z.boolean().refine((v) => v, "Consent is required to contact you"),
  authorization_confirmed: z.boolean().refine((v) => v, "Ownership / legal listing authorization confirmation is required"),
});

type FormData = z.infer<typeof formSchema>;

const SAMPLE_IMAGE_PRESETS = [
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&q=80",
];

export default function ListPropertyForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirmedListing, setConfirmedListing] = useState<{ id: string; listing_id: string; title: string } | null>(null);

  // Uploaded media state
  const [images, setImages] = useState<PropertyImage[]>([
    {
      id: "img-init-1",
      property_id: "",
      url: SAMPLE_IMAGE_PRESETS[0],
      is_cover: true,
      sort_order: 0,
      created_at: new Date().toISOString(),
    },
  ]);
  const [newImageUrl, setNewImageUrl] = useState("");

  const { addProperty } = usePropertyStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      seller_type: "owner",
      area_unit: "sqft",
      consent: false,
      authorization_confirmed: false,
      loading_facilities: false,
    },
  });

  const selectedCategory = (watch("category") as PropertyCategory) || "residential";

  const handleAddImage = (urlToAdd?: string) => {
    const url = urlToAdd || newImageUrl.trim();
    if (!url) return;
    const newImg: PropertyImage = {
      id: "img-" + Date.now() + Math.random().toString(36).substring(2, 5),
      property_id: "",
      url,
      is_cover: images.length === 0,
      sort_order: images.length,
      created_at: new Date().toISOString(),
    };
    setImages((prev) => [...prev, newImg]);
    if (!urlToAdd) setNewImageUrl("");
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

  const handleSetCover = (id: string) => {
    setImages((prev) =>
      prev.map((img) => ({ ...img, is_cover: img.id === id }))
    );
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    if (step === 1) fieldsToValidate = ["seller_name", "seller_mobile", "seller_type"];
    if (step === 2) fieldsToValidate = ["title", "category", "property_type", "state", "city", "locality", "address", "description"];
    if (step === 3) fieldsToValidate = ["total_area", "area_unit", "expected_price"];

    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep((s) => s + 1);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // 1. Submit through the central property store with status 'pending' (Pending Review)
      const newProp = addProperty({
        title: data.title,
        description: data.description,
        category: data.category as PropertyCategory,
        property_type: data.property_type as PropertyType,
        status: "pending", // Public submissions are ALWAYS pending review
        source: data.seller_type as "owner" | "agent" | "developer",
        availability_status: "available",
        state: data.state,
        city: data.city,
        locality: data.locality,
        address: data.address,
        price: parseFloat(data.expected_price),
        total_area: parseFloat(data.total_area),
        area_unit: data.area_unit as any,
        built_up_area: data.built_up_area ? parseFloat(data.built_up_area) : undefined,
        road_width: data.road_width ? parseFloat(data.road_width) : undefined,
        bedrooms: data.bedrooms ? parseInt(data.bedrooms) : undefined,
        bathrooms: data.bathrooms ? parseInt(data.bathrooms) : undefined,
        furnishing: data.furnishing as any,
        ceiling_height: data.ceiling_height ? parseFloat(data.ceiling_height) : undefined,
        power_availability: data.power_availability,
        loading_facilities: data.loading_facilities,
        land_type: data.land_type,
        water_availability: data.water_availability,
        road_access: data.road_access,
        video_url: data.video_url,
        images: images,
        seller_name: data.seller_name,
        seller_mobile: data.seller_mobile,
        seller_email: data.seller_email,
        seller_type: data.seller_type,
      });

      // 2. Also send payload to backend API route for webhook trigger / DB replication
      try {
        await fetch("/api/properties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            listing_id: newProp.listing_id,
            status: "pending",
          }),
        });
      } catch (apiErr) {
        // Non-blocking
      }

      setConfirmedListing({
        id: newProp.id,
        listing_id: newProp.listing_id,
        title: newProp.title,
      });
      setSubmitted(true);
      toast.success("Property submitted for admin review!");
    } catch (error) {
      toast.error("Submission failed. Please check form fields.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted && confirmedListing) {
    return (
      <div className="max-w-lg mx-auto text-center py-10 animate-fade-in">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
          <ShieldCheck className="w-10 h-10 text-amber-700" />
        </div>
        <span className="badge bg-amber-100 text-amber-800 text-xs mb-3 font-semibold px-3 py-1">
          STATUS: PENDING REVIEW
        </span>
        <h2 className="text-2xl font-bold text-[#172B4D] font-display mb-2">
          Submission Received Successfully!
        </h2>
        <p className="text-[#64748B] text-sm mb-4 leading-relaxed">
          Your property has been logged into the central review registry.
          Public visitors cannot view your listing until it is approved by an administrator.
        </p>
        <div className="bg-[#EAF3FA] rounded-2xl p-5 mb-6 text-left border border-[#E2E8F0]">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-[#E2E8F0]">
            <span className="text-xs text-[#64748B]">Assigned Listing ID:</span>
            <span className="font-mono font-bold text-sm text-[#172B4D]">{confirmedListing.listing_id}</span>
          </div>
          <div className="text-xs text-[#172B4D] font-semibold mb-2 line-clamp-1">
            {confirmedListing.title}
          </div>
          <p className="text-xs text-[#64748B]">
            ✓ Admin will verify ownership declaration and boundary details.
            <br />
            ✓ You will receive notification on your mobile number once published.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/properties" className="btn-primary text-sm py-2.5 px-5">
            Browse Live Properties
          </Link>
          <button
            onClick={() => {
              setSubmitted(false);
              setStep(1);
            }}
            className="btn-secondary text-sm py-2.5 px-5"
          >
            Submit Another Property
          </button>
        </div>
      </div>
    );
  }

  const STEPS = [
    { number: 1, label: "Seller Details", icon: User },
    { number: 2, label: "Property & Specs", icon: Building2 },
    { number: 3, label: "Price, Area & Media", icon: FileText },
    { number: 4, label: "Authorization", icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((s, index) => {
          const Icon = s.icon;
          return (
            <div key={s.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    step > s.number
                      ? "bg-green-600 text-white"
                      : step === s.number
                      ? "bg-[#172B4D] text-white ring-4 ring-[#172B4D]/10"
                      : "bg-[#E2E8F0] text-[#64748B]"
                  }`}
                >
                  {step > s.number ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span
                  className={`text-xs mt-1 font-medium hidden sm:block ${
                    step === s.number ? "text-[#172B4D] font-bold" : "text-[#64748B]"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${step > s.number ? "bg-green-600" : "bg-[#E2E8F0]"}`}
                  style={{ minWidth: "40px" }}
                />
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Seller / Contact Information */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-[#172B4D] font-display mb-3">
              Step 1: Ownership & Contact Details
            </h2>

            <div>
              <label className="label-field">Full Legal Name *</label>
              <input {...register("seller_name")} placeholder="Your full name" className="input-field text-sm" />
              {errors.seller_name && <p className="text-xs text-red-500 mt-1">{errors.seller_name.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">10-Digit Mobile Number *</label>
                <input
                  {...register("seller_mobile")}
                  placeholder="e.g. 9810123456"
                  className="input-field text-sm"
                  maxLength={10}
                />
                {errors.seller_mobile && <p className="text-xs text-red-500 mt-1">{errors.seller_mobile.message}</p>}
              </div>

              <div>
                <label className="label-field">Email Address (Optional)</label>
                <input {...register("seller_email")} type="email" placeholder="your@email.com" className="input-field text-sm" />
              </div>
            </div>

            <div>
              <label className="label-field">I am Listing as: *</label>
              <select {...register("seller_type")} className="input-field text-sm">
                <option value="owner">Direct Property Owner</option>
                <option value="agent">Authorized Real Estate Agent / Mandate Holder</option>
                <option value="developer">Builder / Real Estate Developer</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Property Core & Dynamic Specifications */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-[#172B4D] font-display mb-3">
              Step 2: Property Category & Specifications
            </h2>

            <div>
              <label className="label-field">Property Title *</label>
              <input
                {...register("title")}
                placeholder="e.g. 4 BHK Independent Builder Floor with Stilt Parking"
                className="input-field text-sm"
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">Property Category *</label>
                <select {...register("category")} className="input-field text-sm">
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-field">Property Type *</label>
                <select {...register("property_type")} className="input-field text-sm">
                  {(PROPERTY_TYPES[selectedCategory] || []).map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-field">State *</label>
                <select {...register("state")} className="input-field text-sm">
                  {STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-field">City *</label>
                <input {...register("city")} placeholder="e.g. Delhi, Gurugram" className="input-field text-sm" />
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">Locality / Sector *</label>
                <input {...register("locality")} placeholder="e.g. Sector 10, Dwarka" className="input-field text-sm" />
                {errors.locality && <p className="text-xs text-red-500 mt-1">{errors.locality.message}</p>}
              </div>
              <div>
                <label className="label-field">Exact Address *</label>
                <input {...register("address")} placeholder="House / Plot number, Road, Sector" className="input-field text-sm" />
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
              </div>
            </div>

            {/* Dynamic fields based on Category */}
            {selectedCategory === "residential" && (
              <div className="p-4 bg-[#EAF3FA] rounded-xl space-y-3">
                <div className="text-xs font-bold text-[#172B4D] uppercase">Residential Specifications</div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-[#172B4D] mb-1 block">Bedrooms (BHK)</label>
                    <input {...register("bedrooms")} type="number" placeholder="e.g. 3" className="input-field text-xs py-2" />
                  </div>
                  <div>
                    <label className="text-xs text-[#172B4D] mb-1 block">Bathrooms</label>
                    <input {...register("bathrooms")} type="number" placeholder="e.g. 3" className="input-field text-xs py-2" />
                  </div>
                  <div>
                    <label className="text-xs text-[#172B4D] mb-1 block">Furnishing</label>
                    <select {...register("furnishing")} className="input-field text-xs py-2">
                      <option value="unfurnished">Unfurnished</option>
                      <option value="semi-furnished">Semi-Furnished</option>
                      <option value="furnished">Fully Furnished</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {selectedCategory === "industrial" && (
              <div className="p-4 bg-[#EAF3FA] rounded-xl space-y-3">
                <div className="text-xs font-bold text-[#172B4D] uppercase">Industrial / Warehouse Specifications</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#172B4D] mb-1 block">Ceiling Clear Height (Ft)</label>
                    <input {...register("ceiling_height")} placeholder="e.g. 30" className="input-field text-xs py-2" />
                  </div>
                  <div>
                    <label className="text-xs text-[#172B4D] mb-1 block">Power Availability</label>
                    <input {...register("power_availability")} placeholder="e.g. Three Phase 100 KVA" className="input-field text-xs py-2" />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer mt-1">
                  <input {...register("loading_facilities")} type="checkbox" className="w-4 h-4 accent-[#172B4D]" />
                  <span className="text-xs text-[#172B4D] font-medium">Dedicated Loading Docks / Bays Available</span>
                </label>
              </div>
            )}

            {selectedCategory === "agricultural" && (
              <div className="p-4 bg-[#EAF3FA] rounded-xl space-y-3">
                <div className="text-xs font-bold text-[#172B4D] uppercase">Agricultural Land Specifications</div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-[#172B4D] mb-1 block">Soil / Land Type</label>
                    <input {...register("land_type")} placeholder="e.g. Irrigated / Fertile" className="input-field text-xs py-2" />
                  </div>
                  <div>
                    <label className="text-xs text-[#172B4D] mb-1 block">Water Source</label>
                    <input {...register("water_availability")} placeholder="Canal + Borewell" className="input-field text-xs py-2" />
                  </div>
                  <div>
                    <label className="text-xs text-[#172B4D] mb-1 block">Road Access</label>
                    <input {...register("road_access")} placeholder="Pucca Metalled Road" className="input-field text-xs py-2" />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="label-field">Detailed Description *</label>
              <textarea
                {...register("description")}
                rows={3}
                placeholder="Highlight location advantages, nearby expressways, connectivity, and amenities..."
                className="input-field text-sm resize-none"
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
            </div>
          </div>
        )}

        {/* Step 3: Area, Price & Multiple Image / Video Uploads */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-[#172B4D] font-display mb-3">
              Step 3: Area, Price & Property Photos
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-field">Total Area *</label>
                <input {...register("total_area")} type="number" placeholder="e.g. 250" className="input-field text-sm" />
                {errors.total_area && <p className="text-xs text-red-500 mt-1">{errors.total_area.message}</p>}
              </div>

              <div>
                <label className="label-field">Area Measurement Unit *</label>
                <select {...register("area_unit")} className="input-field text-sm">
                  {AREA_UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">Expected Total Asking Price (₹) *</label>
                <input {...register("expected_price")} type="number" placeholder="e.g. 15000000" className="input-field text-sm" />
                {errors.expected_price && <p className="text-xs text-red-500 mt-1">{errors.expected_price.message}</p>}
              </div>

              <div>
                <label className="label-field">Approaching Road Width (Ft)</label>
                <input {...register("road_width")} placeholder="e.g. 60" className="input-field text-sm" />
              </div>
            </div>

            {/* Multiple Photos Upload Section */}
            <div className="p-4 bg-white border border-[#E2E8F0] rounded-2xl shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#C6A66B]" />
                  <span className="font-bold text-sm text-[#172B4D]">Property Photography ({images.length})</span>
                </div>
                <span className="text-xs text-[#64748B]">Click star to select cover</span>
              </div>

              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {images.map((img) => (
                  <div key={img.id} className="relative h-24 rounded-xl overflow-hidden border border-[#E2E8F0] group">
                    <Image src={img.url} alt="Uploaded photo" fill className="object-cover" sizes="150px" />
                    {img.is_cover && (
                      <span className="absolute bottom-1 left-1 bg-[#C6A66B] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                        Cover
                      </span>
                    )}
                    <div className="absolute top-1 right-1 flex gap-1 opacity-90">
                      <button
                        type="button"
                        onClick={() => handleSetCover(img.id)}
                        className={`p-1 rounded-md text-white text-xs ${img.is_cover ? "bg-amber-500" : "bg-black/60 hover:bg-amber-500"}`}
                        title="Set as Cover Photo"
                      >
                        <Star className="w-3 h-3 fill-current" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img.id)}
                        className="p-1 rounded-md bg-red-600/80 text-white text-xs hover:bg-red-700"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Custom Photo URL */}
              <div className="flex gap-2 pt-2">
                <input
                  type="url"
                  placeholder="Paste direct image URL (or select preset below)..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="input-field text-xs py-2 flex-1"
                />
                <button
                  type="button"
                  onClick={() => handleAddImage()}
                  className="btn-secondary text-xs py-2 px-3 whitespace-nowrap"
                >
                  + Add Image
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-[11px] text-[#64748B]">Quick presets:</span>
                {SAMPLE_IMAGE_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddImage(p)}
                    className="text-[11px] text-[#172B4D] bg-[#EAF3FA] hover:bg-[#172B4D] hover:text-white px-2 py-0.5 rounded transition-colors"
                  >
                    Preset {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Walkthrough Link */}
            <div>
              <label className="label-field flex items-center gap-1.5">
                <Video className="w-4 h-4 text-[#C6A66B]" /> Property Video Walkthrough Link (Optional)
              </label>
              <input
                {...register("video_url")}
                placeholder="YouTube or cloud video URL (e.g. https://youtu.be/...)"
                className="input-field text-sm"
              />
            </div>
          </div>
        )}

        {/* Step 4: Review, Legal Declaration & Ownership Consent */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-[#172B4D] font-display mb-3">
              Step 4: Ownership Declaration & Authorization
            </h2>

            <div className="p-4 bg-[#EAF3FA] rounded-xl text-xs space-y-2 border border-[#E2E8F0]">
              <div className="font-bold text-[#172B4D] text-sm mb-1">Submission Review Summary:</div>
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-[#64748B]">Seller: </span><strong>{watch("seller_name")}</strong></div>
                <div><span className="text-[#64748B]">Contact: </span><strong>{watch("seller_mobile")}</strong></div>
                <div><span className="text-[#64748B]">Role: </span><strong className="capitalize">{watch("seller_type")}</strong></div>
                <div><span className="text-[#64748B]">Category: </span><strong className="capitalize">{watch("category")}</strong></div>
                <div><span className="text-[#64748B]">Location: </span><strong>{watch("city")} ({watch("locality")})</strong></div>
                <div><span className="text-[#64748B]">Asking: </span><strong>₹{Number(watch("expected_price") || 0).toLocaleString("en-IN")}</strong></div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 leading-relaxed">
                <strong>Admin Approval Mandatory:</strong> To protect buyers and maintain platform trust,
                all public submissions enter the Admin Dashboard with status <code>Pending Review</code>.
                Public visitors cannot view your listing until verified by our real estate diligence team.
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  {...register("authorization_confirmed")}
                  type="checkbox"
                  className="mt-1 w-4 h-4 accent-[#172B4D]"
                />
                <span className="text-xs text-[#172B4D] leading-relaxed">
                  <strong>Ownership / Listing Authorization Declaration: *</strong> I hereby solemnly declare that I am the lawful title owner or an authorized agent holding valid power of attorney / marketing mandate to advertise this parcel on Land Parcel.
                </span>
              </label>
              {errors.authorization_confirmed && (
                <p className="text-xs text-red-500">{errors.authorization_confirmed.message}</p>
              )}

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  {...register("consent")}
                  type="checkbox"
                  className="mt-1 w-4 h-4 accent-[#172B4D]"
                />
                <span className="text-xs text-[#64748B] leading-relaxed">
                  I give consent to Land Parcel to contact me via phone, WhatsApp, or email regarding prospective buyer inquiries, inspection coordination, and listing verification.
                </span>
              </label>
              {errors.consent && <p className="text-xs text-red-500">{errors.consent.message}</p>}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="btn-secondary flex-1 py-3"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="btn-primary flex-1 py-3 justify-center"
            >
              Continue to Step {step + 1} <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1 py-3 justify-center bg-[#172B4D] hover:bg-[#1e3a6e]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting for Review...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Submit for Admin Review
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
