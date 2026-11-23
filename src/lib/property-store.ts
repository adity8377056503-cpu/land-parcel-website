"use client";

import { useState, useEffect, useCallback } from "react";
import { Property, ListingStatus, PropertySource } from "@/types";
import { generateListingId, generateSlug, generateId, OFFICIAL_BUSINESS } from "@/lib/utils";
import { consumeStoredCredit, refundStoredCredit } from "@/lib/subscription-store";

const STORAGE_KEY = "lp_properties_central_db";

export function loadStoredProperties(): Property[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (p) =>
          !p.is_demo &&
          !p.id?.startsWith("demo-") &&
          !(p.listing_id || "").includes("DEMO") &&
          !(p.title || "").toLowerCase().includes("demo -")
      );
    }
    return [];
  } catch {
    return [];
  }
}

export function saveStoredProperties(properties: Property[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
      window.dispatchEvent(new Event("lp_properties_updated"));
    } catch (err) {
      console.error("Failed to persist local cache:", err);
    }
  }
}

/**
 * Hook to access and manage properties directly backed by production server database & Supabase.
 */
export function usePropertyStore() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchServerProperties = useCallback(async () => {
    try {
      const res = await fetch("/api/properties", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.properties)) {
          setProperties(json.properties);
          saveStoredProperties(json.properties);
          setIsLoaded(true);
          return;
        }
      }
    } catch {
      // Server unreachable, use cached local properties
    }
    const cached = loadStoredProperties();
    setProperties(cached);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    // 1. Initial quick load from local cache
    const initial = loadStoredProperties();
    if (initial.length > 0) {
      setProperties(initial);
      setIsLoaded(true);
    }

    // 2. Refresh from server database
    fetchServerProperties();

    const handleUpdate = () => {
      fetchServerProperties();
    };

    window.addEventListener("lp_properties_updated", handleUpdate);
    return () => window.removeEventListener("lp_properties_updated", handleUpdate);
  }, [fetchServerProperties]);

  const addProperty = async (
    data: Partial<Property> & {
      title: string;
      city: string;
      category: Property["category"];
      property_type: Property["property_type"];
      price: number;
      expected_price?: number;
      total_area: number;
      area_unit: Property["area_unit"];
      source: PropertySource;
      status: ListingStatus;
      consent?: boolean;
      authorization_confirmed?: boolean;
    }
  ): Promise<Property> => {
    // 1. Sync directly to production server API
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.property) {
          const updated = [json.property, ...properties.filter((p) => p.id !== json.property.id)];
          saveStoredProperties(updated);
          setProperties(updated);
          return json.property;
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Property submission failed (HTTP ${res.status})`);
      }
    } catch (err: any) {
      console.error("Server API addProperty error:", err);
      throw err;
    }

    // Fallback local creation
    const id = generateId();
    const listing_id = generateListingId();
    const slug = generateSlug(data.title, data.city) + "-" + listing_id.toLowerCase().slice(-4);
    const now = new Date().toISOString();

    const newProperty: Property = {
      id,
      listing_id,
      slug,
      title: data.title,
      description: data.description || "",
      category: data.category,
      property_type: data.property_type,
      status: data.status,
      source: data.source,
      availability_status: data.availability_status || "available",
      address: data.address || "",
      locality: data.locality || data.city,
      city: data.city,
      state: data.state || "Delhi",
      pincode: data.pincode,
      latitude: data.latitude,
      longitude: data.longitude,
      price: data.price,
      price_unit: data.price_unit || "total",
      price_negotiable: data.price_negotiable ?? true,
      total_area: data.total_area,
      area_unit: data.area_unit,
      built_up_area: data.built_up_area,
      carpet_area: data.carpet_area,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      floor_number: data.floor_number,
      total_floors: data.total_floors,
      furnishing: data.furnishing,
      parking: data.parking,
      property_age: data.property_age,
      covered_area: data.covered_area,
      road_width: data.road_width,
      ceiling_height: data.ceiling_height,
      power_availability: data.power_availability,
      loading_facilities: data.loading_facilities,
      land_type: data.land_type,
      road_access: data.road_access,
      water_availability: data.water_availability,
      nearby_landmarks: data.nearby_landmarks,
      road_connectivity: data.road_connectivity,
      highlights: data.highlights || [],
      is_featured: data.is_featured ?? false,
      is_demo: false,
      view_count: 0,
      seo_title: data.seo_title,
      seo_description: data.seo_description,
      images: data.images || [],
      videos: data.videos || [],
      video_url: data.video_url,
      documents: data.documents || [],
      audit_logs: [
        {
          id: generateId(),
          property_id: id,
          action: data.source === "admin" ? (data.status === "published" ? "Created & Published Directly" : "Saved as Draft") : "Public Submission Created",
          changed_by: data.source === "admin" ? OFFICIAL_BUSINESS.email : (data.seller_name || "Public Client"),
          notes: data.source === "admin" ? "Created in Admin Console" : "Submitted via List Your Property form",
          new_status: data.status,
          timestamp: now,
        },
      ],
      seller_name: data.seller_name,
      seller_mobile: data.seller_mobile,
      seller_email: data.seller_email,
      seller_type: data.seller_type || (data.source === "admin" ? undefined : "owner"),
      created_at: now,
      updated_at: now,
      published_at: data.status === "published" ? now : undefined,
    };

    const updated = [newProperty, ...properties];
    saveStoredProperties(updated);
    setProperties(updated);
    return newProperty;
  };

  const updateProperty = async (
    id: string,
    updates: Partial<Property>,
    adminEmail: string = OFFICIAL_BUSINESS.email,
    notes = "Property details updated"
  ) => {
    // 1. Sync to server API
    try {
      await fetch(`/api/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...updates, statusNotes: notes }),
      });
    } catch (err) {
      console.error("Server API updateProperty error:", err);
    }

    // 2. Update local state
    const current = loadStoredProperties();
    const updated = current.map((p) => {
      if (p.id !== id) return p;

      const previous_status = p.status;
      const new_status = updates.status || p.status;
      const statusChanged = previous_status !== new_status;

      const log = {
        id: generateId(),
        property_id: id,
        action: statusChanged ? `Status transitioned to ${new_status}` : "Property Edited",
        changed_by: adminEmail,
        notes,
        previous_status,
        new_status,
        timestamp: new Date().toISOString(),
      };

      return {
        ...p,
        ...updates,
        audit_logs: [log, ...(p.audit_logs || [])],
        updated_at: new Date().toISOString(),
        published_at: new_status === "published" && !p.published_at ? new Date().toISOString() : p.published_at,
      };
    });

    saveStoredProperties(updated);
    setProperties(updated);
  };

  const updateStatus = async (
    id: string,
    newStatus: ListingStatus,
    adminEmail: string = OFFICIAL_BUSINESS.email,
    notes?: string
  ) => {
    await updateProperty(id, { status: newStatus }, adminEmail, notes || `Status transitioned to ${newStatus}`);
  };

  const deleteProperty = async (id: string) => {
    try {
      await fetch(`/api/properties/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Server API deleteProperty error:", err);
    }
    const current = loadStoredProperties();
    const updated = current.filter((p) => p.id !== id);
    saveStoredProperties(updated);
    setProperties(updated);
  };

  // Filtered views
  const allProperties = properties;
  const myUploaded = properties.filter((p) => p.source === "admin");
  const clientSubmissions = properties.filter((p) => p.source !== "admin");
  const pendingApproval = properties.filter((p) => p.status === "pending");
  const publishedProperties = properties.filter((p) => p.status === "published");
  const soldOrRented = properties.filter((p) => p.status === "sold" || p.status === "rented");
  const drafts = properties.filter((p) => p.status === "draft");
  const rejected = properties.filter((p) => p.status === "rejected");

  const counts = {
    all: allProperties.length,
    myUploaded: myUploaded.length,
    clientSubmissions: clientSubmissions.length,
    pending: pendingApproval.length,
    published: publishedProperties.length,
    soldOrRented: soldOrRented.length,
    drafts: drafts.length,
    rejected: rejected.length,
  };

  return {
    properties,
    isLoaded,
    addProperty,
    updateProperty,
    updateStatus,
    deleteProperty,
    allProperties,
    myUploaded,
    clientSubmissions,
    pendingApproval,
    publishedProperties,
    soldOrRented,
    drafts,
    rejected,
    counts,
    refresh: fetchServerProperties,
  };
}
