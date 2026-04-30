/**
 * Preview pages renderer — WhatsApp-style layout.
 * Height-based pagination to match selected page dimensions. Text preserves newlines.
 */
import React, { useMemo, useState, useRef, useCallback, useEffect, useDeferredValue } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  InteractionManager,
  ActivityIndicator,
  FlatList,
  Animated,
  PanResponder,
  TouchableOpacity,
} from 'react-native';
import { IMessage } from '../../interfaces/IMessage';
import { ResolvedThemeConfig } from '../../themes/types';
import { appendPreviewDebugLog, previewDebugLogPath } from '../../utils/previewDebugLogger';

// Global height cache — persists across book switches, keyed by "msgId_containerWidth_[withName|noName]"
const globalHeightCache: Record<string, number> = {};

// Match PDF dimensions exactly - same as backend pdfService.js
const PAGE_DIMENSIONS = {
  square_14x14: {
    width: 595,
    height: 595,
  },
  standard_14_8x21: {
    width: 560,
    height: 820, // preview height — slightly taller than PDF (794) for better visual spacing
  },
};

// Overhead: page paddingVertical*2 (16*2=32) + bottom safety buffer (16).
// The buffer covers: last message marginBottom (3), page number area at bottom:8,
// and a small cushion so the last bubble never visually touches the bottom edge.
const PAGE_OVERHEAD = 48;
const DEBUG_PREVIEW_LAYOUT = false;
// Header estimates for pagination (tuned to match rendered blocks with current styles).
// Previous values under-counted by ~7px per header in debug runs, causing occasional clipping.
const YEAR_HEADER_ESTIMATE = 67;
const MONTH_HEADER_ESTIMATE = 46;
const DATE_HEADER_ESTIMATE = 40;
// Extra guard for split fragments: measured text slices can still render taller by ~30-50px.
const SPLIT_FRAGMENT_SAFETY = 56;
const PAGE_NUMBER_RESERVE = 12;
const ATOMIC_BOTTOM_SAFETY = 8;
const LONG_TEXT_ATOMIC_SAFETY = 18;
const VERY_LONG_TEXT_ATOMIC_SAFETY = 15;
const LONG_DATE_FIRST_FRAG_SAFETY = 42;
const LONG_SPLIT_FRAGMENT_FUDGE = 44;
const LONG_SPLIT_LAST_FRAGMENT_FUDGE = 28;
const MEDIA_ATOMIC_SAFETY = 18;

/** System message filter - same as backend PDF generation */
const SYSTEM_SENDER_NAMES = ['system', 'whatsapp', 'notification'];
const SYSTEM_PHRASES = [
  'end-to-end encrypted', 'only people in this chat can read', 'learn more', 'security code',
  'security code changed', 'tap to learn more', 'created group', 'added you', 'left the group',
  'changed the subject', 'message timer was updated', 'invalid date', 'messages and calls are',
  'deleted this message', 'you deleted this message',
];

function isSystemMessage(msg: IMessage): boolean {
  const name = String(msg.senderName || '').trim().toLowerCase();
  const text = String(msg.text || '').trim().toLowerCase();
  if (SYSTEM_SENDER_NAMES.some((s) => name === s || name.includes(s))) return true;
  if (SYSTEM_PHRASES.some((phrase) => text.includes(phrase))) return true;
  if (/^\s*$/.test(text)) return true;
  return false;
}

function filterSystemMessages(messages: IMessage[]): IMessage[] {
  return (messages || []).filter((m) => !isSystemMessage(m));
}

/** Plain text only — pagination may split across pages (aligned with pdfService). */
function isSplittableTextMessage(msg: IMessage): boolean {
  const t = msg.messageType;
  if (t === 'image' || t === 'video' || t === 'audio') return false;
  const text = String(msg.text || '');
  if (!text.trim()) return false;
  return t === 'text' || t === 'unknown' || !t;
}

function snapUtf16PrefixEnd(str: string, end: number): number {
  if (end <= 0) return 0;
  if (end < str.length) {
    const c = str.charCodeAt(end);
    if (c >= 0xdc00 && c <= 0xdfff) return end - 1;
  }
  if (end > 0) {
    const c = str.charCodeAt(end - 1);
    if (c >= 0xd800 && c <= 0xdbff) {
      if (end < str.length) return end + 1;
      return end - 1;
    }
  }
  return end;
}

/** Height estimate for a text slice — mirrors backend text bubble formula using preview widths. */
function estimateTextSliceHeightPreview(
  containerWidth: number,
  fontSize: number,
  lineHeight: number,
  text: string,
  showName: boolean,
  messageGap: number
): number {
  // Match visible page content width: page has paddingHorizontal: 12 on both sides.
  const contentWidth = Math.max(1, containerWidth - 24);
  const bubbleWidth = contentWidth * 0.92 - 20;
  const textWidth = Math.max(40, bubbleWidth - 60);
  const charsPerLine = Math.max(1, Math.floor(textWidth / (fontSize * 0.55)));
  const str = String(text || '');
  const lineCount = str.split('\n').reduce((acc, line) => {
    return acc + Math.max(1, Math.ceil((line.length || 1) / charsPerLine));
  }, 0);
  const textH = lineCount * fontSize * lineHeight;
  const nameH = showName ? fontSize - 1 + 2 : 0;
  return nameH + textH + 12 + messageGap;
}

function longestFittingPrefixPreview(
  containerWidth: number,
  fontSize: number,
  lineHeight: number,
  messageGap: number,
  remaining: string,
  maxHeight: number,
  withName: boolean
): number {
  const measureLen = (len: number) => {
    const end = snapUtf16PrefixEnd(remaining, len);
    if (end < 1) return Number.POSITIVE_INFINITY;
    const slice = remaining.slice(0, end);
    return estimateTextSliceHeightPreview(containerWidth, fontSize, lineHeight, slice, withName, messageGap);
  };

  const fullEnd = snapUtf16PrefixEnd(remaining, remaining.length);
  const fullH = measureLen(fullEnd);
  if (fullH <= maxHeight) return fullEnd;

  let lo = 1;
  let hi = fullEnd;
  let best = 0;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const midAdj = snapUtf16PrefixEnd(remaining, mid);
    if (midAdj < 1) {
      lo = mid + 1;
      continue;
    }
    const h = measureLen(midAdj);
    if (h <= maxHeight) {
      best = midAdj;
      lo = midAdj + 1;
    } else {
      hi = midAdj - 1;
    }
  }
  if (best === 0) {
    best = snapUtf16PrefixEnd(remaining, 1);
    if (best < 1) best = 1;
  }
  return best;
}

/** Sender that appears most often = "me" (right side), same as Chat screen. */
function getMostFrequentSenderName(msgs: IMessage[]): string | null {
  if (msgs.length === 0) return null;
  const counts: Record<string, number> = {};
  for (const m of msgs) {
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

function isMessageFromMe(senderName: string, meName: string | null): boolean {
  if (!meName) return false;
  return (senderName || '').trim() === meName;
}

function stripMediaTitleLine(text: string, isVideoOrAudio: boolean): string {
  if (!isVideoOrAudio || !text) return text || '';
  const lines = String(text).split('\n');
  if (lines.length === 0) return '';
  const firstLine = lines[0].trim();
  // Remove media filename title line like:
  // "VID-20200404-WA0001.mp4 (file attached)" or "(fichier joint)"
  const mediaTitlePattern = /^[^\n]+\.(mp4|opus|ogg|m4a|aac|wav|mov|avi|mkv|3gp)(\s*\([^)]*\))?\s*$/i;
  if (mediaTitlePattern.test(firstLine)) {
    return lines.slice(1).join('\n').trim();
  }
  return String(text).trim();
}

function mapCssFontFamilyToReactNative(fontFamily?: string): string | undefined {
  if (!fontFamily) return undefined;
  if (fontFamily.includes('Georgia') || fontFamily.includes('Times')) return 'serif';
  if (fontFamily.includes('Courier')) return 'monospace';
  return 'sans-serif';
}

// Format date based on style and language
function formatDate(
  dateStr: string,
  style: 'short' | 'long' | 'dayName',
  language: 'en' | 'fr' | 'es'
): string {
  // Parse DD/MM/YYYY format
  let date: Date;
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      // DD/MM/YYYY format
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const year = parseInt(parts[2], 10);
      date = new Date(year, month, day);
    } else {
      date = new Date(dateStr);
    }
  } else {
    date = new Date(dateStr);
  }
  
  if (isNaN(date.getTime())) return dateStr;

  const locales: Record<string, string> = {
    en: 'en-US',
    fr: 'fr-FR',
    es: 'es-ES',
  };

  const locale = locales[language] || 'en-US';

  if (style === 'short') {
    // 3/7/26
    return date.toLocaleDateString(locale, { 
      month: 'numeric', 
      day: 'numeric', 
      year: '2-digit' 
    });
  } else if (style === 'long') {
    // March 7, 2026
    return date.toLocaleDateString(locale, { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } else {
    // Friday, March 7, 2026
    return date.toLocaleDateString(locale, { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }
}

// Get year and month from date string
function getYearMonth(dateStr: string): { year: string; month: string; yearNum: number; monthNum: number } | null {
  // Parse DD/MM/YYYY format
  let date: Date;
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      // DD/MM/YYYY format
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const year = parseInt(parts[2], 10);
      date = new Date(year, month, day);
    } else {
      date = new Date(dateStr);
    }
  } else {
    date = new Date(dateStr);
  }
  
  if (isNaN(date.getTime())) return null;
  
  return {
    year: date.getFullYear().toString(),
    month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
    yearNum: date.getFullYear(),
    monthNum: date.getMonth() + 1,
  };
}

// Get month name
function getMonthName(monthNum: number, language: 'en' | 'fr' | 'es'): string {
  const date = new Date(2000, monthNum - 1, 1);
  const locales: Record<string, string> = {
    en: 'en-US',
    fr: 'fr-FR',
    es: 'es-ES',
  };
  return date.toLocaleDateString(locales[language] || 'en-US', { month: 'long' }).toUpperCase();
}

// Render image grid based on count
function renderImageGrid(
  images: IMessage[],
  key: number,
  colors: any,
  meName: string | null,
  showTime: boolean,
  dateFormat: string,
  fontSize: number,
  imageLayout: string = 'grid'
): JSX.Element {
  const count = images.length;
  const isSender = isMessageFromMe(images[0].senderName || '', meName);
  const firstMsg = images[0];
  
  // Get time for display
  const timeContent = showTime && dateFormat === 'full' 
    ? firstMsg.sendingTime || '' 
    : showTime && dateFormat === 'timeOnly'
    ? (firstMsg.sendingTime || '').split(',').pop()?.trim() || firstMsg.sendingTime || ''
    : '';
  
  const getImageUri = (msg: IMessage): string | undefined => {
    const rawMedia = (msg as any).url || (msg as any).localPath;
    if (typeof rawMedia === 'string' && rawMedia.length > 0) {
      if (
        rawMedia.startsWith('http://') ||
        rawMedia.startsWith('https://') ||
        rawMedia.startsWith('data:') ||
        rawMedia.startsWith('file://')
      ) {
        return rawMedia;
      } else {
        return `file://${rawMedia}`;
      }
    }
    return undefined;
  };

  if (imageLayout === 'maxGrid' && count >= 4) {
    // Max Grid: 4 images per row, small square thumbnails (only for 4+ images)
    const rows: IMessage[][] = [];
    for (let i = 0; i < count; i += 4) {
      rows.push(images.slice(i, i + 4));
    }
    return (
      <View key={`grid-${key}`} style={[styles.imageGrid, { alignSelf: isSender ? 'flex-end' : 'flex-start' }]}>
        <View style={{ gap: 2 }}>
          {rows.map((row, rowIdx) => (
            <View key={`row-${rowIdx}`} style={styles.gridRow}>
              {row.map((img, imgIdx) => (
                <Image
                  key={imgIdx}
                  source={{ uri: getImageUri(img) }}
                  style={{ width: '24%', aspectRatio: 1, backgroundColor: '#e8e8e8' }}
                  resizeMode="cover"
                />
              ))}
            </View>
          ))}
        </View>
        {timeContent && (
          <Text style={[styles.gridTime, {
            fontSize: fontSize - 2,
            color: isSender ? colors.senderText || '#FFFFFF' : colors.receiverText || '#FFFFFF',
            textAlign: isSender ? 'right' : 'left',
            paddingHorizontal: 8,
            paddingTop: 4,
          }]}>
            {timeContent}
          </Text>
        )}
      </View>
    );
  }

  if (count === 2) {
    // 2 images side by side
    return (
      <View key={`grid-${key}`} style={[styles.imageGrid, { alignSelf: isSender ? 'flex-end' : 'flex-start' }]}>
        <View style={styles.gridRow}>
          {images.map((img, i) => (
            <Image
              key={i}
              source={{ uri: getImageUri(img) }}
              style={styles.gridImage2}
              resizeMode="cover"
            />
          ))}
        </View>
        {timeContent && (
          <Text style={[styles.gridTime, { 
            fontSize: fontSize - 2, 
            color: isSender ? colors.senderText || '#FFFFFF' : colors.receiverText || '#FFFFFF',
            textAlign: isSender ? 'right' : 'left',
            paddingHorizontal: 8,
            paddingTop: 4,
          }]}>
            {timeContent}
          </Text>
        )}
      </View>
    );
  } else if (count === 3) {
    // 1 left, 2 right - WhatsApp style
    const gridHeight = 150;
    return (
      <View key={`grid-${key}`} style={[styles.imageGrid, { alignSelf: isSender ? 'flex-end' : 'flex-start' }]}>
        <View style={[styles.gridRow, { height: gridHeight }]}>
          <Image
            source={{ uri: getImageUri(images[0]) }}
            style={{ width: '66%', height: gridHeight, backgroundColor: '#e8e8e8' }}
            resizeMode="cover"
          />
          <View style={{ width: '33%', height: gridHeight, gap: 2 }}>
            <Image
              source={{ uri: getImageUri(images[1]) }}
              style={{ width: '100%', height: (gridHeight - 2) / 2, backgroundColor: '#e8e8e8' }}
              resizeMode="cover"
            />
            <Image
              source={{ uri: getImageUri(images[2]) }}
              style={{ width: '100%', height: (gridHeight - 2) / 2, backgroundColor: '#e8e8e8' }}
              resizeMode="cover"
            />
          </View>
        </View>
        {timeContent && (
          <Text style={[styles.gridTime, { 
            fontSize: fontSize - 2, 
            color: isSender ? colors.senderText || '#FFFFFF' : colors.receiverText || '#FFFFFF',
            textAlign: isSender ? 'right' : 'left',
            paddingHorizontal: 8,
            paddingTop: 4,
          }]}>
            {timeContent}
          </Text>
        )}
      </View>
    );
  } else if (count >= 4) {
    // Grid with 2 images per row for 4+ images
    const rows = [];
    for (let i = 0; i < count; i += 2) {
      rows.push(images.slice(i, i + 2));
    }

    return (
      <View key={`grid-${key}`} style={[styles.imageGrid, { alignSelf: isSender ? 'flex-end' : 'flex-start' }]}>
        <View style={{ gap: 2 }}>
          {rows.map((row, rowIdx) => (
            <View key={`row-${rowIdx}`} style={styles.gridRow}>
              {row.map((img, imgIdx) => (
                <Image 
                  key={imgIdx}
                  source={{ uri: getImageUri(img) }} 
                  style={{ width: '49.5%', aspectRatio: 1, backgroundColor: '#e8e8e8' }} 
                  resizeMode="cover" 
                />
              ))}
            </View>
          ))}
        </View>
        {timeContent && (
          <Text style={[styles.gridTime, { 
            fontSize: fontSize - 2, 
            color: isSender ? colors.senderText || '#FFFFFF' : colors.receiverText || '#FFFFFF',
            textAlign: isSender ? 'right' : 'left',
            paddingHorizontal: 8,
            paddingTop: 4,
          }]}>
            {timeContent}
          </Text>
        )}
      </View>
    );
  }

  return <View key={`grid-${key}`} />;
}

interface BookPreviewPagesProps {
  messages: IMessage[];
  pageCount: number;
  resolvedConfig: ResolvedThemeConfig;
  containerWidth: number;
  format?: string; // 'square_14x14' or 'standard_14_8x21'
  onPagesCalculated?: (pages: IMessage[][]) => void;
}

/** Pre-computed per-page header and sender-tracking state so FlatList renderItem is pure. */
interface PageHeaderState {
  showYear: boolean;
  showMonth: boolean;
  showDate: boolean;
  yearValue: string | null;
  monthValue: string | null;
  monthNum: number;
  dateValue: string | null;
  /** The last date shown BEFORE this page starts (used to seed lastShownDate in renderItem). */
  prevDate: string | null;
  /** Sender name at the START of this page (carried from previous page end). */
  initialSenderName: string | null;
  initialSenderSide: boolean | null;
}

interface PageData {
  /** Unique stable key for FlatList. */
  key: string;
  messages: IMessage[];
  pageIndex: number;
  headerState: PageHeaderState;
}

const BookPreviewPagesComponent: React.FC<BookPreviewPagesProps> = ({
  messages,
  resolvedConfig,
  containerWidth,
  format = 'standard_14_8x21',
  onPagesCalculated,
}) => {
  // Get exact dimensions based on format - matches PDF generation
  const dimensions = PAGE_DIMENSIONS[format as keyof typeof PAGE_DIMENSIONS] || PAGE_DIMENSIONS.standard_14_8x21;
  
  // Calculate scale to fit container width while maintaining exact aspect ratio
  const scale = containerWidth / dimensions.width;
  const pageHeight = dimensions.height * scale;

  const colors = resolvedConfig.colors || {};
  const layout = resolvedConfig.layout || {};
  const messageGap = 3;
  const dateFormat = layout.dateFormat || 'full';
  const showTime = dateFormat !== 'hidden';
  const showPageNumbers = layout.showPageNumbers !== false;
  const fontSize = resolvedConfig.fontSize ?? 11;
  const lineHeight = resolvedConfig.lineHeight ?? 1.5;
  const fontFamily = mapCssFontFamilyToReactNative(resolvedConfig.fontFamily);
  const messageBold = resolvedConfig.messageBold ?? false;
  const messageItalic = resolvedConfig.messageItalic ?? false;
  const imageLayout = (resolvedConfig as any).imageLayout ?? 'fullPage';
  const dateStyle = (resolvedConfig as any).dateStyle ?? 'long';
  const dateLanguage = (resolvedConfig as any).dateLanguage ?? 'en';
  const customTitles = (resolvedConfig as any).customTitles ?? { years: {}, months: {} };

  // Filter system messages FIRST - same as backend PDF generation
  const filteredMessages = useMemo(() => filterSystemMessages(messages), [messages]);
  const deferredMessages = useDeferredValue(filteredMessages);
  const isDeferringMessages = deferredMessages !== filteredMessages;
  const meName = useMemo(() => getMostFrequentSenderName(deferredMessages), [deferredMessages]);

  // msgHeights stores { withName, noName } for each message id
  const [msgHeights, setMsgHeights] = useState<Record<string, { withName: number; noName: number }>>({});
  const measuredRef = useRef<Record<string, { withName: number; noName: number }>>({});
  const pendingRef = useRef<number>(0);
  const [paginationReady, setPaginationReady] = useState(false);
  const lastContainerWidthRef = useRef<number>(0);
  const measurementInProgressRef = useRef<boolean>(false);
  const lastMeasuredMessagesRef = useRef<IMessage[] | null>(null);
  const measurementStartMsRef = useRef<number>(0);
  const lastProgressLogMeasuredCountRef = useRef<number>(0);

  const BATCH_SIZE = 150;
  const [renderedUpTo, setRenderedUpTo] = useState(0);
  const batchTimerRef = useRef<any>(null);
  const renderedUpToRef = useRef(0);
  useEffect(() => { renderedUpToRef.current = renderedUpTo; }, [renderedUpTo]);

  // ── Scrollbar state ──────────────────────────────────────────────────────────
  const pagesScrollRef = useRef<FlatList<PageData>>(null);
  const scrollYPages = useRef(new Animated.Value(0)).current;
  const [pagesContentHeight, setPagesContentHeight] = useState(0);
  const [pagesViewHeight, setPagesViewHeight] = useState(0);
  const [trackLayout, setTrackLayout] = useState({ y: 0, height: 0 });
  const debugLoggedBubbleKeysRef = useRef<Set<string>>(new Set());
  const debugPageMetricsRef = useRef<Record<number, { contentHeight?: number; estimatedHeight?: number }>>({});
  const debugHeaderKeysRef = useRef<Set<string>>(new Set());
  const debugSplitKeysRef = useRef<Set<string>>(new Set());
  const debugHeaderLayoutKeysRef = useRef<Set<string>>(new Set());
  const debugMediaLayoutKeysRef = useRef<Set<string>>(new Set());
  const pageHorizontalPadding = 12;
  const pageContentWidth = Math.max(1, containerWidth - pageHorizontalPadding * 2);

  const debugLog = useCallback((scope: string, data: Record<string, unknown>) => {
    if (!DEBUG_PREVIEW_LAYOUT) return;
    console.log(`[PreviewDebug:${scope}]`, data);
    appendPreviewDebugLog(scope, data);
  }, []);

  useEffect(() => {
    if (!DEBUG_PREVIEW_LAYOUT) return;
    debugLog('log-file-path', { path: previewDebugLogPath });
  }, [debugLog]);

  const debugLogOnce = useCallback((scope: string, key: string, data: Record<string, unknown>) => {
    if (!DEBUG_PREVIEW_LAYOUT) return;
    const compositeKey = `${scope}:${key}`;
    if (debugHeaderKeysRef.current.has(compositeKey)) return;
    debugHeaderKeysRef.current.add(compositeKey);
    debugLog(scope, data);
  }, [debugLog]);

  // Minimum thumb height so it's always tappable
  const THUMB_MIN_H = 40;

  // Thumb height = proportion of visible area vs total content
  const thumbHeight = useMemo(() => {
    if (pagesContentHeight <= 0 || pagesViewHeight <= 0) return THUMB_MIN_H;
    const ratio = pagesViewHeight / pagesContentHeight;
    return Math.max(THUMB_MIN_H, Math.min(pagesViewHeight, Math.round(ratio * pagesViewHeight)));
  }, [pagesContentHeight, pagesViewHeight]);

  // Max scroll offset
  const maxScrollOffset = Math.max(0, pagesContentHeight - pagesViewHeight);
  // Max travel distance for the thumb inside the track
  const thumbTravel = Math.max(0, trackLayout.height - thumbHeight);

  // Animated thumb Y position
  const thumbTranslateY = scrollYPages.interpolate({
    inputRange: [0, Math.max(1, maxScrollOffset)],
    outputRange: [0, thumbTravel],
    extrapolate: 'clamp',
  });

  const dragStartScrollOffset = useRef(0);
  const dragStartGestureY = useRef(0);
  const isDraggingThumb = useRef(false);
  const thumbTravelRef = useRef(thumbTravel);
  const maxScrollOffsetRef = useRef(maxScrollOffset);
  // Track current scroll offset directly from onScroll — more reliable than Animated.Value listener
  const scrollYPagesValue = useRef(0);
  useEffect(() => { thumbTravelRef.current = thumbTravel; }, [thumbTravel]);
  useEffect(() => { maxScrollOffsetRef.current = maxScrollOffset; }, [maxScrollOffset]);
  useEffect(() => {
    const id = scrollYPages.addListener(({ value }) => { scrollYPagesValue.current = value; });
    return () => scrollYPages.removeListener(id);
  }, [scrollYPages]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (e) => {
        isDraggingThumb.current = true;
        // Record where the finger started and what the scroll offset was at that moment
        dragStartScrollOffset.current = scrollYPagesValue.current;
        dragStartGestureY.current = e.nativeEvent.pageY;
      },
      onPanResponderMove: (e) => {
        const travel = thumbTravelRef.current;
        const maxOff = maxScrollOffsetRef.current;
        if (travel <= 0 || maxOff <= 0) return;
        // dy relative to where the drag STARTED — not relative to track top
        const dy = e.nativeEvent.pageY - dragStartGestureY.current;
        const scrollDelta = (dy / travel) * maxOff;
        const newOffset = Math.max(0, Math.min(maxOff, dragStartScrollOffset.current + scrollDelta));
        pagesScrollRef.current?.scrollToOffset({ offset: newOffset, animated: false });
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderRelease: () => {
        // Small delay so the onPress on the track fires after this flag is checked
        setTimeout(() => { isDraggingThumb.current = false; }, 50);
      },
      onPanResponderTerminate: () => {
        setTimeout(() => { isDraggingThumb.current = false; }, 50);
      },
    })
  ).current;
  // ─────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (containerWidth <= 0) return;

    const messagesChanged = lastMeasuredMessagesRef.current !== deferredMessages;
    if (messagesChanged) {
      // New selected book/messages: allow a fresh pass even if a previous one was in progress.
      measurementInProgressRef.current = false;
    }

    // Prevent duplicate restart for the same input while measurement is already running
    if (measurementInProgressRef.current) return;

    const widthDiff = Math.abs(containerWidth - lastContainerWidthRef.current);
    if (!messagesChanged && lastContainerWidthRef.current > 0 && widthDiff < 1) {
      return;
    }

    lastContainerWidthRef.current = containerWidth;
    lastMeasuredMessagesRef.current = deferredMessages;
    measurementInProgressRef.current = true;
    measurementStartMsRef.current = Date.now();
    lastProgressLogMeasuredCountRef.current = 0;

    // Check global cache — already measured messages don't need re-rendering
    const cacheWidth = Math.round(containerWidth);
    const preloaded: Record<string, { withName: number; noName: number }> = {};
    const uncached: IMessage[] = [];
    for (const msg of deferredMessages) {
      const cacheKeyWith = `${msg._id}_${cacheWidth}_withName`;
      const cacheKeyNo   = `${msg._id}_${cacheWidth}_noName`;
      if (globalHeightCache[cacheKeyWith] !== undefined && globalHeightCache[cacheKeyNo] !== undefined) {
        preloaded[String(msg._id)] = {
          withName: globalHeightCache[cacheKeyWith],
          noName:   globalHeightCache[cacheKeyNo],
        };
      } else {
        uncached.push(msg);
      }
    }

    debugLog('measurement-cache-scan', {
      deferredMessages: deferredMessages.length,
      cachedMessages: Object.keys(preloaded).length,
      uncachedMessages: uncached.length,
      containerWidth,
      cacheWidth,
      fontSize,
      lineHeight,
      imageLayout,
      dateFormat,
    });
    debugLog('measurement-start', {
      deferredMessages: deferredMessages.length,
      uncachedMessages: uncached.length,
      containerWidth,
      cacheWidth,
      batchSize: BATCH_SIZE,
      isDeferringMessages,
    });

    if (uncached.length === 0) {
      measuredRef.current = preloaded;
      pendingRef.current = 0;
      setMsgHeights(preloaded);
      setPaginationReady(true);
      setRenderedUpTo(0);
      measurementInProgressRef.current = false;
      debugLog('measurement-complete-cache-hit', {
        deferredMessages: deferredMessages.length,
        measuredMessages: Object.keys(preloaded).length,
        elapsedMs: Date.now() - measurementStartMsRef.current,
      });
      return;
    }

    measuredRef.current = { ...preloaded };
    pendingRef.current = uncached.length;
    setMsgHeights({});
    setPaginationReady(false);

    if (batchTimerRef.current) clearTimeout(batchTimerRef.current);
    setRenderedUpTo(0);
    InteractionManager.runAfterInteractions(() => {
      const firstBatchEnd = Math.min(BATCH_SIZE, deferredMessages.length);
      debugLog('measurement-batch-scheduled', {
        reason: 'initial',
        firstBatchEnd,
        deferredMessages: deferredMessages.length,
      });
      setRenderedUpTo(firstBatchEnd);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredMessages, containerWidth]);

  useEffect(() => {
    if (!DEBUG_PREVIEW_LAYOUT) return;
    if (!measurementInProgressRef.current || paginationReady) return;
    const timer = setInterval(() => {
      const measuredCount = Object.keys(measuredRef.current).length;
      debugLog('measurement-heartbeat', {
        deferredMessages: deferredMessages.length,
        measuredCount,
        pendingCount: pendingRef.current,
        renderedUpTo: renderedUpToRef.current,
        elapsedMs: Date.now() - measurementStartMsRef.current,
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [debugLog, deferredMessages.length, paginationReady]);

  const onMsgLayout = useCallback((id: string, hWith: number, hNo: number) => {
    if (id in measuredRef.current) return;
    measuredRef.current[id] = { withName: hWith, noName: hNo };
    pendingRef.current = Math.max(0, pendingRef.current - 1);

    // Save to global cache so switching books never re-measures
    const cacheWidth = Math.round(lastContainerWidthRef.current);
    globalHeightCache[`${id}_${cacheWidth}_withName`] = hWith;
    globalHeightCache[`${id}_${cacheWidth}_noName`]   = hNo;

    const measuredCount = Object.keys(measuredRef.current).length;
    if (
      measuredCount - lastProgressLogMeasuredCountRef.current >= 40 ||
      pendingRef.current <= 5
    ) {
      lastProgressLogMeasuredCountRef.current = measuredCount;
      debugLog('measurement-progress', {
        measuredCount,
        pendingCount: pendingRef.current,
        renderedUpTo: renderedUpToRef.current,
        elapsedMs: Date.now() - measurementStartMsRef.current,
      });
    }

    if (pendingRef.current === 0) {
      setMsgHeights({ ...measuredRef.current });
      setPaginationReady(true);
      measurementInProgressRef.current = false;
      debugLog('measurement-complete', {
        measuredCount,
        elapsedMs: Date.now() - measurementStartMsRef.current,
      });
    } else {
      const currentBatchEnd = renderedUpToRef.current;
      const currentBatchMeasured = Object.keys(measuredRef.current).length;
      if (currentBatchMeasured >= currentBatchEnd && currentBatchEnd < deferredMessages.length) {
        const nextEnd = Math.min(currentBatchEnd + BATCH_SIZE, deferredMessages.length);
        if (batchTimerRef.current) clearTimeout(batchTimerRef.current);
        batchTimerRef.current = setTimeout(() => {
          InteractionManager.runAfterInteractions(() => {
            debugLog('measurement-batch-scheduled', {
              reason: 'advance',
              currentBatchEnd,
              nextEnd,
              currentBatchMeasured,
              deferredMessages: deferredMessages.length,
            });
            setRenderedUpTo(nextEnd);
          });
        }, 50);
      }
    }
  }, [deferredMessages.length]);
  
  // Group consecutive images from same sender
  const groupConsecutiveImages = (msgs: IMessage[]): (IMessage | IMessage[])[] => {
    const result: (IMessage | IMessage[])[] = [];
    let currentGroup: IMessage[] = [];
    let lastSender: string | null = null;

    for (const msg of msgs) {
      const isImage = msg.messageType === 'image';
      const sender = msg.senderName || '';

      if (isImage && sender === lastSender && currentGroup.length > 0) {
        // Same sender, add to group
        currentGroup.push(msg);
      } else if (isImage) {
        // New image or different sender
        if (currentGroup.length > 0) {
          result.push(currentGroup.length === 1 ? currentGroup[0] : currentGroup);
        }
        currentGroup = [msg];
        lastSender = sender;
      } else {
        // Not an image
        if (currentGroup.length > 0) {
          result.push(currentGroup.length === 1 ? currentGroup[0] : currentGroup);
          currentGroup = [];
          lastSender = null;
        }
        result.push(msg);
      }
    }

    if (currentGroup.length > 0) {
      result.push(currentGroup.length === 1 ? currentGroup[0] : currentGroup);
    }

    return result;
  };
  
  // Group messages by date for headers
  const getDateHeader = (msg: IMessage): string => {
    if (!msg.date && !msg.sendingTime) return '';
    
    // Try to parse date from message
    const dateStr = msg.date || msg.sendingTime || '';
    const msgDate = new Date(dateStr);
    
    if (isNaN(msgDate.getTime())) return dateStr; // Return as-is if can't parse
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if today
    if (msgDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    // Check if yesterday
    if (msgDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Format as "March 5, 2026"
    return msgDate.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  // Height-based pages — fit messages into each page based on available height.
  // Reserve extra space for page number row when enabled (prevents end-of-page clipping).
  const pageNumberReserve = showPageNumbers ? PAGE_NUMBER_RESERVE : 0;
  const availableHeight = pageHeight - PAGE_OVERHEAD - pageNumberReserve;
  const pages: PageData[] = useMemo(() => {
    if (!paginationReady) return [];

    const result: IMessage[][] = [];
    let currentPage: IMessage[] = [];
    let usedH = 0;
    let lastYear: string | null = null;
    let lastMonth: string | null = null;
    let lastDate: string | null = null;
    // Track sender across pagination — mirrors render pass so we know which
    // messages actually show the sender name (and which have it hidden).
    let paginationLastSenderName: string | null = null;
    let paginationLastSenderSide: boolean | null = null;

    // For grid layout: pre-group consecutive images so pagination uses grid heights
    // (smaller than full-page image height), allowing multiple images per page.
    type PaginationItem = { messages: IMessage[]; height: number; nameWillShow?: boolean };
    let items: PaginationItem[];

    if (imageLayout === 'grid' || imageLayout === 'maxGrid') {
      const grouped = groupConsecutiveImages(deferredMessages);
      const cols = imageLayout === 'maxGrid' ? 4 : 2;
      const imgSize = Math.round(containerWidth / cols);
      const overhead = 22; // time + padding
      const maxRowsPerPage = Math.max(1, Math.floor((availableHeight - overhead) / imgSize));
      const maxImagesPerPage = maxRowsPerPage * cols;

      const getGridH = (n: number): number => {
        if (imageLayout === 'maxGrid' && n >= 4) {
          return Math.ceil(n / 4) * Math.round(containerWidth / 4) + overhead;
        }
        // grid or maxGrid with < 4 images: use standard 2-per-row height
        const halfW = Math.round(containerWidth / 2);
        if (n === 3) return 150 + overhead;
        return Math.ceil(n / 2) * halfW + overhead;
      };

      items = [];
      let gLastSender: string | null = null;
      let gLastSide: boolean | null = null;
      for (const item of grouped) {
        if (!Array.isArray(item)) {
          const isMedia = item.messageType === 'image' || item.messageType === 'video';
          const senderName = item.senderName || null;
          const senderSide = isMessageFromMe(item.senderName || '', meName);
          const nameWillShow =
            !isMedia && (gLastSender !== senderName || gLastSide !== senderSide);
          gLastSender = senderName;
          gLastSide = senderSide;
          const heights = msgHeights[String(item._id)];
          const h = heights ? (nameWillShow ? heights.withName : heights.noName) : 65;
          items.push({ messages: [item], height: h, nameWillShow });
          continue;
        }
        gLastSender = null;
        gLastSide = null;
        // Split large groups into chunks that fit within one page
        const chunkSize = item.length > maxImagesPerPage ? maxImagesPerPage : item.length;
        for (let i = 0; i < item.length; i += chunkSize) {
          const chunk = item.slice(i, i + chunkSize);
          items.push({ messages: chunk, height: getGridH(chunk.length), nameWillShow: false });
        }
      }
    } else {
      // For non-grid layout, pick withName or noName height based on sender tracking
      let pItemLastSenderName: string | null = null;
      let pItemLastSenderSide: boolean | null = null;
      items = deferredMessages.map(msg => {
        const isMedia = msg.messageType === 'image' || msg.messageType === 'video';
        const senderName = msg.senderName || null;
        const senderSide = isMessageFromMe(msg.senderName || '', meName);
        const nameWillShow =
          !isMedia &&
          (pItemLastSenderName !== senderName || pItemLastSenderSide !== senderSide);
        pItemLastSenderName = senderName;
        pItemLastSenderSide = senderSide;

        const heights = msgHeights[String(msg._id)];
        const h = heights
          ? (nameWillShow ? heights.withName : heights.noName)
          : 65;
        return { messages: [msg], height: h, nameWillShow };
      });
    }

    let splitFragCounter = 0;
    for (const item of items) {
      const firstMsg = item.messages[0];
      // Only split when taller than one page — else use measured height + original atomic pagination.
      const singleSplittable =
        item.messages.length === 1 &&
        isSplittableTextMessage(firstMsg) &&
        item.height > availableHeight;

      if (!singleSplittable) {
        let rawMsgH = item.height;
        const atomicTextLen = String(firstMsg.text || '').length;
        const isAtomicMedia = firstMsg.messageType === 'video' || firstMsg.messageType === 'audio';
        const isAtomicSingle = item.messages.length === 1;
        if (isSplittableTextMessage(firstMsg) && atomicTextLen > 180) {
          rawMsgH += LONG_TEXT_ATOMIC_SAFETY;
          if (atomicTextLen > 350) {
            rawMsgH += VERY_LONG_TEXT_ATOMIC_SAFETY;
          }
        }
        if (isAtomicMedia) {
          rawMsgH += MEDIA_ATOMIC_SAFETY;
        }
        let headerH = 0;

        if (dateFormat === 'full') {
          const msgDateStr = firstMsg.date || firstMsg.sendingTime || '';
          const ym = getYearMonth(msgDateStr);
          const formattedDate = formatDate(msgDateStr, dateStyle, dateLanguage);
          if (ym && ym.year !== lastYear) {
            headerH += YEAR_HEADER_ESTIMATE;
            paginationLastSenderName = null;
            paginationLastSenderSide = null;
          }
          if (ym && ym.month !== lastMonth) {
            headerH += MONTH_HEADER_ESTIMATE;
            paginationLastSenderName = null;
            paginationLastSenderSide = null;
          }
          if (formattedDate && formattedDate !== lastDate) {
            headerH += DATE_HEADER_ESTIMATE;
            paginationLastSenderName = null;
            paginationLastSenderSide = null;
          }
          if (headerH > 0) {
            const msgId = String(firstMsg._id ?? 'unknown');
            const remainingBefore = availableHeight - (usedH + (item.height + headerH));
            debugLogOnce('header-atomic-budget', `${msgId}:${ym?.year ?? 'na'}:${ym?.month ?? 'na'}:${formattedDate ?? 'na'}:${headerH}`, {
              messageId: msgId,
              sender: firstMsg.senderName || 'unknown',
              messageType: firstMsg.messageType || 'text',
              textLength: String(firstMsg.text || '').length,
              headerH,
              messageH: item.height,
              rawMsgH,
              mediaAtomicSafety: isAtomicMedia ? MEDIA_ATOMIC_SAFETY : 0,
              usedHBefore: Number(usedH.toFixed(2)),
              availableHeight: Number(availableHeight.toFixed(2)),
              remainingAfterPlacement: Number(remainingBefore.toFixed(2)),
              yearChanged: !!(ym && ym.year !== lastYear),
              monthChanged: !!(ym && ym.month !== lastMonth),
              dateChanged: !!(formattedDate && formattedDate !== lastDate),
              msgDateStr,
              formattedDate: formattedDate || null,
            });
          }
        }

        // Re-evaluate single-message height using live pagination sender state.
        // This keeps name/no-name choice aligned with actual render after
        // year/month/date boundary resets and prevents under-count overflow.
        if (isAtomicSingle) {
          const heights = msgHeights[String(firstMsg._id)];
          if (heights) {
            const isVisualMedia = firstMsg.messageType === 'image' || firstMsg.messageType === 'video';
            const itemSenderName = firstMsg.senderName || null;
            const itemSenderSide = isMessageFromMe(firstMsg.senderName || '', meName);
            const showNameNow =
              !isVisualMedia &&
              (paginationLastSenderName !== itemSenderName || paginationLastSenderSide !== itemSenderSide);
            rawMsgH = showNameNow ? heights.withName : heights.noName;
          }
        }

        const itemSenderName = firstMsg.senderName || null;
        const itemSenderSide = isMessageFromMe(firstMsg.senderName || '', meName);
        paginationLastSenderName = itemSenderName;
        paginationLastSenderSide = itemSenderSide;

        const totalH = rawMsgH + headerH;

        // If current page can't fit this item, flush page first then evaluate on a fresh page.
        if (usedH + totalH > availableHeight - ATOMIC_BOTTOM_SAFETY && currentPage.length > 0) {
          result.push(currentPage);
          currentPage = [];
          usedH = 0;
        }

        // When headers make first placement overflow, emit a header-only page then place message.
        if (currentPage.length === 0 && headerH > 0 && totalH > availableHeight) {
          result.push([]);
          if (dateFormat === 'full') {
            const msgDateStr = firstMsg.date || firstMsg.sendingTime || '';
            const ym = getYearMonth(msgDateStr);
            const formattedDate = formatDate(msgDateStr, dateStyle, dateLanguage);
            if (ym) { lastYear = ym.year; lastMonth = ym.month; }
            if (formattedDate) lastDate = formattedDate;
          }
          currentPage.push(...item.messages);
          usedH = rawMsgH;
          continue;
        }

        // Defensive: if an atomic message still exceeds page height, clamp accounting to avoid over-pack.
        if (currentPage.length === 0 && totalH > availableHeight) {
          currentPage.push(...item.messages);
          usedH = Math.min(rawMsgH, availableHeight);
        } else {
          currentPage.push(...item.messages);
          usedH += totalH;
        }

        if (dateFormat === 'full') {
          const lastMsg = item.messages[item.messages.length - 1];
          const msgDateStr = lastMsg.date || lastMsg.sendingTime || '';
          const ym = getYearMonth(msgDateStr);
          const formattedDate = formatDate(msgDateStr, dateStyle, dateLanguage);
          if (ym) { lastYear = ym.year; lastMonth = ym.month; }
          if (formattedDate) lastDate = formattedDate;
        }
        continue;
      }

      // Long plain-text message: split across pages (height estimate per fragment)
      const textLength = String(firstMsg.text || '').length;

      // For very long messages (>5000 chars), use fast line-based splitting
      // instead of the expensive binary search to avoid UI hanging.
      if (textLength > 5000) {
        const baseMsg = firstMsg;
        const lines = String(baseMsg.text || '').split('\n');
        const nameOnFirst = item.nameWillShow !== false;

        if (currentPage.length > 0) {
          result.push(currentPage);
          currentPage = [];
          usedH = 0;
        }

        let currentChunk = '';
        let chunkLines = 0;
        const maxLinesPerPage = Math.floor(availableHeight / (fontSize * lineHeight)) - 5;

        for (let i = 0; i < lines.length; i++) {
          if (chunkLines >= maxLinesPerPage && currentChunk.length > 0) {
            currentPage.push({
              ...baseMsg,
              text: currentChunk,
              __suppressTimeRow: true,
              __splitFragKey: `${String(baseMsg._id)}-frag-${splitFragCounter++}`,
            });
            result.push(currentPage);
            currentPage = [];
            usedH = 0;
            currentChunk = '';
            chunkLines = 0;
          }
          currentChunk += (currentChunk ? '\n' : '') + lines[i];
          chunkLines++;
        }

        if (currentChunk.length > 0) {
          currentPage.push({
            ...baseMsg,
            text: currentChunk,
            __suppressTimeRow: false,
            __splitFragKey: `${String(baseMsg._id)}-frag-${splitFragCounter++}`,
          });
          usedH = estimateTextSliceHeightPreview(containerWidth, fontSize, lineHeight, currentChunk, nameOnFirst, messageGap);
        }
        continue;
      }

      // Normal splitting for messages < 5000 chars using binary search
      const baseMsg = firstMsg;
      const nameOnFirst = item.nameWillShow !== false;
      let remainder = String(baseMsg.text || '');
      let firstFragOfMsg = true;
      let splitGuard = 0;
      const splitVerticalBuffer = Math.max(100, Math.ceil(fontSize * lineHeight) + 18);

      // Deterministic guard: start long split messages on a fresh page.
      // This avoids edge clipping when previous items/date blocks consume height.
      if (remainder.length > 220) {
        debugLog('long-split-preflush-check', {
          messageId: String(baseMsg._id ?? 'unknown'),
          sender: baseMsg.senderName || 'unknown',
          totalTextLength: remainder.length,
          currentPageLength: currentPage.length,
          usedHBefore: Number(usedH.toFixed(2)),
          availableHeight: Number(availableHeight.toFixed(2)),
          splitVerticalBuffer,
          splitFragmentSafety: SPLIT_FRAGMENT_SAFETY,
          longDateFirstFragSafety: LONG_DATE_FIRST_FRAG_SAFETY,
        });
      }
      if (currentPage.length > 0 && remainder.length > 220) {
        debugLog('long-split-preflush-triggered', {
          messageId: String(baseMsg._id ?? 'unknown'),
          sender: baseMsg.senderName || 'unknown',
          totalTextLength: remainder.length,
          flushedPageLength: currentPage.length,
          usedHBeforeFlush: Number(usedH.toFixed(2)),
        });
        result.push(currentPage);
        currentPage = [];
        usedH = 0;
      }

      const itemSenderName = baseMsg.senderName || null;
      const itemSenderSide = isMessageFromMe(baseMsg.senderName || '', meName);
      paginationLastSenderName = itemSenderName;
      paginationLastSenderSide = itemSenderSide;

      while (remainder.length > 0 && splitGuard++ < 10000) {
        let headerH = 0;
        if (dateFormat === 'full' && firstFragOfMsg) {
          const msgDateStr = baseMsg.date || baseMsg.sendingTime || '';
          const ym = getYearMonth(msgDateStr);
          const formattedDate = formatDate(msgDateStr, dateStyle, dateLanguage);
          if (ym && ym.year !== lastYear) {
            headerH += YEAR_HEADER_ESTIMATE;
            paginationLastSenderName = null;
            paginationLastSenderSide = null;
          }
          if (ym && ym.month !== lastMonth) {
            headerH += MONTH_HEADER_ESTIMATE;
            paginationLastSenderName = null;
            paginationLastSenderSide = null;
          }
          if (formattedDate && formattedDate !== lastDate) {
            headerH += DATE_HEADER_ESTIMATE;
            paginationLastSenderName = null;
            paginationLastSenderSide = null;
          }
          if (headerH > 0) {
            const msgId = String(baseMsg._id ?? 'unknown');
            debugLogOnce('header-split-first-frag', `${msgId}:${ym?.year ?? 'na'}:${ym?.month ?? 'na'}:${formattedDate ?? 'na'}:${headerH}`, {
              messageId: msgId,
              sender: baseMsg.senderName || 'unknown',
              textLength: String(baseMsg.text || '').length,
              firstFragOfMsg,
              headerH,
              usedHBefore: Number(usedH.toFixed(2)),
              availableHeight: Number(availableHeight.toFixed(2)),
              splitVerticalBuffer,
              yearChanged: !!(ym && ym.year !== lastYear),
              monthChanged: !!(ym && ym.month !== lastMonth),
              dateChanged: !!(formattedDate && formattedDate !== lastDate),
              msgDateStr,
              formattedDate: formattedDate || null,
            });
          }

          // Focused forensic log: long text + date transition at split start.
          if (String(baseMsg.text || '').length > 220) {
            const msgId = String(baseMsg._id ?? 'unknown');
            debugLog('long-date-split-context', {
              messageId: msgId,
              sender: baseMsg.senderName || 'unknown',
              totalTextLength: String(baseMsg.text || '').length,
              firstFragOfMsg,
              msgDateStr,
              formattedDate: formattedDate || null,
              ymYear: ym?.year || null,
              ymMonth: ym?.month || null,
              lastYearBefore: lastYear,
              lastMonthBefore: lastMonth,
              lastDateBefore: lastDate,
              headerH,
              usedHBefore: Number(usedH.toFixed(2)),
              availableHeight: Number(availableHeight.toFixed(2)),
              splitVerticalBuffer,
            });
          }
        }

        if (firstFragOfMsg && currentPage.length === 0 && headerH > 0) {
          const fullRestH = estimateTextSliceHeightPreview(
            containerWidth,
            fontSize,
            lineHeight,
            remainder,
            nameOnFirst,
            messageGap
          );
          if (headerH + fullRestH > availableHeight - splitVerticalBuffer) {
            result.push([]);
            const msgDateStr = baseMsg.date || baseMsg.sendingTime || '';
            const ym = getYearMonth(msgDateStr);
            const formattedDate = formatDate(msgDateStr, dateStyle, dateLanguage);
            if (ym) { lastYear = ym.year; lastMonth = ym.month; }
            if (formattedDate) lastDate = formattedDate;
            continue;
          }
        }

        if (currentPage.length > 0 && usedH + headerH > availableHeight) {
          result.push(currentPage);
          currentPage = [];
          usedH = 0;
        }

        let space = availableHeight - usedH - headerH;
        if (space < 1 && currentPage.length > 0) {
          result.push(currentPage);
          currentPage = [];
          usedH = 0;
          space = availableHeight - headerH;
        }

        const withNameNow = firstFragOfMsg && nameOnFirst;
        const longDateFirstFragSafety =
          firstFragOfMsg && String(baseMsg.text || '').length > 220
            ? LONG_DATE_FIRST_FRAG_SAFETY
            : 0;
        const splitHeightBudget = Math.max(
          1,
          space - splitVerticalBuffer - SPLIT_FRAGMENT_SAFETY - longDateFirstFragSafety
        );
        const prefixLen = longestFittingPrefixPreview(
          containerWidth,
          fontSize,
          lineHeight,
          messageGap,
          remainder,
          splitHeightBudget,
          withNameNow
        );

        let takeEnd = snapUtf16PrefixEnd(remainder, prefixLen);
        let prefix = remainder.slice(0, takeEnd);
        if (!prefix.length) {
          takeEnd = snapUtf16PrefixEnd(remainder, 1);
          prefix = remainder.slice(0, Math.max(1, takeEnd));
        }

        let isLastPart = prefix.length >= remainder.length;
        let fragH = estimateTextSliceHeightPreview(
          containerWidth,
          fontSize,
          lineHeight,
          prefix,
          withNameNow,
          messageGap
        );
        let longSplitFragFudge =
          String(baseMsg.text || '').length > 220
            ? (isLastPart ? LONG_SPLIT_LAST_FRAGMENT_FUDGE : LONG_SPLIT_FRAGMENT_FUDGE)
            : 0;
        let effectiveFragH = fragH + longSplitFragFudge;

        if (String(baseMsg.text || '').length > 220) {
          const splitKey = `${String(baseMsg._id)}:${splitGuard}:${firstFragOfMsg ? 'first' : 'next'}`;
          if (!debugSplitKeysRef.current.has(splitKey)) {
            debugSplitKeysRef.current.add(splitKey);
            debugLog('split-fragment-budget', {
              messageId: String(baseMsg._id),
              sender: baseMsg.senderName || 'unknown',
              totalTextLength: String(baseMsg.text || '').length,
              remainderLength: remainder.length,
              prefixLength: prefix.length,
              splitGuard,
              firstFragOfMsg,
              withNameNow,
              headerH,
              usedHBefore: Number(usedH.toFixed(2)),
              availableHeight: Number(availableHeight.toFixed(2)),
              splitVerticalBuffer,
              longDateFirstFragSafety,
              splitHeightBudget: Number(splitHeightBudget.toFixed(2)),
              fragH: Number(fragH.toFixed(2)),
              longSplitFragFudge,
              effectiveFragH: Number(effectiveFragH.toFixed(2)),
              pageBottomBudget: Number((availableHeight - splitVerticalBuffer - SPLIT_FRAGMENT_SAFETY - longDateFirstFragSafety).toFixed(2)),
              wouldOverflowPageBottom:
                usedH + headerH + effectiveFragH >
                availableHeight - splitVerticalBuffer - SPLIT_FRAGMENT_SAFETY - longDateFirstFragSafety,
              suppressTimeOnFrag: !isLastPart,
            });
          }

          // Extra long-message signal to inspect page-1 cut cases.
          debugLog('long-date-frag-decision', {
            messageId: String(baseMsg._id),
            sender: baseMsg.senderName || 'unknown',
            totalTextLength: String(baseMsg.text || '').length,
            splitGuard,
            firstFragOfMsg,
            prefixLength: prefix.length,
            remainderLengthBeforeCut: remainder.length,
            fragH: Number(fragH.toFixed(2)),
            longSplitFragFudge,
            effectiveFragH: Number(effectiveFragH.toFixed(2)),
            headerH,
            usedHBefore: Number(usedH.toFixed(2)),
            longDateFirstFragSafety,
            wouldOverflowPageBottom:
              usedH + headerH + effectiveFragH >
              availableHeight - splitVerticalBuffer - SPLIT_FRAGMENT_SAFETY - longDateFirstFragSafety,
            isLastPart,
            suppressTimeOnFrag: !isLastPart,
          });
        }

        const pageBottomBudget =
          availableHeight - splitVerticalBuffer - SPLIT_FRAGMENT_SAFETY - longDateFirstFragSafety;

        // Hard fallback: never commit an oversized first fragment on an empty page.
        // Without this, we can enter a long loop of tiny 1-char fragments and appear stuck.
        if (currentPage.length === 0 && usedH === 0 && headerH === 0 && effectiveFragH > pageBottomBudget) {
          let fallbackLen = prefix.length;
          let attempts = 0;
          while (attempts < 8 && fallbackLen > 1 && effectiveFragH > pageBottomBudget) {
            attempts += 1;
            const targetLen = Math.max(1, Math.floor(fallbackLen * 0.7));
            const adjusted = snapUtf16PrefixEnd(remainder, targetLen);
            fallbackLen = Math.max(1, adjusted);
            prefix = remainder.slice(0, fallbackLen);
            isLastPart = prefix.length >= remainder.length;
            fragH = estimateTextSliceHeightPreview(
              containerWidth,
              fontSize,
              lineHeight,
              prefix,
              withNameNow,
              messageGap
            );
            longSplitFragFudge =
              String(baseMsg.text || '').length > 220
                ? (isLastPart ? LONG_SPLIT_LAST_FRAGMENT_FUDGE : LONG_SPLIT_FRAGMENT_FUDGE)
                : 0;
            effectiveFragH = fragH + longSplitFragFudge;
          }
        }

        if (currentPage.length > 0 && usedH + headerH + effectiveFragH > pageBottomBudget) {
          result.push(currentPage);
          currentPage = [];
          usedH = 0;
          continue;
        }

        const fragKey = `${String(baseMsg._id)}-frag-${splitFragCounter++}`;
        currentPage.push({
          ...baseMsg,
          text: prefix,
          __suppressTimeRow: !isLastPart,
          __splitFragKey: fragKey,
        });
        usedH += headerH + effectiveFragH;
        if (String(baseMsg.text || '').length > 220) {
          const pageBottomBudget =
            availableHeight - splitVerticalBuffer - SPLIT_FRAGMENT_SAFETY - longDateFirstFragSafety;
          debugLog('long-split-frag-commit', {
            messageId: String(baseMsg._id ?? 'unknown'),
            splitFragKey: fragKey,
            splitGuard,
            firstFragOfMsg,
            prefixLength: prefix.length,
            remainderLengthAfterCut: Math.max(0, remainder.length - prefix.length),
            headerH,
            fragH: Number(fragH.toFixed(2)),
            longSplitFragFudge,
            effectiveFragH: Number(effectiveFragH.toFixed(2)),
            usedHAfter: Number(usedH.toFixed(2)),
            pageBottomBudget: Number(pageBottomBudget.toFixed(2)),
            exceedsBudgetAfterCommit: usedH > pageBottomBudget,
            suppressTimeOnFrag: !isLastPart,
            isLastPart,
          });
        }
        remainder = remainder.slice(prefix.length);
        firstFragOfMsg = false;

        if (dateFormat === 'full' && isLastPart) {
          const msgDateStr = baseMsg.date || baseMsg.sendingTime || '';
          const ym = getYearMonth(msgDateStr);
          const formattedDate = formatDate(msgDateStr, dateStyle, dateLanguage);
          if (ym) { lastYear = ym.year; lastMonth = ym.month; }
          if (formattedDate) lastDate = formattedDate;
        }
      }
    }

    if (currentPage.length > 0) result.push(currentPage);
    const rawPages = result.length > 0 ? result : (deferredMessages.length > 0 ? [deferredMessages] : []);

    // ── Pre-compute per-page header state so FlatList renderItem is pure ──────
    const pageDataList: PageData[] = [];
    let phLastYear: string | null = null;
    let phLastMonth: string | null = null;
    let phLastDate: string | null = null;
    let phLastSenderName: string | null = null;
    let phLastSenderSide: boolean | null = null;

    for (let pi = 0; pi < rawPages.length; pi++) {
      const pageMessages = rawPages[pi];
      const headerSourceMsg = pageMessages.length > 0 ? pageMessages[0] : rawPages[pi + 1]?.[0];

      let showYear = false;
      let showMonth = false;
      let showDate = false;
      let yearValue: string | null = null;
      let monthValue: string | null = null;
      let monthNum = 0;
      let dateValue: string | null = null;

      if (headerSourceMsg && dateFormat === 'full') {
        const msgDateStr = headerSourceMsg.date || headerSourceMsg.sendingTime || '';
        const ym = getYearMonth(msgDateStr);
        if (ym) {
          if (ym.year !== phLastYear) {
            showYear = true;
            yearValue = ym.year;
            phLastYear = ym.year;
            phLastSenderName = null;
            phLastSenderSide = null;
          }
          if (ym.month !== phLastMonth) {
            showMonth = true;
            monthValue = ym.month;
            monthNum = ym.monthNum;
            phLastMonth = ym.month;
            phLastSenderName = null;
            phLastSenderSide = null;
          }
        }
        if (pageMessages.length === 0) {
          const fd = formatDate(msgDateStr, dateStyle, dateLanguage);
          if (fd && fd !== phLastDate) {
            showDate = true;
            dateValue = fd;
            phLastDate = fd;
            phLastSenderName = null;
            phLastSenderSide = null;
          }
        }
      }

      pageDataList.push({
        key: `page-${pi}`,
        messages: pageMessages,
        pageIndex: pi,
        headerState: {
          showYear,
          showMonth,
          showDate,
          yearValue,
          monthValue,
          monthNum,
          dateValue,
          prevDate: phLastDate,
          initialSenderName: phLastSenderName,
          initialSenderSide: phLastSenderSide,
        },
      });

      // Advance sender/date tracking past all messages on this page
      for (const msg of pageMessages) {
        const msgDateStr = msg.date || msg.sendingTime || '';
        if (dateFormat === 'full' && msgDateStr) {
          const fd = formatDate(msgDateStr, dateStyle, dateLanguage);
          if (fd && fd !== phLastDate) {
            phLastDate = fd;
            phLastSenderName = null;
            phLastSenderSide = null;
          }
        }
        phLastSenderName = msg.senderName || null;
        phLastSenderSide = isMessageFromMe(msg.senderName || '', meName);
      }
    }

    return pageDataList;
  }, [paginationReady, msgHeights, deferredMessages, availableHeight, dateFormat, dateStyle, dateLanguage, imageLayout, containerWidth, meName, lineHeight, fontSize]);
  const totalPreviewPages = pages.length;

  // Page-level estimated height diagnostics: uses pre-computed header state from PageData.
  const debugEstimatedPageHeights = useMemo(() => {
    if (!DEBUG_PREVIEW_LAYOUT || !paginationReady || pages.length === 0) return [];

    const estimates: number[] = [];
    let lastSenderName: string | null = null;
    let lastSenderSide: boolean | null = null;

    for (const pageData of pages) {
      const { messages: pageMessages, headerState } = pageData;
      let estimated = 0;

      if (headerState.showYear) estimated += YEAR_HEADER_ESTIMATE;
      if (headerState.showMonth) estimated += MONTH_HEADER_ESTIMATE;
      if (headerState.showDate) estimated += DATE_HEADER_ESTIMATE;

      if (headerState.showYear || headerState.showMonth || headerState.showDate) {
        lastSenderName = null;
        lastSenderSide = null;
      }

      let localLastDate: string | null = headerState.showDate ? headerState.dateValue : headerState.prevDate;

      for (const msg of pageMessages) {
        const msgDateStr = msg.date || msg.sendingTime || '';
        const formattedDate = formatDate(msgDateStr, dateStyle, dateLanguage);
        if (dateFormat === 'full' && msgDateStr && formattedDate !== localLastDate) {
          estimated += DATE_HEADER_ESTIMATE;
          localLastDate = formattedDate;
          lastSenderName = null;
          lastSenderSide = null;
        }

        const currentSenderName = msg.senderName || null;
        const currentSenderSide = isMessageFromMe(msg.senderName || '', meName);
        const showSenderName = lastSenderName !== currentSenderName || lastSenderSide !== currentSenderSide;
        const isMedia = msg.messageType === 'image' || msg.messageType === 'video';
        const hideSenderName = isMedia || !showSenderName;
        const heights = msgHeights[String(msg._id)];
        estimated += heights ? (hideSenderName ? heights.noName : heights.withName) : 65;

        lastSenderName = currentSenderName;
        lastSenderSide = currentSenderSide;
      }

      estimates.push(estimated);
    }

    return estimates;
  }, [
    pages,
    paginationReady,
    msgHeights,
    dateFormat,
    dateStyle,
    dateLanguage,
    meName,
  ]);

  // Fire onPagesCalculated with the raw IMessage[][] extracted from PageData
  React.useEffect(() => {
    if (paginationReady && pages.length > 0) {
      if (onPagesCalculated) {
        const rawPages = pages.map(p => p.messages);
        console.log(`[BookPreviewPages] firing onPagesCalculated — pages:${pages.length} msgs:${deferredMessages.length} paginationReady:${paginationReady}`);
        onPagesCalculated(rawPages);
      }
    }
  }, [pages.length, deferredMessages.length, paginationReady, availableHeight, dimensions, scale, onPagesCalculated]);

  React.useEffect(() => {
    if (!DEBUG_PREVIEW_LAYOUT || !paginationReady || pages.length === 0) return;
    debugLog('pagination-summary', {
      totalPages: pages.length,
      availableHeight,
      pageHeight,
      pageOverhead: PAGE_OVERHEAD,
      containerWidth,
      fontSize,
      lineHeight,
      dateFormat,
      imageLayout,
      measuredMessages: Object.keys(msgHeights).length,
    });
  }, [
    paginationReady,
    pages.length,
    availableHeight,
    pageHeight,
    containerWidth,
    fontSize,
    lineHeight,
    dateFormat,
    imageLayout,
    msgHeights,
    debugLog,
  ]);

  return (
    <>
    {/* Hidden measurement pass — pixel-perfect clone of the actual bubble render.
        Each message is measured TWICE: once with sender name, once without.
        The pagination loop picks the correct height based on actual visibility. */}
    <View pointerEvents="none" style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: containerWidth, zIndex: -1 }}>
      {containerWidth > 0 && (() => {
        return deferredMessages.slice(0, renderedUpTo).flatMap((msg) => {
          const isImage = msg.messageType === 'image';
          const isVideo = msg.messageType === 'video';
          const isAudio = msg.messageType === 'audio';
          const isVideoOrAudio = isVideo || isAudio;
          const rawMedia = (msg as any).url || (msg as any).localPath;
          const hasImageUri = typeof rawMedia === 'string' && rawMedia.length > 0;
          const imageOnly = isImage && hasImageUri;
          const isMedia = isImage || isVideo;
          const mediaDisplayText = stripMediaTitleLine(String(msg.text || ''), isVideoOrAudio);
          const showMediaText = isVideoOrAudio && mediaDisplayText.length > 0;

          // Time content — mirrors render pass exactly
          const timeContent = showTime && dateFormat === 'full'
            ? msg.sendingTime || ''
            : showTime && dateFormat === 'timeOnly'
            ? (msg.sendingTime || '').split(',').pop()?.trim() || msg.sendingTime || ''
            : '';

          // Render the inner bubble content (shared between both variants)
          const bubbleContent = (withName: boolean) => (
            <>
              {/* Sender name — only in the "withName" variant, and never for media */}
              {withName && !isMedia && (
                <Text
                  numberOfLines={1}
                  style={{
                    fontWeight: '600',
                    fontSize: fontSize - 1,
                    marginBottom: 2,
                    fontFamily,
                    fontStyle: 'normal',
                  }}
                >
                  {msg.senderName || ''}
                </Text>
              )}
              {/* Text — with paddingRight:60 matching styles.messageText */}
              {!imageOnly && !isVideoOrAudio && (
                <Text
                  style={{
                    fontSize,
                    lineHeight: fontSize * lineHeight,
                    paddingRight: 60,
                    flexWrap: 'wrap',
                    fontFamily,
                    fontWeight: messageBold ? '700' : '400',
                    fontStyle: messageItalic ? 'italic' : 'normal',
                  }}
                >
                  {msg.text || ''}
                </Text>
              )}
              {/* Image placeholder — matches styles.messageImage */}
              {imageOnly && (
                <View style={{ width: '100%', minWidth: 150, aspectRatio: 1, maxHeight: 200 }} />
              )}
              {/* Video/Audio — matches qrContainer height */}
              {isVideoOrAudio && (
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 12, height: 120 + 16 + 18 }} />
              )}
              {showMediaText && (
                <Text
                  style={{
                    fontSize,
                    lineHeight: fontSize * lineHeight,
                    paddingRight: 60,
                    flexWrap: 'wrap',
                    fontFamily,
                    fontWeight: messageBold ? '700' : '400',
                    fontStyle: messageItalic ? 'italic' : 'normal',
                  }}
                >
                  {mediaDisplayText}
                </Text>
              )}
              {/* Time row — marginTop:-20 overlaps last text line */}
              {timeContent ? (
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginTop: -20 }}>
                  <Text style={{ flex: 1 }} />
                  <Text
                    style={{
                      fontSize: fontSize - 2,
                      opacity: 0.7,
                      paddingLeft: 8,
                      fontFamily,
                      fontWeight: '400',
                      fontStyle: 'normal',
                    }}
                  >
                    {timeContent}
                  </Text>
                </View>
              ) : null}
            </>
          );

          const cacheWidth = Math.round(containerWidth);
          const cacheKeyWith = `${msg._id}_${cacheWidth}_withName`;
          const cacheKeyNo   = `${msg._id}_${cacheWidth}_noName`;
          const bothCached = globalHeightCache[cacheKeyWith] !== undefined && globalHeightCache[cacheKeyNo] !== undefined;

          if (bothCached) return []; // Already in cache, no need to render

          // For measurement, use the exact pixel width the bubble will render at (92% of containerWidth)
          // so the measured height matches the actual rendered height precisely.
          const measureBubbleWidth = isVideoOrAudio
            ? Math.max(Math.round(pageContentWidth * 0.92), 260)
            : Math.round(pageContentWidth * 0.92);

          return [
            // Variant 1: with sender name
            <View
              key={`measure-with-${msg._id}`}
              style={{ width: measureBubbleWidth, alignSelf: 'flex-start', marginBottom: messageGap }}
            >
              <View
                onLayout={(e) => {
                  const h = e.nativeEvent.layout.height + messageGap;
                  globalHeightCache[cacheKeyWith] = h;
                  // Only call onMsgLayout once both variants are measured
                  if (globalHeightCache[cacheKeyNo] !== undefined) {
                    onMsgLayout(String(msg._id), globalHeightCache[cacheKeyWith], globalHeightCache[cacheKeyNo]);
                  }
                }}
                style={{ paddingHorizontal: imageOnly ? 0 : 10, paddingVertical: imageOnly ? 0 : 6, overflow: 'hidden' }}
              >
                {bubbleContent(true)}
              </View>
            </View>,
            // Variant 2: without sender name
            <View
              key={`measure-no-${msg._id}`}
              style={{ width: measureBubbleWidth, alignSelf: 'flex-start', marginBottom: messageGap }}
            >
              <View
                onLayout={(e) => {
                  const h = e.nativeEvent.layout.height + messageGap;
                  globalHeightCache[cacheKeyNo] = h;
                  // Only call onMsgLayout once both variants are measured
                  if (globalHeightCache[cacheKeyWith] !== undefined) {
                    onMsgLayout(String(msg._id), globalHeightCache[cacheKeyWith], globalHeightCache[cacheKeyNo]);
                  }
                }}
                style={{ paddingHorizontal: imageOnly ? 0 : 10, paddingVertical: imageOnly ? 0 : 6, overflow: 'hidden' }}
              >
                {bubbleContent(false)}
              </View>
            </View>,
          ];
        });
      })()}
    </View>
    {/* ── Scrollable pages area with custom scrollbar ─────────────────────── */}
    <View style={{ position: 'relative' }}>
      {/* Small warning banner above the pages — only while pagination is still running */}
      {!paginationReady && (
        <View style={styles.scrollWaitBanner}>
          <Text style={styles.scrollWaitText}>⏳ Calculating pages, scroll available soon…</Text>
        </View>
      )}
      {isDeferringMessages && (
        <View style={styles.deferLoading}>
          <ActivityIndicator size="small" color={colors.text || '#1a1a1a'} />
          <Text style={[styles.deferLoadingText, { color: colors.text || '#1a1a1a' }]}>Loading selected book...</Text>
        </View>
      )}
      <FlatList<PageData>
        ref={pagesScrollRef}
        data={paginationReady ? pages : []}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        scrollEnabled={paginationReady}
        windowSize={21}
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={30}
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          scrollYPagesValue.current = y;
          scrollYPages.setValue(y);
          setPagesContentHeight(e.nativeEvent.contentSize.height);
        }}
        onContentSizeChange={undefined}
        onLayout={(e) => setPagesViewHeight(e.nativeEvent.layout.height)}
        style={{ height: paginationReady ? pageHeight + 32 : 0 }}
        nestedScrollEnabled
        contentContainerStyle={styles.pagesContainer}
        renderItem={({ item: pageData }) => {
          const { messages: pageMessages, pageIndex, headerState } = pageData;
          const pageElements: JSX.Element[] = [];

          // ── Year header ──────────────────────────────────────────────────
          if (headerState.showYear && headerState.yearValue) {
            const yearTitle = customTitles.years?.[headerState.yearValue];
            if (DEBUG_PREVIEW_LAYOUT) {
              debugLog('render-year-header', {
                pageIndex: pageIndex + 1,
                year: headerState.yearValue,
                hasYearSubtitle: !!yearTitle?.text,
                yearEstimate: YEAR_HEADER_ESTIMATE,
              });
            }
            pageElements.push(
              <View
                key={`year-${headerState.yearValue}`}
                style={styles.yearHeader}
                onLayout={
                  DEBUG_PREVIEW_LAYOUT
                    ? (e) => {
                        const key = `year:${pageIndex}:${headerState.yearValue}`;
                        if (debugHeaderLayoutKeysRef.current.has(key)) return;
                        debugHeaderLayoutKeysRef.current.add(key);
                        debugLog('header-layout-height', {
                          pageIndex: pageIndex + 1,
                          headerType: 'year',
                          year: headerState.yearValue,
                          estimatedHeight: YEAR_HEADER_ESTIMATE,
                          actualHeight: Number(e.nativeEvent.layout.height.toFixed(2)),
                        });
                      }
                    : undefined
                }
              >
                <Text style={[styles.yearText, { fontSize: fontSize + 12, color: colors.text || '#1a1a1a' }]}>
                  {headerState.yearValue}
                </Text>
                {yearTitle?.text && (
                  <Text
                    style={[
                      styles.yearSubtitle,
                      {
                        fontSize: fontSize + 2,
                        color: colors.text || '#666',
                        fontWeight: yearTitle.bold ? '700' : '400',
                        fontStyle: yearTitle.italic ? 'italic' : 'normal',
                      },
                    ]}
                  >
                    {yearTitle.text}
                  </Text>
                )}
              </View>
            );
          }

          // ── Month header ─────────────────────────────────────────────────
          if (headerState.showMonth && headerState.monthValue) {
            const monthTitle = customTitles.months?.[headerState.monthValue];
            const monthName = getMonthName(headerState.monthNum, dateLanguage);
            if (DEBUG_PREVIEW_LAYOUT) {
              debugLog('render-month-header', {
                pageIndex: pageIndex + 1,
                month: headerState.monthValue,
                monthName,
                hasMonthSubtitle: !!monthTitle?.text,
                monthEstimate: MONTH_HEADER_ESTIMATE,
              });
            }
            pageElements.push(
              <View
                key={`month-${headerState.monthValue}`}
                style={styles.monthHeader}
                onLayout={
                  DEBUG_PREVIEW_LAYOUT
                    ? (e) => {
                        const key = `month:${pageIndex}:${headerState.monthValue}`;
                        if (debugHeaderLayoutKeysRef.current.has(key)) return;
                        debugHeaderLayoutKeysRef.current.add(key);
                        debugLog('header-layout-height', {
                          pageIndex: pageIndex + 1,
                          headerType: 'month',
                          month: headerState.monthValue,
                          estimatedHeight: MONTH_HEADER_ESTIMATE,
                          actualHeight: Number(e.nativeEvent.layout.height.toFixed(2)),
                        });
                      }
                    : undefined
                }
              >
                <Text style={[styles.monthText, { fontSize: fontSize + 6, color: colors.text || '#1a1a1a' }]}>
                  {monthName}
                </Text>
                {monthTitle?.text && (
                  <Text
                    style={[
                      styles.monthSubtitle,
                      {
                        fontSize: fontSize,
                        color: colors.text || '#666',
                        fontWeight: monthTitle.bold ? '700' : '400',
                        fontStyle: monthTitle.italic ? 'italic' : 'normal',
                      },
                    ]}
                  >
                    {monthTitle.text}
                  </Text>
                )}
              </View>
            );
          }

          // ── Date header for header-only pages ────────────────────────────
          if (headerState.showDate && headerState.dateValue && pageMessages.length === 0) {
            if (DEBUG_PREVIEW_LAYOUT) {
              debugLog('render-date-header-only-page', {
                pageIndex: pageIndex + 1,
                formattedDate: headerState.dateValue,
                dateEstimate: DATE_HEADER_ESTIMATE,
              });
            }
            pageElements.push(
              <View
                key={`date-header-only-${pageIndex}`}
                style={styles.dateHeader}
                onLayout={
                  DEBUG_PREVIEW_LAYOUT
                    ? (e) => {
                        const key = `date-only:${pageIndex}:${headerState.dateValue}`;
                        if (debugHeaderLayoutKeysRef.current.has(key)) return;
                        debugHeaderLayoutKeysRef.current.add(key);
                        debugLog('header-layout-height', {
                          pageIndex: pageIndex + 1,
                          headerType: 'date',
                          formattedDate: headerState.dateValue,
                          estimatedHeight: DATE_HEADER_ESTIMATE,
                          actualHeight: Number(e.nativeEvent.layout.height.toFixed(2)),
                          headerOnlyPage: true,
                        });
                      }
                    : undefined
                }
              >
                <Text style={[styles.dateHeaderText, { fontSize: fontSize + 1, color: colors.text || '#666' }]}>
                  {headerState.dateValue}
                </Text>
              </View>
            );
          }

          // ── Message elements ─────────────────────────────────────────────
          // Sender tracking is local to this page, seeded from pre-computed initial state.
          let lastSenderName: string | null = headerState.initialSenderName;
          let lastSenderSide: boolean | null = headerState.initialSenderSide;
          // prevDate = the last date shown before this page (so we don't re-show it for the first msg)
          let lastShownDate: string | null = headerState.showDate ? headerState.dateValue : headerState.prevDate;

          const groupedMessages = (imageLayout === 'grid' || imageLayout === 'maxGrid')
            ? groupConsecutiveImages(pageMessages)
            : pageMessages.map(m => m);

          const messageElements = groupedMessages.map((item, idx) => {
            const msg = Array.isArray(item) ? item[0] : item;
            const msgDateStr = msg.date || msg.sendingTime || '';
            const formattedDate = formatDate(msgDateStr, dateStyle, dateLanguage);

            const showDateHeader = dateFormat === 'full' && msgDateStr && formattedDate !== lastShownDate;
            if (showDateHeader) lastShownDate = formattedDate;

            const elements: JSX.Element[] = [];

            if (showDateHeader) {
              if (DEBUG_PREVIEW_LAYOUT) {
                debugLog('render-date-header', {
                  pageIndex: pageIndex + 1,
                  formattedDate,
                  dateEstimate: DATE_HEADER_ESTIMATE,
                  messageId: String(msg._id),
                  textLength: String(msg.text || '').length,
                });
                if (String(msg.text || '').length > 220) {
                  debugLog('render-long-date-message', {
                    pageIndex: pageIndex + 1,
                    messageId: String(msg._id),
                    splitFragKey: (msg as any).__splitFragKey || null,
                    formattedDate,
                    textLength: String(msg.text || '').length,
                    suppressTimeRow: !!msg.__suppressTimeRow,
                  });
                }
              }
              elements.push(
                <View
                  key={`date-${pageIndex}-${idx}`}
                  style={styles.dateHeader}
                  onLayout={
                    DEBUG_PREVIEW_LAYOUT
                      ? (e) => {
                          const key = `date:${pageIndex}:${formattedDate}`;
                          if (debugHeaderLayoutKeysRef.current.has(key)) return;
                          debugHeaderLayoutKeysRef.current.add(key);
                          debugLog('header-layout-height', {
                            pageIndex: pageIndex + 1,
                            headerType: 'date',
                            formattedDate,
                            estimatedHeight: DATE_HEADER_ESTIMATE,
                            actualHeight: Number(e.nativeEvent.layout.height.toFixed(2)),
                            headerOnlyPage: false,
                          });
                        }
                      : undefined
                  }
                >
                  <Text style={[styles.dateHeaderText, { fontSize: fontSize + 1, color: colors.text || '#666' }]}>
                    {formattedDate}
                  </Text>
                </View>
              );
              lastSenderName = null;
              lastSenderSide = null;
            }

            const currentSenderName = msg.senderName;
            const currentSenderSide = isMessageFromMe(msg.senderName || '', meName);
            const showSenderName = lastSenderName !== currentSenderName || lastSenderSide !== currentSenderSide;
            lastSenderName = currentSenderName;
            lastSenderSide = currentSenderSide;

            const isGroup = Array.isArray(item);
            if (isGroup && item.length >= 2) {
              elements.push(renderImageGrid(item, idx, colors, meName, showTime, dateFormat, fontSize, imageLayout));
              return <React.Fragment key={`msg-group-${idx}`}>{elements}</React.Fragment>;
            }

            const isSender = isMessageFromMe(msg.senderName || '', meName);
            const displayName =
              layout.senderLabelStyle === 'initial' && msg.senderName
                ? msg.senderName.charAt(0).toUpperCase()
                : msg.senderName;
            const timeContent = showTime && dateFormat === 'full'
              ? msg.sendingTime || ''
              : showTime && dateFormat === 'timeOnly'
              ? (msg.sendingTime || '').split(',').pop()?.trim() || msg.sendingTime || ''
              : '';
            const text = msg.text || '';
            const isImage = msg.messageType === 'image';
            const isVideo = msg.messageType === 'video';
            const isAudio = msg.messageType === 'audio';
            const rawMedia = (msg as any).url || (msg as any).localPath;
            let imageUri: string | undefined;
            if (isVideo && (msg as any).thumbnailUrl) {
              imageUri = (msg as any).thumbnailUrl;
            } else if (typeof rawMedia === 'string' && rawMedia.length > 0) {
              if (
                rawMedia.startsWith('http://') ||
                rawMedia.startsWith('https://') ||
                rawMedia.startsWith('data:') ||
                rawMedia.startsWith('file://')
              ) {
                imageUri = rawMedia;
              } else {
                imageUri = `file://${rawMedia}`;
              }
            }
            const isVideoOrAudio = isVideo || isAudio;
            const displayText = stripMediaTitleLine(text, isVideoOrAudio);
            const showText = isImage ? !imageUri : isVideoOrAudio ? displayText.length > 0 : true;
            const imageOnly = isImage && imageUri && !showText;
            const isMedia = msg.messageType === 'image' || msg.messageType === 'video';
            const hideSenderName = isMedia || !showSenderName;

            elements.push(
              <View
                key={msg._id}
                style={[
                  styles.bubbleWrap,
                  {
                    alignSelf: isSender ? 'flex-end' : 'flex-start',
                    maxWidth: '92%',
                    marginHorizontal: 0,
                    minWidth: isVideoOrAudio ? 260 : 120,
                  },
                ]}
              >
                <View
                  onLayout={
                    DEBUG_PREVIEW_LAYOUT
                      ? (e) => {
                          const bubbleH = e.nativeEvent.layout.height;
                          const expectedPair = msgHeights[String(msg._id)];
                          if (!expectedPair) return;
                          const expected = (hideSenderName ? expectedPair.noName : expectedPair.withName) - messageGap;
                          const delta = bubbleH - expected;
                          const splitFragKey = (msg as any).__splitFragKey || 'no-split';
                          const debugKey = `${pageIndex}-${String(msg._id)}-${splitFragKey}-${hideSenderName ? 'noName' : 'withName'}-${String(msg.text || '').length}-${msg.__suppressTimeRow ? 'no-time' : 'with-time'}`;
                          if (Math.abs(delta) > 6 && !debugLoggedBubbleKeysRef.current.has(debugKey)) {
                            debugLoggedBubbleKeysRef.current.add(debugKey);
                            debugLog('bubble-height-mismatch', {
                              pageIndex: pageIndex + 1,
                              messageId: String(msg._id),
                              splitFragKey: (msg as any).__splitFragKey || null,
                              sender: msg.senderName || 'unknown',
                              messageType: msg.messageType || 'text',
                              hideSenderName,
                              expectedBubbleHeight: Number(expected.toFixed(2)),
                              actualBubbleHeight: Number(bubbleH.toFixed(2)),
                              delta: Number(delta.toFixed(2)),
                              textLength: String(msg.text || '').length,
                              suppressTimeRow: !!msg.__suppressTimeRow,
                            });
                          }
                          if (isVideoOrAudio) {
                            const mediaKey = `${pageIndex}-${String(msg._id)}-${splitFragKey}-${hideSenderName ? 'noName' : 'withName'}`;
                            if (!debugMediaLayoutKeysRef.current.has(mediaKey)) {
                              debugMediaLayoutKeysRef.current.add(mediaKey);
                              debugLog('media-bubble-layout', {
                                pageIndex: pageIndex + 1,
                                messageId: String(msg._id),
                                messageType: msg.messageType || 'unknown',
                                splitFragKey: (msg as any).__splitFragKey || null,
                                hideSenderName,
                                expectedBubbleHeight: Number(expected.toFixed(2)),
                                actualBubbleHeight: Number(bubbleH.toFixed(2)),
                                delta: Number(delta.toFixed(2)),
                                textLength: String(msg.text || '').length,
                                hasMonthHeader: pageIndex > 0,
                              });
                            }
                          }
                        }
                      : undefined
                  }
                  style={[
                    styles.bubble,
                    {
                      marginBottom: messageGap,
                      backgroundColor: imageOnly
                        ? 'transparent'
                        : isSender
                        ? colors.senderBubble || '#005C4B'
                        : colors.receiverBubble || '#2A3942',
                      borderTopLeftRadius: 10,
                      borderTopRightRadius: 10,
                      borderBottomLeftRadius: isSender ? 10 : 2,
                      borderBottomRightRadius: isSender ? 2 : 10,
                      borderWidth: 0,
                      borderColor: 'transparent',
                      shadowColor: 'rgba(0,0,0,0.08)',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.08,
                      shadowRadius: 2,
                      elevation: 1,
                      overflow: 'hidden',
                      paddingHorizontal: imageOnly ? 0 : 10,
                      paddingVertical: imageOnly ? 0 : 6,
                    },
                  ]}
                >
                  {!hideSenderName && (
                    <Text
                      style={[
                        styles.senderName,
                        {
                          color: isSender ? colors.senderText || '#FFFFFF' : colors.receiverText || '#FFFFFF',
                          fontSize: fontSize - 1,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {displayName}
                    </Text>
                  )}
                  {showText && (
                    <Text
                      style={[
                        styles.messageText,
                        {
                          color: isSender ? colors.senderText || '#FFFFFF' : colors.receiverText || '#FFFFFF',
                          fontSize,
                          lineHeight: fontSize * lineHeight,
                          fontFamily,
                          fontWeight: messageBold ? '700' : '400',
                          fontStyle: messageItalic ? 'italic' : 'normal',
                        },
                      ]}
                    >
                      {isVideoOrAudio ? displayText : text}
                    </Text>
                  )}
                  {isImage && imageUri ? (
                    <Image
                      source={{ uri: imageUri }}
                      style={[styles.messageImage, imageOnly ? styles.messageImageNoBorder : null]}
                      resizeMode="cover"
                    />
                  ) : null}
                  {(isVideo || isAudio) ? (
                    <View style={styles.qrContainer}>
                      {isVideo ? (
                        <View style={styles.videoThumbnailContainer}>
                          {imageUri ? (
                            <>
                              <Image source={{ uri: imageUri }} style={styles.videoThumbnail} resizeMode="cover" />
                              <View style={styles.playIconOverlay}>
                                <Text style={styles.playIcon}>▶</Text>
                              </View>
                            </>
                          ) : (
                            <View style={[styles.videoThumbnail, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#333' }]}>
                              <Text style={styles.playIcon}>▶</Text>
                            </View>
                          )}
                        </View>
                      ) : null}
                      <View style={styles.qrCodeSection}>
                        {(msg as any).qrUrl ? (
                          <Image source={{ uri: (msg as any).qrUrl }} style={styles.qrImage} resizeMode="contain" />
                        ) : (
                          <View style={[styles.qrImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 8 }]}>
                            <Text style={{ fontSize: 28 }}>{isAudio ? '🎵' : '🎬'}</Text>
                            <Text style={{ fontSize: 9, color: '#999', marginTop: 4, textAlign: 'center' }}>QR pending</Text>
                          </View>
                        )}
                        <Text style={[styles.qrLabel, { fontSize: Math.max(8, fontSize - 2), color: isSender ? colors.senderText || '#FFFFFF' : colors.receiverText || '#FFFFFF' }]}>
                          {isVideo ? 'Scan to watch video' : 'Scan to listen'}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                  {timeContent && !msg.__suppressTimeRow ? (
                    <View style={styles.messageTimeRow}>
                      <Text style={styles.messageTimeSpacer} />
                      <Text
                        style={[
                          styles.messageTime,
                          {
                            color: isSender ? colors.senderText || '#FFFFFF' : colors.receiverText || '#FFFFFF',
                            fontSize: fontSize - 2,
                          },
                        ]}
                      >
                        {timeContent}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            );

            return <React.Fragment key={`msg-${idx}`}>{elements}</React.Fragment>;
          });

          return (
            <View
              style={[
                styles.page,
                {
                  width: containerWidth,
                  height: pageHeight,
                  backgroundColor: colors.background || '#ECE5DD',
                  paddingHorizontal: 12,
                  paddingVertical: 16,
                  paddingBottom: 24,
                  overflow: 'hidden',
                },
              ]}
            >
              <View
                onLayout={
                  DEBUG_PREVIEW_LAYOUT
                    ? (e) => {
                        const contentHeight = e.nativeEvent.layout.height;
                        const innerAvailableHeight = pageHeight - 16 - 24;
                        const estimatedHeight = debugEstimatedPageHeights[pageIndex];
                        const exceeds = contentHeight - innerAvailableHeight;
                        const hasMediaOnPage = pageMessages.some(
                          (m) => m.messageType === 'video' || m.messageType === 'audio'
                        );
                        debugPageMetricsRef.current[pageIndex] = {
                          ...debugPageMetricsRef.current[pageIndex],
                          contentHeight,
                          estimatedHeight,
                        };
                        if (
                          exceeds > 2 ||
                          Math.abs((estimatedHeight ?? 0) - contentHeight) > 10 ||
                          (hasMediaOnPage && exceeds > -8)
                        ) {
                          debugLog('page-height-check', {
                            pageIndex: pageIndex + 1,
                            pageMessages: pageMessages.length,
                            hasMediaOnPage,
                            estimatedContentHeight: estimatedHeight !== undefined ? Number(estimatedHeight.toFixed(2)) : null,
                            actualContentHeight: Number(contentHeight.toFixed(2)),
                            innerAvailableHeight: Number(innerAvailableHeight.toFixed(2)),
                            overflowBy: Number(exceeds.toFixed(2)),
                            remainingSpace: Number((innerAvailableHeight - contentHeight).toFixed(2)),
                            estimateVsActualDelta:
                              estimatedHeight !== undefined
                                ? Number((contentHeight - estimatedHeight).toFixed(2))
                                : null,
                          });
                        }
                      }
                    : undefined
                }
              >
                {pageElements}
                {messageElements}
              </View>

              {showPageNumbers && (
                <Text
                  style={[
                    styles.pageNumber,
                    {
                      color: '#000000',
                      fontSize: 9,
                      position: 'absolute',
                      bottom: 8,
                      left: 0,
                      right: 0,
                    },
                  ]}
                >
                  {pageIndex + 1} / {totalPreviewPages}
                </Text>
              )}
            </View>
          );
        }}
      />

      {/* Custom scrollbar — only visible when content overflows and pages are ready */}
      {paginationReady && pagesContentHeight > pagesViewHeight && (
        <TouchableOpacity
          activeOpacity={1}
          onLayout={(e) => {
            const { y, height } = e.nativeEvent.layout;
            setTrackLayout({ y, height });
          }}
          onPress={(e) => {
            // Suppress onPress if this tap was actually the end of a thumb drag
            if (isDraggingThumb.current) return;
            if (trackLayout.height <= 0 || thumbTravel <= 0) return;
            const tapY = Math.max(0, Math.min(e.nativeEvent.locationY, trackLayout.height));
            const ratio = tapY / trackLayout.height;
            const newOffset = ratio * maxScrollOffset;
            pagesScrollRef.current?.scrollToOffset({ offset: newOffset, animated: true });
          }}
          style={styles.scrollbarTrack}
        >
          <Animated.View
            style={[
              styles.scrollbarThumb,
              {
                height: thumbHeight,
                transform: [{ translateY: thumbTranslateY }],
              },
            ]}
            {...panResponder.panHandlers}
          />
        </TouchableOpacity>
      )}
    </View>
    </>
  );
};

export const BookPreviewPages = React.memo(BookPreviewPagesComponent);
BookPreviewPages.displayName = 'BookPreviewPages';

const styles = StyleSheet.create({
  pagesContainer: { paddingVertical: 8, paddingRight: 16 }, // right padding so pages don't overlap scrollbar
  deferLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  deferLoadingText: {
    fontSize: 12,
    opacity: 0.8,
  },
  page: {
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  bubbleWrap: {
    maxWidth: '92%',
    minWidth: 120,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  senderName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  messageText: {
    flexWrap: 'wrap',
    paddingRight: 60, // Reserve space for inline time
  },
  messageTimeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginTop: -20, // Pull time up to overlap with last line of text
  },
  messageTimeSpacer: {
    flex: 1,
  },
  messageTime: {
    opacity: 0.7,
    paddingLeft: 8,
    textAlign: 'right',
  },
  messageImage: {
    marginTop: 6,
    borderRadius: 8,
    width: '100%',
    minWidth: 150,
    aspectRatio: 1,
    maxHeight: 200,
    backgroundColor: '#e8e8e8',
  },
  messageImageNoBorder: {
    marginTop: 0,
    borderRadius: 18,
  },
  qrContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  videoThumbnailContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e8e8e8',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  playIconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playIcon: {
    fontSize: 32,
    color: '#fff',
  },
  qrCodeSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  qrImage: {
    width: 120,
    height: 120,
  },
  qrLabel: {
    marginTop: 4,
    opacity: 0.8,
    textAlign: 'center',
  },
  pageNumber: {
    textAlign: 'center',
    marginTop: 8,
  },
  dateHeader: {
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 6,
  },
  dateHeaderText: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  yearHeader: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  yearText: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  yearSubtitle: {
    textAlign: 'center',
    opacity: 0.8,
  },
  monthHeader: {
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  monthText: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  monthSubtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  imageGrid: {
    marginBottom: 10,
    borderRadius: 18,
    overflow: 'hidden',
    maxWidth: '100%',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 2,
  },
  gridColumn: {
    flexDirection: 'column',
    gap: 2,
    flex: 1,
  },
  gridImage2: {
    width: '49%',
    aspectRatio: 1,
    backgroundColor: '#e8e8e8',
  },
  gridImageLarge: {
    width: '66%',
    aspectRatio: 0.75,
    backgroundColor: '#e8e8e8',
  },
  gridImageSmall: {
    width: '100%',
    aspectRatio: 1.5,
    backgroundColor: '#e8e8e8',
  },
  gridImage4: {
    width: '49%',
    aspectRatio: 1,
    backgroundColor: '#e8e8e8',
  },
  gridTime: {
    opacity: 0.7,
    marginTop: 2,
  },
  scrollbarTrack: {
    position: 'absolute',
    right: 2,
    top: 0,
    bottom: 0,
    width: 10,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 5,
  },
  scrollbarThumb: {
    width: 10,
    backgroundColor: 'rgba(100,100,100,0.55)',
    borderRadius: 5,
  },
  scrollWaitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 6,
    marginBottom: 6,
  },
  scrollWaitText: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
  },
});
