import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { getTeamColorScheme, hexToRgba } from '@/lib/team-colors';

/**
 * Opacities of every derived color. Keeping them here means the scheme data can
 * stay plain hex and no component has to reach for an opacity of its own.
 */
const OPACITY = {
  surface: 0.25,
  edge: 0.6,
  mutedText: 0.8,
  hairline: 0.2,
  shadow: 0.12,
  faintSurface: 0.06,
  faintBorder: 0.35,
} as const;

/** Fade-out of the header band. 182/255 is the alpha of a "#RRGGBBb6" color. */
const HEADER_FADE_ALPHA = 182 / 255;

/**
 * Single source of truth for every color a slide paints with. Takes a team
 * name, a ref or a getter, so an editor input can re-theme while typing.
 *
 * Returns plain values rather than refs because most colors are handed to child
 * component props, and `vue-tsc` does not unwrap refs at those call sites.
 */
export function useTeamColors(teamName: MaybeRefOrGetter<string>) {
  const scheme = computed(() => getTeamColorScheme(toValue(teamName)));

  const tint = computed(() => scheme.value.tint);
  const ink = computed(() => scheme.value.ink ?? tint.value);
  const surface = computed(() => scheme.value.surface ?? ink.value);
  const edge = computed(() => scheme.value.edge ?? ink.value);

  /** The tint at an arbitrary alpha, for hairlines, decorations and shadows. */
  const getDecorationColor = (alpha: number) => hexToRgba(tint.value, alpha);

  /** Solid dark color: header band and the two-tone logo knock-out. */
  const getDarkColor = () => tint.value;
  /** Solid color for text, icons and badges. */
  const getInkColor = () => ink.value;
  /** Ink at reduced strength, for secondary labels. */
  const getMutedTextColor = () => hexToRgba(ink.value, OPACITY.mutedText);
  /** Card wash behind the content of a slide. */
  const getSurfaceColor = () => hexToRgba(surface.value, OPACITY.surface);
  /** Card border. */
  const getEdgeColor = () => hexToRgba(edge.value, OPACITY.edge);
  /** Divider lines between rows. */
  const getHairlineColor = () => getDecorationColor(OPACITY.hairline);
  /** Soft drop shadow below a card. */
  const getShadowColor = () => getDecorationColor(OPACITY.shadow);
  /** Background tint of a card that previews a team's theme, e.g. in the editor. */
  const getTintedSurfaceStyle = () => ({
    background: getDecorationColor(OPACITY.faintSurface),
    borderColor: getDecorationColor(OPACITY.faintBorder),
  });

  /** Header band: solid on the left, fading out so the action image shows through. */
  const getHeaderGradient = () =>
    `linear-gradient(90deg, ${tint.value} 0%, ${getDecorationColor(HEADER_FADE_ALPHA)} 55%, transparent 100%)`;

  /** Vignette that pulls the team color into the edges of the slide. */
  const getVignetteGradient = () =>
    `radial-gradient(circle at center, transparent 0%, transparent 34%, ${tint.value} 100%)`;

  return {
    getDarkColor,
    getInkColor,
    getMutedTextColor,
    getSurfaceColor,
    getEdgeColor,
    getHairlineColor,
    getShadowColor,
    getDecorationColor,
    getTintedSurfaceStyle,
    getHeaderGradient,
    getVignetteGradient,
  };
}
