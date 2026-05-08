"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Compass,
  Flame,
  Globe2,
  Headphones,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type Tab = {
  href: string;
  label: string;
  Icon: LucideIcon;
};

const TABS: Tab[] = [
  { href: "/play",      label: "Play",      Icon: Globe2 },
  { href: "/deep-dive", label: "Deep Dive", Icon: Headphones },
  { href: "/trivia",    label: "Trivia",    Icon: Sparkles },
  { href: "/lessons",   label: "Lessons",   Icon: BookOpen },
  { href: "/trending",  label: "Trending",  Icon: Flame },
  { href: "/explore",   label: "Explore",   Icon: Compass },
  { href: "/ranks",     label: "Ranks",     Icon: Trophy },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="sticky bottom-0 z-40 border-t border-white/5 bg-background/85 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur"
    >
      <ul className="flex items-stretch justify-between gap-0.5">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-12 items-center justify-center rounded-full transition-all",
                    active ? "bg-brand-gradient text-white shadow-md shadow-brand-purple/30" : "bg-transparent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="leading-none">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
