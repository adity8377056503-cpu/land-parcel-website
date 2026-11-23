// Core TypeScript types for Land Parcel platform

export type PropertyCategory =
  | "residential"
  | "commercial"
  | "industrial"
  | "agricultural"
  | "institutional"
  | "large-land";

export type PropertyType =
  // Residential
  | "independent-house"
  | "builder-floor"
  | "apartment"
  | "flat"
  | "villa"
  | "duplex-house"
  | "residential-plot"
  // Commercial
  | "commercial-shop"
  | "office-space"
  | "commercial-building"
  | "sco-plot"
  | "showroom"
  | "commercial-land"
  | "retail-space"
  // Industrial
  | "industrial-plot"
  | "industrial-building"
  | "warehouse"
  | "factory"
  | "manufacturing-unit"
  | "logistics-facility"
  // Agricultural
  | "agricultural-land"
  | "farmhouse"
  | "farm-land"
  | "orchard"
  // Institutional
  | "school"
  | "hospital"
  | "college"
  | "educational-building"
  | "institutional-land"
  // Large Land
  | "development-land"
  | "investment-land"
  | "bulk-land"
  | "township-land";

export type ListingStatus =
  | "draft"
  | "pending"
  | "published"
  | "rejected"
  | "sold"
  | "rented"
  | "unpublished";

export type PropertySource =
  | "admin"
  | "owner"
  | "agent"
  | "developer";

export type AreaUnit = "sqft" | "sqm" | "sqyd" | "acre" | "bigha" | "kanal" | "marla" | "hectare";

export type FurnishingStatus = "furnished" | "semi-furnished" | "unfurnished";

export type AvailabilityStatus = "ready-to-move" | "under-construction" | "available" | "sold";

export interface PropertyDocument {
  id: string;
  property_id: string;
  title: string;
  file_url: string;
  file_type?: string;
  is_private: boolean; // Strictly hidden from public visitors
  created_at: string;
}

export interface AuditLog {
  id: string;
  property_id: string;
  action: string;
  changed_by: string;
  notes?: string;
  previous_status?: ListingStatus;
  new_status?: ListingStatus;
  timestamp: string;
}

export interface Property {
  id: string;
  listing_id: string;
  title: string;
  slug: string;
  description: string;
  category: PropertyCategory;
  property_type: PropertyType;
  status: ListingStatus;
  source: PropertySource;
  availability_status: AvailabilityStatus;
  
  // Location
  address: string;
  locality: string;
  city: string;
  state: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  
  // Pricing
  price: number;
  price_unit?: "total" | "per-sqft" | "per-acre";
  price_negotiable: boolean;
  
  // Area
  total_area: number;
  area_unit: AreaUnit;
  built_up_area?: number;
  carpet_area?: number;
  
  // Residential specific
  bedrooms?: number;
  bathrooms?: number;
  floor_number?: number;
  total_floors?: number;
  furnishing?: FurnishingStatus;
  parking?: number;
  property_age?: string;
  
  // Industrial specific
  covered_area?: number;
  road_width?: number;
  ceiling_height?: number;
  power_availability?: string;
  loading_facilities?: boolean;
  
  // Agricultural specific
  land_type?: string;
  road_access?: string;
  water_availability?: string;
  
  // Meta & SEO
  nearby_landmarks?: string;
  road_connectivity?: string;
  highlights?: string[];
  is_featured: boolean;
  is_demo: boolean;
  view_count: number;
  seo_title?: string;
  seo_description?: string;
  
  // Media & Documents
  images?: PropertyImage[];
  videos?: PropertyVideo[];
  video_url?: string;
  documents?: PropertyDocument[];
  audit_logs?: AuditLog[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
  published_at?: string;
  
  // Seller / Contact Information
  seller_id?: string;
  seller_name?: string;
  seller_mobile?: string;
  seller_email?: string;
  seller_type?: "owner" | "agent" | "developer";
  seller?: Seller;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  alt_text?: string;
  is_cover: boolean;
  sort_order: number;
  created_at: string;
}

export interface PropertyVideo {
  id: string;
  property_id: string;
  url: string;
  title?: string;
  created_at: string;
}

export interface PropertyCategory_DB {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
}

export interface Location {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  description?: string;
  image_url?: string;
  property_count?: number;
  is_featured: boolean;
  is_active: boolean;
}

export interface Enquiry {
  id: string;
  lead_id: string;
  property_id?: string;
  property_title?: string;
  
  // Contact
  name: string;
  mobile: string;
  email?: string;
  
  // Details
  buyer_type: "individual" | "investor" | "company" | "developer" | "broker";
  budget_min?: number;
  budget_max?: number;
  message?: string;
  preferred_contact_time?: string;
  
  // Status tracking
  status: "new" | "contacted" | "interested" | "site-visit-scheduled" | "negotiation" | "converted" | "closed" | "not-interested";
  
  // Meta
  source: string;
  consent: boolean;
  assigned_to?: string;
  notes?: LeadNote[];
  
  created_at: string;
  updated_at: string;
}

export interface LeadNote {
  id: string;
  enquiry_id: string;
  note: string;
  created_by: string;
  created_at: string;
}

export interface Seller {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  seller_type: "owner" | "agent" | "developer";
  created_at: string;
}

export interface SiteVisit {
  id: string;
  property_id: string;
  enquiry_id: string;
  scheduled_date?: string;
  status: "requested" | "scheduled" | "completed" | "cancelled";
  notes?: string;
  created_at: string;
}

export interface AdminSettings {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

// Search & Filter types
export interface PropertyFilters {
  query?: string;
  city?: string;
  locality?: string;
  category?: PropertyCategory;
  property_type?: PropertyType;
  min_price?: number;
  max_price?: number;
  min_area?: number;
  max_area?: number;
  bedrooms?: number;
  status?: ListingStatus;
  source?: PropertySource;
  availability?: AvailabilityStatus;
  listing_type?: "buy" | "rent";
  sort?: "latest" | "price-asc" | "price-desc" | "area-desc" | "updated";
  page?: number;
  limit?: number;
}

export interface SearchResult {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface DashboardStats {
  total_properties: number;
  active_properties: number;
  pending_properties: number;
  sold_properties: number;
  total_leads: number;
  new_leads: number;
  site_visit_requests: number;
  recent_enquiries: Enquiry[];
}
