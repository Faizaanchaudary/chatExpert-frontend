import { ThemeDefinition } from './types';

export const cozyTheme: ThemeDefinition = {
  id: 'cozy',
  displayName: 'Cozy',
  defaults: {
    fontFamily: 'Georgia, serif',
    fontSize: 12,
    lineHeight: 1.6,
    colors: {
      background: '#fff9f0',
      text: '#2d2d2d',
      accent: '#8b6914',
      senderBubble: '#f5e6d3',
      receiverBubble: '#ffffff',
      senderText: '#2d2d2d',
      receiverText: '#2d2d2d',
      bubbleBorder: '#e8d4b8',
      bubbleShadow: 'rgba(139,105,20,0.15)',
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
