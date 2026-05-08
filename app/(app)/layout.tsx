import { GameHeader } from "@/components/game-header";
import { BottomNav } from "@/components/bottom-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <GameHeader />
      <div className="flex-1 overflow-x-hidden">{children}</div>
      <BottomNav />
    </div>
  );
}
