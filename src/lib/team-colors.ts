export interface TeamColorScheme {
  name: string;
  imageTint: string;
  primary: string;
  primaryBgLight: string;
  badgeBg: string;
  primaryOpacity80: string;
  borderOpacity60: string;
}

const colorSchemes: TeamColorScheme[] = [
  {
    name: 'green',
    imageTint: '#047A3F',
    primary: 'text-green-800',
    primaryBgLight: 'bg-green-50/25',
    badgeBg: 'bg-green-800',
    primaryOpacity80: 'text-green-800/80',
    borderOpacity60: 'border-green-700/60',
  },
  {
    name: 'lightblue',
    imageTint: '#2B5C61',
    primary: 'text-[#2B5C61]',
    primaryBgLight: 'bg-[#A3E4E6]/25',
    badgeBg: 'bg-[#2B5C61]',
    primaryOpacity80: 'text-[#2B5C61]/80',
    borderOpacity60: 'border-[#2B5C61]/60',
  },
  {
    name: 'darkblue',
    imageTint: '#21263F',
    primary: 'text-[#21263F]',
    primaryBgLight: 'bg-[#21263F]/25',
    badgeBg: 'bg-[#21263F]',
    primaryOpacity80: 'text-[#21263F]/80',
    borderOpacity60: 'border-[#21263F]/60',
  },
  {
    name: 'purple',
    imageTint: '#64325F',
    primary: 'text-[#64325F]',
    primaryBgLight: 'bg-[#64325F]/25',
    badgeBg: 'bg-[#64325F]',
    primaryOpacity80: 'text-[#64325F]/80',
    borderOpacity60: 'border-[#64325F]/60',
  },
];

const explicitTeamColors: Record<string, string> = {
  'Herren 1': 'purple',
  'Herren 2': 'lightblue',
  'Damen 1': 'darkblue',
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
