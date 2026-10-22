import type { ExplainStory } from '@/src/data/types';

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// Rule-based practice feedback: an idea counts as mentioned when any of its
// keywords appears in the student's text. It checks for ideas, not grammar.
export function checkIdeas(story: ExplainStory, text: string) {
  const t = ` ${norm(text)} `;
  return story.ideas.map((idea) => ({ label: idea.label, hit: idea.keywords.some((k) => t.includes(norm(k))) }));
}
