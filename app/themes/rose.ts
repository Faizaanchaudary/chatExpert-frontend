import { ThemeDefinition } from './types';

export const roseTheme: ThemeDefinition = {
  id: 'rose',
  displayName: 'Rose',
  defaults: {
    fontFamily: 'Georgia, serif',
    fontSize: 11,
    lineHeight: 1.5,
    colors: {
      background: '#fff1f2',
      text: '#4c0519',
      accent: '#be123c',
      senderBubble: '#fecdd3',
      receiverBubble: '#fff5f5',
      senderText: '#4c0519',
      receiverText: '#4c0519',
      bubbleBorder: '#fda4af',
      bubbleShadow: 'rgba(190,18,60,0.2)',
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
