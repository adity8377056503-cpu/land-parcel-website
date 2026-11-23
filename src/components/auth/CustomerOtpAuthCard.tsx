"use client";

import { useState } from "react";
import {
  Phone,
  ShieldCheck,
  KeyRound,
  User,
  Mail,
  Briefcase,
  Building2,
  Loader2,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { useCustomerAuth } from "@/lib/customer-auth";
import { ClientAccount, CustomerAccountType } from "@/types";
import toast from "react-hot-toast";

const ACCOUNT_TYPES: { value: CustomerAccountType; label: string; desc: string }[] = [
  { value: "owner", label: "Property Owner", desc: "Individual selling or listing personal property" },
  { value: "dealer", label: "Property Dealer", desc: "Real estate dealer managing client inventory" },
  { value: "agent", label: "Broker / Agent", desc: "Authorized property consultant or broker" },
  { value: "builder", label: "Builder", desc: "Independent builder / floor developer" },
  { value: "developer", label: "Developer", desc: "Real estate company or township developer" },
];

interface CustomerOtpAuthCardProps {
  onSuccess?: (customer: ClientAccount) => void;
  title?: string;
  subtitle?: string;
}

export default function CustomerOtpAuthCard({
  onSuccess,
  title = "Customer Login & Registration",
  subtitle = "Sign in or register with your verified Indian mobile number. New customers receive 5 lifetime free listing credits.",
}: CustomerOtpAuthCardProps) {
  const { sendOtp, verifyOtp, completeRegistration } = useCustomerAuth();

  const [stage, setStage] = useState<"mobile" | "otp" | "register">("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [registrationToken, setRegistrationToken] = useState("");

  // Registration fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [accountType, setAccountType] = useState<CustomerAccountType>("owner");
  const [companyName, setCompanyName] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = mobile.replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(digits)) {
      toast.error("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(digits);
      setMobile(digits);
      setDevOtpHint(res.devOtp || null);
      setStage("otp");
      toast.success(res.message || "OTP sent successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Could not send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.replace(/\D/g, "");
    if (cleanOtp.length !== 6) {
      toast.error("Enter the 6-digit verification OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp(mobile, cleanOtp);
      if (res.requiresRegistration && res.registrationToken) {
        setRegistrationToken(res.registrationToken);
        setStage("register");
        toast.success("Mobile verified! Complete your profile to finish registration.");
      } else if (res.customer) {
        toast.success(`Welcome back, ${res.customer.name}!`);
        if (onSuccess) onSuccess(res.customer);
      }
    } catch (err: any) {
      toast.error(err?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim().length < 2) {
      toast.error("Please enter your full name.");
      return;
    }

    setLoading(true);
    try {
      const customer = await completeRegistration({
        registrationToken,
        name: fullName.trim(),
        email: email.trim() || undefined,
        accountType,
        companyName: companyName.trim() || undefined,
      });
      toast.success("Account registered! 5 lifetime free listing credits activated.");
      if (onSuccess) onSuccess(customer);
    } catch (err: any) {
      toast.error(err?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-[#E2E8F0] max-w-md w-full mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-[#172B4D] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
          <ShieldCheck className="w-6 h-6 text-[#C6A66B]" />
        </div>
        <h2 className="text-xl font-bold text-[#172B4D] font-display">{title}</h2>
        <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{subtitle}</p>
      </div>

      {/* Stage 1: Mobile Input */}
      {stage === "mobile" && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="label-field">Mobile Number (India +91) *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#64748B]">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit mobile number"
                className="input-field pl-12 text-sm font-mono tracking-wide"
              />
              <Phone className="w-4 h-4 text-[#C6A66B] absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || mobile.length < 10}
            className="btn-primary w-full py-3 justify-center text-sm disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...
              </>
            ) : (
              <>
                Send Verification OTP <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-[11px] text-[#64748B] space-y-1">
            <div className="font-semibold text-[#172B4D]">Customer Account Benefits:</div>
            <div>• 5 lifetime free property listing credits on registration</div>
            <div>• Personal dashboard to track approvals, edits &amp; plans</div>
            <div>• Secure mobile OTP authentication</div>
          </div>
        </form>
      )}

      {/* Stage 2: Verify OTP */}
      {stage === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="bg-[#EAF3FA] border border-blue-200 rounded-xl p-3 text-xs text-[#172B4D] flex items-center justify-between">
            <span>
              OTP sent to <strong className="font-mono">+91 {mobile}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setStage("mobile");
                setOtp("");
                setDevOtpHint(null);
              }}
              className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Change
            </button>
          </div>

          {devOtpHint && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
              <div className="font-bold">Local Verification Code (SMS Gateway Not Connected):</div>
              <div className="mt-1 flex items-center justify-between">
                <span>Enter this server-generated OTP:</span>
                <code className="font-mono font-extrabold text-sm bg-white px-2.5 py-0.5 rounded border border-amber-300">
                  {devOtpHint}
                </code>
              </div>
            </div>
          )}

          <div>
            <label className="label-field">Enter 6-Digit OTP *</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#C6A66B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit OTP"
                className="input-field pl-10 text-base font-mono tracking-[0.35em] font-bold text-center"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="btn-primary w-full py-3 justify-center text-sm disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying OTP...
              </>
            ) : (
              <>
                Verify &amp; Continue <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Stage 3: Complete New Customer Profile */}
      {stage === "register" && (
        <form onSubmit={handleCompleteRegistration} className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              Mobile <strong className="font-mono">+91 {mobile}</strong> verified! Complete your customer profile below.
            </span>
          </div>

          <div>
            <label className="label-field">Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="input-field pl-10 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="label-field">Email Address (Optional)</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field pl-10 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="label-field">Account Type *</label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as CustomerAccountType)}
                className="input-field pl-10 text-sm"
              >
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">
              {ACCOUNT_TYPES.find((t) => t.value === accountType)?.desc}
            </p>
          </div>

          {accountType !== "owner" && (
            <div>
              <label className="label-field">Agency / Company Name (Optional)</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Your firm or developer name"
                  className="input-field pl-10 text-sm"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 justify-center text-sm disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Creating Customer Account...
              </>
            ) : (
              <>
                Create Account &amp; Get 5 Free Credits <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
