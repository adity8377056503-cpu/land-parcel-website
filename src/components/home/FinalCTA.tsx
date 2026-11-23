import Link from "next/link";
import { Building2, Phone, ArrowRight } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#EAF3FA] via-white to-[#EAF3FA]">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#172B4D] font-display mb-4">
            Your Next Property Opportunity Starts Here
          </h2>
          <p className="text-[#64748B] text-lg mb-10 leading-relaxed">
            Whether you are buying, selling or investing — Land Parcel is your trusted
            real estate partner across Delhi NCR.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties" className="btn-primary px-8 py-4 text-base">
              <Building2 className="w-5 h-5" />
              Explore Properties
            </Link>
            <Link href="/contact" className="btn-secondary px-8 py-4 text-base">
              <Phone className="w-5 h-5" />
              Contact Our Team
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
