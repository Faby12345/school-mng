"use client";

import { BookOpenText, CalendarCheck2, GraduationCap, House } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const items = [
  { href: "/", label: "Acasă", icon: House },
  { href: "/catalog", label: "Catalog", icon: GraduationCap },
  { href: "/study", label: "Învață", icon: BookOpenText },
] as const;

export function AppNavigation() {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  return (
    <nav className="app-navigation" aria-label="Navigare principală">
      <div className="nav-inner">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === href : pathname.startsWith(href);
          const navigating = pendingHref === href && !active;
          return (
            <Link
              key={href}
              href={href}
              prefetch
              draggable={false}
              className={`nav-item${active ? " is-active" : ""}${navigating ? " is-navigating" : ""}`}
              aria-current={active ? "page" : undefined}
              aria-busy={navigating || undefined}
              onClick={() => setPendingHref(href)}
            >
              <Icon size={21} strokeWidth={active ? 2.4 : 2} />
              <span>{label}</span>
            </Link>
          );
        })}
        <span className="nav-item is-disabled" aria-disabled="true" title="Disponibil în curând">
          <CalendarCheck2 size={21} />
          <span>Teme</span>
        </span>
      </div>
    </nav>
  );
}

