"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  QrCode,
  Building,
  Loader2,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  LogIn,
} from "lucide-react";
import { SubscriptionPlan, PaymentMethod, ClientAccount } from "@/types";
import { useSubscriptionStore } from "@/lib/subscription-store";
import { useCustomerAuth } from "@/lib/customer-auth";
import { OFFICIAL_BUSINESS, getWhatsAppUrl } from "@/lib/utils";
import toast from "react-hot-toast";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan?: SubscriptionPlan | null;
  client?: ClientAccount | null;
  onSuccess?: () => void;
}

const CONFIGURED_UPI = process.env.NEXT_PUBLIC_OFFICIAL_UPI_ID || "";
const CONFIGURED_BANK_NAME = process.env.NEXT_PUBLIC_OFFICIAL_BANK_NAME || "";
const CONFIGURED_BANK_ACCOUNT = process.env.NEXT_PUBLIC_OFFICIAL_BANK_ACCOUNT || "";
const CONFIGURED_BANK_IFSC = process.env.NEXT_PUBLIC_OFFICIAL_BANK_IFSC || "";
const CONFIGURED_BENEFICIARY = process.env.NEXT_PUBLIC_OFFICIAL_BENEFICIARY_NAME || "Land Parcel";

export default function SubscriptionModal({
  isOpen,
  onClose,
  selectedPlan,
  client,
  onSuccess,
}: SubscriptionModalProps) {
  const { plans, submitSubscriptionPurchase } = useSubscriptionStore();
  const { customer } = useCustomerAuth();
  const currentClient = client || customer;

  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>(
    selectedPlan || plans[1] || plans[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("offline_upi");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [proofNotes, setProofNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (selectedPlan) {
      setCurrentPlan(selectedPlan);
    } else if (plans.length > 0 && !currentPlan) {
      setCurrentPlan(plans[0]);
    }
  }, [selectedPlan, plans, currentPlan]);

  if (!isOpen) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const whatsappPaymentDetailsUrl = getWhatsAppUrl(
    OFFICIAL_BUSINESS.whatsapp_link_number,
    `Hello Land Parcel team, I would like the official UPI / bank transfer details to purchase the ${currentPlan.name} (₹${currentPlan.price}) for my registered mobile ${currentClient?.mobile || ""}.`
  );

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClient) {
      toast.error("Please sign in with your mobile number first.");
      return;
    }
    if (referenceNumber.trim().length < 4) {
      toast.error("Please enter your valid Transaction Reference / UTR Number.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitSubscriptionPurchase({
        planId: currentPlan.id,
        paymentMethod,
        referenceNumber: referenceNumber.trim(),
        proofNotes: proofNotes.trim() || undefined,
      });

      toast.success(
        "Payment submitted! Your subscription is now 'Pending Verification' and will activate once verified by Super Admin Aditya Raj.",
        { duration: 5000 }
      );
      setReferenceNumber("");
      setProofNotes("");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to record payment submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#E2E8F0]">
        {/* Header */}
        <div className="sticky top-0 bg-[#172B4D] text-white px-6 py-5 rounded-t-3xl flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C6A66B]/20 flex items-center justify-center border border-[#C6A66B]/40">
              <Sparkles className="w-5 h-5 text-[#C6A66B]" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display">Purchase Listing Subscription</h3>
              <p className="text-xs text-slate-300">
                Credits are added strictly after manual payment verification by Super Admin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Require Customer Login */}
          {!currentClient ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#EAF3FA] flex items-center justify-center mx-auto">
                <LogIn className="w-7 h-7 text-[#172B4D]" />
              </div>
              <h4 className="text-lg font-bold text-[#172B4D] font-display">
                Customer Login Required
              </h4>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto leading-relaxed">
                Sign in or register with your verified mobile number so your purchased listing credits and invoice are linked directly to your account.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Link
                  href="/login"
                  onClick={onClose}
                  className="btn-primary text-xs py-2.5 px-6"
                >
                  Login / Register with Mobile OTP
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Plan Selector Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plans.map((p) => {
                  const isSelected = currentPlan.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setCurrentPlan(p)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? "border-[#172B4D] bg-[#EAF3FA] ring-2 ring-[#172B4D]/15"
                          : "border-[#E2E8F0] hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-[#172B4D]">{p.name}</span>
                        <span className="text-xs font-extrabold text-[#172B4D]">
                          ₹{p.price.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        {p.listing_credits} Listing Credits · {p.validity_months}{" "}
                        {p.validity_months > 1 ? "Months" : "Month"} Validity
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Account Summary */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-[#64748B]">Customer Account: </span>
                  <strong className="text-[#172B4D]">{currentClient.name}</strong>
                  <span className="text-[#64748B] ml-2 font-mono">+91 {currentClient.mobile}</span>
                </div>
                <span className="font-bold text-[#172B4D]">
                  Payable: ₹{currentPlan.price.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] block">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("offline_upi")}
                    className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      paymentMethod === "offline_upi"
                        ? "border-[#172B4D] bg-[#EAF3FA] ring-2 ring-[#172B4D]/10"
                        : "border-[#E2E8F0] hover:border-slate-300"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#172B4D] text-[#C6A66B] flex items-center justify-center flex-shrink-0">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#172B4D]">UPI Transfer</div>
                      <div className="text-[11px] text-[#64748B]">GPay, PhonePe, Paytm, BHIM</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("offline_bank_transfer")}
                    className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      paymentMethod === "offline_bank_transfer"
                        ? "border-[#172B4D] bg-[#EAF3FA] ring-2 ring-[#172B4D]/10"
                        : "border-[#E2E8F0] hover:border-slate-300"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#172B4D] text-[#C6A66B] flex items-center justify-center flex-shrink-0">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#172B4D]">Bank Transfer</div>
                      <div className="text-[11px] text-[#64748B]">NEFT / RTGS / IMPS</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Official Payment Instructions (NO FAKE BANK NUMBERS) */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                  <span className="font-bold text-[#172B4D] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Official Payment Instructions
                  </span>
                </div>

                {paymentMethod === "offline_upi" ? (
                  CONFIGURED_UPI ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B]">Official UPI ID:</span>
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-bold text-[#172B4D] bg-white px-2 py-1 rounded border border-[#E2E8F0]">
                            {CONFIGURED_UPI}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopy(CONFIGURED_UPI, "upi")}
                            className="p-1 text-slate-500 hover:text-[#172B4D]"
                          >
                            {copiedField === "upi" ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#64748B]">
                        Pay ₹{currentPlan.price.toLocaleString("en-IN")} to the official UPI ID above and enter your 12-digit UTR below.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <p className="text-[#64748B] leading-relaxed">
                        Request the verified Land Parcel UPI / QR code on our official WhatsApp before transferring{" "}
                        <strong className="text-[#172B4D]">₹{currentPlan.price.toLocaleString("en-IN")}</strong>, then submit your UTR / Reference ID below for verification.
                      </p>
                      <a
                        href={whatsappPaymentDetailsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3.5 py-2 rounded-xl text-xs transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Get Official UPI Details on WhatsApp
                      </a>
                    </div>
                  )
                ) : CONFIGURED_BANK_ACCOUNT && CONFIGURED_BANK_IFSC ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[#64748B]">Beneficiary Name:</span>
                      <span className="font-semibold text-[#172B4D]">{CONFIGURED_BENEFICIARY}</span>
                    </div>
                    {CONFIGURED_BANK_NAME && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B]">Bank Name:</span>
                        <span className="font-semibold text-[#172B4D]">{CONFIGURED_BANK_NAME}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[#64748B]">Account Number:</span>
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-bold text-[#172B4D] bg-white px-2 py-0.5 rounded border border-[#E2E8F0]">
                          {CONFIGURED_BANK_ACCOUNT}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopy(CONFIGURED_BANK_ACCOUNT, "acc")}
                          className="p-1 text-slate-500 hover:text-[#172B4D]"
                        >
                          {copiedField === "acc" ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#64748B]">IFSC Code:</span>
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-bold text-[#172B4D] bg-white px-2 py-0.5 rounded border border-[#E2E8F0]">
                          {CONFIGURED_BANK_IFSC}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopy(CONFIGURED_BANK_IFSC, "ifsc")}
                          className="p-1 text-slate-500 hover:text-[#172B4D]"
                        >
                          {copiedField === "ifsc" ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <p className="text-[#64748B] leading-relaxed">
                      Official bank account &amp; IFSC details are shared directly by Land Parcel administration upon request. Contact us via WhatsApp to obtain verified NEFT / IMPS details, then submit your reference ID below.
                    </p>
                    <a
                      href={whatsappPaymentDetailsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3.5 py-2 rounded-xl text-xs transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Request Official Bank Details on WhatsApp
                    </a>
                  </div>
                )}
              </div>

              {/* Submit Reference Number Form */}
              <form onSubmit={handleSubmitPayment} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#172B4D] block mb-1.5">
                    Transaction Reference / UTR Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="Enter 12-digit UPI UTR or NEFT/IMPS Reference ID"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#172B4D] font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#172B4D] block mb-1.5">
                    Payment Remarks (Optional)
                  </label>
                  <input
                    type="text"
                    value={proofNotes}
                    onChange={(e) => setProofNotes(e.target.value)}
                    placeholder="Sender name, bank name, or transfer date"
                    className="w-full px-4 py-2 rounded-xl border border-[#E2E8F0] text-xs focus:outline-none focus:border-[#172B4D]"
                  />
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Manual Verification Policy:</strong> Paid subscriptions and listing credits are{" "}
                    <strong>never</strong> activated automatically without payment verification. Super Admin Aditya Raj verifies your reference and activates your credits.
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Submit Payment for Verification</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
