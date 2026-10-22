// "Field Notes" (light) and "Night Atlas" (dark). Components read tokens only.

export const light = {
  bg: '#FAF5EE', surface: '#FFFCF8', surfaceAlt: '#F3EADF', sunk: '#EFE4D6',
  ink: '#2B1610', inkMuted: '#6B5246', inkFaint: '#8F7A6D',
  primary: '#B4482F', primaryHover: '#963A25', primaryOn: '#FFFFFF', primarySoft: '#FBE6DC',
  brand: '#D87558',
  mapSea: '#FAF5EE', mapLand: '#EADBC8', mapLandHover: '#E2CCB3', mapStroke: '#D9C6B0', mapGrid: '#EFE4D6',
  gold: '#C98A1B', goldSoft: '#FBEFD6',
  teal: '#2C7A75', tealSoft: '#DDEFEC',
  border: '#EADFD2', borderStrong: '#D8C7B5',
  error: '#B83A2E', overlay: 'rgba(43,22,16,0.45)',
  inkAmericas: '#B4482F', inkAfrica: '#9A6516', inkAsia: '#2C7A75', inkMena: '#3B4F8A', inkEurope: '#8C4A6E',
} as const;

export const dark = {
  bg: '#140D0A', surface: '#1E1511', surfaceAlt: '#2A1E18', sunk: '#100A08',
  ink: '#F7EDE3', inkMuted: '#C9B4A5', inkFaint: '#8E7869',
  primary: '#EE8466', primaryHover: '#F4A088', primaryOn: '#1A0C07', primarySoft: '#3A1F16',
  brand: '#E07E60',
  mapSea: '#140D0A', mapLand: '#3A2A21', mapLandHover: '#4A372C', mapStroke: '#2A1E18', mapGrid: '#1E1511',
  gold: '#F0BE5C', goldSoft: '#33290F', teal: '#5FC2B8', tealSoft: '#12302D',
  border: '#33251E', borderStrong: '#4A372C', error: '#FF7B6B', overlay: 'rgba(0,0,0,0.6)',
  inkAmericas: '#EE8466', inkAfrica: '#E0A443', inkAsia: '#5FC2B8', inkMena: '#8FA4E8', inkEurope: '#D78BB0',
} as const;

export type Colors = { [K in keyof typeof light]: string };

// SoundDeck hardware panel: the same in both themes.
export const deck = {
  body: '#1B120E', panel: '#241914', well: '#120C09', pad: '#2E211B', padEdge: '#3A2A21',
  led: '#F0BE5C', ledOff: '#4A372C', readout: '#F7EDE3', label: '#C9B4A5', faint: '#8E7869',
  stepOff: '#2A1E18', playhead: '#F7EDE3',
} as const;

export const regionInkKey = {
  americas: 'inkAmericas', africa: 'inkAfrica', asia: 'inkAsia', mena: 'inkMena', europe: 'inkEurope',
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;
export const radius = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 } as const;

export const font = {
  display: 'YoungSerif_400Regular',
  body: 'HankenGrotesk_400Regular',
  bodyMedium: 'HankenGrotesk_500Medium',
  bodySemi: 'HankenGrotesk_600SemiBold',
  bodyBold: 'HankenGrotesk_700Bold',
  bodyHeavy: 'HankenGrotesk_800ExtraBold',
  mono: 'DMMono_400Regular',
  monoMedium: 'DMMono_500Medium',
} as const;

// Each shadow also carries Android elevation.
export const shadow = {
  card: { shadowColor: '#2B1610', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  raised: { shadowColor: '#2B1610', shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  pad: { shadowColor: '#000000', shadowOpacity: 0.45, shadowRadius: 3, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
} as const;

export const motion = { fast: 180, base: 220, slow: 260, flight: 1600 } as const;
