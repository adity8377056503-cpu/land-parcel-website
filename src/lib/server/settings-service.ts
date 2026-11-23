import fs from "fs";
import path from "path";
import { SiteCategory, SiteSettings } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const AUDIT_LOGS_FILE = path.join(DATA_DIR, "audit-logs.json");

export const DEFAULT_CATEGORIES: SiteCategory[] = [
  {
    id: "cat-residential",
    name: "Residential Properties",
    slug: "residential",
    description: "Apartments, builder floors, independent houses, villas and residential plots across Delhi NCR.",
    is_active: true,
    sort_order: 1,
  },
  {
    id: "cat-commercial",
    name: "Commercial Properties",
    slug: "commercial",
    description: "Office spaces, commercial buildings, SCO plots, and retail showrooms.",
    is_active: true,
    sort_order: 2,
  },
  {
    id: "cat-industrial",
    name: "Industrial Properties",
    slug: "industrial",
    description: "Industrial plots, factories, manufacturing units, and logistics hubs.",
    is_active: true,
    sort_order: 3,
  },
  {
    id: "cat-agricultural",
    name: "Agricultural Land",
    slug: "agricultural",
    description: "Fertile agricultural land, farmhouses, and expansive rural farm lands.",
    is_active: true,
    sort_order: 4,
  },
  {
    id: "cat-plots-land",
    name: "Plots and Land",
    slug: "plots-land",
    description: "Freehold plots, commercial land parcels, and strategic investment land.",
    is_active: true,
    sort_order: 5,
  },
  {
    id: "cat-warehouses",
    name: "Warehouses",
    slug: "warehouses",
    description: "Ready-to-use and build-to-suit warehouses with high ceilings and heavy vehicle access.",
    is_active: true,
    sort_order: 6,
  },
  {
    id: "cat-shops-offices",
    name: "Shops and Offices",
    slug: "shops-offices",
    description: "High-street retail shops and grade-A corporate offices in prime business districts.",
    is_active: true,
    sort_order: 7,
  },
  {
    id: "cat-institutional",
    name: "Institutional Properties",
    slug: "institutional",
    description: "Schools, hospitals, colleges, healthcare centres, and educational campus lands.",
    is_active: true,
    sort_order: 8,
  },
];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  brand_name: "Land Parcel",
  owner_name: "Suraj Prakash",
  official_email: "acreindiaclub@gmail.com",
  whatsapp_number: "8750442235",
  primary_market: "Delhi NCR, India",
  office_address: "Connaught Place / Barakhamba Road, New Delhi, Delhi 110001",
  tagline: "Your Trusted Partner in Premium Property Deals",
  seo_title: "Land Parcel — Premium Commercial, Residential & Industrial Real Estate in Delhi NCR",
  seo_description:
    "Direct and verified real estate marketplace in Delhi NCR for residential, commercial, industrial, agricultural land, plots, warehouses, and institutional properties.",
  seo_keywords: "delhi ncr real estate, commercial land, industrial plot, agricultural land, warehouses, land parcel, buy property delhi",
  hero_headline: "Discover Prime Real Estate & Verified Land Parcels in Delhi NCR",
  hero_subheadline:
    "Connect directly with genuine property owners, builders, and institutional investors. Zero fake listings, 100% verified documentation.",
  hero_banner_image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=1600&auto=format&fit=crop",
  about_us_headline: "Connecting Serious Investors with Prime Land & Properties",
  about_us_content:
    "Land Parcel is Delhi NCR's premier real estate marketplace dedicated to institutional, commercial, industrial, and luxury residential properties. Guided by transparent diligence and genuine property ownership, we empower buyers and sellers to transact with uncompromised integrity.",
  footer_text: "© 2026 Land Parcel. All rights reserved. A verified marketplace powered by Acre India Club.",
  categories: DEFAULT_CATEGORIES,
  updated_at: new Date().toISOString(),
};

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

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), "utf-8");
      return fallback;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

function writeJsonFile<T>(filePath: string, data: T) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`Failed to write ${path.basename(filePath)}:`, err);
  }
}

export interface AdminAuditEntry {
  id: string;
  action: string;
  performed_by: string;
  target_entity: string;
  target_id?: string;
  details?: Record<string, any>;
  created_at: string;
}

export class SettingsService {
  static async getSettings(): Promise<SiteSettings> {
    if (isSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const supabase = await createAdminClient();
        const { data, error } = await supabase
          .from("site_settings")
          .select("settings, updated_at")
          .eq("id", "current")
          .maybeSingle();

        if (!error && data?.settings) {
          return {
            ...DEFAULT_SITE_SETTINGS,
            ...data.settings,
            updated_at: data.updated_at || data.settings.updated_at,
          };
        }
      } catch (err) {
        console.error("Supabase getSettings error:", err);
      }
    }

    return readJsonFile<SiteSettings>(SETTINGS_FILE, DEFAULT_SITE_SETTINGS);
  }

  static async updateSettings(updates: Partial<SiteSettings>, updatedBy: string): Promise<SiteSettings> {
    const current = await this.getSettings();
    const updated: SiteSettings = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const supabase = await createAdminClient();
        await supabase
          .from("site_settings")
          .upsert({
            id: "current",
            settings: updated,
            updated_at: updated.updated_at,
          });
      } catch (err) {
        console.error("Supabase updateSettings error:", err);
      }
    }

    writeJsonFile(SETTINGS_FILE, updated);

    await this.recordAudit({
      action: "UPDATE_SITE_SETTINGS",
      performed_by: updatedBy,
      target_entity: "site_settings",
      details: { fields: Object.keys(updates) },
    });

    return updated;
  }

  static async addCategory(
    category: Omit<SiteCategory, "id">,
    performedBy: string
  ): Promise<SiteCategory> {
    const settings = await this.getSettings();
    const id = `cat-${category.slug.replace(/[^a-zA-Z0-9_-]/g, "")}-${Date.now().toString().slice(-4)}`;
    const newCat: SiteCategory = {
      id,
      name: category.name.trim(),
      slug: category.slug.trim().toLowerCase(),
      description: category.description?.trim(),
      is_active: category.is_active ?? true,
      sort_order: category.sort_order ?? settings.categories.length + 1,
    };

    const exists = settings.categories.some((c) => c.slug === newCat.slug);
    if (exists) {
      throw new Error(`Category slug "${newCat.slug}" already exists.`);
    }

    const categories = [...settings.categories, newCat];
    await this.updateSettings({ categories }, performedBy);

    await this.recordAudit({
      action: "ADD_CATEGORY",
      performed_by: performedBy,
      target_entity: "category",
      target_id: newCat.id,
      details: { name: newCat.name, slug: newCat.slug },
    });

    return newCat;
  }

  static async updateCategory(
    idOrSlug: string,
    updates: Partial<Omit<SiteCategory, "id">>,
    performedBy: string
  ): Promise<SiteCategory | null> {
    const settings = await this.getSettings();
    const idx = settings.categories.findIndex((c) => c.id === idOrSlug || c.slug === idOrSlug);
    if (idx === -1) return null;

    settings.categories[idx] = {
      ...settings.categories[idx],
      ...updates,
    };

    await this.updateSettings({ categories: settings.categories }, performedBy);

    await this.recordAudit({
      action: "UPDATE_CATEGORY",
      performed_by: performedBy,
      target_entity: "category",
      target_id: settings.categories[idx].id,
      details: updates,
    });

    return settings.categories[idx];
  }

  static async recordAudit(entry: Omit<AdminAuditEntry, "id" | "created_at">): Promise<void> {
    const record: AdminAuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      action: entry.action,
      performed_by: entry.performed_by,
      target_entity: entry.target_entity,
      target_id: entry.target_id,
      details: entry.details,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const supabase = await createAdminClient();
        await supabase.from("admin_audit_logs").insert({
          action: record.action,
          performed_by: record.performed_by,
          target_entity: record.target_entity,
          target_id: record.target_id,
          details: record.details,
          created_at: record.created_at,
        });
      } catch (err) {
        console.error("Supabase recordAudit error:", err);
      }
    }

    const logs = readJsonFile<AdminAuditEntry[]>(AUDIT_LOGS_FILE, []);
    logs.unshift(record);
    // Keep last 500 audit logs
    if (logs.length > 500) logs.length = 500;
    writeJsonFile(AUDIT_LOGS_FILE, logs);
  }

  static async getAuditLogs(limit = 50): Promise<AdminAuditEntry[]> {
    if (isSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const supabase = await createAdminClient();
        const { data, error } = await supabase
          .from("admin_audit_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(limit);

        if (!error && Array.isArray(data)) {
          return data;
        }
      } catch (err) {
        console.error("Supabase getAuditLogs error:", err);
      }
    }

    const logs = readJsonFile<AdminAuditEntry[]>(AUDIT_LOGS_FILE, []);
    return logs.slice(0, limit);
  }
}
