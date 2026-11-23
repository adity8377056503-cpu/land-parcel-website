import type { Metadata } from "next";
import { generateSEO } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import { Building2, Target, Eye, MapPin, Heart, Users, ArrowRight } from "lucide-react";

export const metadata: Metadata = generateSEO({
  title: "About Land Parcel - Premium Real Estate Platform Delhi NCR",
  description:
    "Learn about Land Parcel - a real estate platform focused on connecting buyers, sellers, investors and businesses across Delhi NCR.",
  canonical: "/about",
});

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 bg-[#172B4D] overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <Image
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80"
            alt="About Land Parcel"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative container-custom text-center text-white">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-300 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#C6A66B]">About Us</span>
          </div>
          <div className="w-14 h-14 bg-[#C6A66B]/20 rounded-xl flex items-center justify-center mx-auto mb-5">
            <Building2 className="w-7 h-7 text-[#C6A66B]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">About Land Parcel</h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Your Trusted Partner in Premium Property Deals across Delhi NCR and beyond.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {/* Introduction */}
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-[#172B4D] font-display mb-5">
                What is Land Parcel?
              </h2>
              <p className="text-[#64748B] text-lg leading-relaxed">
                Land Parcel is a real estate platform focused on helping buyers, sellers,
                investors and businesses discover property opportunities across Delhi NCR and beyond.
                We connect genuine property seekers with verified sellers — covering residential homes,
                commercial spaces, industrial facilities, agricultural land and large land parcels.
              </p>
            </div>

            {/* Mission & Vision Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
              {[
                {
                  icon: Target,
                  title: "Our Mission",
                  description:
                    "To simplify property discovery and dealing in Delhi NCR by providing a transparent, reliable and comprehensive platform where buyers and sellers can connect with confidence.",
                },
                {
                  icon: Eye,
                  title: "Our Vision",
                  description:
                    "To become the most trusted regional real estate platform in India — starting with Delhi NCR and expanding to serve property seekers across the country.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="p-6 border border-[#E2E8F0] rounded-2xl">
                    <div className="w-12 h-12 bg-[#EAF3FA] rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-[#172B4D]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#172B4D] font-display mb-3">{item.title}</h3>
                    <p className="text-[#64748B] leading-relaxed">{item.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Property Categories */}
            <div className="mb-14">
              <h2 className="text-2xl font-bold text-[#172B4D] font-display mb-6">
                What We Cover
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { emoji: "🏠", label: "Residential Properties" },
                  { emoji: "🏢", label: "Commercial Properties" },
                  { emoji: "🏭", label: "Industrial Properties" },
                  { emoji: "🌾", label: "Agricultural Land" },
                  { emoji: "🏫", label: "Institutional Properties" },
                  { emoji: "🗺️", label: "Large Land Parcels" },
                  { emoji: "🏡", label: "Farmhouses" },
                  { emoji: "📐", label: "Residential Plots" },
                  { emoji: "🚛", label: "Warehouses" },
                ].map((cat) => (
                  <div
                    key={cat.label}
                    className="p-4 bg-[#F5F7FA] rounded-xl flex items-center gap-3"
                  >
                    <span className="text-2xl">{cat.emoji}</span>
                    <span className="text-sm font-medium text-[#172B4D]">{cat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Areas */}
            <div className="mb-14">
              <h2 className="text-2xl font-bold text-[#172B4D] font-display mb-6">
                Where We Operate
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-5 bg-[#EAF3FA] rounded-xl">
                  <h3 className="font-semibold text-[#172B4D] mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#C6A66B]" />
                    Primary Markets
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {["Delhi", "Dwarka", "Najafgarh", "West Delhi", "South West Delhi", "Gurugram", "Manesar"].map((loc) => (
                      <span key={loc} className="px-3 py-1 bg-white text-[#172B4D] text-sm rounded-full border border-[#E2E8F0]">
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-5 bg-[#F5F7FA] rounded-xl">
                  <h3 className="font-semibold text-[#172B4D] mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#64748B]" />
                    Secondary Markets
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {["Noida", "Greater Noida", "Faridabad", "Sonipat", "Jhajjar", "Other NCR"].map((loc) => (
                      <span key={loc} className="px-3 py-1 bg-white text-[#172B4D] text-sm rounded-full border border-[#E2E8F0]">
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Values */}
            <div className="mb-14">
              <h2 className="text-2xl font-bold text-[#172B4D] font-display mb-6">Our Values</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: Heart, title: "Transparency", desc: "We provide honest and accurate property information." },
                  { icon: Users, title: "Trust", desc: "We build long-term relationships with buyers and sellers." },
                  { icon: Target, title: "Simplicity", desc: "We make property discovery easy and straightforward." },
                ].map((val) => {
                  const Icon = val.icon;
                  return (
                    <div key={val.title} className="p-5 border border-[#E2E8F0] rounded-xl text-center">
                      <div className="w-10 h-10 bg-[#EAF3FA] rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Icon className="w-5 h-5 text-[#172B4D]" />
                      </div>
                      <h3 className="font-semibold text-[#172B4D] mb-2">{val.title}</h3>
                      <p className="text-sm text-[#64748B]">{val.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#172B4D] font-display mb-4">
                Ready to Find Your Property?
              </h2>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/properties" className="btn-primary">
                  <Building2 className="w-4 h-4" />
                  Explore Properties
                </Link>
                <Link href="/contact" className="btn-secondary">
                  Contact Us
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
