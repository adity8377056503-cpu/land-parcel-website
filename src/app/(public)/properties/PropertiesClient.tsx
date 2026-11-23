"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, SlidersHorizontal, Grid3X3, List, X, Building2, MessageCircle } from "lucide-react";
import PropertyCard from "@/components/property/PropertyCard";
import { usePropertyStore } from "@/lib/property-store";
import { Property, PropertyFilters, PropertyCategory } from "@/types";
import { OFFICIAL_BUSINESS, getWhatsAppUrl } from "@/lib/utils";

const CATEGORIES = [
  { label: "All Categories", value: "" },
  { label: "Residential", value: "residential" },
  { label: "Commercial", value: "commercial" },
  { label: "Industrial", value: "industrial" },
  { label: "Agricultural", value: "agricultural" },
  { label: "Institutional", value: "institutional" },
  { label: "Large Land Parcels", value: "large-land" },
];

const CITIES = [
  "All Cities", "Delhi", "Dwarka", "Najafgarh", "West Delhi", "South West Delhi",
  "Gurugram", "Manesar", "Noida", "Greater Noida", "Faridabad", "Sonipat", "Jhajjar",
];

const BUDGET_OPTIONS = [
  { label: "Any Budget", min: 0, max: 0 },
  { label: "Under ₹50 Lakh", min: 0, max: 5000000 },
  { label: "₹50L – ₹1 Cr", min: 5000000, max: 10000000 },
  { label: "₹1 Cr – ₹3 Cr", min: 10000000, max: 30000000 },
  { label: "₹3 Cr – ₹5 Cr", min: 30000000, max: 50000000 },
  { label: "₹5 Cr – ₹10 Cr", min: 50000000, max: 100000000 },
  { label: "Above ₹10 Cr", min: 100000000, max: 0 },
];

const SORT_OPTIONS = [
  { label: "Latest Listings", value: "latest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Largest Area", value: "area-desc" },
];

function filterAndSortProperties(properties: Property[], filters: PropertyFilters): Property[] {
  // Public marketplace strictly exposes ONLY published inventory
  let result = [...properties].filter((p) => p.status === "published" || p.status === "active");

  if (filters.query) {
    const q = filters.query.toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.locality.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.listing_id.toLowerCase().includes(q)
    );
  }

  if (filters.city && filters.city !== "All Cities") {
    result = result.filter(
      (p) => p.city.toLowerCase().includes(filters.city!.toLowerCase()) ||
             p.locality.toLowerCase().includes(filters.city!.toLowerCase())
    );
  }

  if (filters.category) {
    result = result.filter((p) => p.category === filters.category);
  }

  if (filters.property_type) {
    result = result.filter((p) => p.property_type === filters.property_type);
  }

  if (filters.min_price && filters.min_price > 0) {
    result = result.filter((p) => p.price >= filters.min_price!);
  }

  if (filters.max_price && filters.max_price > 0) {
    result = result.filter((p) => p.price <= filters.max_price!);
  }

  // Sort
  switch (filters.sort) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "area-desc":
      result.sort((a, b) => b.total_area - a.total_area);
      break;
    default:
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return result;
}

export default function PropertiesClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { properties } = usePropertyStore();

  const [filters, setFilters] = useState<PropertyFilters>({
    query: searchParams.get("query") || "",
    city: searchParams.get("city") || "",
    category: (searchParams.get("category") as PropertyCategory) || undefined,
    min_price: Number(searchParams.get("min_price")) || 0,
    max_price: Number(searchParams.get("max_price")) || 0,
    sort: (searchParams.get("sort") as PropertyFilters["sort"]) || "latest",
  });

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.query || "");

  const totalPublished = properties.filter((p) => p.status === "published" || p.status === "active").length;
  const filteredProperties = filterAndSortProperties(properties, filters);

  const whatsappUrl = getWhatsAppUrl(
    OFFICIAL_BUSINESS.whatsapp_link_number,
    "Hello Suraj Prakash, I am inquiring about verified property listings in Delhi NCR at Land Parcel."
  );

  const updateFilter = useCallback(
    (key: keyof PropertyFilters, value: PropertyFilters[keyof PropertyFilters]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const clearFilters = () => {
    setFilters({ query: "", sort: "latest" });
    setSearchQuery("");
  };

  const hasActiveFilters =
    Boolean(filters.query || filters.city || filters.category || filters.min_price || filters.max_price);

  return (
    <div>
      {/* Search Header */}
      <div className="bg-[#172B4D] py-10">
        <div className="container-custom">
          <h1 className="text-3xl font-bold text-white font-display mb-2">
            Find Your Perfect Property
          </h1>
          <p className="text-slate-300 mb-6">
            {filteredProperties.length} verified live properties available across Delhi NCR
          </p>

          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
              <input
                type="text"
                placeholder="Search by location, property type, listing ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") updateFilter("query", searchQuery);
                }}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl text-[#172B4D] text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <button
              onClick={() => updateFilter("query", searchQuery)}
              className="btn-gold px-6"
            >
              Search
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-5 py-3.5 bg-white/10 text-white border border-white/20 rounded-xl hover:bg-white/20 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-[#C6A66B] rounded-full" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b border-[#E2E8F0] shadow-sm">
          <div className="container-custom py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {/* Category */}
              <div>
                <label className="label-field">Category</label>
                <select
                  value={filters.category || ""}
                  onChange={(e) => updateFilter("category", (e.target.value as PropertyCategory) || undefined)}
                  className="input-field text-sm"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="label-field">Location</label>
                <select
                  value={filters.city || ""}
                  onChange={(e) => updateFilter("city", e.target.value)}
                  className="input-field text-sm"
                >
                  {CITIES.map((city) => (
                    <option key={city} value={city === "All Cities" ? "" : city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Budget */}
              <div>
                <label className="label-field">Budget</label>
                <select
                  onChange={(e) => {
                    const opt = BUDGET_OPTIONS[Number(e.target.value)];
                    updateFilter("min_price", opt.min);
                    updateFilter("max_price", opt.max);
                  }}
                  className="input-field text-sm"
                >
                  {BUDGET_OPTIONS.map((opt, i) => (
                    <option key={i} value={i}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="label-field">Sort By</label>
                <select
                  value={filters.sort || "latest"}
                  onChange={(e) => updateFilter("sort", e.target.value as PropertyFilters["sort"])}
                  className="input-field text-sm"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Clear */}
              <div className="flex items-end">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="bg-[#F5F7FA] min-h-screen py-8">
        <div className="container-custom">
          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-[#64748B]">
              <span className="font-semibold text-[#172B4D]">{filteredProperties.length}</span> published properties
              {hasActiveFilters && (
                <button onClick={clearFilters} className="ml-3 text-xs text-[#C6A66B] hover:underline">
                  Clear filters
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-[#172B4D] text-white" : "text-[#64748B] hover:bg-white"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list" ? "bg-[#172B4D] text-white" : "text-[#64748B] hover:bg-white"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Property Grid/List */}
          {filteredProperties.length > 0 ? (
            <div
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1 max-w-3xl"
              }`}
            >
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : totalPublished === 0 ? (
            <div className="text-center py-20 px-6 bg-white rounded-2xl shadow-card border border-[#E2E8F0] max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-[#EAF3FA] flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-[#172B4D]" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-[#172B4D] font-display mb-2">
                No Real Properties Listed Yet
              </h3>
              <p className="text-[#64748B] text-sm md:text-base mb-6 leading-relaxed">
                Our marketplace is currently preparing verified property listings across Delhi NCR. All listings undergo strict physical inspection and title verification before appearing live.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/list-property" className="btn-primary text-sm py-2.5 px-5">
                  List Your Property
                </Link>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp text-sm py-2.5 px-5"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact on WhatsApp
                </a>
              </div>
              <div className="mt-8 pt-6 border-t border-[#E2E8F0] text-xs text-[#64748B]">
                Looking for private off-market deals? Call Suraj Prakash:{" "}
                <a href="tel:+918750442235" className="text-[#172B4D] font-bold hover:underline">
                  +91 8750442235
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl shadow-card border border-[#E2E8F0] max-w-lg mx-auto">
              <div className="text-5xl mb-3">🔍</div>
              <h3 className="text-lg font-bold text-[#172B4D] mb-1">
                No matching published properties found
              </h3>
              <p className="text-[#64748B] text-xs mb-5">
                Try widening your budget, changing category, or clearing search filters.
              </p>
              <button onClick={clearFilters} className="btn-primary text-xs py-2 px-4">
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
