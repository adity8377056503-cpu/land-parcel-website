"use client";

import { useState } from "react";
import { Settings, Save, Phone, Mail, Globe, Shield, Database, Webhook } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const [whatsappNumber, setWhatsappNumber] = useState("919999999999");
  const [officialEmail, setOfficialEmail] = useState("info@landparcel.in");
  const [adminNotificationEmail, setAdminNotificationEmail] = useState("admin@landparcel.in");
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState("https://n8n.yourdomain.com/webhook/land-parcel-leads");
  const [siteTitle, setSiteTitle] = useState("Land Parcel - Premium Real Estate in Delhi NCR");
  const [facebookUrl, setFacebookUrl] = useState("https://facebook.com/landparcel");
  const [instagramUrl, setInstagramUrl] = useState("https://instagram.com/landparcel");
  const [linkedinUrl, setLinkedinUrl] = useState("https://linkedin.com/company/landparcel");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Settings saved successfully");
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#172B4D] font-display">
          System & Marketplace Settings
        </h1>
        <p className="text-sm text-[#64748B]">
          Configure official contact numbers, WhatsApp automation routing, n8n webhook triggers, and SEO presets.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Contact & WhatsApp */}
        <div className="card p-6 border border-[#E2E8F0] space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-5 h-5 text-[#C6A66B]" />
            <h2 className="text-lg font-bold text-[#172B4D] font-display">
              Contact & WhatsApp Routing
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Marketplace WhatsApp Number (with country code)</label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="input-field text-sm"
                placeholder="919999999999"
              />
              <span className="text-[11px] text-[#64748B] mt-1 block">
                Powers all WhatsApp click-to-chat inquiry links on property pages.
              </span>
            </div>

            <div>
              <label className="label-field">Public Inquiries Email</label>
              <input
                type="email"
                value={officialEmail}
                onChange={(e) => setOfficialEmail(e.target.value)}
                className="input-field text-sm"
                placeholder="info@landparcel.in"
              />
            </div>
          </div>
        </div>

        {/* Lead Automation & Webhooks */}
        <div className="card p-6 border border-[#E2E8F0] space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Webhook className="w-5 h-5 text-[#C6A66B]" />
            <h2 className="text-lg font-bold text-[#172B4D] font-display">
              n8n & WhatsApp Automation Webhook
            </h2>
          </div>
          <p className="text-xs text-[#64748B]">
            Configure n8n webhook workflow for automated WhatsApp follow-ups, CRM lead push, and instant notifications.
          </p>

          <div>
            <label className="label-field">n8n Lead Ingestion Webhook URL</label>
            <input
              type="url"
              value={n8nWebhookUrl}
              onChange={(e) => setN8nWebhookUrl(e.target.value)}
              className="input-field text-sm font-mono"
            />
          </div>

          <div>
            <label className="label-field">Admin Notification Email for New Inquiries</label>
            <input
              type="email"
              value={adminNotificationEmail}
              onChange={(e) => setAdminNotificationEmail(e.target.value)}
              className="input-field text-sm"
            />
          </div>
        </div>

        {/* SEO & Brand Meta */}
        <div className="card p-6 border border-[#E2E8F0] space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-[#C6A66B]" />
            <h2 className="text-lg font-bold text-[#172B4D] font-display">
              SEO & Social Media
            </h2>
          </div>

          <div>
            <label className="label-field">Default SEO Title Template</label>
            <input
              type="text"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              className="input-field text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label-field">Facebook URL</label>
              <input
                type="url"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="label-field">Instagram URL</label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="label-field">LinkedIn URL</label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="input-field text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
