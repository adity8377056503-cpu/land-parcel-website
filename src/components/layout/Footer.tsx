import Link from "next/link";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Shield,
  Sparkles,
} from "lucide-react";
import { OFFICIAL_BUSINESS, getWhatsAppUrl } from "@/lib/utils";

const FOOTER_SECTIONS = {
  "Marketplace": [
    { label: "All Properties", href: "/properties" },
    { label: "Subscription Plans & Pricing", href: "/pricing" },
    { label: "List a Property", href: "/list-property" },
    { label: "About Land Parcel", href: "/about" },
    { label: "Contact Us", href: "/contact" },
  ],
  "Property Types": [
    { label: "Residential Properties", href: "/residential" },
    { label: "Commercial Properties", href: "/commercial" },
    { label: "Industrial Properties", href: "/industrial" },
    { label: "Agricultural Land", href: "/agricultural" },
    { label: "Plots & Land", href: "/properties?category=plots-land" },
    { label: "Warehouses", href: "/properties?type=warehouse" },
    { label: "Shops & Offices", href: "/properties?category=shops-offices" },
    { label: "Institutional", href: "/properties?category=institutional" },
  ],
  "Portals & Accounts": [
    { label: "Customer Login / Register", href: "/login" },
    { label: "Customer Dashboard", href: "/dashboard" },
    { label: "Super Admin Dashboard", href: "/admin" },
    { label: "Super Admin Login", href: "/admin/login" },
  ],
  "Key Locations": [
    { label: "Properties in Dwarka", href: "/locations/dwarka" },
    { label: "Properties in Najafgarh", href: "/locations/najafgarh" },
    { label: "Properties in Gurugram", href: "/locations/gurugram" },
    { label: "Properties in West Delhi", href: "/locations/west-delhi" },
    { label: "Properties in Noida", href: "/locations/noida" },
    { label: "Properties in Faridabad", href: "/locations/faridabad" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#172B4D] text-white">
      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-[#C6A66B] rounded-xl flex items-center justify-center shadow-xs">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold font-display tracking-tight">LAND</span>
                <span className="text-xl font-bold font-display tracking-tight text-[#C6A66B] ml-1">
                  PARCEL
                </span>
              </div>
            </Link>
            <p className="text-slate-300 text-sm leading-relaxed mb-5">
              {OFFICIAL_BUSINESS.tagline}. Connecting verified buyers, sellers, investors, builders, and developers across {OFFICIAL_BUSINESS.primary_market}. Zero fake listings, 100% verified documentation.
            </p>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <MapPin className="w-4 h-4 text-[#C6A66B] flex-shrink-0" />
                <span>{OFFICIAL_BUSINESS.primary_market}</span>
              </div>
              <a
                href={getWhatsAppUrl(
                  OFFICIAL_BUSINESS.whatsapp_link_number,
                  "Hi, I'd like to get in touch with Land Parcel."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 text-[#C6A66B] flex-shrink-0" />
                <span>WhatsApp: {OFFICIAL_BUSINESS.whatsapp_formatted}</span>
              </a>
              <a
                href={`mailto:${OFFICIAL_BUSINESS.email}`}
                className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 text-[#C6A66B] flex-shrink-0" />
                <span>{OFFICIAL_BUSINESS.email}</span>
              </a>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Linkedin, href: "#", label: "LinkedIn" },
                { icon: Youtube, href: "#", label: "YouTube" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#C6A66B] transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Dynamic Link Columns */}
          {Object.entries(FOOTER_SECTIONS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="font-semibold text-xs text-[#C6A66B] uppercase tracking-wider mb-4 flex items-center gap-1.5">
                {heading === "Portals & Accounts" && <Shield className="w-3.5 h-3.5" />}
                {heading === "Marketplace" && <Sparkles className="w-3.5 h-3.5" />}
                <span>{heading}</span>
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-slate-300 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-5 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-slate-400 text-xs">
            © {new Date().getFullYear()} Land Parcel · Website Owner: {OFFICIAL_BUSINESS.owner_name}. Super Admin: Aditya Raj. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms &amp; Conditions
            </Link>
            <span>·</span>
            <Link href="/disclaimer" className="hover:text-white transition-colors">
              Disclaimer
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
