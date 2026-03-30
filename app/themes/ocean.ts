import { ThemeDefinition } from './types';

export const oceanTheme: ThemeDefinition = {
  id: 'ocean',
  displayName: 'Ocean',
  defaults: {
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: 11,
    lineHeight: 1.5,
    colors: {
      background: '#e8f4fc',
      text: '#0c4a6e',
      accent: '#0284c7',
      senderBubble: '#7dd3fc',
      receiverBubble: '#f0f9ff',
      senderText: '#0c4a6e',
      receiverText: '#0c4a6e',
      bubbleBorder: '#38bdf8',
      bubbleShadow: 'rgba(2,132,199,0.25)',
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
