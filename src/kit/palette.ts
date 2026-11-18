// Shared colors. Story-specific colors live with the story, not here.
export const palette = {
  // Midnight Monitor base
  skyTop: '#070D1F',
  skyHorizon: '#1B2A55',
  keyTeal: '#3FD0E0',
  warmRim: '#FFB547',
  alarm: '#FF3B2F',

  // Verdict stamps
  verdictTrue: '#39E58C',
  verdictFalse: '#FF4D5E',
  verdictUnproven: '#FFC233',

  // Props
  chipBody: '#232B42',
  chipGold: '#E8B04B',
  chipViolet: '#7B5CFF',
  chipOrange: '#FF8A3D',
  brass: '#C9973E',
  rack: '#151B2B',

  // Skin tones (generic range)
  skin1: '#F6D3B3',
  skin2: '#E8B48F',
  skin3: '#C98E66',
  skin4: '#9A6444',
  skin5: '#6B4430',

  ink: '#111318',
  white: '#F4F1EA',
} as const;

// ---------------------------------------------------------------------------
// Palette v2 ("blend"): daylight structure of the reference Short, ~25% more
// saturated, with pink / cyan / violet accents. Use for look: 'v2' stories.
// Rule of thumb per frame: 60% sky+ground neutrals, 30% mid tones, 10% accent.
// ---------------------------------------------------------------------------
export const paletteV2 = {
  // Sky gradients (top -> horizon)
  skyDayTop: '#8EC9F2',
  skyDayHorizon: '#FFE3C4',
  skySunsetTop: '#9C8CE0',
  skySunsetHorizon: '#FFB38A',
  skyOvercastTop: '#B9C8DF',
  skyOvercastHorizon: '#E6E2DC',

  // Ground / structure
  grass: '#A8B84A',
  grassDeep: '#7E9A3A',
  sand: '#EBCB93',
  concrete: '#9AA6BA',
  asphalt: '#5F6B82',
  wood: '#C58A4E',
  tan: '#D9B48A',

  // Accents (max ~10% of the frame)
  sun: '#FFC83D',
  orange: '#FF8A2B',
  pink: '#FF6FA8',
  violet: '#8B6CF2',
  cyan: '#33C9E8',
  mint: '#5FD6A8',
  red: '#F2554A',

  // Info cards (navy + white + ONE accent)
  cardNavy: '#07192E',
  cardNavyDeep: '#000F1B',
  cardSlate: '#56718C',
  cardAccent: '#FC7915',

  // Soft outline tint (never pure black)
  line: '#3A3F63',
  shadowTint: '#5A5FA8',
} as const;
