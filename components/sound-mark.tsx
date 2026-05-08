import Image from "next/image";

import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  size?: number;
};

export function SoundMark({ className, size = 220 }: Props) {
  return (
    <Image
      src="/logo.png"
      alt="SoundMap"
      width={1024}
      height={1024}
      priority
      sizes={`${size}px`}
      className={cn("h-auto w-full", className)}
    />
  );
}
