import { ComingSoon } from "@/components/coming-soon";

export default function TriviaPage() {
  return (
    <ComingSoon
      emoji="🧠"
      title="Music Trivia"
      tagline="Test your ear with quick questions about world music styles, instruments, and history."
      bullets={[
        "Daily 10-question rounds — earn XP, build a trivia streak",
        "Multiple-choice + audio-clip identification",
        "Difficulty scales as you climb levels",
      ]}
    />
  );
}
