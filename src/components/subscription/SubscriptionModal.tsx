"use client";

import { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  CreditCard,
  QrCode,
  Building,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { SubscriptionPlan, PaymentMethod, ClientAccount } from "@/types";
import { useSubscriptionStore } from "@/lib/subscription-store";
import { OFFICIAL_BUSINESS } from "@/lib/utils";
import toast from "react-hot-toast";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan?: SubscriptionPlan | null;
  client?: ClientAccount;
  onSuccess?: () => void;
}

export default function SubscriptionModal({
  isOpen,
  onClose,
  selectedPlan,
  client,
  onSuccess,
}: SubscriptionModalProps) {
  const { plans, activeClient, submitOfflinePayment } = useSubscriptionStore();
  const currentClient = client || activeClient;

  const [activeTab, setActiveTab] = useState<"plans" | "pay">("pay");
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
    }
  }, [selectedPlan]);

  if (!isOpen) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceNumber.trim()) {
      toast.error("Please enter your Transaction Reference / UTR Number");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Submit through store (for reactive local state)
      submitOfflinePayment({
        clientId: currentClient.id,
        planId: currentPlan.id,
        paymentMethod,
        referenceNumber: referenceNumber.trim(),
        proofNotes: proofNotes.trim() || undefined,
      });

      // 2. Submit to backend API endpoint
      try {
        await fetch("/api/payments/offline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: currentClient.id,
            client_name: currentClient.name,
            client_mobile: currentClient.mobile,
            plan_id: currentPlan.id,
            plan_name: currentPlan.name,
            amount: currentPlan.price,
            payment_method: paymentMethod,
            reference_number: referenceNumber.trim(),
            proof_notes: proofNotes.trim() || undefined,
          }),
        });
      } catch (apiErr) {
        // Backend optional fallback
      }

      toast.success(
        "Payment reference submitted! Your subscription is now 'Pending Admin Verification'.",
        { duration: 5000 }
      );
      setReferenceNumber("");
      setProofNotes("");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit payment reference");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#E2E8F0]">
        {/* Header */}
        <div className="bg-[#172B4D] text-white p-6 rounded-t-3xl flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#C6A66B]/20 text-[#C6A66B] px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                Subscription & Quota
              </span>
              <span className="text-xs text-slate-300">
                Client: <strong className="text-white">{currentClient?.name}</strong>
              </span>
            </div>
            <h3 className="text-xl font-bold font-display mt-1">
              Upgrade / Renew: {currentPlan.name}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              ₹{currentPlan.price.toLocaleString("en-IN")} / month · Verified Direct Activation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Plan Selector tabs if user wants to change plan */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#F5F7FA] rounded-2xl border border-[#E2E8F0]">
            {plans.filter((p) => p.price > 0).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setCurrentPlan(p)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  currentPlan.id === p.id
                    ? "bg-[#172B4D] text-white shadow-sm"
                    : "text-[#64748B] hover:text-[#172B4D]"
                }`}
              >
                <span>{p.name}</span>
                <span className="text-[11px] opacity-80">(₹{p.price})</span>
              </button>
            ))}
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-[#172B4D] uppercase tracking-wider mb-2">
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
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#172B4D] shadow-sm">
                  <QrCode className="w-5 h-5 text-[#172B4D]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#172B4D]">Instant UPI / QR</div>
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
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#172B4D] shadow-sm">
                  <Building className="w-5 h-5 text-[#172B4D]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#172B4D]">Bank Transfer</div>
                  <div className="text-[11px] text-[#64748B]">NEFT / RTGS / IMPS Direct</div>
                </div>
              </button>
            </div>
          </div>

          {/* Bank / UPI Account Information Box */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
              <span className="font-bold text-[#172B4D] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Land Parcel Official Account · {OFFICIAL_BUSINESS.owner_name}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Verified Business
              </span>
            </div>

            {paymentMethod === "offline_upi" ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Official UPI / GPay / PhonePe:</span>
                  <div className="flex items-center gap-2">
                    <code className="font-mono font-bold text-[#172B4D] bg-white px-2 py-1 rounded border border-[#E2E8F0]">
                      8750442235
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopy("8750442235", "upi")}
                      className="p-1 text-slate-500 hover:text-[#172B4D]"
                    >
                      {copiedField === "upi" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                  <span>Beneficiary Name:</span>
                  <strong className="text-[#172B4D]">Suraj Prakash (Land Parcel)</strong>
                </div>
                <div className="text-[11px] text-[#64748B]">
                  Transfer ₹{currentPlan.price.toLocaleString("en-IN")} via Google Pay, PhonePe, Paytm or BHIM to <strong>8750442235</strong> and paste the 12-digit UTR below.
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Beneficiary Name:</span>
                  <span className="font-semibold text-[#172B4D]">SURAJ PRAKASH / LAND PARCEL</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Official Email:</span>
                  <span className="font-semibold text-[#172B4D]">{OFFICIAL_BUSINESS.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Bank:</span>
                  <span className="font-semibold text-[#172B4D]">HDFC Bank Ltd.</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Account Number:</span>
                  <div className="flex items-center gap-2">
                    <code className="font-mono font-bold text-[#172B4D] bg-white px-2 py-0.5 rounded border border-[#E2E8F0]">
                      50200088991122
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopy("50200088991122", "acc")}
                      className="p-1 text-slate-500 hover:text-[#172B4D]"
                    >
                      {copiedField === "acc" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">IFSC Code:</span>
                  <div className="flex items-center gap-2">
                    <code className="font-mono font-bold text-[#172B4D] bg-white px-2 py-0.5 rounded border border-[#E2E8F0]">
                      HDFC0000123
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopy("HDFC0000123", "ifsc")}
                      className="p-1 text-slate-500 hover:text-[#172B4D]"
                    >
                      {copiedField === "ifsc" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form to submit reference number */}
          <form onSubmit={handleSubmitPayment} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#172B4D] uppercase tracking-wider mb-1.5">
                UTR / Transaction Reference Number *
              </label>
              <input
                type="text"
                required
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. UPI-432890123498 or NEFT Reference ID"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#172B4D] focus:ring-2 focus:ring-[#172B4D]/10 font-mono"
              />
              <p className="text-[11px] text-[#64748B] mt-1">
                Found in your payment app receipt under &ldquo;UPI Ref ID / UTR / Reference ID&rdquo;.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B4D] uppercase tracking-wider mb-1.5">
                Additional Notes (Optional)
              </label>
              <input
                type="text"
                value={proofNotes}
                onChange={(e) => setProofNotes(e.target.value)}
                placeholder="Sender name, bank name, or remarks"
                className="w-full px-4 py-2 rounded-xl border border-[#E2E8F0] text-xs focus:outline-none focus:border-[#172B4D]"
              />
            </div>

            {/* Security Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Strict Business Policy:</strong> Subscriptions are verified by Land Parcel
                admin staff upon receipt of your reference number. Never fake or simulate payments.
                Your account enters <em>Pending Verification</em> immediately upon submission.
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-bold text-[#64748B] hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary py-2.5 px-6 text-xs font-bold flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Reference for Approval</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
