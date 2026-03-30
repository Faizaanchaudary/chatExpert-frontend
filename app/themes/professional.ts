import { ThemeDefinition } from './types';

export const professionalTheme: ThemeDefinition = {
  id: 'professional',
  displayName: 'Professional',
  defaults: {
    fontFamily: 'Times New Roman, Times, serif',
    fontSize: 11,
    lineHeight: 1.5,
    colors: {
      background: '#ffffff',
      text: '#000000',
      accent: '#374151',
      senderBubble: '#f0f0f0',
      receiverBubble: '#ffffff',
      senderText: '#000000',
      receiverText: '#000000',
      bubbleBorder: '#d1d5db',
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
