import { ThemeDefinition } from './types';

export const modernTheme: ThemeDefinition = {
  id: 'modern',
  displayName: 'Modern',
  defaults: {
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: 11,
    lineHeight: 1.5,
    colors: {
      background: '#ffffff',
      text: '#1f2937',
      accent: '#3b82f6',
      senderBubble: '#dbeafe',
      receiverBubble: '#f3f4f6',
      senderText: '#1e40af',
      receiverText: '#1f2937',
      bubbleBorder: '#93c5fd',
      bubbleShadow: 'rgba(59,130,246,0.2)',
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
