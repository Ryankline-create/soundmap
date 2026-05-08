import { ComingSoon } from "@/components/coming-soon";

export default function ExplorePage() {
  return (
    <ComingSoon
      emoji="🗺️"
      title="Explore"
      tagline="Drop a pin anywhere on the map and listen to what comes from there."
      bullets={[
        "Free-form world map — pinch, pan and tap any country",
        "5+ tracks per region, refreshed weekly",
        "Save songs to your own playlists",
      ]}
    />
  );
}
