"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ChevronDown, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";

const LISTING_TYPES = ["Buy", "Rent", "Sell"];

const CATEGORIES = [
  { label: "All Categories", value: "" },
  { label: "Residential", value: "residential" },
  { label: "Commercial", value: "commercial" },
  { label: "Industrial", value: "industrial" },
  { label: "Agricultural Land", value: "agricultural" },
  { label: "Institutional", value: "institutional" },
  { label: "Large Land Parcels", value: "large-land" },
];

const BUDGET_RANGES = [
  { label: "Any Budget", value: "" },
  { label: "Under ₹50 L", value: "0-5000000" },
  { label: "₹50 L - ₹1 Cr", value: "5000000-10000000" },
  { label: "₹1 Cr - ₹3 Cr", value: "10000000-30000000" },
  { label: "₹3 Cr - ₹5 Cr", value: "30000000-50000000" },
  { label: "₹5 Cr - ₹10 Cr", value: "50000000-100000000" },
  { label: "Above ₹10 Cr", value: "100000000-" },
];

const LOCATIONS = [
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

export default function HeroSearch() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Buy");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("city", location);
    if (category) params.set("category", category);
    if (budget) {
      const [min, max] = budget.split("-");
      if (min) params.set("min_price", min);
      if (max) params.set("max_price", max);
    }
    params.set("listing_type", activeTab.toLowerCase());
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-card-hover p-2 w-full max-w-4xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-1 mb-2 p-1 bg-[#F5F7FA] rounded-xl">
        {LISTING_TYPES.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200",
              activeTab === tab
                ? "bg-[#172B4D] text-white shadow-sm"
                : "text-[#64748B] hover:text-[#172B4D]"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch}>
        <div className="flex flex-col md:flex-row gap-2">
          {/* Location */}
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C6A66B]" />
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-9 pr-4 py-3.5 border border-[#E2E8F0] rounded-xl text-sm text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#172B4D]/20 focus:border-[#172B4D] bg-white appearance-none cursor-pointer"
            >
              <option value="">Select Location</option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
          </div>

          {/* Category */}
          <div className="relative flex-1">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3.5 border border-[#E2E8F0] rounded-xl text-sm text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#172B4D]/20 focus:border-[#172B4D] bg-white appearance-none cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
          </div>

          {/* Budget */}
          <div className="relative flex-1">
            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C6A66B]" />
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full pl-9 pr-4 py-3.5 border border-[#E2E8F0] rounded-xl text-sm text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#172B4D]/20 focus:border-[#172B4D] bg-white appearance-none cursor-pointer"
            >
              {BUDGET_RANGES.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
          </div>

          {/* Search Button */}
          <button type="submit" className="btn-primary py-3.5 px-8 whitespace-nowrap">
            <Search className="w-4 h-4" />
            Explore
          </button>
        </div>
      </form>
    </div>
  );
}
