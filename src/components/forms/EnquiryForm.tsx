"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Send, Loader2 } from "lucide-react";

const enquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  buyer_type: z.enum(["individual", "investor", "company", "developer", "broker"]),
  budget_min: z.string().optional(),
  budget_max: z.string().optional(),
  message: z.string().min(5, "Message must be at least 5 characters").optional().or(z.literal("")),
  preferred_contact_time: z.string().optional(),
  consent: z.boolean().refine((v) => v === true, "You must provide consent to be contacted"),
});

type EnquiryFormData = z.infer<typeof enquirySchema>;

interface EnquiryFormProps {
  propertyId: string;
  propertyTitle: string;
}

export default function EnquiryForm({ propertyId, propertyTitle }: EnquiryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EnquiryFormData>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      buyer_type: "individual",
      consent: false,
    },
  });

  const onSubmit = async (data: EnquiryFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          property_id: propertyId,
          property_title: propertyTitle,
          source: "property_detail_page",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit enquiry");
      }

      setSubmitted(true);
      reset();
      toast.success("Enquiry submitted! We will contact you shortly.");
    } catch (error) {
      toast.error("Failed to submit. Please try WhatsApp instead.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Send className="w-7 h-7 text-green-600" />
        </div>
        <h3 className="font-semibold text-[#172B4D] mb-2">Enquiry Submitted!</h3>
        <p className="text-sm text-[#64748B] mb-4">
          Thank you! We will reach out to you shortly regarding this property.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-sm text-[#172B4D] hover:underline"
        >
          Submit Another Enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {/* Name */}
      <div>
        <label className="label-field">Full Name *</label>
        <input
          {...register("name")}
          placeholder="Your full name"
          className="input-field text-sm"
        />
        {errors.name && (
          <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Mobile */}
      <div>
        <label className="label-field">Mobile Number *</label>
        <input
          {...register("mobile")}
          placeholder="10-digit mobile number"
          className="input-field text-sm"
          maxLength={10}
        />
        {errors.mobile && (
          <p className="text-xs text-red-500 mt-1">{errors.mobile.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="label-field">Email (Optional)</label>
        <input
          {...register("email")}
          type="email"
          placeholder="your@email.com"
          className="input-field text-sm"
        />
      </div>

      {/* Buyer Type */}
      <div>
        <label className="label-field">I am a *</label>
        <select {...register("buyer_type")} className="input-field text-sm">
          <option value="individual">Individual Buyer</option>
          <option value="investor">Investor</option>
          <option value="company">Company</option>
          <option value="developer">Developer</option>
          <option value="broker">Broker / Agent</option>
        </select>
      </div>

      {/* Message */}
      <div>
        <label className="label-field">Message (Optional)</label>
        <textarea
          {...register("message")}
          placeholder="Tell us about your requirements..."
          rows={3}
          className="input-field text-sm resize-none"
        />
      </div>

      {/* Preferred Contact Time */}
      <div>
        <label className="label-field">Preferred Contact Time</label>
        <select {...register("preferred_contact_time")} className="input-field text-sm">
          <option value="">Any Time</option>
          <option value="morning">Morning (9 AM – 12 PM)</option>
          <option value="afternoon">Afternoon (12 PM – 4 PM)</option>
          <option value="evening">Evening (4 PM – 7 PM)</option>
        </select>
      </div>

      {/* Consent */}
      <div className="flex items-start gap-2">
        <input
          {...register("consent")}
          type="checkbox"
          id="consent"
          className="mt-1 w-4 h-4 accent-[#172B4D] cursor-pointer"
        />
        <label htmlFor="consent" className="text-xs text-[#64748B] cursor-pointer leading-relaxed">
          I consent to Land Parcel contacting me about this property and related services.
        </label>
      </div>
      {errors.consent && (
        <p className="text-xs text-red-500">{errors.consent.message}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full py-3 justify-center"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Send Enquiry
          </>
        )}
      </button>
    </form>
  );
}
