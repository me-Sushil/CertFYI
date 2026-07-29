import Link from "next/link";
import { LayoutDashboard, Plus, Upload, History, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { href: "/issuer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/issuer/issue", label: "Issue Document", icon: Plus },
  { href: "/issuer/bulk-issue", label: "Bulk Issue", icon: Upload },
  { href: "/issuer/history", label: "History", icon: History },
  { href: "/issuer/activity", label: "Activity", icon: Activity },
];

export function Sidebar({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <aside className="flex h-full flex-col bg-card">
      <div className="border-b border-border/10 p-6 sm:p-8">
      <Link href="/" className="flex items-center gap-2 outline-none">
        <div className="flex items-center gap-2.5">
          <div className=" rounded-2xl bg-white px-4 py-2">
            <img
              src="/certFYI-logo.png"
              alt="CertFyi Logo"
              className="h-10 w-auto"
            />
          </div>
        </div>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4 sm:p-5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ease-[var(--ease-premium)]",
                isActive
                  ? "bg-primary text-primary-foreground shadow-button"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
