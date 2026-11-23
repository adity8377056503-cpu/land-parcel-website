import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const CATEGORIES = [
  {
    id: "residential",
    name: "Residential Properties",
    slug: "residential",
    description: "Houses, apartments, villas and residential floors",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=80",
    count: "Explore →",
  },
  {
    id: "commercial",
    name: "Commercial Properties",
    slug: "commercial",
    description: "Shops, offices, showrooms and corporate buildings",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80",
    count: "Explore →",
  },
  {
    id: "industrial",
    name: "Industrial Properties",
    slug: "industrial",
    description: "Factories, manufacturing units and industrial plots",
    image: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=400&q=80",
    count: "Explore →",
  },
  {
    id: "agricultural",
    name: "Agricultural Land",
    slug: "agricultural",
    description: "Fertile farm land, farmhouses and rural holdings",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80",
    count: "Explore →",
  },
  {
    id: "plots-land",
    name: "Plots and Land",
    slug: "properties?category=plots-land",
    description: "Freehold residential, commercial and investment land",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80",
    count: "Explore →",
  },
  {
    id: "warehouses",
    name: "Warehouses",
    slug: "properties?type=warehouse",
    description: "Modern warehousing and logistics facilities",
    image: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400&q=80",
    count: "Explore →",
  },
  {
    id: "shops-offices",
    name: "Shops and Offices",
    slug: "properties?category=shops-offices",
    description: "Retail high-street shops and grade-A office spaces",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80",
    count: "Explore →",
  },
  {
    id: "institutional",
    name: "Institutional Properties",
    slug: "properties?category=institutional",
    description: "Schools, hospitals, colleges and campus land",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?w=400&q=80",
    count: "Explore →",
  },
];

export default function PropertyCategories() {
  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="section-heading">Explore Property Categories</h2>
          <p className="section-subheading mx-auto">
            From residential homes to industrial warehouses — find exactly what you are looking for.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/${cat.slug}`}
              className="group relative h-44 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#172B4D]/90 via-[#172B4D]/30 to-transparent" />
              
              {/* Content */}
              <div className="absolute inset-0 p-4 flex flex-col justify-end">
                <h3 className="text-white font-semibold text-sm font-display leading-tight mb-1">
                  {cat.name}
                </h3>
                <p className="text-slate-300 text-xs line-clamp-2 leading-tight hidden sm:block">
                  {cat.description}
                </p>
              </div>

              {/* Hover Arrow */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="w-7 h-7 bg-[#C6A66B] rounded-full flex items-center justify-center">
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
