/**
 * Preview pages renderer — WhatsApp-style layout.
 * Height-based pagination to match selected page dimensions. Text preserves newlines.
 */
import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { IMessage } from '../../interfaces/IMessage';
import { ResolvedThemeConfig } from '../../themes/types';

// Match PDF dimensions exactly - same as backend pdfService.js
const PAGE_DIMENSIONS = {
  square_14x14: {
    width: 595,
    height: 595,
  },
  standard_14_8x21: {
    width: 560,
    height: 820,
  },
};

// Overhead: paddingVertical*2 (32) + page number area (~24)
const PAGE_OVERHEAD = 56;

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
            color: isSender ? colors.senderText || '#000' : colors.receiverText || '#000',
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
            color: isSender ? colors.senderText || '#000' : colors.receiverText || '#000',
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
            color: isSender ? colors.senderText || '#000' : colors.receiverText || '#000',
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
            color: isSender ? colors.senderText || '#000' : colors.receiverText || '#000',
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
}

export const BookPreviewPages: React.FC<BookPreviewPagesProps> = ({
  messages,
  resolvedConfig,
  containerWidth,
  format = 'standard_14_8x21',
}) => {
  // Get exact dimensions based on format - matches PDF generation
  const dimensions = PAGE_DIMENSIONS[format as keyof typeof PAGE_DIMENSIONS] || PAGE_DIMENSIONS.standard_14_8x21;
  
  // Calculate scale to fit container width while maintaining exact aspect ratio
  const scale = containerWidth / dimensions.width;
  const pageHeight = dimensions.height * scale;

  const colors = resolvedConfig.colors || {};
  const layout = resolvedConfig.layout || {};
  const messageGap = 10;
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
  const meName = useMemo(() => getMostFrequentSenderName(filteredMessages), [filteredMessages]);

  // ── Height-based pagination ──────────────────────────────────────────────
  const [msgHeights, setMsgHeights] = useState<Record<string, number>>({});
  const measuredRef = useRef<Record<string, number>>({});
  const pendingRef = useRef<number>(0);
  const [paginationReady, setPaginationReady] = useState(false);

  const messageKey = filteredMessages.map(m => String(m._id)).join(',');
  useEffect(() => {
    if (containerWidth <= 0) return; // wait for valid layout width
    measuredRef.current = {};
    pendingRef.current = filteredMessages.length;
    setMsgHeights({});
    setPaginationReady(filteredMessages.length === 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageKey, containerWidth]); // re-measure if containerWidth changes

  const onMsgLayout = useCallback((id: string, h: number) => {
    if (id in measuredRef.current) return;
    measuredRef.current[id] = h;
    pendingRef.current = Math.max(0, pendingRef.current - 1);
    if (pendingRef.current === 0) {
      setMsgHeights({ ...measuredRef.current });
      setPaginationReady(true);
    }
  }, []);
  
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
  
  // Height-based pages — fit messages into each page based on available height
  const availableHeight = pageHeight - PAGE_OVERHEAD;
  const pages: IMessage[][] = useMemo(() => {
    if (!paginationReady) return [];

    const result: IMessage[][] = [];
    let currentPage: IMessage[] = [];
    let usedH = 0;
    let lastYear: string | null = null;
    let lastMonth: string | null = null;
    let lastDate: string | null = null;

    // For grid layout: pre-group consecutive images so pagination uses grid heights
    // (smaller than full-page image height), allowing multiple images per page.
    type PaginationItem = { messages: IMessage[]; height: number };
    let items: PaginationItem[];

    if (imageLayout === 'grid' || imageLayout === 'maxGrid') {
      const grouped = groupConsecutiveImages(filteredMessages);
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
      for (const item of grouped) {
        if (!Array.isArray(item)) {
          items.push({ messages: [item], height: msgHeights[String(item._id)] ?? 65 });
          continue;
        }
        // Split large groups into chunks that fit within one page
        const chunkSize = item.length > maxImagesPerPage ? maxImagesPerPage : item.length;
        for (let i = 0; i < item.length; i += chunkSize) {
          const chunk = item.slice(i, i + chunkSize);
          items.push({ messages: chunk, height: getGridH(chunk.length) });
        }
      }
    } else {
      items = filteredMessages.map(msg => ({
        messages: [msg],
        height: msgHeights[String(msg._id)] ?? 65,
      }));
    }

    for (const item of items) {
      const firstMsg = item.messages[0];
      const rawMsgH = item.height;
      let headerH = 0;

      if (dateFormat === 'full') {
        const msgDateStr = firstMsg.date || firstMsg.sendingTime || '';
        const ym = getYearMonth(msgDateStr);
        const formattedDate = formatDate(msgDateStr, dateStyle, dateLanguage);
        if (ym && ym.year !== lastYear) headerH += 68;
        if (ym && ym.month !== lastMonth) headerH += 48;
        if (formattedDate && formattedDate !== lastDate) headerH += 44;
      }

      const totalH = rawMsgH + headerH;

      // Special case: headers + message don't fit on an empty page.
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

      if (usedH + totalH > availableHeight && currentPage.length > 0) {
        result.push(currentPage);
        currentPage = [...item.messages];
        usedH = totalH;
      } else {
        currentPage.push(...item.messages);
        usedH += totalH;
      }

      // Update header tracking — use last message in group for date tracking
      if (dateFormat === 'full') {
        const lastMsg = item.messages[item.messages.length - 1];
        const msgDateStr = lastMsg.date || lastMsg.sendingTime || '';
        const ym = getYearMonth(msgDateStr);
        const formattedDate = formatDate(msgDateStr, dateStyle, dateLanguage);
        if (ym) { lastYear = ym.year; lastMonth = ym.month; }
        if (formattedDate) lastDate = formattedDate;
      }
    }

    if (currentPage.length > 0) result.push(currentPage);
    return result.length > 0 ? result : (filteredMessages.length > 0 ? [filteredMessages] : []);
  }, [paginationReady, msgHeights, filteredMessages, availableHeight, dateFormat, dateStyle, dateLanguage, imageLayout, containerWidth]);
  const totalPreviewPages = pages.length;

  return (
    <>
    {/* Hidden measurement pass — renders all messages off-screen to capture heights */}
    <View pointerEvents="none" style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: containerWidth, zIndex: -1 }}>
      {containerWidth > 0 && filteredMessages.map((msg) => {
        const isImage = msg.messageType === 'image';
        const isVideoOrAudio = msg.messageType === 'video' || msg.messageType === 'audio';
        const rawMedia = (msg as any).url || (msg as any).localPath;
        const hasImageUri = typeof rawMedia === 'string' && rawMedia.length > 0;
        const showText = !isImage || !hasImageUri;
        return (
          <View
            key={`measure-${msg._id}`}
            onLayout={(e) => onMsgLayout(String(msg._id), e.nativeEvent.layout.height + messageGap)}
            style={{
              alignSelf: 'flex-start',
              maxWidth: '92%',
              minWidth: 120,
              paddingHorizontal: isImage && hasImageUri ? 0 : 14,
              paddingVertical: isImage && hasImageUri ? 0 : 10,
              marginBottom: messageGap,
            }}
          >
            {!isImage && !isVideoOrAudio && <Text style={{ fontWeight: '600', fontSize: fontSize - 1, marginBottom: 2 }}>{msg.senderName || ''}</Text>}
            {showText && !isVideoOrAudio && <Text style={{ fontSize, lineHeight: fontSize * lineHeight }}>{msg.text || ''}</Text>}
            {isImage && hasImageUri && <View style={{ width: 200, height: 200 }} />}
            {isVideoOrAudio && (msg as any).qrUrl && (
              <View style={{ flexDirection: 'row', gap: 12, width: '100%', height: 120 + 16 + 20 + 4 }} />
            )}
            {showTime && <Text style={{ fontSize: fontSize - 2, marginTop: 4 }}>{msg.sendingTime || ''}</Text>}
          </View>
        );
      })}
    </View>
    <View style={styles.pagesContainer}>
      {(() => {
        let lastShownDate: string | null = null;
        let lastShownYear: string | null = null;
        let lastShownMonth: string | null = null;
        let globalMessageIndex = 0;
        let lastSenderName: string | null = null; // Track sender across pages
        let lastSenderSide: boolean | null = null; // Track sender side (true/false)

        return pages.map((pageMessages, pageIndex) => {
          const pageElements: JSX.Element[] = [];
          
          // Check if we need year/month headers at start of this page.
          // For empty header-only pages, derive the date from the next page's first message.
          const headerSourceMsg = pageMessages.length > 0
            ? pageMessages[0]
            : pages[pageIndex + 1]?.[0];
          if (headerSourceMsg && dateFormat === 'full') {
            const firstMsg = headerSourceMsg;
            const msgDateStr = firstMsg.date || firstMsg.sendingTime || '';
            const yearMonth = getYearMonth(msgDateStr);
            
            if (yearMonth) {
              // Year header (if year changed)
              if (yearMonth.year !== lastShownYear) {
                const yearTitle = customTitles.years?.[yearMonth.year];
                pageElements.push(
                  <View key={`year-${yearMonth.year}`} style={styles.yearHeader}>
                    <Text style={[styles.yearText, { fontSize: fontSize + 12, color: colors.text || '#1a1a1a' }]}>
                      {yearMonth.year}
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
                          }
                        ]}
                      >
                        {yearTitle.text}
                      </Text>
                    )}
                  </View>
                );
                lastShownYear = yearMonth.year;
                // Reset sender tracking when year changes
                lastSenderName = null;
                lastSenderSide = null;
              }
              
              // Month header (if month changed)
              if (yearMonth.month !== lastShownMonth) {
                const monthTitle = customTitles.months?.[yearMonth.month];
                const monthName = getMonthName(yearMonth.monthNum, dateLanguage);
                pageElements.push(
                  <View key={`month-${yearMonth.month}`} style={styles.monthHeader}>
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
                          }
                        ]}
                      >
                        {monthTitle.text}
                      </Text>
                    )}
                  </View>
                );
                lastShownMonth = yearMonth.month;
                // Reset sender tracking when month changes
                lastSenderName = null;
                lastSenderSide = null;
              }
            }

            // For header-only pages (no messages), also render the date header
            if (pageMessages.length === 0 && headerSourceMsg) {
              const msgDateStr = headerSourceMsg.date || headerSourceMsg.sendingTime || '';
              const formattedDate = formatDate(msgDateStr, dateStyle, dateLanguage);
              if (formattedDate && formattedDate !== lastShownDate) {
                pageElements.push(
                  <View key={`date-header-only-${pageIndex}`} style={styles.dateHeader}>
                    <Text style={[styles.dateHeaderText, { fontSize: fontSize + 1, color: colors.text || '#666' }]}>
                      {formattedDate}
                    </Text>
                  </View>
                );
                lastShownDate = formattedDate;
                // Reset sender tracking when date changes
                lastSenderName = null;
                lastSenderSide = null;
              }
            }
          }

          // Group messages if grid layout is selected
          const groupedMessages = (imageLayout === 'grid' || imageLayout === 'maxGrid')
            ? groupConsecutiveImages(pageMessages)
            : pageMessages.map(m => m);

          const messageElements = groupedMessages.map((item, idx) => {
            const msg = Array.isArray(item) ? item[0] : item;
            const msgDateStr = msg.date || msg.sendingTime || '';
            const formattedDate = formatDate(msgDateStr, dateStyle, dateLanguage);
            
            // Show date header only if date changed and dateFormat is 'full'
            const showDateHeader = dateFormat === 'full' && msgDateStr && formattedDate !== lastShownDate;
            if (showDateHeader) {
              lastShownDate = formattedDate;
            }

            const elements: JSX.Element[] = [];
            
            // Add date header if needed
            if (showDateHeader) {
              elements.push(
                <View key={`date-${globalMessageIndex}`} style={styles.dateHeader}>
                  <Text style={[styles.dateHeaderText, { fontSize: fontSize + 1, color: colors.text || '#666' }]}>
                    {formattedDate}
                  </Text>
                </View>
              );
              // Reset sender tracking when date changes
              lastSenderName = null;
              lastSenderSide = null;
            }
            
            // Check if we should show sender name (WhatsApp-style grouping across pages)
            const currentSenderName = msg.senderName;
            const currentSenderSide = isMessageFromMe(msg.senderName || '', meName);
            const showSenderName = lastSenderName !== currentSenderName || lastSenderSide !== currentSenderSide;
            
            // Update tracking for next message
            lastSenderName = currentSenderName;
            lastSenderSide = currentSenderSide;
            
            globalMessageIndex++;
            
            // Check if item is a group of images
            const isGroup = Array.isArray(item);
            
            if (isGroup && item.length >= 2) {
              // Render image grid
              elements.push(renderImageGrid(item, idx, colors, meName, showTime, dateFormat, fontSize, imageLayout));
              return <React.Fragment key={`msg-group-${idx}`}>{elements}</React.Fragment>;
            }
            
            // Single message (text or single image)
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
            
            // For videos, use thumbnailUrl if available, otherwise fall back to video URL
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
            const showText = !isImage || !imageUri;
            const imageOnly = isImage && imageUri && !showText;
            const isMedia = msg.messageType === 'image' || msg.messageType === 'video';
            const hideSenderName = isMedia || !showSenderName; // Hide if media OR if same sender as previous

            elements.push(
              <View
                key={msg._id}
                style={[
                  styles.bubbleWrap,
                  {
                    alignSelf: isSender ? 'flex-end' : 'flex-start',
                    maxWidth: '92%',
                    marginHorizontal: 0,
                  },
                ]}
              >
                <View
                  style={[
                    styles.bubble,
                    {
                      marginBottom: messageGap,
                      backgroundColor: imageOnly
                        ? 'transparent'
                        : isSender
                        ? colors.senderBubble || '#dcf8c6'
                        : colors.receiverBubble || '#ffffff',
                      borderTopLeftRadius: 18,
                      borderTopRightRadius: 18,
                      borderBottomLeftRadius: isSender ? 18 : 4,
                      borderBottomRightRadius: isSender ? 4 : 18,
                      borderWidth: 0,
                      borderColor: 'transparent',
                      shadowColor: 'rgba(0,0,0,0.08)',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.08,
                      shadowRadius: 2,
                      elevation: 1,
                      overflow: 'hidden',
                      paddingHorizontal: imageOnly ? 0 : 14,
                      paddingVertical: imageOnly ? 0 : 10,
                    },
                  ]}
                >
                  {!hideSenderName && (
                    <Text
                      style={[
                        styles.senderName,
                        {
                          color: isSender ? colors.senderText : colors.receiverText,
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
                          color: isSender ? colors.senderText : colors.receiverText,
                          fontSize,
                          lineHeight: fontSize * lineHeight,
                          fontFamily,
                          fontWeight: messageBold ? '700' : '400',
                          fontStyle: messageItalic ? 'italic' : 'normal',
                        },
                      ]}
                    >
                      {text}
                    </Text>
                  )}
                  {isImage && imageUri ? (
                    <Image
                      source={{ uri: imageUri }}
                      style={[styles.messageImage, imageOnly ? styles.messageImageNoBorder : null]}
                      resizeMode="cover"
                    />
                  ) : null}
                  {(isVideo || isAudio) && (msg as any).qrUrl ? (
                    <View style={styles.qrContainer}>
                      {isVideo && imageUri ? (
                        <View style={styles.videoThumbnailContainer}>
                          <Image
                            source={{ uri: imageUri }}
                            style={styles.videoThumbnail}
                            resizeMode="cover"
                          />
                          <View style={styles.playIconOverlay}>
                            <Text style={styles.playIcon}>▶</Text>
                          </View>
                        </View>
                      ) : null}
                      <View style={styles.qrCodeSection}>
                        <Image
                          source={{ uri: (msg as any).qrUrl }}
                          style={styles.qrImage}
                          resizeMode="contain"
                        />
                        <Text style={[styles.qrLabel, { fontSize: Math.max(8, fontSize - 2), color: isSender ? colors.senderText || '#000' : colors.receiverText || '#000' }]}>
                          {isVideo ? 'Scan to watch video' : 'Scan to listen'}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                  {timeContent ? (
                    <Text
                      style={[
                        styles.messageTime,
                        {
                          color: isSender ? colors.senderText : colors.receiverText,
                          fontSize: fontSize - 2,
                          textAlign: isSender ? 'right' : 'left',
                        },
                      ]}
                    >
                      {timeContent}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
            
            return <React.Fragment key={`msg-${idx}`}>{elements}</React.Fragment>;
          });

          return (
            <View
              key={`page-${pageIndex}`}
              style={[
                styles.page,
                {
                  width: containerWidth,
                  height: pageHeight,
                  backgroundColor: colors.background || '#e5ddd5',
                  paddingHorizontal: 12,
                  paddingVertical: 16,
                },
              ]}
            >
              {pageElements}
              {messageElements}

              {showPageNumbers && (
                <Text
                  style={[
                    styles.pageNumber,
                    { color: colors.text || '#1a1a1a', fontSize: 9, position: 'absolute', bottom: 8, left: 0, right: 0 },
                  ]}
                >
                  {pageIndex + 1} / {totalPreviewPages}
                </Text>
              )}
            </View>
          );
        });
      })()}
    </View>
    </>
  );
};

const styles = StyleSheet.create({
  pagesContainer: { paddingVertical: 8 },
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
  },
  messageTime: {
    opacity: 0.7,
    marginTop: 4,
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
    opacity: 0.6,
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
});
