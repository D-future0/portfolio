export const PROFESSIONS = [
  { key: "consultant", label: "Consultant", description: "Turn expertise into trusted engagements." },
  { key: "designer", label: "Designer", description: "Show the thinking behind your best work." },
  { key: "developer", label: "Developer", description: "Present products, systems, and technical craft." },
  { key: "coach", label: "Coach", description: "Make your approach and client outcomes clear." },
  { key: "lawyer", label: "Lawyer", description: "Build a credible professional presence." },
  { key: "agency", label: "Agency", description: "Package your team, services, and case studies." },
  { key: "creator", label: "Creator", description: "Bring your work, voice, and collaborations together." },
] as const;

export const TEMPLATES = [
  { key: "editorial", label: "Editorial", description: "Quiet typography for thoughtful professionals." },
  { key: "studio", label: "Studio", description: "A sharper frame for visual work and services." },
  { key: "signal", label: "Signal", description: "Clear sections for technical work and outcomes." },
] as const;

export type ProfessionKey = (typeof PROFESSIONS)[number]["key"];
export type TemplateKey = (typeof TEMPLATES)[number]["key"];

const examples: Record<ProfessionKey, { title: string; tagline: string; bio: string; projectTitle: string; projectSummary: string }> = {
  consultant: { title: "Strategy Consultant", tagline: "Clear direction for complex decisions.", bio: "I help ambitious teams turn uncertainty into focused, measurable progress.", projectTitle: "Growth strategy sprint", projectSummary: "A focused engagement that aligned the team around its next stage of growth." },
  designer: { title: "Independent Designer", tagline: "Useful ideas, beautifully made.", bio: "I design identities and digital experiences that make good work easier to understand.", projectTitle: "Brand system for a new venture", projectSummary: "A flexible identity system built to grow from launch to product-market fit." },
  developer: { title: "Software Developer", tagline: "Reliable systems for ambitious products.", bio: "I build thoughtful web products with a bias toward clarity, performance, and maintainability.", projectTitle: "Product platform rebuild", projectSummary: "A faster, simpler foundation that helped a growing team ship with confidence." },
  coach: { title: "Professional Coach", tagline: "Make your next move with intention.", bio: "I work with thoughtful leaders who want practical progress and a clearer sense of direction.", projectTitle: "Leadership transition programme", projectSummary: "A structured programme that helped a new leader build trust and momentum." },
  lawyer: { title: "Legal Professional", tagline: "Practical counsel for important work.", bio: "I help people and organisations navigate complex decisions with clarity and care.", projectTitle: "Commercial advisory engagement", projectSummary: "Practical guidance that reduced risk while keeping the work moving." },
  agency: { title: "Creative Studio", tagline: "A focused team for meaningful work.", bio: "We partner with ambitious organisations to shape clear brands, products, and experiences.", projectTitle: "Launch campaign and identity", projectSummary: "A connected campaign system that gave a new offer a confident public voice." },
  creator: { title: "Independent Creator", tagline: "Ideas worth making visible.", bio: "I create useful, curious work across writing, media, and collaboration.", projectTitle: "Editorial series", projectSummary: "A body of work that grew an engaged audience around a clear point of view." },
};

export function getProfessionExample(profession: string) {
  return examples[profession as ProfessionKey] ?? examples.consultant;
}