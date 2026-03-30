import { ThemeDefinition } from './types';

export const sunsetTheme: ThemeDefinition = {
  id: 'sunset',
  displayName: 'Sunset',
  defaults: {
    fontFamily: 'Georgia, serif',
    fontSize: 11,
    lineHeight: 1.55,
    colors: {
      background: '#fff7ed',
      text: '#431407',
      accent: '#c2410c',
      senderBubble: '#fed7aa',
      receiverBubble: '#fffbeb',
      senderText: '#431407',
      receiverText: '#431407',
      bubbleBorder: '#fdba74',
      bubbleShadow: 'rgba(194,65,12,0.2)',
    },
    layout: {
      dateFormat: 'full',
      showPageNumbers: true,
      senderLabelStyle: 'name',
    },
  },
  overridesSchema: {
    dateFormat: { type: 'string', enum: ['full', 'timeOnly', 'hidden'] },
    showPageNumbers: { type: 'boolean' },
    senderLabelStyle: { type: 'string', enum: ['name', 'initial', 'hidden'] },
  },
};
