"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/admin-auth";
import { Building2, Lock, UserCheck, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      toast.error("Please enter your authorized mobile number or email and password.");
      return;
    }

    setLoading(true);
    try {
      const result = await login(identifier.trim(), password);
      if (result.ok) {
        toast.success(`Welcome, ${result.user?.name || "Super Admin"}!`);
        router.push("/admin");
      } else {
        toast.error(result.error || "Invalid administrator credentials");
        setLoading(false);
      }
    } catch {
      toast.error("Authentication request failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#172B4D] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#172B4D] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <Building2 className="w-7 h-7 text-[#C6A66B]" />
          </div>
          <h1 className="text-2xl font-bold text-[#172B4D] font-display">
            LAND <span className="text-[#C6A66B]">PARCEL</span>
          </h1>
          <p className="text-xs text-[#64748B] uppercase tracking-widest mt-1 font-semibold">
            Super Admin Command Center
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Super Admin Mobile Number or Email</label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="input-field pl-10 text-sm"
                placeholder="Authorized mobile number or email"
              />
            </div>
          </div>

          <div>
            <label className="label-field">Administrator Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10 text-sm"
                placeholder="Enter your secure admin password"
              />
            </div>
          </div>

          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[11px] text-[#64748B] flex items-start gap-2 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-[#172B4D] flex-shrink-0 mt-0.5" />
            <span>
              Server-verified authentication required. Access is strictly restricted to authorized Super Admin and delegated Admin accounts.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 mt-2 justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying Super Admin...
              </>
            ) : (
              <>
                Sign In to Admin Dashboard <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#E2E8F0] text-xs">
          <Link href="/" className="text-[#64748B] hover:text-[#172B4D] transition-colors">
            ← Public Website
          </Link>
          <Link href="/login" className="text-[#172B4D] font-semibold hover:underline">
            Customer OTP Login →
          </Link>
        </div>
      </div>
    </div>
  );
}
