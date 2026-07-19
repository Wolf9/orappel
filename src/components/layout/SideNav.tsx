"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Grid, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Accueil", href: "/", icon: Home },
  { name: "Calendrier", href: "/calendar", icon: Calendar },
  { name: "Catégories", href: "/categories", icon: Grid },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex w-64 flex-col border-r bg-card px-4 py-8">
      <div className="mb-8 px-4 text-2xl font-bold text-primary">Rappels</div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-2xl px-4 py-3 transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
