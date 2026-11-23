"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin, MessageCircle, Send, Loader2, CheckCircle2, User } from "lucide-react";
import { getWhatsAppUrl, OFFICIAL_BUSINESS } from "@/lib/utils";

const contactSchema = z.object({
  name: z.string().min(2),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid mobile number"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  subject: z.string().min(2),
  message: z.string().min(10, "Message must be at least 10 characters"),
  consent: z.boolean().refine((v) => v, "Consent is required"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || OFFICIAL_BUSINESS.whatsapp_link_number;
  const whatsappUrl = getWhatsAppUrl(whatsappNumber, "Hi Suraj ji, I'd like to get in touch regarding Land Parcel property deals.");

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { consent: false },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      // Submit as an enquiry
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          mobile: data.mobile,
          email: data.email,
          message: `Subject: ${data.subject}\n\n${data.message}`,
          buyer_type: "individual",
          consent: data.consent,
          source: "contact_page",
        }),
      });

      if (!response.ok) throw new Error("Failed");
      setSubmitted(true);
      reset();
      toast.success("Message sent! We will get back to you soon.");
    } catch {
      toast.error("Failed to send. Please contact us via WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#172B4D] py-16">
        <div className="container-custom text-center text-white">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-300 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#C6A66B]">Contact Us</span>
          </div>
          <h1 className="text-4xl font-bold font-display mb-3">Get in Touch</h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto">
            Have a question about a property or want to list yours? We are here to help.
          </p>
        </div>
      </section>

      <section className="py-14 bg-[#F5F7FA]">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold text-[#172B4D] font-display mb-6">
                Contact Information
              </h2>

              <div className="space-y-4 mb-8">
                {[
                  {
                    icon: User,
                    label: "Business Owner / Founder",
                    value: OFFICIAL_BUSINESS.owner_name,
                  },
                  {
                    icon: Phone,
                    label: "Phone / WhatsApp",
                    value: OFFICIAL_BUSINESS.whatsapp_formatted,
                    action: { href: whatsappUrl, label: "Chat on WhatsApp" },
                  },
                  {
                    icon: Mail,
                    label: "Official Email",
                    value: OFFICIAL_BUSINESS.email,
                    action: { href: `mailto:${OFFICIAL_BUSINESS.email}`, label: "Send Email" },
                  },
                  {
                    icon: MapPin,
                    label: "Primary Market & Office",
                    value: OFFICIAL_BUSINESS.primary_market,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-card">
                      <div className="w-10 h-10 bg-[#EAF3FA] rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-[#172B4D]" />
                      </div>
                      <div>
                        <div className="text-xs text-[#64748B] mb-1">{item.label}</div>
                        <div className="font-semibold text-[#172B4D]">{item.value}</div>
                        {item.action && (
                          <a href={item.action.href} target="_blank" rel="noopener noreferrer" className="text-sm text-[#C6A66B] hover:underline mt-0.5 inline-block">
                            {item.action.label}
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* WhatsApp CTA */}
              <div className="p-5 bg-[#172B4D] rounded-2xl text-white">
                <h3 className="font-semibold mb-2 font-display">Fastest Response via WhatsApp</h3>
                <p className="text-sm text-slate-300 mb-4">
                  Send us a message on WhatsApp for the quickest response from our team.
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp inline-flex"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat on WhatsApp
                </a>
              </div>

              {/* Map Placeholder */}
              <div className="mt-5 h-48 bg-[#EAF3FA] rounded-2xl flex items-center justify-center border border-[#E2E8F0]">
                <div className="text-center text-[#64748B]">
                  <MapPin className="w-8 h-8 mx-auto mb-2 text-[#C6A66B]" />
                  <p className="text-sm font-medium">Map Available with Google Maps API</p>
                  <p className="text-xs mt-1">Delhi NCR, India</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-card p-8">
              <h2 className="text-2xl font-bold text-[#172B4D] font-display mb-6">
                Send Us a Message
              </h2>

              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-[#172B4D] text-lg mb-2">Message Sent!</h3>
                  <p className="text-[#64748B] text-sm mb-4">
                    Thank you for reaching out. We will get back to you shortly.
                  </p>
                  <button onClick={() => setSubmitted(false)} className="btn-secondary text-sm py-2 px-5">
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="label-field">Full Name *</label>
                    <input {...register("name")} placeholder="Your name" className="input-field" />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="label-field">Mobile Number *</label>
                    <input {...register("mobile")} placeholder="10-digit mobile" className="input-field" maxLength={10} />
                    {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile.message}</p>}
                  </div>
                  <div>
                    <label className="label-field">Email (Optional)</label>
                    <input {...register("email")} type="email" placeholder="your@email.com" className="input-field" />
                  </div>
                  <div>
                    <label className="label-field">Subject *</label>
                    <input {...register("subject")} placeholder="e.g. Property Enquiry, Site Visit" className="input-field" />
                    {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
                  </div>
                  <div>
                    <label className="label-field">Message *</label>
                    <textarea {...register("message")} rows={4} placeholder="Tell us how we can help..." className="input-field resize-none" />
                    {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
                  </div>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input {...register("consent")} type="checkbox" className="mt-1 w-4 h-4 accent-[#172B4D]" />
                    <span className="text-xs text-[#64748B]">
                      I consent to Land Parcel contacting me in response to this message.
                    </span>
                  </label>
                  {errors.consent && <p className="text-xs text-red-500">{errors.consent.message}</p>}
                  <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3.5">
                    {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Sending...</> : <><Send className="w-4 h-4" />Send Message</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
