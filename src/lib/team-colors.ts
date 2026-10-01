export interface TeamColorScheme {
  name: string;
  /**
   * Solid dark color of the team: header band, background vignette and the
   * two-tone logo knock-out. White text is drawn on top of it, so it has to
   * stay dark enough for that to be readable.
   */
  tint: string;
  /** Color for text and icons, and for solid badges. Defaults to `tint`. */
  ink?: string;
  /** Color of the card wash. Defaults to `ink`. */
  surface?: string;
  /** Color of the card border. Defaults to `ink`. */
  edge?: string;
}

const colorSchemes: TeamColorScheme[] = [
  { name: 'green', tint: '#047A3F', ink: '#166534', surface: '#F0FDF4', edge: '#15803D' },
  { name: 'lightblue', tint: '#2B5C61', surface: '#A3E4E6' },
  { name: 'darkblue', tint: '#21263F' },
  { name: 'purple', tint: '#64325F' },
  { name: 'neongreen', tint: '#374137', surface: '#F0FDF4', edge: '#0dff0d' },
];

const explicitTeamColors: Record<string, string> = {
  'Herren 1': 'purple',
  'Herren 2': 'lightblue',
  'Damen 1': 'darkblue',
  'Mixed 1': 'neongreen',
};

export function getTeamColorScheme(teamName: string): TeamColorScheme {
  const normalizedTeamName = teamName.toLowerCase();
  const matchedTeam = Object.keys(explicitTeamColors).find((team) =>
    normalizedTeamName.includes(team.toLowerCase()),
  );
  const colorName =
    explicitTeamColors[teamName] ?? (matchedTeam ? explicitTeamColors[matchedTeam] : undefined);
  return colorSchemes.find((scheme) => scheme.name === colorName) ?? colorSchemes[0];
}

/** Converts a "#RRGGBB" color to an "rgba(r, g, b, a)" string for inline styles. */
export function hexToRgba(hex: string, alpha: number): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
