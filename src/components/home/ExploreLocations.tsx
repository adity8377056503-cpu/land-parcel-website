import Link from "next/link";
import Image from "next/image";
import { MapPin, Building2 } from "lucide-react";

const LOCATIONS = [
  {
    name: "Dwarka",
    slug: "dwarka",
    city: "Delhi",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80",
    description: "Well-planned sector township",
    propertyTypes: ["Residential", "Commercial"],
  },
  {
    name: "Najafgarh",
    slug: "najafgarh",
    city: "Delhi",
    image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&q=80",
    description: "Growing residential hub",
    propertyTypes: ["Residential", "Agricultural"],
  },
  {
    name: "Gurugram",
    slug: "gurugram",
    city: "Haryana",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80",
    description: "Corporate & industrial hub",
    propertyTypes: ["Commercial", "Industrial"],
  },
  {
    name: "South West Delhi",
    slug: "south-west-delhi",
    city: "Delhi",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80",
    description: "Prime residential areas",
    propertyTypes: ["Residential", "Plots"],
  },
  {
    name: "West Delhi",
    slug: "west-delhi",
    city: "Delhi",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
    description: "Established neighbourhoods",
    propertyTypes: ["Residential", "Commercial"],
  },
  {
    name: "Manesar",
    slug: "manesar",
    city: "Haryana",
    image: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=600&q=80",
    description: "Industrial & manufacturing zone",
    propertyTypes: ["Industrial", "Warehouses"],
  },
  {
    name: "Noida",
    slug: "noida",
    city: "UP",
    image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&q=80",
    description: "IT & residential hub",
    propertyTypes: ["Residential", "Commercial"],
  },
  {
    name: "Faridabad",
    slug: "faridabad",
    city: "Haryana",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80",
    description: "Industrial & residential",
    propertyTypes: ["Industrial", "Residential"],
  },
];

export default function ExploreLocations() {
  return (
    <section className="py-16 bg-[#EAF3FA]">
      <div className="container-custom">
        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="section-heading">Explore Locations</h2>
          <p className="section-subheading mx-auto">
            Discover properties across prime locations in Delhi NCR and surrounding areas.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {LOCATIONS.map((location) => (
            <Link
              key={location.slug}
              href={`/locations/${location.slug}`}
              className="group relative h-56 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
            >
              <Image
                src={location.image}
                alt={`Properties in ${location.name}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#172B4D]/85 via-[#172B4D]/20 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 p-5 flex flex-col justify-end">
                <div className="flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C6A66B]" />
                  <span className="text-[#C6A66B] text-xs font-medium">{location.city}</span>
                </div>
                <h3 className="text-white font-bold text-lg font-display leading-tight">
                  {location.name}
                </h3>
                <p className="text-slate-300 text-xs mt-1 hidden sm:block">
                  {location.description}
                </p>
                {/* Property Types */}
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {location.propertyTypes.map((type) => (
                    <span
                      key={type}
                      className="px-2 py-0.5 bg-white/20 text-white text-xs rounded-md backdrop-blur-sm"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/properties" className="btn-secondary inline-flex">
            <Building2 className="w-4 h-4" />
            View All Properties
          </Link>
        </div>
      </div>
    </section>
  );
}
