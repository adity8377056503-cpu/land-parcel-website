import Link from "next/link";
import { ArrowRight, Building2, Phone } from "lucide-react";

export default function SellCTA() {
  return (
    <section className="py-16 bg-[#172B4D]">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C6A66B]/20 rounded-full mb-6">
            <Building2 className="w-4 h-4 text-[#C6A66B]" />
            <span className="text-[#C6A66B] text-sm font-semibold">For Property Owners</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white font-display mb-4">
            Have a Property to Sell?
          </h2>
          <p className="text-slate-300 text-lg mb-8 leading-relaxed">
            Connect with potential buyers and showcase your property with Land Parcel.
            List your residential, commercial, industrial or agricultural property today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/list-property" className="btn-gold px-8 py-4 text-base">
              <Building2 className="w-5 h-5" />
              List Your Property
            </Link>
            <Link href="/contact" className="btn-secondary border-white text-white hover:bg-white hover:text-[#172B4D] px-8 py-4 text-base">
              <Phone className="w-5 h-5" />
              Talk to Our Team
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
