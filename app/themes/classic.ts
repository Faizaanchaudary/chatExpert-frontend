import { ThemeDefinition } from './types';

export const classicTheme: ThemeDefinition = {
  id: 'classic',
  displayName: 'Classic',
  defaults: {
    fontFamily: 'Georgia',
    fontSize: 11,
    lineHeight: 1.5,
    colors: {
      // WhatsApp-style chat: brand green sent bubbles, dark grey received + white text
      background: '#ECE5DD',
      text: '#1a1a1a',
      accent: '#128C7E',
      // WhatsApp-style sent bubble (dark teal — same family as WhatsApp dark / default sent chip, not logo #25D366)
      senderBubble: '#005C4B',
      receiverBubble: '#2A3942',
      senderText: '#FFFFFF',
      receiverText: '#FFFFFF',
      bubbleBorder: 'transparent',
      bubbleShadow: 'rgba(0,0,0,0.12)',
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
