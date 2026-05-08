import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandMarkProps = {
  size?: number;
  glow?: boolean;
  className?: string;
};

export function BrandMark({ size = 132, glow = true, className }: BrandMarkProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full bg-card/60 ring-1 ring-white/10",
        glow && "glow-brand",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/icon.png"
        alt="SoundMap"
        width={size}
        height={size}
        priority
        className="h-[88%] w-[88%] animate-pulse-soft"
      />
    </div>
  );
}
