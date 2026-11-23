"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { useAdminAuth } from "@/lib/admin-auth";
import { usePropertyStore } from "@/lib/property-store";
import {
  Building2,
  LayoutDashboard,
  Building,
  PlusCircle,
  FolderUp,
  Inbox,
  Clock,
  CheckCircle2,
  BadgeCheck,
  FileEdit,
  XCircle,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  Shield,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

function AdminSidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "all";
  const router = useRouter();
  const { isAuthenticated, logout } = useAdminAuth();
  const { counts } = usePropertyStore();

  if (pathname === "/admin/login") {
    return null;
  }

  const PROPERTY_SECTIONS = [
    { label: "1. All Properties", tab: "all", icon: Building, count: counts.all },
    { label: "2. Add New Property", href: "/admin/properties/new", icon: PlusCircle, isAction: true },
    { label: "3. My Uploaded Properties", tab: "my-uploaded", icon: FolderUp, count: counts.myUploaded },
    { label: "4. Client Submissions", tab: "client-submissions", icon: Inbox, count: counts.clientSubmissions },
    { label: "5. Pending Approval", tab: "pending", icon: Clock, count: counts.pending, alert: counts.pending > 0 },
    { label: "6. Published Properties", tab: "published", icon: CheckCircle2, count: counts.published },
    { label: "7. Sold / Rented", tab: "sold-rented", icon: BadgeCheck, count: counts.soldOrRented },
    { label: "8. Draft Listings", tab: "drafts", icon: FileEdit, count: counts.drafts },
    { label: "9. Rejected Listings", tab: "rejected", icon: XCircle, count: counts.rejected },
  ];

  return (
    <aside className="w-64 bg-[#172B4D] text-white flex flex-col flex-shrink-0">
      {/* Brand */}
      <div className="p-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#C6A66B] rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg font-display tracking-tight">LAND</span>
            <span className="font-bold text-lg font-display tracking-tight text-[#C6A66B] ml-1">PARCEL</span>
          </div>
        </Link>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-300">
          <Shield className="w-3.5 h-3.5 text-[#C6A66B]" />
          <span>Dual Listing Console</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3 flex-1 space-y-1 overflow-y-auto">
        <Link
          href="/admin"
          className={cn(
            "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors",
            pathname === "/admin"
              ? "bg-white/15 text-white font-bold text-[#C6A66B]"
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          )}
        >
          <LayoutDashboard className="w-4 h-4 text-[#C6A66B]" />
          <span>Overview</span>
        </Link>

        {/* Section Heading */}
        <div className="pt-3 pb-1 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Property Registry (9 Sections)
        </div>

        {PROPERTY_SECTIONS.map((sec) => {
          const Icon = sec.icon;
          const isAdd = sec.isAction;
          const href = isAdd ? sec.href! : `/admin/properties?tab=${sec.tab}`;
          const active =
            pathname === "/admin/properties/new" && isAdd
              ? true
              : pathname === "/admin/properties" && currentTab === sec.tab;

          return (
            <Link
              key={sec.label}
              href={href}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors",
                active
                  ? "bg-white/15 text-white font-bold text-[#C6A66B]"
                  : isAdd
                  ? "text-amber-300 bg-white/5 hover:bg-white/10 font-semibold"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <div className="flex items-center gap-2.5 line-clamp-1">
                <Icon className={cn("w-3.5 h-3.5 flex-shrink-0", active ? "text-[#C6A66B]" : isAdd ? "text-amber-400" : "text-slate-400")} />
                <span className="truncate">{sec.label}</span>
              </div>
              {sec.count !== undefined && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-md font-mono font-semibold",
                    sec.alert
                      ? "bg-amber-400 text-[#172B4D] animate-pulse"
                      : active
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-slate-300"
                  )}
                >
                  {sec.count}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-3 pb-1 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Operations
        </div>

        <Link
          href="/admin/leads"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors",
            pathname === "/admin/leads"
              ? "bg-white/15 text-white font-bold text-[#C6A66B]"
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          )}
        >
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>Leads & Inquiries</span>
        </Link>

        <Link
          href="/admin/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors",
            pathname === "/admin/settings"
              ? "bg-white/15 text-white font-bold text-[#C6A66B]"
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          )}
        >
          <Settings className="w-3.5 h-3.5 text-slate-400" />
          <span>System Settings</span>
        </Link>
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-white/10 space-y-1.5">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>View Public Marketplace</span>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-300 hover:bg-red-500/20 transition-colors text-left"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAdminAuth();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#172B4D] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (typeof window !== "undefined") {
      router.push("/admin/login");
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex">
      <Suspense fallback={<div className="w-64 bg-[#172B4D]" />}>
        <AdminSidebarContent />
      </Suspense>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-[#E2E8F0] px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#172B4D] font-display">
              Administrative Command Center
            </h2>
            <span className="badge bg-green-100 text-green-700 text-[10px]">
              Dual System Active
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/properties/new"
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#C6A66B]" /> + Add New Property
            </Link>
          </div>
        </header>

        <main className="p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
