import Image from "next/image";
import Link from "next/link";
import { MapPin, Maximize2, MessageCircle, Eye, IndianRupee } from "lucide-react";
import { Property } from "@/types";
import { formatPrice, formatArea, getWhatsAppUrl, getPropertyWhatsAppMessage, cn } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
  className?: string;
}

export default function PropertyCard({ property, className }: PropertyCardProps) {
  const coverImage = property.images?.find((img) => img.is_cover)?.url ||
    property.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80";

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919999999999";
  const whatsappMessage = getPropertyWhatsAppMessage(property.title, property.listing_id);
  const whatsappUrl = getWhatsAppUrl(whatsappNumber, whatsappMessage);

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    sold: "bg-blue-100 text-blue-700",
  };

  const availabilityColors: Record<string, string> = {
    "ready-to-move": "bg-emerald-100 text-emerald-700",
    "under-construction": "bg-orange-100 text-orange-700",
    available: "bg-green-100 text-green-700",
    sold: "bg-blue-100 text-blue-700",
  };

  const availabilityLabels: Record<string, string> = {
    "ready-to-move": "Ready to Move",
    "under-construction": "Under Construction",
    available: "Available",
    sold: "Sold",
  };

  return (
    <div className={cn("card group", className)}>
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <Image
          src={coverImage}
          alt={property.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          {property.is_demo && (
            <span className="badge badge-demo">DEMO</span>
          )}
          {property.is_featured && !property.is_demo && (
            <span className="badge bg-[#C6A66B] text-white">Featured</span>
          )}
          <span
            className={cn(
              "badge",
              availabilityColors[property.availability_status] || "bg-gray-100 text-gray-700"
            )}
          >
            {availabilityLabels[property.availability_status] || property.availability_status}
          </span>
        </div>

        {/* Category Tag */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1 bg-[#172B4D]/80 text-white text-xs font-medium rounded-lg capitalize">
            {property.category.replace("-", " ")}
          </span>
        </div>

        {/* ID */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 bg-black/40 text-white text-xs rounded-lg">
            {property.listing_id}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-[#172B4D] text-base line-clamp-2 leading-snug mb-1.5 font-display">
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-sm text-[#64748B] mb-3">
          <MapPin className="w-3.5 h-3.5 text-[#C6A66B] flex-shrink-0" />
          <span className="line-clamp-1">{property.locality}, {property.city}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-[#64748B] mb-3">
          <div className="flex items-center gap-1">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{formatArea(property.total_area, property.area_unit)}</span>
          </div>
          {property.bedrooms && (
            <div className="flex items-center gap-1">
              <span>🛏</span>
              <span>{property.bedrooms} BHK</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs">
            <Eye className="w-3 h-3" />
            <span>{property.view_count} views</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center gap-1 mb-4">
          <IndianRupee className="w-4 h-4 text-[#172B4D]" />
          <span className="text-lg font-bold text-[#172B4D] font-display">
            {formatPrice(property.price)}
          </span>
          {property.price_negotiable && (
            <span className="text-xs text-[#64748B] ml-1">(Negotiable)</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/properties/${property.slug}`}
            className="btn-primary text-sm py-2 px-4 flex-1 justify-center"
          >
            View Details
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp text-sm py-2 px-4"
            title="WhatsApp Enquiry"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
