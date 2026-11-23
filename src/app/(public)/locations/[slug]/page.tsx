import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Building2, Filter, ArrowLeft } from "lucide-react";
import CategoryPropertiesList from "@/components/property/CategoryPropertiesList";
import { LOCATION_SEO, generateSEO } from "@/lib/seo";

interface LocationPageProps {
  params: Promise<{ slug: string }>;
}

const LOCATION_DETAILS: Record<
  string,
  {
    name: string;
    city: string;
    state: string;
    overview: string;
    connectivity: string;
    image: string;
  }
> = {
  dwarka: {
    name: "Dwarka",
    city: "Delhi",
    state: "Delhi",
    overview:
      "Dwarka is one of Asia's largest organized residential townships, strategically situated in South West Delhi. Renowned for its wide roads, planned sectors, high-density metro network, and upcoming diplomatic enclave.",
    connectivity:
      "Direct metro connectivity via Blue Line & Airport Express. Proximity to IGI Airport (T3) and Dwarka Expressway.",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&q=80",
  },
  najafgarh: {
    name: "Najafgarh",
    city: "Delhi",
    state: "Delhi",
    overview:
      "Najafgarh is a bustling commercial and residential hub in West/South West Delhi offering high value growth, residential plots, builder floors, and agricultural land in surrounding extensions.",
    connectivity:
      "Connected via Grey Line Metro, Najafgarh-Gurugram Road, and easy link to Western Peripheral Expressway (KMP).",
    image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&q=80",
  },
  gurugram: {
    name: "Gurugram",
    city: "Gurugram",
    state: "Haryana",
    overview:
      "Gurugram is the millennium city and primary corporate and industrial hub of North India. It features state-of-the-art office buildings, premium high-rises, expansive warehousing clusters in Sector 35 & Manesar, and commercial spaces.",
    connectivity:
      "Direct access via NH-48, Delhi Metro Yellow Line, Rapid Metro, and the newly commissioned Dwarka Expressway.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80",
  },
  manesar: {
    name: "Manesar",
    city: "Manesar",
    state: "Haryana",
    overview:
      "IMT Manesar is an industrial powerhouse hosting premier automobile, electronics, warehousing, and logistics parks. Ideal for businesses looking for large floor plate industrial facilities and plots.",
    connectivity:
      "Situated directly on NH-48 with seamless link to KMP Expressway and Kundli-Ghaziabad-Palwal (KGP) corridors.",
    image: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1200&q=80",
  },
  "west-delhi": {
    name: "West Delhi",
    city: "Delhi",
    state: "Delhi",
    overview:
      "Established residential and trading centers including Janakpuri, Rajouri Garden, Punjabi Bagh, and surrounding sectors with high retail demand and modern builder floor developments.",
    connectivity:
      "Blue, Pink, and Magenta metro lines, Ring Road, and Outer Ring Road corridors.",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
  },
  "south-west-delhi": {
    name: "South West Delhi",
    city: "Delhi",
    state: "Delhi",
    overview:
      "South West Delhi combines prime urbanization with expansive development plots and farm properties near Bijwasan, Kapashera, and Dwarka.",
    connectivity:
      "Connected to Aerocity, Gurgaon border, and national highways.",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80",
  },
  noida: {
    name: "Noida",
    city: "Noida",
    state: "Uttar Pradesh",
    overview:
      "New Okhla Industrial Development Authority (Noida) is a premier planned city with thriving IT hubs, commercial sectors, and modern residential high-rises.",
    connectivity:
      "Noida-Greater Noida Expressway, Blue Line, and Aqua Line metro network.",
    image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&q=80",
  },
  faridabad: {
    name: "Faridabad",
    city: "Faridabad",
    state: "Haryana",
    overview:
      "One of Haryana's largest industrial and residential sectors with booming infrastructure, industrial warehousing, and affordable housing.",
    connectivity:
      "Violet Line metro corridor, Delhi-Mumbai Expressway link, and NH-19 (Mathura Road).",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80",
  },
};

export async function generateStaticParams() {
  return Object.keys(LOCATION_DETAILS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const loc = LOCATION_DETAILS[slug];
  if (!loc) return {};

  const seoData = LOCATION_SEO[slug] || {
    title: `Properties in ${loc.name}, ${loc.city}`,
    description: `Discover top residential, commercial and industrial properties for sale and rent in ${loc.name}.`,
    keywords: [`property in ${loc.name}`, `${loc.name} real estate`, `land in ${loc.name}`],
  };

  return generateSEO({
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
    canonical: `/locations/${slug}`,
  });
}

export default async function LocationDetailPage({ params }: LocationPageProps) {
  const { slug } = await params;
  const loc = LOCATION_DETAILS[slug];

  if (!loc) {
    notFound();
  }

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      {/* Hero */}
      <section className="relative py-20 bg-[#172B4D] overflow-hidden text-white">
        <div className="absolute inset-0 opacity-20">
          <Image
            src={loc.image}
            alt={loc.name}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative container-custom">
          <div className="flex items-center gap-2 text-sm text-slate-300 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/properties" className="hover:text-white transition-colors">Locations</Link>
            <span>/</span>
            <span className="text-[#C6A66B]">{loc.name}</span>
          </div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C6A66B]/20 rounded-full text-xs font-semibold text-[#C6A66B] mb-3">
              <MapPin className="w-3.5 h-3.5" />
              {loc.city}, {loc.state}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
              Properties in {loc.name}
            </h1>
            <p className="text-slate-200 text-base md:text-lg leading-relaxed mb-6">
              {loc.overview}
            </p>
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl text-sm border border-white/10">
              <strong className="text-[#C6A66B]">Connectivity Highlights: </strong>
              <span>{loc.connectivity}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Property Listings in this Location */}
      <section className="py-14">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#172B4D] font-display">
                Available Listings in {loc.name}
              </h2>
              <p className="text-[#64748B] text-sm mt-1">
                Verified residential, commercial, industrial and land opportunities
              </p>
            </div>
            <Link
              href={`/properties?city=${encodeURIComponent(loc.name)}`}
              className="btn-secondary text-sm py-2 px-4 inline-flex items-center gap-1.5"
            >
              <Filter className="w-4 h-4" />
              Filter Results
            </Link>
          </div>

          <CategoryPropertiesList
            locationName={loc.name}
            emptyTitle={`No Active Listings Currently in ${loc.name}`}
            emptySubtitle={`Be the first to list a property in this high-demand location or explore similar surrounding localities in Delhi NCR.`}
          />

          <div className="mt-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-[#172B4D] font-semibold hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Homepage
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
