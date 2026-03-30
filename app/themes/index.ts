import { ThemeDefinition, ThemeConfigOverrides, ResolvedThemeConfig } from './types';
import { classicTheme } from './classic';
import { minimalTheme } from './minimal';
import { modernTheme } from './modern';
import { cozyTheme } from './cozy';
import { professionalTheme } from './professional';
import { oceanTheme } from './ocean';
import { sunsetTheme } from './sunset';
import { forestTheme } from './forest';
import { roseTheme } from './rose';

export const themes: ThemeDefinition[] = [
  classicTheme,
  minimalTheme,
  modernTheme,
  cozyTheme,
  professionalTheme,
  oceanTheme,
  sunsetTheme,
  forestTheme,
  roseTheme,
];

export const themeMap: Record<string, ThemeDefinition> = themes.reduce(
  (acc, t) => {
    acc[t.id] = t;
    return acc;
  },
  {} as Record<string, ThemeDefinition>
);

export const DEFAULT_THEME_ID = 'classic';

export function getTheme(themeId: string): ThemeDefinition {
  return themeMap[themeId] || themeMap[DEFAULT_THEME_ID];
}

const OVERRIDES_ALLOWLIST: (keyof ThemeConfigOverrides)[] = [
  'dateFormat',
  'showPageNumbers',
  'senderLabelStyle',
  'fontFamily',
  'fontSize',
  'messageBold',
  'messageItalic',
  'imageLayout',
  'dateStyle',
  'dateLanguage',
  'customTitles',
];

const FALLBACK_OVERRIDES_SCHEMA: Partial<Record<keyof ThemeConfigOverrides, { type: 'string' | 'boolean' | 'number'; enum?: string[]; min?: number; max?: number }>> = {
  fontFamily: {
    type: 'string',
    enum: [
      'Georgia',
      'Helvetica, Arial, sans-serif',
      'Times New Roman, Times, serif',
      'Courier New, Courier, monospace',
    ],
  },
  fontSize: { type: 'number', min: 9, max: 18 },
  messageBold: { type: 'boolean' },
  messageItalic: { type: 'boolean' },
  imageLayout: { type: 'string', enum: ['fullPage', 'grid', 'maxGrid'] },
  dateStyle: { type: 'string', enum: ['short', 'long', 'dayName'] },
  dateLanguage: { type: 'string', enum: ['en', 'fr', 'es'] },
};

function validateOverride(
  key: keyof ThemeConfigOverrides,
  value: unknown,
  schema: { type: string; enum?: string[]; min?: number; max?: number }
): unknown {
  if (schema.type === 'boolean') return typeof value === 'boolean' ? value : false;
  if (schema.type === 'number') {
    if (typeof value !== 'number' || Number.isNaN(value)) return schema.min ?? 10;
    const min = schema.min ?? value;
    const max = schema.max ?? value;
    return Math.min(max, Math.max(min, value));
  }
  if (schema.type === 'string' && schema.enum?.length) {
    return typeof value === 'string' && schema.enum.includes(value) ? value : schema.enum[0];
  }
  return value;
}

/**
 * Resolve full config from themeId + overrides (same logic as backend for preview sync).
 */
export function resolveThemeConfig(
  themeId: string,
  overrides: ThemeConfigOverrides = {}
): ResolvedThemeConfig {
  const theme = getTheme(themeId);
  const validated: ThemeConfigOverrides = {};

  OVERRIDES_ALLOWLIST.forEach((key) => {
    const schema = theme.overridesSchema[key] || FALLBACK_OVERRIDES_SCHEMA[key];
    if (overrides[key] === undefined) return;
    
    // Special handling for customTitles - pass through without validation
    if (key === 'customTitles') {
      validated[key] = overrides[key] as any;
      return;
    }
    
    if (!schema) return;
    validated[key] = validateOverride(key, overrides[key], schema) as ThemeConfigOverrides[keyof ThemeConfigOverrides];
  });

  const layout = { ...theme.defaults.layout };
  if (validated.dateFormat !== undefined) layout.dateFormat = validated.dateFormat;
  if (validated.showPageNumbers !== undefined) layout.showPageNumbers = validated.showPageNumbers;
  if (validated.senderLabelStyle !== undefined) layout.senderLabelStyle = validated.senderLabelStyle;

  return {
    ...theme.defaults,
    fontFamily:
      validated.fontFamily !== undefined ? validated.fontFamily : theme.defaults.fontFamily,
    fontSize:
      validated.fontSize !== undefined ? validated.fontSize : theme.defaults.fontSize,
    messageBold: validated.messageBold !== undefined ? validated.messageBold : false,
    messageItalic: validated.messageItalic !== undefined ? validated.messageItalic : false,
    imageLayout: validated.imageLayout !== undefined ? validated.imageLayout : 'fullPage',
    dateStyle: validated.dateStyle !== undefined ? validated.dateStyle : 'long',
    dateLanguage: validated.dateLanguage !== undefined ? validated.dateLanguage : 'en',
    customTitles: validated.customTitles !== undefined ? validated.customTitles : { years: {}, months: {} },
    layout,
  };
}

export * from './types';
export {
  classicTheme,
  minimalTheme,
  modernTheme,
  cozyTheme,
  professionalTheme,
  oceanTheme,
  sunsetTheme,
  forestTheme,
  roseTheme,
};
