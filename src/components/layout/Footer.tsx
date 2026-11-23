import Link from "next/link";
import { Building2, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Linkedin, Youtube } from "lucide-react";

const FOOTER_LINKS = {
  "Quick Links": [
    { label: "Home", href: "/" },
    { label: "Buy Property", href: "/buy" },
    { label: "Sell Property", href: "/list-property" },
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
  ],
  "Property Types": [
    { label: "Residential Properties", href: "/residential" },
    { label: "Commercial Properties", href: "/commercial" },
    { label: "Industrial Properties", href: "/industrial" },
    { label: "Agricultural Land", href: "/agricultural" },
    { label: "Warehouses", href: "/properties?type=warehouse" },
    { label: "Large Land Parcels", href: "/properties?category=large-land" },
  ],
  "Key Locations": [
    { label: "Properties in Dwarka", href: "/locations/dwarka" },
    { label: "Properties in Najafgarh", href: "/locations/najafgarh" },
    { label: "Properties in Gurugram", href: "/locations/gurugram" },
    { label: "Properties in West Delhi", href: "/locations/west-delhi" },
    { label: "Properties in Noida", href: "/locations/noida" },
    { label: "Properties in Faridabad", href: "/locations/faridabad" },
  ],
  "Legal": [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Disclaimer", href: "/disclaimer" },
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
              <div className="w-9 h-9 bg-[#C6A66B] rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold font-display tracking-tight">LAND</span>
                <span className="text-xl font-bold font-display tracking-tight text-[#C6A66B] ml-1">PARCEL</span>
              </div>
            </Link>
            <p className="text-slate-300 text-sm leading-relaxed mb-5">
              Your Trusted Partner in Premium Property Deals. Connecting buyers,
              sellers, investors and businesses across Delhi NCR and beyond.
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <MapPin className="w-4 h-4 text-[#C6A66B] flex-shrink-0" />
                <span>Delhi NCR, India</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Phone className="w-4 h-4 text-[#C6A66B] flex-shrink-0" />
                <span>Contact via WhatsApp</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Mail className="w-4 h-4 text-[#C6A66B] flex-shrink-0" />
                <span>info@landparcel.in</span>
              </div>
            </div>
            {/* Social Links */}
            <div className="flex items-center gap-3 mt-5">
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

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="font-semibold text-sm text-[#C6A66B] uppercase tracking-wider mb-4">
                {heading}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-300 hover:text-white transition-colors"
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
            © {new Date().getFullYear()} Land Parcel. All rights reserved.
          </p>
          <p className="text-slate-400 text-xs">
            Real estate information is for property discovery purposes only. Always verify property details independently.
          </p>
        </div>
      </div>
    </footer>
  );
}
