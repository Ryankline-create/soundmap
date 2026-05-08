import { ComingSoon } from "@/components/coming-soon";

export default function RanksPage() {
  return (
    <ComingSoon
      emoji="🏆"
      title="Ranks"
      tagline="Climb leaderboards by region, by streak, and by ear — see how you stack up."
      bullets={[
        "Weekly global + per-region leaderboards",
        "Earn badges: Polyrhythm Pro, Drone Master, Pin-Drop Sniper",
        "Friends-only ranks — challenge your classmates",
      ]}
    />
  );
}
