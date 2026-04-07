export type WhatsAppMessageType = 'text' | 'image' | 'video' | 'audio' | 'document';

export type MediaFilesMap = Record<string, string>;

/**
 * REQUIRED output shape (do not change).
 */
export interface WhatsAppParsedMessage {
  id: string;
  sender: string;
  timestamp: number;
  text: string;
  type: WhatsAppMessageType;
  mediaUri?: string;
}

/**
 * Internal/detailed form used during integration (keeps original date/time
 * strings deterministically, without re-parsing from timestamp).
 */
export type WhatsAppParsedMessageDetailed = WhatsAppParsedMessage & {
  date: string; // "12/05/24" or "12/05/2024"
  time: string; // "10:22" or "10:22 PM"
  mediaFileName?: string; // "IMG-1234.jpg"
};

// Example:
// [12/05/24, 10:22] Ali: Hello
const USER_LINE_RE =
  /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?(?:[\u202F\s]?[APMapm]{2})?)\]\s([^:]+):\s([\s\S]*)$/;

// Example:
// 17/07/2025, 12:32 pm - Ali: Hello
// 17/07/2025, 12:32 PM - Ali: Hello
const USER_LINE_DASH_RE =
  /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?(?:[\u202F\s]?[APMapm]{2})?)\s-\s([^:]+):\s([\s\S]*)$/;

// Example system/meta line (no "Name:"):
// [12/05/24, 10:22] Messages and calls are end-to-end encrypted.
const SYSTEM_LINE_RE =
  /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?(?:[\u202F\s]?[APMapm]{2})?)\]\s([\s\S]*)$/;

// Example system/meta line:
// 17/07/2025, 12:32 pm - Messages and calls are end-to-end encrypted.
const SYSTEM_LINE_DASH_RE =
  /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?(?:[\u202F\s]?[APMapm]{2})?)\s-\s([\s\S]*)$/;

function normalizeNewlines(input: string): string {
  return input.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function toFileUri(pathOrUri: string): string {
  if (!pathOrUri) return pathOrUri;
  if (pathOrUri.startsWith('file://')) return pathOrUri;
  return `file://${pathOrUri}`;
}

/**
 * Step 1 — build a deterministic filename → local file:// URI map.
 */
export function buildMediaFilesMap(
  mediaFiles: Array<{ name: string; path: string }>,
): MediaFilesMap {
  const map: MediaFilesMap = Object.create(null);
  for (const f of mediaFiles) {
    if (!f?.name || !f?.path) continue;
    map[f.name] = toFileUri(f.path);
  }
  return map;
}

function parseDateParts(dateStr: string): { year: number; month: number; day: number } | null {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const a = Number(parts[0]);
  const b = Number(parts[1]);
  let year = Number(parts[2]);
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(year)) return null;

  // 2-digit year → 20xx (WhatsApp exports are modern)
  if (year < 100) year += 2000;

  // WhatsApp exports are locale-dependent (dd/mm or mm/dd).
  // Deterministic heuristic:
  // - if first part > 12 → it's day/month
  // - else if second part > 12 → it's month/day
  // - else default to day/month (most common outside US)
  let day: number;
  let month: number;
  if (a > 12) {
    day = a;
    month = b;
  } else if (b > 12) {
    month = a;
    day = b;
  } else {
    day = a;
    month = b;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

function parseTimeParts(timeStr: string): { hours: number; minutes: number } | null {
  // "10:22", "10:22 PM", "10:22pm"
  const trimmed = (timeStr || '').trim();
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:[\u202F\s]?([APap][Mm]))?$/.exec(trimmed);
  if (!m) return null;
  let hours = Number(m[1]);
  const minutes = Number(m[2]);
  const ampm = m[4]?.toLowerCase();
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (minutes < 0 || minutes > 59) return null;

  if (ampm) {
    if (hours < 1 || hours > 12) return null;
    if (ampm === 'am') {
      hours = hours === 12 ? 0 : hours;
    } else {
      hours = hours === 12 ? 12 : hours + 12;
    }
  } else {
    if (hours < 0 || hours > 23) return null;
  }

  return { hours, minutes };
}

/**
 * Step 9 — timestamp handling.
 * Deterministic: for the same input date/time, always returns identical timestamp.
 */
export function toUnixTimestamp(dateStr: string, timeStr: string): number {
  const date = parseDateParts(dateStr);
  const time = parseTimeParts(timeStr);
  if (!date || !time) return 0;
  const d = new Date(date.year, date.month - 1, date.day, time.hours, time.minutes, 0, 0);
  const ts = d.getTime();
  return Number.isFinite(ts) ? ts : 0;
}

function detectMedia(messageText: string): {
  type: WhatsAppMessageType;
  fileName?: string;
} {
  const raw = (messageText || '').trim();

  // WhatsApp often formats: "IMG-1234.jpg (file attached)"
  // Also seen: "<attached: IMG-1234.jpg>"
  const attachedMatch = /<attached:\s*([^>]+)>/i.exec(raw);
  const candidateText = attachedMatch?.[1]?.trim() || raw;
  const withoutSuffix = candidateText.replace(/\s*\(file attached\)\s*$/i, '').trim();

  const img = /(IMG-[^\s]+\.(?:jpg|jpeg|png))/i.exec(withoutSuffix);
  if (img?.[1]) return { type: 'image', fileName: img[1] };

  const vid = /(VID-[^\s]+\.(?:mp4))/i.exec(withoutSuffix);
  if (vid?.[1]) return { type: 'video', fileName: vid[1] };

  const aud = /((?:AUD|PTT)-[^\s]+\.(?:opus|mp3|m4a|aac))/i.exec(withoutSuffix);
  if (aud?.[1]) return { type: 'audio', fileName: aud[1] };

  const doc = /(DOC-[^\s]+\.(?:pdf))/i.exec(withoutSuffix);
  if (doc?.[1]) return { type: 'document', fileName: doc[1] };

  return { type: 'text' };
}

/**
 * Deterministic, single-pass WhatsApp export parser.
 *
 * Requirements:
 * - Line-by-line sequential parsing
 * - No sorting/grouping/reconstruction that changes order
 * - Multi-line messages are appended to the previous message
 * - Media detection and linking via mediaFilesMap
 */
export function parseWhatsAppChatTextDetailed(
  chatText: string,
  mediaFilesMap: MediaFilesMap,
): { messages: WhatsAppParsedMessageDetailed[]; mediaLinked: number } {
  const text = normalizeNewlines(chatText || '');
  const lines = text.split('\n');

  const messages: WhatsAppParsedMessageDetailed[] = [];
  let current: WhatsAppParsedMessageDetailed | null = null;
  let sequence = 0;
  let mediaLinked = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === '') {
      // Empty line is a valid part of a multiline message
      if (current) current.text += '\n';
      continue;
    }

    const userMatch = USER_LINE_RE.exec(line) || USER_LINE_DASH_RE.exec(line);
    if (userMatch) {
      if (current) messages.push(current);

      const date = userMatch[1];
      const time = userMatch[2];
      const sender = userMatch[3].trim();
      const msgText = userMatch[4] ?? '';

      const timestamp = toUnixTimestamp(date, time);
      const media = detectMedia(msgText);
      const mediaUri = media.fileName ? mediaFilesMap[media.fileName] : undefined;
      if (mediaUri) mediaLinked++;

      current = {
        id: `wa-${sequence++}`,
        sender,
        timestamp,
        text: msgText,
        type: media.type,
        ...(mediaUri ? { mediaUri } : {}),
        date,
        time,
        ...(media.fileName ? { mediaFileName: media.fileName } : {}),
      };
      continue;
    }

    const sysMatch = SYSTEM_LINE_RE.exec(line) || SYSTEM_LINE_DASH_RE.exec(line);
    if (sysMatch) {
      // Treat system lines as standalone deterministic messages to prevent
      // accidental multiline-append into the previous user message.
      if (current) messages.push(current);

      const date = sysMatch[1];
      const time = sysMatch[2];
      const msgText = sysMatch[3] ?? '';
      const timestamp = toUnixTimestamp(date, time);

      current = {
        id: `wa-${sequence++}`,
        sender: 'system',
        timestamp,
        text: msgText,
        type: 'text',
        date,
        time,
      };
      continue;
    }

    // Step 5 — multiline append
    if (current) {
      current.text += `\n${line}`;
    }
  }

  if (current) messages.push(current);
  return { messages, mediaLinked };
}

/**
 * Exact required return format.
 */
export function parseWhatsAppChatText(
  chatText: string,
  mediaFilesMap: MediaFilesMap,
): { messages: WhatsAppParsedMessage[]; mediaLinked: number } {
  const { messages: detailed, mediaLinked } = parseWhatsAppChatTextDetailed(
    chatText,
    mediaFilesMap,
  );
  // Strip the extra fields deterministically.
  const messages: WhatsAppParsedMessage[] = detailed.map(m => ({
    id: m.id,
    sender: m.sender,
    timestamp: m.timestamp,
    text: m.text,
    type: m.type,
    ...(m.mediaUri ? { mediaUri: m.mediaUri } : {}),
  }));
  return { messages, mediaLinked };
}

