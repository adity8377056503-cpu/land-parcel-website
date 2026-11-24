"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Phone,
  ChevronDown,
  Building2,
  Shield,
  User,
  LogIn,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn, getWhatsAppUrl, OFFICIAL_BUSINESS } from "@/lib/utils";
import { useCustomerAuth } from "@/lib/customer-auth";

const PROPERTY_CATEGORIES = [
  { label: "Residential Properties", href: "/residential" },
  { label: "Commercial Properties", href: "/commercial" },
  { label: "Industrial Properties", href: "/industrial" },
  { label: "Agricultural Land", href: "/agricultural" },
  { label: "Plots & Land", href: "/properties?category=plots-land" },
  { label: "Warehouses", href: "/properties?type=warehouse" },
  { label: "Shops & Offices", href: "/properties?category=shops-offices" },
  { label: "Institutional", href: "/properties?category=institutional" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { customer, isAuthenticated, logout } = useCustomerAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);

  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || OFFICIAL_BUSINESS.whatsapp_link_number;
  const whatsappUrl = getWhatsAppUrl(
    whatsappNumber,
    "Hi, I'm looking for verified property deals on Land Parcel. Please assist me."
  );

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Top Utility Announcement Bar */}
      <div className="bg-[#101F38] text-slate-300 text-[11px] py-1.5 border-b border-white/5">
        <div className="container-custom flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">
              Delhi NCR&apos;s Verified Real Estate Marketplace · Zero Fake Listings
            </span>
            <span className="sm:hidden font-medium text-white">Land Parcel Marketplace</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <Phone className="w-3 h-3 text-[#C6A66B]" />
              <span className="hidden md:inline">WhatsApp Support:</span>
              <span className="font-semibold">{OFFICIAL_BUSINESS.whatsapp_formatted}</span>
            </a>

            <span className="text-white/20">|</span>

            {/* Direct Super Admin Portal Access */}
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-[#C6A66B] hover:text-[#d8bb83] font-semibold transition-colors"
            >
              <Shield className="w-3 h-3" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div
        className={cn(
          "transition-all duration-300",
          isScrolled
            ? "bg-white shadow-nav"
            : "bg-white/95 backdrop-blur-md border-b border-[#E2E8F0]"
        )}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-[#172B4D] rounded-xl flex items-center justify-center group-hover:bg-[#1e3a6e] transition-colors shadow-xs">
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

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-5 xl:gap-6">
              <Link
                href="/"
                className={cn(
                  "text-sm font-medium transition-colors",
                  pathname === "/" ? "text-[#172B4D] font-bold" : "text-[#64748B] hover:text-[#172B4D]"
                )}
              >
                Home
              </Link>

              <Link
                href="/properties"
                className={cn(
                  "text-sm font-medium transition-colors",
                  pathname === "/properties" ? "text-[#172B4D] font-bold" : "text-[#64748B] hover:text-[#172B4D]"
                )}
              >
                All Properties
              </Link>

              {/* Property Types Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setOpenDropdown(true)}
                onMouseLeave={() => setOpenDropdown(false)}
              >
                <button
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium transition-colors py-2",
                    pathname.startsWith("/residential") ||
                      pathname.startsWith("/commercial") ||
                      pathname.startsWith("/industrial") ||
                      pathname.startsWith("/agricultural")
                      ? "text-[#172B4D] font-bold"
                      : "text-[#64748B] hover:text-[#172B4D]"
                  )}
                >
                  <span>Property Types</span>
                  <ChevronDown className="w-3.5 h-3.5 mt-0.5 text-[#64748B]" />
                </button>

                {openDropdown && (
                  <div className="absolute top-full left-0 w-60 bg-white rounded-2xl shadow-card-hover border border-[#E2E8F0] p-2 z-50 animate-fade-in">
                    {PROPERTY_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.label}
                        href={cat.href}
                        className="block px-3.5 py-2 text-xs font-semibold text-[#172B4D] hover:text-[#C6A66B] hover:bg-[#EAF3FA] rounded-xl transition-colors"
                      >
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/pricing"
                className={cn(
                  "text-sm font-medium transition-colors flex items-center gap-1",
                  pathname === "/pricing" ? "text-[#172B4D] font-bold" : "text-[#64748B] hover:text-[#172B4D]"
                )}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C6A66B]" />
                <span>Pricing &amp; Plans</span>
              </Link>

              <Link
                href="/about"
                className={cn(
                  "text-sm font-medium transition-colors",
                  pathname === "/about" ? "text-[#172B4D] font-bold" : "text-[#64748B] hover:text-[#172B4D]"
                )}
              >
                About Us
              </Link>

              <Link
                href="/contact"
                className={cn(
                  "text-sm font-medium transition-colors",
                  pathname === "/contact" ? "text-[#172B4D] font-bold" : "text-[#64748B] hover:text-[#172B4D]"
                )}
              >
                Contact
              </Link>
            </nav>

            {/* Desktop CTA & Customer Account Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated && customer ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-xs font-bold text-[#172B4D] bg-[#EAF3FA] hover:bg-[#dbebf7] px-3.5 py-2 rounded-xl transition-colors border border-blue-200"
                  >
                    <User className="w-3.5 h-3.5 text-[#C6A66B]" />
                    <span>{customer.name.split(" ")[0]} (Dashboard)</span>
                  </Link>

                  <button
                    onClick={() => logout()}
                    title="Sign Out"
                    className="p-2 text-[#64748B] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 text-xs font-bold text-[#172B4D] hover:text-[#C6A66B] px-3.5 py-2 rounded-xl hover:bg-[#EAF3FA] transition-colors"
                >
                  <LogIn className="w-4 h-4 text-[#C6A66B]" />
                  <span>Customer Login</span>
                </Link>
              )}

              <Link
                href="/list-property"
                className="btn-primary text-xs font-bold py-2.5 px-4.5 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5"
              >
                <span>List Property</span>
              </Link>
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#64748B] hover:text-[#172B4D] hover:bg-[#EAF3FA] transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-[#E2E8F0] shadow-2xl max-h-[calc(100vh-5rem)] overflow-y-auto animate-fade-in">
          <div className="container-custom py-5 space-y-4">
            {/* Quick Links */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] px-3">
                Main Pages
              </span>
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-[#172B4D] hover:bg-[#EAF3FA] rounded-xl"
              >
                Home
              </Link>
              <Link
                href="/properties"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-[#172B4D] hover:bg-[#EAF3FA] rounded-xl"
              >
                All Properties Marketplace
              </Link>
              <Link
                href="/pricing"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-[#172B4D] hover:bg-[#EAF3FA] rounded-xl"
              >
                Pricing &amp; Subscription Plans
              </Link>
              <Link
                href="/list-property"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-[#172B4D] hover:bg-[#EAF3FA] rounded-xl"
              >
                List a Property
              </Link>
            </div>

            {/* Categories */}
            <div className="space-y-1 pt-2 border-t border-[#E2E8F0]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] px-3">
                Property Categories
              </span>
              <div className="grid grid-cols-2 gap-1">
                {PROPERTY_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.label}
                    href={cat.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 text-xs text-[#64748B] hover:text-[#172B4D] hover:bg-[#EAF3FA] rounded-xl"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Portals & Actions */}
            <div className="space-y-2 pt-3 border-t border-[#E2E8F0]">
              {isAuthenticated && customer ? (
                <div className="flex gap-2">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="btn-secondary text-xs py-2.5 px-3 flex-1 text-center"
                  >
                    Dashboard ({customer.name.split(" ")[0]})
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="px-3 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="btn-secondary text-xs py-2.5 px-4 block text-center"
                >
                  Customer Login / Register
                </Link>
              )}

              <Link
                href="/list-property"
                onClick={() => setIsMenuOpen(false)}
                className="btn-primary text-xs py-2.5 px-4 block text-center"
              >
                List Your Property Free
              </Link>

              <Link
                href="/admin"
                onClick={() => setIsMenuOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-[#172B4D] bg-[#EAF3FA] hover:bg-[#dbebf7] flex items-center justify-center gap-1.5 border border-blue-200"
              >
                <Shield className="w-3.5 h-3.5 text-[#C6A66B]" />
                <span>Super Admin Portal</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
