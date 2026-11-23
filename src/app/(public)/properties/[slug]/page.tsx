import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin, Maximize2, IndianRupee, Calendar, Eye, MessageCircle,
  Phone, ArrowLeft, Building2, CheckCircle, Info
} from "lucide-react";
import { DEMO_PROPERTIES } from "@/lib/demo-data";
import { generateSEO } from "@/lib/seo";
import { formatPrice, formatArea, getWhatsAppUrl, getPropertyWhatsAppMessage, formatDate } from "@/lib/utils";
import EnquiryForm from "@/components/forms/EnquiryForm";

interface PropertyDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return DEMO_PROPERTIES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PropertyDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = DEMO_PROPERTIES.find((p) => p.slug === slug);
  if (!property) return {};
  return generateSEO({
    title: property.title,
    description: property.description.substring(0, 160),
    keywords: [property.city, property.locality, property.category, property.property_type],
    canonical: `/properties/${property.slug}`,
  });
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { slug } = await params;
  const property = DEMO_PROPERTIES.find((p) => p.slug === slug);

  if (!property) {
    notFound();
  }

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919999999999";
  const whatsappMessage = getPropertyWhatsAppMessage(property.title, property.listing_id);
  const whatsappUrl = getWhatsAppUrl(whatsappNumber, whatsappMessage);

  const images = property.images?.length
    ? property.images
    : [
        {
          id: "placeholder",
          property_id: property.id,
          url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80",
          is_cover: true,
          sort_order: 0,
          created_at: "",
        },
      ];

  const coverImage = images.find((img) => img.is_cover)?.url || images[0]?.url;

  const similarProperties = DEMO_PROPERTIES.filter(
    (p) => p.id !== property.id && p.category === property.category
  ).slice(0, 3);

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="container-custom py-3 flex items-center gap-2 text-sm text-[#64748B]">
          <Link href="/" className="hover:text-[#172B4D] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/properties" className="hover:text-[#172B4D] transition-colors">Properties</Link>
          <span>/</span>
          <span className="text-[#172B4D] font-medium line-clamp-1">{property.title}</span>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Demo Warning */}
            {property.is_demo && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
                <Info className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-orange-700">Demo Listing</p>
                  <p className="text-xs text-orange-600 mt-0.5">
                    This is a sample listing for demonstration. Real listings will show actual property details.
                  </p>
                </div>
              </div>
            )}

            {/* Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-card">
              <div className="relative h-72 md:h-96">
                <Image
                  src={coverImage}
                  alt={property.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {property.is_demo && <span className="badge badge-demo">DEMO</span>}
                  {property.is_featured && (
                    <span className="badge bg-[#C6A66B] text-white">Featured</span>
                  )}
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-black/50 text-white text-sm rounded-lg backdrop-blur-sm">
                    {property.listing_id}
                  </span>
                </div>
              </div>
            </div>

            {/* Title & Location */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge bg-[#EAF3FA] text-[#172B4D] capitalize">
                      {property.category.replace("-", " ")}
                    </span>
                    <span className="badge bg-green-100 text-green-700 capitalize">
                      {property.availability_status.replace("-", " ")}
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-[#172B4D] font-display leading-tight mb-3">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-1.5 text-[#64748B]">
                    <MapPin className="w-4 h-4 text-[#C6A66B]" />
                    <span>{property.address}, {property.city}, {property.state}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-3xl font-bold text-[#172B4D] font-display">
                    <IndianRupee className="w-6 h-6" />
                    {formatPrice(property.price)}
                  </div>
                  {property.price_negotiable && (
                    <span className="text-sm text-[#64748B]">Price Negotiable</span>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-[#E2E8F0]">
                <div className="text-center">
                  <div className="text-xs text-[#64748B] mb-1">Total Area</div>
                  <div className="font-semibold text-[#172B4D] text-sm">
                    {formatArea(property.total_area, property.area_unit)}
                  </div>
                </div>
                {property.bedrooms && (
                  <div className="text-center">
                    <div className="text-xs text-[#64748B] mb-1">Bedrooms</div>
                    <div className="font-semibold text-[#172B4D] text-sm">{property.bedrooms} BHK</div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="text-center">
                    <div className="text-xs text-[#64748B] mb-1">Bathrooms</div>
                    <div className="font-semibold text-[#172B4D] text-sm">{property.bathrooms}</div>
                  </div>
                )}
                {property.built_up_area && (
                  <div className="text-center">
                    <div className="text-xs text-[#64748B] mb-1">Built-up Area</div>
                    <div className="font-semibold text-[#172B4D] text-sm">
                      {property.built_up_area.toLocaleString()} sqft
                    </div>
                  </div>
                )}
                {property.covered_area && (
                  <div className="text-center">
                    <div className="text-xs text-[#64748B] mb-1">Covered Area</div>
                    <div className="font-semibold text-[#172B4D] text-sm">
                      {property.covered_area.toLocaleString()} sqft
                    </div>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-xs text-[#64748B] mb-1">Listed On</div>
                  <div className="font-semibold text-[#172B4D] text-sm">
                    {formatDate(property.created_at)}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <h2 className="text-xl font-bold text-[#172B4D] font-display mb-4">
                Property Description
              </h2>
              <p className="text-[#64748B] leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <h2 className="text-xl font-bold text-[#172B4D] font-display mb-4">
                Property Details
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h2 className="text-xl font-bold text-[#172B4D] font-display mb-4">
                  Property Highlights
                </h2>
                <div className="flex flex-wrap gap-3">
                  {property.highlights.map((h) => (
                    <div
                      key={h}
                      className="flex items-center gap-2 px-4 py-2 bg-[#EAF3FA] rounded-xl text-sm text-[#172B4D] font-medium"
                    >
                      <CheckCircle className="w-4 h-4 text-[#C6A66B]" />
                      {h}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location & Connectivity */}
            {(property.road_connectivity || property.nearby_landmarks) && (
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h2 className="text-xl font-bold text-[#172B4D] font-display mb-4">
                  Location & Connectivity
                </h2>
                {property.road_connectivity && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-[#172B4D] mb-1.5">Road Connectivity</h3>
                    <p className="text-[#64748B] text-sm">{property.road_connectivity}</p>
                  </div>
                )}
                {property.nearby_landmarks && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#172B4D] mb-1.5">Nearby Landmarks</h3>
                    <p className="text-[#64748B] text-sm">{property.nearby_landmarks}</p>
                  </div>
                )}

                {/* Map Placeholder */}
                {property.latitude && property.longitude && (
                  <div className="mt-4 h-48 bg-[#EAF3FA] rounded-xl flex items-center justify-center border border-[#E2E8F0]">
                    <div className="text-center text-[#64748B]">
                      <MapPin className="w-8 h-8 mx-auto mb-2 text-[#C6A66B]" />
                      <p className="text-sm font-medium">Map view available with Google Maps API key</p>
                      <p className="text-xs mt-1">
                        {property.latitude.toFixed(4)}°N, {property.longitude.toFixed(4)}°E
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Similar Properties */}
            {similarProperties.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-[#172B4D] font-display mb-4">
                  Similar Properties
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {similarProperties.map((p) => (
                    <Link
                      key={p.id}
                      href={`/properties/${p.slug}`}
                      className="bg-white rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all group"
                    >
                      <h3 className="font-semibold text-[#172B4D] text-sm font-display line-clamp-2 mb-1 group-hover:text-[#1e3a6e]">
                        {p.title}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-[#64748B] mb-2">
                        <MapPin className="w-3 h-3" />
                        {p.locality}, {p.city}
                      </div>
                      <div className="text-sm font-bold text-[#C6A66B]">
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
            {/* WhatsApp & Contact Quick Actions */}
            <div className="bg-white rounded-2xl p-5 shadow-card">
              <h3 className="text-lg font-bold text-[#172B4D] font-display mb-4">
                Interested in This Property?
              </h3>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp w-full justify-center py-3.5 text-base mb-3"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp Enquiry
              </a>
              <div className="text-center text-xs text-[#64748B]">
                Response typically within a few hours
              </div>
            </div>

            {/* Enquiry Form */}
            <div className="bg-white rounded-2xl p-5 shadow-card">
              <h3 className="text-lg font-bold text-[#172B4D] font-display mb-4">
                Send Enquiry
              </h3>
              <EnquiryForm
                propertyId={property.id}
                propertyTitle={property.title}
              />
            </div>

            {/* Property Summary Card */}
            <div className="bg-[#EAF3FA] rounded-2xl p-5">
              <h3 className="text-sm font-bold text-[#172B4D] mb-3 uppercase tracking-wide">
                Property Summary
              </h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Listing ID</span>
                  <span className="font-semibold text-[#172B4D]">{property.listing_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Category</span>
                  <span className="font-semibold text-[#172B4D] capitalize">{property.category.replace("-", " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Location</span>
                  <span className="font-semibold text-[#172B4D]">{property.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Area</span>
                  <span className="font-semibold text-[#172B4D]">
                    {formatArea(property.total_area, property.area_unit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Price</span>
                  <span className="font-semibold text-[#172B4D]">{formatPrice(property.price)}</span>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <Link
              href="/properties"
              className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#172B4D] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to All Properties
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
