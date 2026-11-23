import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";
import HeroSearch from "@/components/home/HeroSearch";
import PropertyCategories from "@/components/home/PropertyCategories";
import FeaturedProperties from "@/components/home/FeaturedProperties";
import ExploreLocations from "@/components/home/ExploreLocations";
import WhyLandParcel from "@/components/home/WhyLandParcel";
import SellCTA from "@/components/home/SellCTA";
import InvestmentOpportunities from "@/components/home/InvestmentOpportunities";
import FinalCTA from "@/components/home/FinalCTA";
import { generateSEO } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = generateSEO({
  title: "Find the Right Property. Build Your Future.",
  description:
    "Land Parcel - Your Trusted Partner in Premium Property Deals. Explore residential, commercial, industrial and agricultural properties across Delhi NCR.",
  canonical: "/",
});

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex items-center pt-16">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=85"
              alt="Premium real estate - Land Parcel"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#172B4D]/90 via-[#172B4D]/60 to-[#172B4D]/30" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 container-custom py-20">
            <div className="max-w-4xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C6A66B]/20 backdrop-blur-sm border border-[#C6A66B]/30 rounded-full mb-6 animate-fade-in">
                <span className="w-2 h-2 bg-[#C6A66B] rounded-full"></span>
                <span className="text-[#C6A66B] text-sm font-medium">Premium Real Estate Platform · Delhi NCR</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-display leading-tight mb-5 animate-fade-up">
                Find the Right Property.
                <br />
                <span className="text-[#C6A66B]">Build Your Future.</span>
              </h1>

              {/* Subheading */}
              <p className="text-lg md:text-xl text-slate-200 mb-10 max-w-2xl leading-relaxed animate-fade-up">
                Explore premium residential, commercial, industrial and land
                opportunities across Delhi NCR.
              </p>

              {/* Hero Search */}
              <div className="animate-fade-up">
                <HeroSearch />
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 mt-8 animate-fade-up">
                {[
                  { label: "Property Categories", value: "9+" },
                  { label: "Prime Locations", value: "12+" },
                  { label: "Delhi NCR Coverage", value: "NCR Wide" },
                ].map((stat) => (
                  <div key={stat.label} className="text-white">
                    <div className="text-2xl font-bold font-display text-[#C6A66B]">
                      {stat.value}
                    </div>
                    <div className="text-sm text-slate-300">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mt-8 animate-fade-up">
                <Link href="/properties" className="btn-primary px-8 py-4 text-base">
                  Explore Properties
                </Link>
                <Link
                  href="/list-property"
                  className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/40 text-white font-semibold rounded-xl transition-all duration-200 hover:bg-white hover:text-[#172B4D] text-base"
                >
                  List Your Property
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Property Categories */}
        <PropertyCategories />

        {/* Featured Properties */}
        <FeaturedProperties />

        {/* Explore Locations */}
        <ExploreLocations />

        {/* Why Land Parcel */}
        <WhyLandParcel />

        {/* Sell Property CTA */}
        <SellCTA />

        {/* Investment Opportunities */}
        <InvestmentOpportunities />

        {/* Final CTA */}
        <FinalCTA />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
