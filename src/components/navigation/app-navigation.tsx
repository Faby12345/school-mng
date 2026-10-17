"use client";

import { BookOpenText, CalendarCheck2, GraduationCap, House } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Acasă", icon: House },
  { href: "/catalog", label: "Catalog", icon: GraduationCap },
] as const;

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <nav className="app-navigation" aria-label="Navigare principală">
      <div className="nav-inner">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={active ? "nav-item is-active" : "nav-item"} aria-current={active ? "page" : undefined}>
              <Icon size={21} strokeWidth={active ? 2.4 : 2} />
              <span>{label}</span>
            </Link>
          );
        })}
        <span className="nav-item is-disabled" aria-disabled="true" title="Disponibil în curând">
          <BookOpenText size={21} />
          <span>Învață</span>
        </span>
        <span className="nav-item is-disabled" aria-disabled="true" title="Disponibil în curând">
          <CalendarCheck2 size={21} />
          <span>Teme</span>
        </span>
      </div>
    </nav>
  );
}

