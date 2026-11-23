"use client";

import { getWhatsAppUrl } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

export default function WhatsAppFloat() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919999999999";
  const whatsappUrl = getWhatsAppUrl(
    whatsappNumber,
    "Hi, I'm looking for a property on Land Parcel. Please help me."
  );

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#1db950] hover:scale-110 transition-all duration-200"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="w-7 h-7 fill-white" />
    </a>
  );
}
