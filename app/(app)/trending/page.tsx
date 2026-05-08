import { ComingSoon } from "@/components/coming-soon";

export default function TrendingPage() {
  return (
    <ComingSoon
      emoji="🔥"
      title="Trending"
      tagline="What other players are listening to right now — and what's catching fire this week."
      bullets={[
        "Hot tracks across all 12 regions, updated daily",
        "Most-missed songs (where most players guess wrong)",
        "Friend feed — see what your friends are guessing",
      ]}
    />
  );
}
