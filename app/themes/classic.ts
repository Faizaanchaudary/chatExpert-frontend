import { ThemeDefinition } from './types';

export const classicTheme: ThemeDefinition = {
  id: 'classic',
  displayName: 'Classic',
  defaults: {
    fontFamily: 'Georgia',
    fontSize: 11,
    lineHeight: 1.5,
    colors: {
      background: '#ffffff',
      text: '#1a1a1a',
      accent: '#2c5282',
      senderBubble: '#e1ffc7',
      receiverBubble: '#ffffff',
      senderText: '#000000',
      receiverText: '#000000',
      bubbleBorder: '#d4e5d0',
      bubbleShadow: 'rgba(0,0,0,0.08)',
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
