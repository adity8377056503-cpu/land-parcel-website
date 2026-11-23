import fs from "fs";
import path from "path";
import { Property, ListingStatus, PropertySource } from "@/types";
import { generateId, generateListingId, generateSlug, OFFICIAL_BUSINESS } from "@/lib/utils";

const DATA_DIR = path.join(process.cwd(), "data");
const PROPERTIES_FILE = path.join(DATA_DIR, "properties.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PROPERTIES_FILE)) {
    fs.writeFileSync(PROPERTIES_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

function readLocalProperties(): Property[] {
  try {
    ensureDataDir();
    const content = fs.readFileSync(PROPERTIES_FILE, "utf-8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to read server properties file:", err);
    return [];
  }
}

function writeLocalProperties(properties: Property[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(PROPERTIES_FILE, JSON.stringify(properties, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write server properties file:", err);
  }
}

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes("placeholder") &&
    !key.includes("placeholder") &&
    url.startsWith("https://")
  );
}

export class PropertyService {
  /**
   * Retrieves all properties from production Supabase database (or server storage).
   */
  static async getAllProperties(options?: {
    onlyPublished?: boolean;
    category?: string;
    city?: string;
    source?: string;
  }): Promise<Property[]> {
    if (isSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const supabase = await createAdminClient();

        let query = supabase
          .from("properties")
          .select(`
            *,
            images:property_images(*),
            documents:property_documents(*),
            audit_logs:property_audit_logs(*)
          `)
          .order("created_at", { ascending: false });

        if (options?.onlyPublished) {
          query = query.in("status", ["published", "active"]);
        }
        if (options?.category) {
          query = query.eq("category", options.category);
        }
        if (options?.source) {
          query = query.eq("source", options.source);
        }

        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          return data.map((item) => ({
            ...item,
            images: item.images || [],
            documents: item.documents || [],
            audit_logs: item.audit_logs || [],
          }));
        }
      } catch (err) {
        console.error("Supabase query error, falling back to server storage:", err);
      }
    }

    // Server-side database fallback
    let list = readLocalProperties();
    if (options?.onlyPublished) {
      list = list.filter((p) => p.status === "published");
    }
    if (options?.category) {
      list = list.filter((p) => p.category === options.category);
    }
    if (options?.source) {
      list = list.filter((p) => p.source === options.source);
    }
    if (options?.city && options.city !== "All Cities") {
      list = list.filter(
        (p) =>
          p.city.toLowerCase().includes(options.city!.toLowerCase()) ||
          p.locality.toLowerCase().includes(options.city!.toLowerCase())
      );
    }
    return list;
  }

  /**
   * Retrieves a single property by ID or Slug.
   * Strictly shields confidential property documents from public viewers.
   */
  static async getPropertyByIdOrSlug(
    idOrSlug: string,
    isInternalAdmin: boolean = false
  ): Promise<Property | null> {
    let property: Property | null = null;

    if (isSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const supabase = await createAdminClient();

        const { data, error } = await supabase
          .from("properties")
          .select(`
            *,
            images:property_images(*),
            documents:property_documents(*),
            audit_logs:property_audit_logs(*)
          `)
          .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug},listing_id.eq.${idOrSlug}`)
          .maybeSingle();

        if (!error && data) {
          property = {
            ...data,
            images: data.images || [],
            documents: data.documents || [],
            audit_logs: data.audit_logs || [],
          };
        }
      } catch (err) {
        console.error("Supabase single property error:", err);
      }
    }

    if (!property) {
      const list = readLocalProperties();
      const found = list.find(
        (p) =>
          p.id === idOrSlug ||
          p.slug === idOrSlug ||
          (p.listing_id && p.listing_id.toLowerCase() === idOrSlug.toLowerCase())
      );
      if (found) property = found;
    }

    if (!property) return null;

    // Security shield: remove confidential private documents for non-admin viewers
    if (!isInternalAdmin) {
      return {
        ...property,
        documents: [], // Confidential documents are shielded
      };
    }

    return property;
  }

  /**
   * Creates a new property record.
   * Admin-added properties are permanently exempt from all limits.
   */
  static async createProperty(
    input: Partial<Property> & {
      title: string;
      category: Property["category"];
      property_type: Property["property_type"];
      price: number;
      total_area: number;
      area_unit: Property["area_unit"];
      city: string;
      state?: string;
      source?: PropertySource;
      status?: ListingStatus;
    },
    author: string = OFFICIAL_BUSINESS.email
  ): Promise<Property> {
    const id = generateId();
    const listing_id = generateListingId();
    const city = input.city || "Delhi";
    const slug = generateSlug(input.title, city) + "-" + listing_id.toLowerCase().slice(-4);
    const now = new Date().toISOString();
    const status = input.status || "draft";
    const source = input.source || "admin";

    const newProperty: Property = {
      id,
      listing_id,
      slug,
      title: input.title.trim(),
      description: input.description || "",
      category: input.category,
      property_type: input.property_type,
      status,
      source,
      availability_status: input.availability_status || "available",
      address: input.address || "",
      locality: input.locality || city,
      city,
      state: input.state || "Delhi",
      pincode: input.pincode,
      latitude: input.latitude,
      longitude: input.longitude,
      price: Number(input.price),
      price_unit: input.price_unit || "total",
      price_negotiable: input.price_negotiable ?? true,
      total_area: Number(input.total_area),
      area_unit: input.area_unit,
      built_up_area: input.built_up_area ? Number(input.built_up_area) : undefined,
      carpet_area: input.carpet_area ? Number(input.carpet_area) : undefined,
      covered_area: input.covered_area ? Number(input.covered_area) : undefined,
      road_width: input.road_width ? Number(input.road_width) : undefined,
      ceiling_height: input.ceiling_height ? Number(input.ceiling_height) : undefined,
      power_availability: input.power_availability,
      loading_facilities: input.loading_facilities,
      land_type: input.land_type,
      road_access: input.road_access,
      water_availability: input.water_availability,
      bedrooms: input.bedrooms ? Number(input.bedrooms) : undefined,
      bathrooms: input.bathrooms ? Number(input.bathrooms) : undefined,
      floor_number: input.floor_number !== undefined ? Number(input.floor_number) : undefined,
      total_floors: input.total_floors ? Number(input.total_floors) : undefined,
      furnishing: input.furnishing,
      parking: input.parking ? Number(input.parking) : undefined,
      property_age: input.property_age,
      nearby_landmarks: input.nearby_landmarks,
      road_connectivity: input.road_connectivity,
      highlights: input.highlights || [],
      is_featured: input.is_featured ?? false,
      is_demo: false,
      view_count: 0,
      seo_title: input.seo_title || `${input.title} | Land Parcel`,
      seo_description: input.seo_description || (input.description ? input.description.slice(0, 160) : ""),
      video_url: input.video_url,
      videos: input.videos || [],
      images: (input.images || []).map((img, idx) => ({
        id: img.id || generateId(),
        property_id: id,
        url: img.url,
        is_cover: img.is_cover ?? idx === 0,
        sort_order: img.sort_order ?? idx,
        created_at: now,
      })),
      documents: (input.documents || []).map((doc) => ({
        id: doc.id || generateId(),
        property_id: id,
        title: doc.title,
        file_url: doc.file_url,
        is_private: true,
        created_at: now,
      })),
      audit_logs: [
        {
          id: generateId(),
          property_id: id,
          action: source === "admin" ? (status === "published" ? "Created & Published Live" : "Created as Draft") : "Public Submission Intake",
          changed_by: author,
          notes: source === "admin" ? "Admin direct entry" : "Submitted via public listing form",
          new_status: status,
          timestamp: now,
        },
      ],
      customer_id: input.customer_id,
      seller_name: input.seller_name,
      seller_mobile: input.seller_mobile,
      seller_email: input.seller_email,
      seller_type: input.seller_type || (source === "admin" ? undefined : "owner"),
      created_at: now,
      updated_at: now,
      published_at: status === "published" ? now : undefined,
    };

    if (isSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const supabase = await createAdminClient();

        // 1. Insert property
        const { error: propErr } = await supabase.from("properties").insert({
          id: newProperty.id,
          listing_id: newProperty.listing_id,
          slug: newProperty.slug,
          title: newProperty.title,
          description: newProperty.description,
          category: newProperty.category,
          property_type: newProperty.property_type,
          status: newProperty.status,
          source: newProperty.source,
          availability_status: newProperty.availability_status,
          address: newProperty.address,
          locality: newProperty.locality,
          city: newProperty.city,
          state: newProperty.state,
          pincode: newProperty.pincode,
          latitude: newProperty.latitude,
          longitude: newProperty.longitude,
          price: newProperty.price,
          price_unit: newProperty.price_unit,
          price_negotiable: newProperty.price_negotiable,
          total_area: newProperty.total_area,
          area_unit: newProperty.area_unit,
          built_up_area: newProperty.built_up_area,
          carpet_area: newProperty.carpet_area,
          bedrooms: newProperty.bedrooms,
          bathrooms: newProperty.bathrooms,
          floor_number: newProperty.floor_number,
          total_floors: newProperty.total_floors,
          furnishing: newProperty.furnishing,
          parking: newProperty.parking,
          property_age: newProperty.property_age,
          covered_area: newProperty.covered_area,
          road_width: newProperty.road_width,
          ceiling_height: newProperty.ceiling_height,
          power_availability: newProperty.power_availability,
          loading_facilities: newProperty.loading_facilities,
          land_type: newProperty.land_type,
          road_access: newProperty.road_access,
          water_availability: newProperty.water_availability,
          nearby_landmarks: newProperty.nearby_landmarks,
          road_connectivity: newProperty.road_connectivity,
          highlights: newProperty.highlights,
          is_featured: newProperty.is_featured,
          is_demo: false,
          view_count: 0,
          seo_title: newProperty.seo_title,
          seo_description: newProperty.seo_description,
          video_url: newProperty.video_url,
          created_at: newProperty.created_at,
          updated_at: newProperty.updated_at,
          published_at: newProperty.published_at,
        });

        if (propErr) throw propErr;

        // 2. Insert images
        if (newProperty.images && newProperty.images.length > 0) {
          await supabase.from("property_images").insert(
            newProperty.images.map((img) => ({
              id: img.id,
              property_id: newProperty.id,
              url: img.url,
              is_cover: img.is_cover,
              sort_order: img.sort_order,
              created_at: img.created_at,
            }))
          );
        }

        // 3. Insert documents
        if (newProperty.documents && newProperty.documents.length > 0) {
          await supabase.from("property_documents").insert(
            newProperty.documents.map((doc) => ({
              id: doc.id,
              property_id: newProperty.id,
              title: doc.title,
              file_url: doc.file_url,
              is_private: true,
              created_at: doc.created_at,
            }))
          );
        }
      } catch (err) {
        console.error("Supabase insert error, persisting to server store:", err);
      }
    }

    // Always persist to server storage for local/hybrid reliability
    const current = readLocalProperties();
    writeLocalProperties([newProperty, ...current]);
    return newProperty;
  }

  /**
   * Updates an existing property.
   */
  static async updateProperty(
    id: string,
    updates: Partial<Property>,
    author: string = OFFICIAL_BUSINESS.email,
    notes: string = "Property updated by admin"
  ): Promise<Property | null> {
    const now = new Date().toISOString();
    const current = readLocalProperties();
    const index = current.findIndex((p) => p.id === id);

    let updated: Property;

    if (index !== -1) {
      const prev = current[index];
      const previous_status = prev.status;
      const new_status = updates.status || prev.status;
      const statusChanged = previous_status !== new_status;

      const log = {
        id: generateId(),
        property_id: id,
        action: statusChanged ? `Status transitioned to ${new_status}` : "Property Edited",
        changed_by: author,
        notes,
        previous_status,
        new_status,
        timestamp: now,
      };

      updated = {
        ...prev,
        ...updates,
        audit_logs: [log, ...(prev.audit_logs || [])],
        updated_at: now,
        published_at: new_status === "published" && !prev.published_at ? now : prev.published_at,
      };

      current[index] = updated;
      writeLocalProperties(current);
    } else {
      return null;
    }

    if (isSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const supabase = await createAdminClient();

        // Update main property table
        await supabase
          .from("properties")
          .update({
            ...updates,
            updated_at: now,
            published_at: updated.published_at,
          })
          .eq("id", id);

        // Update images if provided
        if (updates.images) {
          await supabase.from("property_images").delete().eq("property_id", id);
          if (updates.images.length > 0) {
            await supabase.from("property_images").insert(
              updates.images.map((img, idx) => ({
                id: img.id || generateId(),
                property_id: id,
                url: img.url,
                is_cover: img.is_cover,
                sort_order: img.sort_order ?? idx,
                created_at: now,
              }))
            );
          }
        }
      } catch (err) {
        console.error("Supabase update error:", err);
      }
    }

    return updated;
  }

  /**
   * Deletes a property record permanently.
   */
  static async deleteProperty(id: string): Promise<boolean> {
    const current = readLocalProperties();
    const filtered = current.filter((p) => p.id !== id);
    writeLocalProperties(filtered);

    if (isSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const supabase = await createAdminClient();
        await supabase.from("properties").delete().eq("id", id);
      } catch (err) {
        console.error("Supabase delete error:", err);
      }
    }

    return true;
  }

  /**
   * Duplicates an existing property as a new Draft listing.
   */
  static async duplicateProperty(
    id: string,
    author: string = OFFICIAL_BUSINESS.email
  ): Promise<Property | null> {
    const property = await this.getPropertyByIdOrSlug(id);
    if (!property) return null;

    const copyTitle = `Copy of ${property.title}`;
    const duplicated = await this.createProperty(
      {
        ...property,
        title: copyTitle,
        status: "draft",
        source: "admin",
        is_featured: false,
        view_count: 0,
        images: property.images?.map((img) => ({
          ...img,
          id: generateId(),
          property_id: "",
          created_at: new Date().toISOString(),
        })),
        documents: property.documents?.map((doc) => ({
          ...doc,
          id: generateId(),
          property_id: "",
          created_at: new Date().toISOString(),
        })),
      },
      author
    );

    return duplicated;
  }
}
