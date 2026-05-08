import { ComingSoon } from "@/components/coming-soon";

export default function LessonsPage() {
  return (
    <ComingSoon
      emoji="📚"
      title="Lessons"
      tagline="Short, illustrated dives into a region's music — what makes it sound the way it does."
      bullets={[
        "5-minute reads on rhythm, scales and instruments per region",
        "Audio examples that play inline as you scroll",
        "Built-in quizzes that count towards your XP",
      ]}
    />
  );
}
