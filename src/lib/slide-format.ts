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
