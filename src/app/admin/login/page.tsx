"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/admin-auth";
import { Building2, Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();
  const [email, setEmail] = useState("admin@landparcel.in");
  const [password, setPassword] = useState("Admin@LandParcel2026");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const ok = login(email, password);
      if (ok) {
        toast.success("Welcome to Land Parcel Admin Portal");
        router.push("/admin");
      } else {
        toast.error("Invalid administrator credentials");
        setLoading(false);
      }
    }, 400);
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
            Administrative Control Panel
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10 text-sm"
                placeholder="admin@landparcel.in"
              />
            </div>
          </div>

          <div>
            <label className="label-field">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10 text-sm"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <div className="p-3 bg-[#EAF3FA] rounded-xl text-xs text-[#172B4D] leading-relaxed">
            <strong>Development Credentials Pre-filled:</strong>
            <br />
            Email: <code className="font-mono">admin@landparcel.in</code>
            <br />
            Password: <code className="font-mono">Admin@LandParcel2026</code>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 mt-2 justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
              </>
            ) : (
              <>
                Sign In to Dashboard <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-[#64748B] hover:text-[#172B4D] transition-colors"
          >
            ← Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
