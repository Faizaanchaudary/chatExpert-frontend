import { ThemeDefinition } from './types';

export const minimalTheme: ThemeDefinition = {
  id: 'minimal',
  displayName: 'Minimal',
  defaults: {
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: 10,
    lineHeight: 1.6,
    colors: {
      background: '#fafafa',
      text: '#333333',
      accent: '#666666',
      senderBubble: '#eeeeee',
      receiverBubble: '#ffffff',
      senderText: '#111111',
      receiverText: '#111111',
      bubbleBorder: '#e0e0e0',
      bubbleShadow: 'rgba(0,0,0,0.06)',
    },
    layout: {
      dateFormat: 'timeOnly',
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
