export type SlideFormatMode = 'portrait_4by5' | 'stories';

export interface SlideFormatConfig {
  width: number;
  height: number;
  label: string;
}

export const SLIDE_FORMATS: Record<SlideFormatMode, SlideFormatConfig> = {
  portrait_4by5: {
    width: 1080,
    height: 1350,
    label: 'Portrait 4:5',
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
  seasonClasses: string;
  headerLabelFlexDirection: string;
  teamTextSize: string;
}

const SHARED_FORMAT_CLASSES = {
  mainGap: 'gap-4',
  footerGap: 'gap-3',
  sponsorLabel: 'Partner, Unterstützer und Förderer',
  sponsorGap: 'gap-12',
  sponsorLogoHeight: 'h-16',
  headerPadding: 'p-14',
  seasonClasses: 'px-9 py-2 text-3xl',
};

const FORMAT_CLASSES: Record<SlideFormatMode, SlideFormatClasses> = {
  portrait_4by5: {
    ...SHARED_FORMAT_CLASSES,
    headerHeight: 'h-[350px]',
    headerLabelFlexDirection: 'flex-row',
    teamTextSize: 'text-3xl',
  },
  stories: {
    ...SHARED_FORMAT_CLASSES,
    headerHeight: 'h-[700px]',
    headerLabelFlexDirection: 'flex-col',
    teamTextSize: 'text-4xl',
  },
};

export function getFormatClasses(mode: SlideFormatMode): SlideFormatClasses {
  return FORMAT_CLASSES[mode];
}

export function getSlideDimensions(mode: SlideFormatMode = 'portrait_4by5'): SlideFormatConfig {
  return SLIDE_FORMATS[mode];
}

export function getSlideBoxStyle(mode: SlideFormatMode = 'portrait_4by5') {
  const { width, height } = getSlideDimensions(mode);
  return {
    width: `${width}px`,
    height: `${height}px`,
  } as const;
}

export function getSlideScale(
  mode: SlideFormatMode = 'portrait_4by5',
  maxWidth = 216,
  maxHeight = 216,
) {
  const { width, height } = getSlideDimensions(mode);
  return Math.min(maxWidth / width, maxHeight / height);
}

export function getSlidePreviewStyle(
  mode: SlideFormatMode = 'portrait_4by5',
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
