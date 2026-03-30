import { ThemeDefinition } from './types';

export const forestTheme: ThemeDefinition = {
  id: 'forest',
  displayName: 'Forest',
  defaults: {
    fontFamily: 'Georgia, serif',
    fontSize: 11,
    lineHeight: 1.5,
    colors: {
      background: '#f0fdf4',
      text: '#14532d',
      accent: '#15803d',
      senderBubble: '#bbf7d0',
      receiverBubble: '#f7fee7',
      senderText: '#14532d',
      receiverText: '#14532d',
      bubbleBorder: '#86efac',
      bubbleShadow: 'rgba(21,128,61,0.2)',
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
