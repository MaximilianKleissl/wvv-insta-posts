export interface TeamColorScheme {
  name: string;
  imageTint: string;
  logoFilter: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryBg: string;
  primaryBgLight: string;
  primaryBorder: string;
  accent: string;
  leftPanelBg: string;
  badgeBg: string;
  highlightBg: string;
  dateText: string;
  resultBg: string;
  resultBgOpacity: string;
  primaryOpacity80: string;
  borderOpacity20: string;
  borderOpacity60: string;
  borderOpacity95: string;
}

const colorSchemes: TeamColorScheme[] = [
  {
    name: 'green',
    imageTint: '#047A3F',
    logoFilter: 'none',
    primary: 'text-green-800',
    primaryLight: 'text-green-700',
    primaryDark: 'text-green-900',
    primaryBg: 'bg-green-50',
    primaryBgLight: 'bg-green-50/25',
    primaryBorder: 'border-green-700',
    accent: 'text-green-100',
    leftPanelBg: 'bg-green-800/25',
    badgeBg: 'bg-green-800',
    highlightBg: 'bg-green-400/80',
    dateText: 'text-green-700',
    resultBg: 'bg-green-900',
    resultBgOpacity: 'bg-green-900/90',
    primaryOpacity80: 'text-green-800/80',
    borderOpacity20: 'border-green-700/20',
    borderOpacity60: 'border-green-700/60',
    borderOpacity95: 'border-green-700/95',
  },
  {
    name: 'lightblue',
    imageTint: '#2B5C61',
    logoFilter: 'hue-rotate(150deg) saturate(0.8) brightness(1.2)',
    primary: 'text-[#2B5C61]',
    primaryLight: 'text-[#2B5C61]',
    primaryDark: 'text-[#21474B]',
    primaryBg: 'bg-[#A3E4E6]',
    primaryBgLight: 'bg-[#A3E4E6]/25',
    primaryBorder: 'border-[#2B5C61]',
    accent: 'text-[#A3E4E6]',
    leftPanelBg: 'bg-[#A3E4E6]/25',
    badgeBg: 'bg-[#2B5C61]',
    highlightBg: 'bg-[#A3E4E6]/80',
    dateText: 'text-[#2B5C61]',
    resultBg: 'bg-[#21474B]',
    resultBgOpacity: 'bg-[#21474B]/90',
    primaryOpacity80: 'text-[#2B5C61]/80',
    borderOpacity20: 'border-[#2B5C61]/20',
    borderOpacity60: 'border-[#2B5C61]/60',
    borderOpacity95: 'border-[#2B5C61]/95',
  },
  {
    name: 'darkblue',
    imageTint: '#21263F',
    logoFilter: 'hue-rotate(190deg) saturate(0.7) brightness(0.6)',
    primary: 'text-[#21263F]',
    primaryLight: 'text-[#21263F]',
    primaryDark: 'text-[#21263F]',
    primaryBg: 'bg-[#21263F]',
    primaryBgLight: 'bg-[#21263F]/25',
    primaryBorder: 'border-[#21263F]',
    accent: 'text-[#21263F]',
    leftPanelBg: 'bg-[#21263F]/25',
    badgeBg: 'bg-[#21263F]',
    highlightBg: 'bg-[#21263F]/80',
    dateText: 'text-[#21263F]',
    resultBg: 'bg-[#21263F]',
    resultBgOpacity: 'bg-[#21263F]/90',
    primaryOpacity80: 'text-[#21263F]/80',
    borderOpacity20: 'border-[#21263F]/20',
    borderOpacity60: 'border-[#21263F]/60',
    borderOpacity95: 'border-[#21263F]/95',
  },
  {
    name: 'purple',
    imageTint: '#64325F',
    logoFilter: 'hue-rotate(285deg) saturate(0.8) brightness(0.8)',
    primary: 'text-[#64325F]',
    primaryLight: 'text-[#64325F]',
    primaryDark: 'text-[#64325F]',
    primaryBg: 'bg-[#64325F]',
    primaryBgLight: 'bg-[#64325F]/25',
    primaryBorder: 'border-[#64325F]',
    accent: 'text-[#64325F]',
    leftPanelBg: 'bg-[#64325F]/25',
    badgeBg: 'bg-[#64325F]',
    highlightBg: 'bg-[#64325F]/80',
    dateText: 'text-[#64325F]',
    resultBg: 'bg-[#64325F]',
    resultBgOpacity: 'bg-[#64325F]/90',
    primaryOpacity80: 'text-[#64325F]/80',
    borderOpacity20: 'border-[#64325F]/20',
    borderOpacity60: 'border-[#64325F]/60',
    borderOpacity95: 'border-[#64325F]/95',
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

export function getTeamColorWithOpacity(teamName: string, opacity: number): string {
  return `${getTeamColorScheme(teamName).badgeBg}/${opacity}`;
}
