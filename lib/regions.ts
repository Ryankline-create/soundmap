export type RegionId =
  | "west-africa"
  | "east-africa"
  | "north-america"
  | "south-america"
  | "caribbean"
  | "europe"
  | "middle-east"
  | "south-asia"
  | "southeast-asia"
  | "east-asia"
  | "central-asia"
  | "oceania";

export type Region = {
  id: RegionId;
  emoji: string;
  label: string;
};

export const REGIONS: Region[] = [
  { id: "west-africa",     emoji: "🌍", label: "West Africa" },
  { id: "east-africa",     emoji: "🦁", label: "East Africa" },
  { id: "north-america",   emoji: "🦅", label: "North America" },
  { id: "south-america",   emoji: "🦜", label: "South America" },
  { id: "caribbean",       emoji: "🌊", label: "Caribbean" },
  { id: "europe",          emoji: "🏰", label: "Europe" },
  { id: "middle-east",     emoji: "🕌", label: "Middle East" },
  { id: "south-asia",      emoji: "🪔", label: "South Asia" },
  { id: "southeast-asia",  emoji: "🌺", label: "Southeast Asia" },
  { id: "east-asia",       emoji: "🏮", label: "East Asia" },
  { id: "central-asia",    emoji: "🏔️", label: "Central Asia" },
  { id: "oceania",         emoji: "🦘", label: "Australia/Oceania" },
];

export const REGION_BY_ID: Record<RegionId, Region> = REGIONS.reduce(
  (acc, r) => ({ ...acc, [r.id]: r }),
  {} as Record<RegionId, Region>
);
