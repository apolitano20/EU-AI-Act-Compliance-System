"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "@/lib/nav";

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-2.5">
      <div className="flex items-start gap-6 flex-wrap">
        <div className="flex flex-col justify-center pt-0.5">
          <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">EU AI Act</span>
          <span className="text-sm font-medium text-slate-700 whitespace-nowrap">Compliance Readiness</span>
        </div>
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
              {group.label}
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm whitespace-nowrap",
                      active ? "text-slate-900 font-medium" : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
