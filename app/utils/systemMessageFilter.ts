import { IMessage } from '../interfaces/IMessage';

const SYSTEM_SENDER_NAMES = ['system', 'whatsapp', 'notification'];

const SYSTEM_PHRASES = [
  'end-to-end encrypted',
  'only people in this chat can read',
  'learn more',
  'security code',
  'security code changed',
  'tap to learn more',
  'created group',
  'added you',
  'left the group',
  'changed the subject',
  'message timer was updated',
  'invalid date',
  'messages and calls are',
  'deleted this message',
  'you deleted this message',
];

/**
 * Returns true if the message should be hidden (system / WhatsApp meta).
 */
export function isSystemMessage(msg: { senderName?: string; text?: string }): boolean {
  const name = (msg.senderName || '').trim().toLowerCase();
  const text = (msg.text || '').trim().toLowerCase();

  if (SYSTEM_SENDER_NAMES.some(s => name === s || name.includes(s))) return true;
  if (SYSTEM_PHRASES.some(phrase => text.includes(phrase))) return true;
  if (/^\s*$/.test(text)) return true;

  return false;
}

/**
 * Filter out system messages from a list.
 */
export function filterSystemMessages(messages: IMessage[]): IMessage[] {
  return messages.filter(m => !isSystemMessage(m));
}

/**
 * Get the sender name that appears most often (assumed to be "me").
 */
export function getMostFrequentSenderName(messages: IMessage[]): string | null {
  if (messages.length === 0) return null;
  const counts: Record<string, number> = {};
  for (const m of messages) {
    const name = (m.senderName || '').trim();
    if (!name) continue;
    counts[name] = (counts[name] || 0) + 1;
  }
  let best: string | null = null;
  let max = 0;
  for (const [name, count] of Object.entries(counts)) {
    if (count > max) {
      max = count;
      best = name;
    }
  }
  return best;
}
