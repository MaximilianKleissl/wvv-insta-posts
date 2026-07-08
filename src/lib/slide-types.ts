/**
 * Shared type definitions for slide components
 * Centralized types to avoid duplication across components
 */

export interface SlideTitle {
  subtitle: string;
  title: string;
  label: string;
}

export interface MatchDayMetaData {
  date: string;
  location: string;
}

export interface SlideProps {
  id: string;
}
