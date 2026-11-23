"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin, Maximize2, IndianRupee, Calendar, Eye, MessageCircle,
  Phone, ArrowLeft, Building2, CheckCircle, Video, ShieldCheck, Share2
} from "lucide-react";
import { usePropertyStore } from "@/lib/property-store";
import { Property } from "@/types";
import { formatPrice, formatArea, getWhatsAppUrl, getPropertyWhatsAppMessage, formatDate, OFFICIAL_BUSINESS } from "@/lib/utils";
import EnquiryForm from "@/components/forms/EnquiryForm";
import toast from "react-hot-toast";

interface PropertyDetailClientProps {
  slug: string;
}

export default function PropertyDetailClient({ slug }: PropertyDetailClientProps) {
  const { properties, isLoaded } = usePropertyStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [fetchedProperty, setFetchedProperty] = useState<Property | null>(null);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);

  const cached = properties.find(
    (p) =>
      p.slug === slug ||
      p.id === slug ||
      (p.listing_id && p.listing_id.toLowerCase() === slug.toLowerCase())
  );

  useEffect(() => {
    if (!cached && slug) {
      setIsFetchingDetail(true);
      fetch(`/api/properties/${slug}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json?.property) {
            setFetchedProperty(json.property);
          }
        })
        .catch(() => {})
        .finally(() => setIsFetchingDetail(false));
    }
  }, [cached, slug]);

  const property = cached || fetchedProperty;

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || OFFICIAL_BUSINESS.whatsapp_link_number;
  const whatsappMessage = property ? getPropertyWhatsAppMessage(property.title, property.listing_id) : "";
  const whatsappUrl = getWhatsAppUrl(whatsappNumber, whatsappMessage);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      toast.success("Listing link copied to clipboard!");
    }
  };

  if (!isLoaded || (isFetchingDetail && !property)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-[#172B4D] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="bg-[#F5F7FA] min-h-[80vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-card border border-[#E2E8F0] p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#EAF3FA] flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-[#172B4D]" />
          </div>
          <h2 className="text-xl font-bold text-[#172B4D] font-display mb-2">
            Property Not Found or Has Been Delisted
          </h2>
          <p className="text-sm text-[#64748B] mb-6 leading-relaxed">
            The listing you are searching for is not currently active in our live marketplace. It may have been sold, rented, or saved as a draft.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/properties" className="btn-primary text-sm py-2.5 px-5">
              Browse Live Properties
            </Link>
            <a
              href={getWhatsAppUrl(
                OFFICIAL_BUSINESS.whatsapp_link_number,
                `Hello Suraj Prakash, I was looking for property listing ${slug} on Land Parcel.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp text-sm py-2.5 px-5"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Suraj Prakash
            </a>
          </div>
        </div>
      </div>
    );
  }

  const images = property.images || [];
  const coverImage = images[selectedImageIndex]?.url || images[0]?.url;

  const similarProperties = properties.filter(
    (p) => p.id !== property.id && p.category === property.category && p.status === "published"
  ).slice(0, 3);

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="container-custom py-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-[#64748B] overflow-hidden">
            <Link href="/" className="hover:text-[#172B4D] transition-colors shrink-0">Home</Link>
            <span>/</span>
            <Link href="/properties" className="hover:text-[#172B4D] transition-colors shrink-0">Properties</Link>
            <span>/</span>
            <span className="text-[#172B4D] font-medium truncate">{property.title}</span>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs text-[#172B4D] font-semibold hover:text-[#C6A66B] transition-colors shrink-0 ml-3"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery / Media Header */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-card border border-[#E2E8F0]">
              {coverImage ? (
                <div>
                  <div className="relative h-72 md:h-96 bg-[#172B4D]">
                    <Image
                      src={coverImage}
                      alt={property.title}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 1024px) 100vw, 66vw"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      {property.is_featured && (
                        <span className="badge bg-[#C6A66B] text-white">Featured</span>
                      )}
                      {property.source === "admin" && (
                        <span className="badge bg-[#172B4D] text-white flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-[#C6A66B]" /> Official Land Parcel Listing
                        </span>
                      )}
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-black/50 text-white text-xs font-mono rounded-lg backdrop-blur-sm">
                        {property.listing_id}
                      </span>
                    </div>
                  </div>

                  {/* Thumbnail Row */}
                  {images.length > 1 && (
                    <div className="p-3 bg-slate-50 border-t border-[#E2E8F0] flex gap-2 overflow-x-auto">
                      {images.map((img, idx) => (
                        <button
                          key={img.id || idx}
                          type="button"
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                            selectedImageIndex === idx ? "border-[#C6A66B] scale-105" : "border-transparent opacity-70 hover:opacity-100"
                          }`}
                        >
                          <Image src={img.url} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" sizes="80px" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-64 bg-gradient-to-br from-[#172B4D] via-[#1e3a6e] to-[#254170] flex flex-col items-center justify-center text-white/80 p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-3">
                    <Building2 className="w-8 h-8 text-[#C6A66B]" />
                  </div>
                  <h3 className="text-lg font-bold text-white font-display">Land Parcel Verified Property</h3>
                  <span className="text-xs text-[#C6A66B] tracking-wider uppercase font-semibold mt-1">
                    {property.category.replace("-", " ")}
                  </span>
                  <span className="px-3 py-1 bg-black/40 text-xs font-mono rounded-lg mt-3 text-slate-200">
                    ID: {property.listing_id}
                  </span>
                </div>
              )}
            </div>

            {/* Video Walkthrough (if supplied) */}
            {property.video_url && (
              <div className="bg-white rounded-2xl p-6 shadow-card border border-[#E2E8F0]">
                <h2 className="text-lg font-bold text-[#172B4D] font-display mb-3 flex items-center gap-2">
                  <Video className="w-5 h-5 text-[#C6A66B]" /> Property Video Walkthrough
                </h2>
                {property.video_url.includes("youtube.com") || property.video_url.includes("youtu.be") ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                    <iframe
                      src={
                        property.video_url.includes("watch?v=")
                          ? property.video_url.replace("watch?v=", "embed/")
                          : property.video_url
                      }
                      title="Property Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                ) : (
                  <a
                    href={property.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[#172B4D] font-semibold bg-[#EAF3FA] px-4 py-2.5 rounded-xl hover:bg-[#172B4D] hover:text-white transition-colors"
                  >
                    <Video className="w-4 h-4 text-[#C6A66B]" /> Open External Video Tour
                  </a>
                )}
              </div>
            )}

            {/* Title & Location Header */}
            <div className="bg-white rounded-2xl p-6 shadow-card border border-[#E2E8F0]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge bg-[#EAF3FA] text-[#172B4D] capitalize">
                      {property.category.replace("-", " ")}
                    </span>
                    <span className="badge bg-green-100 text-green-700 capitalize">
                      {property.availability_status.replace("-", " ")}
                    </span>
                    {property.source === "admin" && (
                      <span className="badge bg-blue-100 text-blue-800">
                        Admin Direct
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-[#172B4D] font-display leading-tight mb-3">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-1.5 text-[#64748B]">
                    <MapPin className="w-4 h-4 text-[#C6A66B] shrink-0" />
                    <span>{property.address || property.locality}, {property.city}, {property.state}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-3xl font-bold text-[#172B4D] font-display">
                    <IndianRupee className="w-6 h-6" />
                    {formatPrice(property.price)}
                  </div>
                  {property.price_negotiable && (
                    <span className="text-xs text-[#64748B]">Price Negotiable</span>
                  )}
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-[#E2E8F0]">
                <div className="text-center p-3 bg-[#F5F7FA] rounded-xl">
                  <div className="text-xs text-[#64748B] mb-1">Total Area</div>
                  <div className="font-semibold text-[#172B4D] text-sm">
                    {formatArea(property.total_area, property.area_unit)}
                  </div>
                </div>
                {property.bedrooms && (
                  <div className="text-center p-3 bg-[#F5F7FA] rounded-xl">
                    <div className="text-xs text-[#64748B] mb-1">Bedrooms</div>
                    <div className="font-semibold text-[#172B4D] text-sm">{property.bedrooms} BHK</div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="text-center p-3 bg-[#F5F7FA] rounded-xl">
                    <div className="text-xs text-[#64748B] mb-1">Bathrooms</div>
                    <div className="font-semibold text-[#172B4D] text-sm">{property.bathrooms}</div>
                  </div>
                )}
                {property.built_up_area && (
                  <div className="text-center p-3 bg-[#F5F7FA] rounded-xl">
                    <div className="text-xs text-[#64748B] mb-1">Built-up Area</div>
                    <div className="font-semibold text-[#172B4D] text-sm">
                      {property.built_up_area.toLocaleString()} sqft
                    </div>
                  </div>
                )}
                <div className="text-center p-3 bg-[#F5F7FA] rounded-xl">
                  <div className="text-xs text-[#64748B] mb-1">Listed On</div>
                  <div className="font-semibold text-[#172B4D] text-sm">
                    {formatDate(property.created_at)}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-card border border-[#E2E8F0]">
              <h2 className="text-xl font-bold text-[#172B4D] font-display mb-4">
                Property Description
              </h2>
              <p className="text-[#64748B] leading-relaxed whitespace-pre-line text-sm md:text-base">
                {property.description}
              </p>
            </div>

            {/* Property Specifications Details */}
            <div className="bg-white rounded-2xl p-6 shadow-card border border-[#E2E8F0]">
              <h2 className="text-xl font-bold text-[#172B4D] font-display mb-4">
                Detailed Specifications
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Category", value: property.category?.replace("-", " ") },
                  { label: "Property Type", value: property.property_type?.replace("-", " ") },
                  { label: "Total Area", value: formatArea(property.total_area, property.area_unit) },
                  property.built_up_area && { label: "Built-up Area", value: `${property.built_up_area.toLocaleString()} sqft` },
                  property.carpet_area && { label: "Carpet Area", value: `${property.carpet_area.toLocaleString()} sqft` },
                  property.covered_area && { label: "Covered Area", value: `${property.covered_area.toLocaleString()} sqft` },
                  property.bedrooms && { label: "Bedrooms", value: property.bedrooms.toString() },
                  property.bathrooms && { label: "Bathrooms", value: property.bathrooms.toString() },
                  property.furnishing && { label: "Furnishing", value: property.furnishing },
                  property.floor_number !== undefined && property.floor_number !== null && {
                    label: "Floor",
                    value: property.floor_number === 0 ? "Ground Floor" : `Floor ${property.floor_number}`,
                  },
                  property.total_floors && { label: "Total Floors", value: property.total_floors.toString() },
                  property.parking && { label: "Parking", value: `${property.parking} Cars` },
                  property.property_age && { label: "Property Age", value: property.property_age },
                  property.road_width && { label: "Road Width", value: `${property.road_width} Ft` },
                  property.ceiling_height && { label: "Ceiling Height", value: `${property.ceiling_height} Ft` },
                  property.power_availability && { label: "Power", value: property.power_availability },
                  property.loading_facilities !== undefined && {
                    label: "Loading Docks",
                    value: property.loading_facilities ? "Available" : "Not Available",
                  },
                  property.land_type && { label: "Land Type", value: property.land_type },
                  property.road_access && { label: "Road Access", value: property.road_access },
                  property.water_availability && { label: "Water", value: property.water_availability },
                  { label: "City", value: property.city },
                  { label: "State", value: property.state },
                  property.pincode && { label: "Pincode", value: property.pincode },
                  { label: "Listing Status", value: property.status },
                  { label: "Availability", value: property.availability_status?.replace("-", " ") },
                ]
                  .filter(Boolean)
                  .map((detail) => (
                    <div
                      key={(detail as any).label}
                      className="p-3 bg-[#F5F7FA] rounded-xl"
                    >
                      <div className="text-xs text-[#64748B] mb-1 capitalize">
                        {(detail as any).label}
                      </div>
                      <div className="text-sm font-semibold text-[#172B4D] capitalize">
                        {(detail as any).value || "—"}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Highlights */}
            {property.highlights && property.highlights.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-card border border-[#E2E8F0]">
                <h2 className="text-xl font-bold text-[#172B4D] font-display mb-4">
                  Property Highlights
                </h2>
                <div className="flex flex-wrap gap-2.5">
                  {property.highlights.map((h) => (
                    <div
                      key={h}
                      className="flex items-center gap-2 px-3.5 py-2 bg-[#EAF3FA] rounded-xl text-xs font-semibold text-[#172B4D]"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-[#C6A66B]" />
                      {h}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location & Connectivity */}
            {(property.road_connectivity || property.nearby_landmarks || (property.latitude && property.longitude)) && (
              <div className="bg-white rounded-2xl p-6 shadow-card border border-[#E2E8F0]">
                <h2 className="text-xl font-bold text-[#172B4D] font-display mb-4">
                  Location, Coordinates & Connectivity
                </h2>
                {property.road_connectivity && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-[#172B4D] mb-1">Road Connectivity</h3>
                    <p className="text-[#64748B] text-sm">{property.road_connectivity}</p>
                  </div>
                )}
                {property.nearby_landmarks && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-[#172B4D] mb-1">Nearby Landmarks</h3>
                    <p className="text-[#64748B] text-sm">{property.nearby_landmarks}</p>
                  </div>
                )}
                {property.latitude && property.longitude && (
                  <div className="p-4 bg-[#EAF3FA] rounded-xl flex items-center justify-between text-xs text-[#172B4D]">
                    <span className="font-mono flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#C6A66B]" />
                      Coordinates: {property.latitude.toFixed(4)}°N, {property.longitude.toFixed(4)}°E
                    </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-xs py-1.5 px-3 bg-white"
                    >
                      Open in Google Maps
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Similar Properties */}
            {similarProperties.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-[#172B4D] font-display mb-4">
                  Similar Verified Properties
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {similarProperties.map((p) => (
                    <Link
                      key={p.id}
                      href={`/properties/${p.slug}`}
                      className="bg-white rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all group border border-[#E2E8F0]"
                    >
                      <h3 className="font-semibold text-[#172B4D] text-sm font-display line-clamp-2 mb-1 group-hover:text-[#1e3a6e]">
                        {p.title}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-[#64748B] mb-2">
                        <MapPin className="w-3 h-3 text-[#C6A66B]" />
                        {p.locality}, {p.city}
                      </div>
                      <div className="text-sm font-bold text-[#172B4D]">
                        {formatPrice(p.price)}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Direct WhatsApp & Contact Actions */}
            <div className="bg-white rounded-2xl p-5 shadow-card border border-[#E2E8F0]">
              <h3 className="text-lg font-bold text-[#172B4D] font-display mb-3">
                Connect for Site Inspection
              </h3>
              <p className="text-xs text-[#64748B] mb-4">
                Speak directly with Suraj Prakash (Land Parcel Founder) or request a private physical site visit.
              </p>

              <div className="space-y-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp w-full justify-center text-sm py-3"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat on WhatsApp
                </a>
                <a
                  href="tel:+918750442235"
                  className="btn-secondary w-full justify-center text-sm py-3 bg-white"
                >
                  <Phone className="w-4 h-4 text-[#172B4D]" />
                  Call: +91 8750442235
                </a>
              </div>

              <div className="mt-4 pt-4 border-t border-[#E2E8F0] text-[11px] text-[#64748B] text-center">
                Official Business Email: <a href="mailto:acreindiaclub@gmail.com" className="text-[#172B4D] font-semibold hover:underline">acreindiaclub@gmail.com</a>
              </div>
            </div>

            {/* Direct Enquiry Form */}
            <div className="bg-white rounded-2xl p-5 shadow-card border border-[#E2E8F0]">
              <h3 className="text-lg font-bold text-[#172B4D] font-display mb-3">
                Send Direct Enquiry
              </h3>
              <EnquiryForm
                propertyId={property.id}
                propertyTitle={property.title}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
