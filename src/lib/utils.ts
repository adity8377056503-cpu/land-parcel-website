import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuidv4 } from "uuid";
import { ListingStatus, PropertySource } from "@/types";

export const OFFICIAL_BUSINESS = {
  brand_name: "Land Parcel",
  owner_name: "Suraj Prakash",
  email: "acreindiaclub@gmail.com",
  whatsapp: "8750442235",
  whatsapp_formatted: "+91 8750442235",
  whatsapp_link_number: "918750442235",
  tagline: "Your Trusted Partner in Premium Property Deals",
  primary_market: "Delhi NCR, India",
} as const;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} L`;
  } else if (price >= 1000) {
    return `₹${(price / 1000).toFixed(0)}K`;
  }
  return `₹${price.toLocaleString("en-IN")}`;
}

export function formatArea(area: number, unit: string): string {
  return `${area.toLocaleString("en-IN")} ${unit}`;
}

export function generateListingId(): string {
  const prefix = "LP";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

export function generateLeadId(): string {
  const prefix = "LD";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

export function generateSlug(title: string, city: string): string {
  const combined = `${title} ${city}`.toLowerCase();
  return combined
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function getWhatsAppUrl(phone: string, message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encoded}`;
}

export function getPropertyWhatsAppMessage(
  propertyTitle: string,
  listingId: string
): string {
  return `Hi, I'm interested in the property: ${propertyTitle} (ID: ${listingId}). Please share more details.`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

export function getStatusColor(status: ListingStatus | string): string {
  const colors: Record<string, string> = {
    published: "bg-green-100 text-green-700 border-green-200",
    active: "bg-green-100 text-green-700 border-green-200",
    draft: "bg-slate-100 text-slate-700 border-slate-200",
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    rejected: "bg-rose-100 text-rose-700 border-rose-200",
    sold: "bg-blue-100 text-blue-700 border-blue-200",
    rented: "bg-indigo-100 text-indigo-700 border-indigo-200",
    unpublished: "bg-gray-100 text-gray-700 border-gray-200",
    inactive: "bg-gray-100 text-gray-600 border-gray-200",
    new: "bg-purple-100 text-purple-700 border-purple-200",
    contacted: "bg-blue-100 text-blue-700 border-blue-200",
    interested: "bg-green-100 text-green-700 border-green-200",
    "site-visit-scheduled": "bg-orange-100 text-orange-700 border-orange-200",
    negotiation: "bg-yellow-100 text-yellow-700 border-yellow-200",
    converted: "bg-emerald-100 text-emerald-700 border-emerald-200",
    closed: "bg-gray-100 text-gray-600 border-gray-200",
    "not-interested": "bg-red-100 text-red-600 border-red-200",
  };
  return colors[status] || "bg-gray-100 text-gray-600 border-gray-200";
}

export function getStatusLabel(status: ListingStatus | string): string {
  const labels: Record<string, string> = {
    published: "Published",
    active: "Published",
    draft: "Draft",
    pending: "Pending Review",
    rejected: "Rejected",
    sold: "Sold",
    rented: "Rented",
    unpublished: "Unpublished",
  };
  return labels[status] || status;
}

export function getSourceLabel(source: PropertySource | string): string {
  const labels: Record<string, string> = {
    admin: "Admin Added",
    owner: "Owner Submitted",
    dealer: "Dealer Submitted",
    agent: "Agent Submitted",
    builder: "Builder Submitted",
    developer: "Developer Submitted",
  };
  return labels[source] || source;
}

export function getSourceColor(source: PropertySource | string): string {
  const colors: Record<string, string> = {
    admin: "bg-blue-50 text-blue-700 border-blue-200",
    owner: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dealer: "bg-indigo-50 text-indigo-700 border-indigo-200",
    agent: "bg-purple-50 text-purple-700 border-purple-200",
    builder: "bg-orange-50 text-orange-700 border-orange-200",
    developer: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return colors[source] || "bg-gray-50 text-gray-700 border-gray-200";
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateId(): string {
  return uuidv4();
}

export const PROPERTY_CATEGORIES = [
  {
    id: "residential",
    name: "Residential Properties",
    slug: "residential",
    description: "Houses, apartments, villas and residential plots",
    icon: "🏠",
  },
  {
    id: "commercial",
    name: "Commercial Properties",
    slug: "commercial",
    description: "Shops, offices, showrooms and commercial spaces",
    icon: "🏢",
  },
  {
    id: "industrial",
    name: "Industrial Properties",
    slug: "industrial",
    description: "Warehouses, factories and industrial plots",
    icon: "🏭",
  },
  {
    id: "agricultural",
    name: "Agricultural Land",
    slug: "agricultural",
    description: "Farm land, farmhouses and orchards",
    icon: "🌾",
  },
  {
    id: "institutional",
    name: "Institutional Properties",
    slug: "institutional",
    description: "Schools, hospitals and educational buildings",
    icon: "🏫",
  },
  {
    id: "large-land",
    name: "Large Land Parcels",
    slug: "large-land",
    description: "Development land and bulk land investments",
    icon: "🗺️",
  },
];

export const PRIORITY_LOCATIONS = [
  "Delhi",
  "Dwarka",
  "Najafgarh",
  "West Delhi",
  "South West Delhi",
  "Gurugram",
  "Manesar",
];

export const ALL_LOCATIONS = [
  "Delhi",
  "Dwarka",
  "Najafgarh",
  "West Delhi",
  "South West Delhi",
  "Gurugram",
  "Manesar",
  "Noida",
  "Greater Noida",
  "Faridabad",
  "Sonipat",
  "Jhajjar",
];
