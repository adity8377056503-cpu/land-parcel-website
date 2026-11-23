"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield } from "lucide-react";
import CustomerOtpAuthCard from "@/components/auth/CustomerOtpAuthCard";
import { useCustomerAuth } from "@/lib/customer-auth";

export default function CustomerLoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoaded } = useCustomerAuth();

  useEffect(() => {
    if (isLoaded && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isLoaded, isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] pt-28 pb-20 px-4">
      <div className="container-custom max-w-lg mx-auto space-y-6">
        <CustomerOtpAuthCard
          onSuccess={() => {
            router.push("/dashboard");
          }}
        />

        <div className="text-center">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#172B4D] font-medium transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-[#C6A66B]" />
            Administrator Portal Login
          </Link>
        </div>
      </div>
    </div>
  );
}
