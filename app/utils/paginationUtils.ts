/**
 * Pagination Utilities
 * Shared logic for calculating pages and splitting books
 * Used by both chat.tsx (for splitting) and BookPreviewPages (for rendering)
 */

import { IMessage } from '../interfaces/IMessage';

// Match PDF dimensions exactly - same as BookPreviewPages
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

const PAGE_OVERHEAD = 56; // paddingVertical*2 (32) + page number area (~24)
const MESSAGE_GAP = 10; // gap between messages

/**
 * Estimate height of a single message
 * Mimics the actual rendering logic in BookPreviewPages
 * 
 * IMPORTANT: This estimates based on PDF dimensions (no scale)
 * The preview scales down for screen display, but PDF uses full dimensions
 */
export function estimateMessageHeight(msg: IMessage): number {
  const isImage = msg.messageType === 'image';
  const isVideoOrAudio = msg.messageType === 'video' || msg.messageType === 'audio';
  const hasImageUri = isImage && (msg.localPath || (msg as any).url);
  const showText = !isImage || !hasImageUri;
  
  if (isImage && hasImageUri) {
    // Image: 200px image height + gap
    return 200 + MESSAGE_GAP;
  } else if (isVideoOrAudio) {
    // Video/Audio: always reserve space for QR container (shown with placeholder if qrUrl not yet available)
    return (120 + 16 + 20 + 4) + MESSAGE_GAP;
  } else {
    // Text message: estimate based on actual rendering
    const fontSize = 11;
    const lineHeight = 1.5;
    const text = msg.text || '';
    
    let height = 0;
    
    // Sender name line (if not image/video)
    if (!isImage && !isVideoOrAudio) {
      height += (fontSize - 1) + 2; // sender name + marginBottom
    }
    
    // Text content - CRITICAL: Account for maxWidth 92% and padding
    if (text && showText && !isVideoOrAudio) {
      // Message bubble has maxWidth: 92%, minWidth: 120, paddingHorizontal: 14
      // So effective text width is less than full page width
      // Conservative estimate: ~35-40 chars per line (not 45)
      const avgCharsPerLine = 38;
      const lines = Math.max(1, Math.ceil(text.length / avgCharsPerLine));
      height += lines * fontSize * lineHeight;
    }
    
    // Time line
    if (showText) {
      height += (fontSize - 2) + 4; // time + marginTop
    }
    
    // Padding (only for text messages, not images)
    if (!isImage || !hasImageUri) {
      height += 20; // paddingVertical (10 top + 10 bottom)
    }
    
    return height + MESSAGE_GAP;
  }
}

/**
 * Paginate messages based on available height
 * Returns array of pages, each page is an array of messages
 */
export function paginateMessages(
  messages: IMessage[],
  format: 'square_14x14' | 'standard_14_8x21'
): IMessage[][] {
  const dimensions = PAGE_DIMENSIONS[format];
  const availableHeight = dimensions.height - PAGE_OVERHEAD;
  
  const pages: IMessage[][] = [];
  let currentPage: IMessage[] = [];
  let usedHeight = 0;
  
  for (const msg of messages) {
    const msgHeight = estimateMessageHeight(msg);
    
    // Check if message fits on current page
    if (usedHeight + msgHeight > availableHeight && currentPage.length > 0) {
      // Page is full, start new page
      pages.push(currentPage);
      currentPage = [msg];
      usedHeight = msgHeight;
    } else {
      // Add to current page
      currentPage.push(msg);
      usedHeight += msgHeight;
    }
  }
  
  // Add last page
  if (currentPage.length > 0) {
    pages.push(currentPage);
  }
  
  return pages;
}

/**
 * Calculate total pages for messages
 */
export function calculateTotalPages(
  messages: IMessage[],
  format: 'square_14x14' | 'standard_14_8x21'
): number {
  const pages = paginateMessages(messages, format);
  return pages.length;
}

/**
 * Split messages into books with max pages per book
 * Uses actual pagination logic, not estimation
 */
export function splitIntoBooksByPages(
  messages: IMessage[],
  format: 'square_14x14' | 'standard_14_8x21',
  maxPagesPerBook: number = 200
): Array<{
  bookNumber: number;
  messages: IMessage[];
  pages: number;
  dateRange: { from: string; to: string };
}> {
  const books: Array<{
    bookNumber: number;
    messages: IMessage[];
    pages: number;
    dateRange: { from: string; to: string };
  }> = [];
  
  let bookNumber = 1;
  let currentBookMessages: IMessage[] = [];
  let currentBookPages = 0;
  
  for (const msg of messages) {
    // Add message to current book temporarily
    const testMessages = [...currentBookMessages, msg];
    const testPages = calculateTotalPages(testMessages, format);
    
    // Check if adding this message exceeds max pages
    if (testPages > maxPagesPerBook && currentBookMessages.length > 0) {
      // Save current book
      books.push({
        bookNumber,
        messages: currentBookMessages,
        pages: currentBookPages,
        dateRange: {
          from: currentBookMessages[0].date || currentBookMessages[0].sendingTime || '',
          to: currentBookMessages[currentBookMessages.length - 1].date || currentBookMessages[currentBookMessages.length - 1].sendingTime || '',
        },
      });
      
      // Start new book
      bookNumber++;
      currentBookMessages = [msg];
      currentBookPages = calculateTotalPages([msg], format);
    } else {
      // Add to current book
      currentBookMessages.push(msg);
      currentBookPages = testPages;
    }
  }
  
  // Add last book
  if (currentBookMessages.length > 0) {
    books.push({
      bookNumber,
      messages: currentBookMessages,
      pages: currentBookPages,
      dateRange: {
        from: currentBookMessages[0].date || currentBookMessages[0].sendingTime || '',
        to: currentBookMessages[currentBookMessages.length - 1].date || currentBookMessages[currentBookMessages.length - 1].sendingTime || '',
      },
    });
  }
  
  return books;
}
