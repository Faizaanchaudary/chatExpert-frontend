/**
 * Theme system types.
 * Matches backend theme_config and resolved config shape for preview/layout sync.
 */

export interface ThemeColors {
  background: string;
  text: string;
  accent: string;
  senderBubble: string;
  receiverBubble: string;
  senderText: string;
  receiverText: string;
  /** Optional border for message bubbles */
  bubbleBorder?: string;
  /** Optional shadow color for bubbles */
  bubbleShadow?: string;
}

export interface ThemeLayout {
  dateFormat: 'full' | 'timeOnly' | 'hidden';
  showPageNumbers: boolean;
  senderLabelStyle: 'name' | 'initial' | 'hidden';
}

export interface ThemeDefaults {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  messageBold?: boolean;
  messageItalic?: boolean;
  colors: ThemeColors;
  layout: ThemeLayout;
}

export interface OverridesSchemaField {
  type: 'string' | 'boolean' | 'number';
  enum?: string[];
  min?: number;
  max?: number;
}

export interface ThemeOverridesSchema {
  dateFormat?: OverridesSchemaField;
  showPageNumbers?: OverridesSchemaField;
  senderLabelStyle?: OverridesSchemaField;
}

export interface ThemeDefinition {
  id: string;
  displayName: string;
  previewThumbnail?: string;
  defaults: ThemeDefaults;
  overridesSchema: ThemeOverridesSchema;
}

/** Per-project theme config stored in Redux and sent to backend */
export interface ThemeConfigState {
  themeId: string;
  overrides: ThemeConfigOverrides;
}

export interface ThemeConfigOverrides {
  dateFormat?: 'full' | 'timeOnly' | 'hidden';
  showPageNumbers?: boolean;
  senderLabelStyle?: 'name' | 'initial' | 'hidden';
  fontFamily?: string;
  fontSize?: number;
  messageBold?: boolean;
  messageItalic?: boolean;
  imageLayout?: 'fullPage' | 'grid' | 'maxGrid';
  dateStyle?: 'short' | 'long' | 'dayName'; // New: date format style
  dateLanguage?: 'en' | 'fr' | 'es'; // New: language for dates
  customTitles?: {
    years?: Record<string, { text: string; bold?: boolean; italic?: boolean }>;
    months?: Record<string, { text: string; bold?: boolean; italic?: boolean }>;
  };
}

/** Stored on project (API): theme_config */
export interface ThemeConfigStored {
  themeId: string;
  schemaVersion: number;
  overrides: ThemeConfigOverrides;
}

/** Resolved config (defaults + overrides) for rendering */
export interface ResolvedThemeConfig extends ThemeDefaults {}
