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
  { href: "/deep-dive", label: "Dive",      Icon: Headphones },
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
      className="sticky bottom-0 z-40 border-t border-border bg-background/90 px-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur"
    >
      <ul className="flex items-stretch justify-between">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex flex-col items-center gap-1 px-1 py-1.5 text-[10px] font-medium transition-colors",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="relative flex h-6 w-6 items-center justify-center">
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px]",
                      active ? "text-foreground" : "text-muted-foreground/85"
                    )}
                    strokeWidth={active ? 2 : 1.6}
                  />
                  {active && (
                    <span
                      aria-hidden
                      className="absolute -bottom-1.5 h-1 w-1 rounded-full bg-primary"
                    />
                  )}
                </span>
                <span
                  className={cn(
                    "leading-none tracking-tight",
                    active ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
