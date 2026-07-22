"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

const TABS = [
  { href: ROUTES.admin, label: "Genel Bakış" },
  { href: `${ROUTES.admin}/users`, label: "Kullanıcılar" },
  { href: `${ROUTES.admin}/generations`, label: "Üretimler" },
  { href: `${ROUTES.admin}/purchases`, label: "Satın Almalar" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex flex-wrap gap-1 border-b border-border">
      {TABS.map((tab) => {
        const isActive =
          tab.href === ROUTES.admin
            ? pathname === ROUTES.admin
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 border-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
              isActive && "border-primary text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
