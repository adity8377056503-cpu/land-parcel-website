import {
  Layers,
  Users,
  Search,
  Handshake,
  MapPin,
  FileText,
  CheckCircle2,
} from "lucide-react";

const FEATURES = [
  {
    icon: Layers,
    title: "Multiple Property Categories",
    description:
      "Browse residential, commercial, industrial, agricultural and institutional properties all in one place.",
  },
  {
    icon: Users,
    title: "Dedicated Property Assistance",
    description:
      "Our team is here to assist buyers and sellers through every step of the property discovery journey.",
  },
  {
    icon: Search,
    title: "Advanced Property Discovery",
    description:
      "Powerful search and filtering tools to help you find the right property by location, type, size and budget.",
  },
  {
    icon: Handshake,
    title: "Buyer & Seller Connections",
    description:
      "We connect genuine buyers with verified sellers to facilitate smooth and transparent property dealings.",
  },
  {
    icon: MapPin,
    title: "Site Visit Assistance",
    description:
      "We help coordinate property site visits and provide location-specific guidance for shortlisted properties.",
  },
  {
    icon: FileText,
    title: "Transparent Listing Information",
    description:
      "Every listing presents accurate and clear property details so buyers can make informed decisions.",
  },
];

export default function WhyLandParcel() {
  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="section-heading">Why Choose Land Parcel</h2>
          <p className="section-subheading mx-auto">
            We are committed to making property discovery and dealing transparent, simple and reliable.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-2xl border border-[#E2E8F0] bg-white hover:border-[#172B4D]/20 hover:shadow-card transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-[#EAF3FA] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#172B4D] transition-colors duration-300">
                  <Icon className="w-6 h-6 text-[#172B4D] group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-semibold text-[#172B4D] text-lg font-display mb-2">
                  {feature.title}
                </h3>
                <p className="text-[#64748B] text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Trust note */}
        <div className="mt-10 p-5 bg-[#EAF3FA] rounded-2xl flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#C6A66B] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#64748B]">
            <span className="font-semibold text-[#172B4D]">Our commitment to you: </span>
            Land Parcel provides a property discovery platform. We do not make guarantees about property returns, legal verifications or market predictions. All property information should be independently verified before purchase.
          </p>
        </div>
      </div>
    </section>
  );
}
