"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Phone, ChevronDown, Building2 } from "lucide-react";
import { cn, getWhatsAppUrl, OFFICIAL_BUSINESS } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  {
    label: "Buy Property",
    href: "/buy",
    children: [
      { label: "Residential", href: "/residential" },
      { label: "Commercial", href: "/commercial" },
      { label: "Industrial", href: "/industrial" },
      { label: "Agricultural Land", href: "/agricultural" },
    ],
  },
  { label: "Residential", href: "/residential" },
  { label: "Commercial", href: "/commercial" },
  { label: "Industrial", href: "/industrial" },
  { label: "Agricultural Land", href: "/agricultural" },
  { label: "Sell Property", href: "/list-property" },
  { label: "Pricing", href: "/pricing" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || OFFICIAL_BUSINESS.whatsapp_link_number;
  const whatsappUrl = getWhatsAppUrl(whatsappNumber, "Hi, I'm looking for a property on Land Parcel. Please help me.");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white shadow-nav"
          : "bg-white/95 backdrop-blur-md border-b border-[#E2E8F0]"
      )}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#172B4D] rounded-lg flex items-center justify-center group-hover:bg-[#1e3a6e] transition-colors">
              <Building2 className="w-5 h-5 text-[#C6A66B]" />
            </div>
            <div>
              <span className="text-xl font-bold text-[#172B4D] font-display tracking-tight">
                LAND
              </span>
              <span className="text-xl font-bold text-[#C6A66B] font-display tracking-tight ml-1">
                PARCEL
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {NAV_ITEMS.slice(0, 7).map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium transition-colors duration-200",
                    "text-[#64748B] hover:text-[#172B4D]"
                  )}
                >
                  {item.label}
                  {item.children && (
                    <ChevronDown className="w-3.5 h-3.5 mt-0.5" />
                  )}
                </Link>
                {item.children && openDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-card-hover border border-[#E2E8F0] py-2 z-50">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-[#64748B] hover:text-[#172B4D] hover:bg-[#EAF3FA] transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-sm font-semibold text-[#172B4D] hover:text-[#C6A66B] px-3 py-2 rounded-xl hover:bg-[#EAF3FA] transition-colors"
            >
              Client Dashboard
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#172B4D] transition-colors"
            >
              <Phone className="w-4 h-4" />
              Contact
            </a>
            <Link href="/list-property" className="btn-primary text-sm py-2.5 px-5">
              List Your Property
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-[#64748B] hover:text-[#172B4D] hover:bg-[#EAF3FA] transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-[#E2E8F0] shadow-lg">
          <div className="container-custom py-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-[#64748B] hover:text-[#172B4D] hover:bg-[#EAF3FA] rounded-xl transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-[#E2E8F0] flex gap-2">
              <Link
                href="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="btn-secondary text-sm py-2.5 px-4 flex-1 text-center"
              >
                Customer Dashboard
              </Link>
              <Link
                href="/list-property"
                onClick={() => setIsMenuOpen(false)}
                className="btn-primary text-sm py-2.5 px-4 flex-1 text-center"
              >
                List Property
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
