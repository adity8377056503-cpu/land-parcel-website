"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Save,
  Phone,
  Mail,
  Globe,
  Shield,
  Database,
  User,
  Sparkles,
  Layers,
  FileText,
  Plus,
  CheckCircle,
  XCircle,
  HelpCircle,
  Image as ImageIcon,
} from "lucide-react";
import { SiteSettings, SiteCategory } from "@/types";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "seo" | "homepage" | "about" | "categories" | "security">("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings state
  const [brandName, setBrandName] = useState("Land Parcel");
  const [ownerName, setOwnerName] = useState("Suraj Prakash");
  const [officialEmail, setOfficialEmail] = useState("acreindiaclub@gmail.com");
  const [whatsappNumber, setWhatsappNumber] = useState("8750442235");
  const [primaryMarket, setPrimaryMarket] = useState("Delhi NCR, India");
  const [officeAddress, setOfficeAddress] = useState("Barakhamba Road, Connaught Place, New Delhi 110001");
  const [tagline, setTagline] = useState("Your Trusted Partner in Premium Property Deals");

  // SEO state
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");

  // Homepage state
  const [heroHeadline, setHeroHeadline] = useState("");
  const [heroSubheadline, setHeroSubheadline] = useState("");
  const [heroBannerImage, setHeroBannerImage] = useState("");

  // About state
  const [aboutUsHeadline, setAboutUsHeadline] = useState("");
  const [aboutUsContent, setAboutUsContent] = useState("");
  const [footerText, setFooterText] = useState("");

  // Categories state
  const [categories, setCategories] = useState<SiteCategory[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.settings) {
          const s = json.settings as SiteSettings;
          setBrandName(s.brand_name || "Land Parcel");
          setOwnerName(s.owner_name || "Suraj Prakash");
          setOfficialEmail(s.official_email || "acreindiaclub@gmail.com");
          setWhatsappNumber(s.whatsapp_number || "8750442235");
          setPrimaryMarket(s.primary_market || "Delhi NCR, India");
          setOfficeAddress(s.office_address || "");
          setTagline(s.tagline || "");

          setSeoTitle(s.seo_title || "");
          setSeoDescription(s.seo_description || "");
          setSeoKeywords(s.seo_keywords || "");

          setHeroHeadline(s.hero_headline || "");
          setHeroSubheadline(s.hero_subheadline || "");
          setHeroBannerImage(s.hero_banner_image || "");

          setAboutUsHeadline(s.about_us_headline || "");
          setAboutUsContent(s.about_us_content || "");
          setFooterText(s.footer_text || "");

          setCategories(Array.isArray(s.categories) ? s.categories : []);
        }
      })
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    const toastId = toast.loading("Saving platform settings...");

    try {
      const payload: Partial<SiteSettings> = {
        brand_name: brandName.trim(),
        owner_name: ownerName.trim(),
        official_email: officialEmail.trim(),
        whatsapp_number: whatsappNumber.trim(),
        primary_market: primaryMarket.trim(),
        office_address: officeAddress.trim(),
        tagline: tagline.trim(),
        seo_title: seoTitle.trim(),
        seo_description: seoDescription.trim(),
        seo_keywords: seoKeywords.trim(),
        hero_headline: heroHeadline.trim(),
        hero_subheadline: heroSubheadline.trim(),
        hero_banner_image: heroBannerImage.trim(),
        about_us_headline: aboutUsHeadline.trim(),
        about_us_content: aboutUsContent.trim(),
        footer_text: footerText.trim(),
        categories,
      };

      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: payload }),
      });

      if (!res.ok) throw new Error();
      const json = await res.json();
      toast.success(json.message || "Settings updated successfully", { id: toastId });
    } catch {
      toast.error("Failed to save settings", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim() || !newCatSlug.trim()) {
      toast.error("Category name and slug are required");
      return;
    }

    setIsAddingCategory(true);
    const toastId = toast.loading("Adding category...");

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_category",
          category: {
            name: newCatName.trim(),
            slug: newCatSlug.trim().toLowerCase().replace(/\s+/g, "-"),
            description: newCatDesc.trim(),
            is_active: true,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to add category");
      }

      const json = await res.json();
      if (json.category) {
        setCategories((prev) => [...prev, json.category]);
        setNewCatName("");
        setNewCatSlug("");
        setNewCatDesc("");
        toast.success(`Category "${json.category.name}" added`, { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to add category", { id: toastId });
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleToggleCategoryActive = (slug: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.slug === slug ? { ...c, is_active: !c.is_active } : c))
    );
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-[#64748B]">
        <div className="animate-spin w-8 h-8 border-4 border-[#172B4D] border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-xs">Loading website management console...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172B4D] font-display">
            Website Content &amp; Marketplace Management
          </h1>
          <p className="text-xs text-[#64748B]">
            Edit homepage banners, SEO meta, About Us, contact info, and property categories without writing code.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSaveSettings()}
          disabled={saving}
          className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm"
        >
          <Save className="w-4 h-4 text-[#C6A66B]" /> Save All Settings
        </button>
      </div>

      {/* Tab Navigation Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#E2E8F0]">
        {[
          { id: "general", label: "General & Branding", icon: Shield },
          { id: "homepage", label: "Homepage Banners", icon: Sparkles },
          { id: "categories", label: `Categories (${categories.length})`, icon: Layers },
          { id: "seo", label: "SEO & Meta", icon: Globe },
          { id: "about", label: "About Us & Footer", icon: FileText },
          { id: "security", label: "Super Admin & Supabase", icon: Database },
        ].map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                active
                  ? "bg-[#172B4D] text-white shadow-sm"
                  : "bg-white text-[#64748B] hover:text-[#172B4D] hover:bg-slate-100 border border-[#E2E8F0]"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? "text-[#C6A66B]" : "text-slate-400"}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: General & Branding */}
      {activeTab === "general" && (
        <div className="space-y-6">
          <div className="card p-6 border border-[#E2E8F0] space-y-4">
            <h2 className="text-base font-bold text-[#172B4D] font-display">
              Business Identity &amp; Contact Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">Brand Name</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="input-field text-xs font-semibold"
                />
              </div>

              <div>
                <label className="label-field">Business Owner Name</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="input-field text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">Official Business Email</label>
                <input
                  type="email"
                  value={officialEmail}
                  onChange={(e) => setOfficialEmail(e.target.value)}
                  className="input-field text-xs font-mono font-semibold"
                />
                <span className="text-[10px] text-[#64748B] mt-1 block">
                  Official communications &amp; lead notifications.
                </span>
              </div>

              <div>
                <label className="label-field">Marketplace WhatsApp Number</label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="input-field text-xs font-mono font-semibold"
                />
                <span className="text-[10px] text-[#64748B] mt-1 block">
                  Click-to-chat inquiry number on property pages (8750442235).
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">Primary Market Focus</label>
                <input
                  type="text"
                  value={primaryMarket}
                  onChange={(e) => setPrimaryMarket(e.target.value)}
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="label-field">Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="input-field text-xs"
                />
              </div>
            </div>

            <div>
              <label className="label-field">Office Address</label>
              <input
                type="text"
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
                className="input-field text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Homepage Banners */}
      {activeTab === "homepage" && (
        <div className="space-y-6">
          <div className="card p-6 border border-[#E2E8F0] space-y-4">
            <h2 className="text-base font-bold text-[#172B4D] font-display">
              Homepage Hero Banner &amp; Headline
            </h2>

            <div>
              <label className="label-field">Hero Main Headline</label>
              <input
                type="text"
                value={heroHeadline}
                onChange={(e) => setHeroHeadline(e.target.value)}
                className="input-field text-sm font-semibold"
                placeholder="e.g. Discover Prime Real Estate & Verified Land Parcels in Delhi NCR"
              />
            </div>

            <div>
              <label className="label-field">Hero Subheadline</label>
              <textarea
                rows={3}
                value={heroSubheadline}
                onChange={(e) => setHeroSubheadline(e.target.value)}
                className="input-field text-xs resize-none"
                placeholder="Supporting description under hero headline..."
              />
            </div>

            <div>
              <label className="label-field">Hero Banner Image URL</label>
              <input
                type="url"
                value={heroBannerImage}
                onChange={(e) => setHeroBannerImage(e.target.value)}
                className="input-field text-xs font-mono"
              />
            </div>

            {heroBannerImage && (
              <div className="rounded-xl overflow-hidden border border-slate-200 aspect-[21/9] max-h-56 bg-slate-100">
                <img
                  src={heroBannerImage}
                  alt="Hero Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Property Categories Manager */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          {/* Add Category Form */}
          <div className="card p-5 border border-[#E2E8F0] space-y-3 bg-[#F8FAFC]">
            <h2 className="text-sm font-bold text-[#172B4D] font-display flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#C6A66B]" /> Add New Property Category
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-[#64748B] block mb-1">Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Institutional Properties"
                  value={newCatName}
                  onChange={(e) => {
                    setNewCatName(e.target.value);
                    if (!newCatSlug) {
                      setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                    }
                  }}
                  className="input-field text-xs py-1.5"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#64748B] block mb-1">URL Slug *</label>
                <input
                  type="text"
                  placeholder="e.g. institutional"
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value)}
                  className="input-field text-xs py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#64748B] block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Short description..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="input-field text-xs py-1.5"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={isAddingCategory}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Category
              </button>
            </div>
          </div>

          {/* Categories Table */}
          <div className="card border border-[#E2E8F0] overflow-hidden">
            <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#172B4D]">
                  Active Marketplace Categories ({categories.length})
                </h3>
                <p className="text-xs text-[#64748B]">
                  Categories supported across filters, search navigation, and property listing forms.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F7FA] text-[#64748B] border-b border-[#E2E8F0] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Category Name</th>
                    <th className="py-3 px-4">Slug</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {categories.map((cat) => (
                    <tr key={cat.id || cat.slug} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#172B4D]">{cat.name}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{cat.slug}</td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {cat.description || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`badge text-[10px] ${
                            cat.is_active
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {cat.is_active ? "Active" : "Hidden"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleCategoryActive(cat.slug)}
                          className="text-[11px] text-blue-600 hover:underline font-semibold"
                        >
                          {cat.is_active ? "Hide" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SEO & Meta */}
      {activeTab === "seo" && (
        <div className="space-y-6">
          <div className="card p-6 border border-[#E2E8F0] space-y-4">
            <h2 className="text-base font-bold text-[#172B4D] font-display">
              Search Engine Optimization (SEO) Presets
            </h2>

            <div>
              <label className="label-field">Global Meta Title</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="input-field text-xs font-semibold"
              />
            </div>

            <div>
              <label className="label-field">Global Meta Description</label>
              <textarea
                rows={3}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="input-field text-xs resize-none"
              />
            </div>

            <div>
              <label className="label-field">Meta Keywords</label>
              <input
                type="text"
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                className="input-field text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: About Us & Footer */}
      {activeTab === "about" && (
        <div className="space-y-6">
          <div className="card p-6 border border-[#E2E8F0] space-y-4">
            <h2 className="text-base font-bold text-[#172B4D] font-display">
              About Us &amp; Footer Information
            </h2>

            <div>
              <label className="label-field">About Us Headline</label>
              <input
                type="text"
                value={aboutUsHeadline}
                onChange={(e) => setAboutUsHeadline(e.target.value)}
                className="input-field text-xs font-semibold"
              />
            </div>

            <div>
              <label className="label-field">Detailed About Us Content</label>
              <textarea
                rows={6}
                value={aboutUsContent}
                onChange={(e) => setAboutUsContent(e.target.value)}
                className="input-field text-xs resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="label-field">Footer Copyright &amp; Legal Text</label>
              <input
                type="text"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                className="input-field text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Super Admin & Supabase Configuration Status */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="card p-6 border border-[#E2E8F0] space-y-4">
            <h2 className="text-base font-bold text-[#172B4D] font-display flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#C6A66B]" /> Super Admin Identity
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="text-[#64748B]">Primary Super Admin</div>
                <div className="text-sm font-bold text-[#172B4D] mt-1">Aditya Raj</div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="text-[#64748B]">Super Admin Mobile</div>
                <div className="text-sm font-bold text-[#172B4D] font-mono mt-1">+91 8377056503</div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="text-[#64748B]">Account Authority</div>
                <div className="text-sm font-bold text-[#C6A66B] mt-1">Website Owner / Full Access</div>
              </div>
            </div>
          </div>

          <div className="card p-6 border border-[#E2E8F0] space-y-3">
            <h2 className="text-base font-bold text-[#172B4D] font-display flex items-center gap-2">
              <Database className="w-4 h-4 text-[#C6A66B]" /> Production Database &amp; Storage Architecture
            </h2>

            <div className="text-xs text-[#64748B] space-y-2 leading-relaxed">
              <p>
                Land Parcel is engineered with dual persistence:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li>
                  <strong>PostgreSQL &amp; Supabase Storage</strong>: Real properties, customers, subscriptions, and private documents persist via Supabase when configured.
                </li>
                <li>
                  <strong>Automatic Server Fallback</strong>: Seamlessly stores verified records on server disk when external Supabase credentials are pending.
                </li>
                <li>
                  <strong>Zero Mock Data</strong>: No fake properties, demo users, or test transactions are generated.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
