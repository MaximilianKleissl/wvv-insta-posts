export type SlideFormatMode = 'square' | 'stories';

export interface SlideFormatConfig {
  width: number;
  height: number;
  label: string;
}

export const SLIDE_FORMATS: Record<SlideFormatMode, SlideFormatConfig> = {
  square: {
    width: 1080,
    height: 1080,
    label: 'Square',
  },
  stories: {
    width: 1080,
    height: 1920,
    label: 'Stories',
  },
} as const;

/**
 * Tailwind class fragments (and a few strings) shared across slide components,
 * keyed by format. Centralizing these keeps Open/Closed: adding a new format
 * only requires extending this map instead of editing every slide component.
 */
export interface SlideFormatClasses {
  mainGap: string;
  footerGap: string;
  sponsorLabel: string;
  sponsorGap: string;
  sponsorLogoHeight: string;
  headerHeight: string;
  headerPadding: string;
  titleSize: string;
  seasonClasses: string;
  headerLabelFlexDirection: string;
}

const FORMAT_CLASSES: Record<SlideFormatMode, SlideFormatClasses> = {
  square: {
    mainGap: 'gap-5',
    footerGap: 'gap-3',
    sponsorLabel: 'Der WVV bedankt sich bei seinen Sponsoren',
    sponsorGap: 'gap-8',
    sponsorLogoHeight: 'h-12',
    headerHeight: 'h-[300px]',
    headerPadding: 'p-10',
    titleSize: 'text-[49px]',
    seasonClasses: 'px-6 py-2 text-xl',
    headerLabelFlexDirection: 'flex-row',
  },
  stories: {
    mainGap: 'gap-4',
    footerGap: 'gap-3',
    sponsorLabel: 'Partner, Unterstützer und Förderer',
    sponsorGap: 'gap-12',
    sponsorLogoHeight: 'h-16',
    headerHeight: 'h-[700px]',
    headerPadding: 'p-14',
    titleSize: 'text-[80px]',
    seasonClasses: 'px-9 py-2 text-3xl',
    headerLabelFlexDirection: 'flex-col',
  },
};

export function getFormatClasses(mode: SlideFormatMode): SlideFormatClasses {
  return FORMAT_CLASSES[mode];
}

/** Returns the classes for a given format without cluttering templates with ternaries. */
export function pickFormatClass(
  format: SlideFormatMode,
  square: string | undefined,
  stories: string,
): string | undefined {
  return format === 'stories' ? stories : square;
}

export function getSlideDimensions(mode: SlideFormatMode = 'square'): SlideFormatConfig {
  return SLIDE_FORMATS[mode];
}

export function getSlideBoxStyle(mode: SlideFormatMode = 'square') {
  const { width, height } = getSlideDimensions(mode);
  return {
    width: `${width}px`,
    height: `${height}px`,
  } as const;
}

export function getSlideScale(mode: SlideFormatMode = 'square', maxWidth = 216, maxHeight = 216) {
  const { width, height } = getSlideDimensions(mode);
  return Math.min(maxWidth / width, maxHeight / height);
}

export function getSlidePreviewStyle(
  mode: SlideFormatMode = 'square',
  maxWidth = 216,
  maxHeight = 216,
) {
  const { width, height } = getSlideDimensions(mode);
  const scale = Math.min(maxWidth / width, maxHeight / height);

  return {
    width: `${width * scale}px`,
    height: `${height * scale}px`,
  } as const;
}
