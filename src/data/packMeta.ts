import type { PackId } from '@/src/audio/types';
import type { GlyphId, RegionKey } from './types';

// How each SoundDeck pack looks: its region ink and badge glyph.
export const PACK_LOOK: Record<PackId, { region: RegionKey; glyph: GlyphId; stamp: string }> = {
  westafrica: { region: 'africa', glyph: 'djembe', stamp: 'WEST AFRICA' },
  caribbean: { region: 'americas', glyph: 'conga', stamp: 'CARIBBEAN' },
  southasia: { region: 'asia', glyph: 'tabla', stamp: 'SOUTH ASIA' },
  seasia: { region: 'asia', glyph: 'gong', stamp: 'SOUTHEAST ASIA' },
  mena: { region: 'mena', glyph: 'oud', stamp: 'N. AFRICA · MID. EAST' },
};
