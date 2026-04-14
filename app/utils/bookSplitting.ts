/**
 * Book Splitting Utilities
 * Helper functions for splitting large chats into multiple 200-page books
 */

import { IMessage } from '../interfaces/IMessage';

export interface Book {
  bookNumber: number;
  messages: IMessage[];
  estimatedPages: number;
  dateRange: {
    from: string;
    to: string;
  };
}

/**
 * Estimate total pages from messages
 * Uses same logic as BookPreviewPages component
 */
export function estimatePages(messages: IMessage[], format: string): number {
  const dimensions = format === 'square_14x14' 
    ? { width: 595, height: 595 }
    : { width: 560, height: 820 };
  
  const PAGE_OVERHEAD = 56; // padding + page number
  const availableHeight = dimensions.height - PAGE_OVERHEAD;
  
  let totalHeight = 0;
  
  messages.forEach(msg => {
    if (msg.messageType === 'image') {
      // Image: 200px image + 13px time + 10px gap
      totalHeight += 223;
    } else if (msg.messageType === 'video' || msg.messageType === 'audio') {
      // Video/Audio: QR code + thumbnail ~170px
      totalHeight += 170;
    } else {
      // Text message: estimate based on text length
      const text = msg.text || '';
      const avgCharsPerLine = 40;
      const lines = Math.max(1, Math.ceil(text.length / avgCharsPerLine));
      // senderName + text lines + time + padding + gap
      totalHeight += (11 + 2) + (lines * 11 * 1.5) + (9 + 4) + 20 + 10;
    }
  });
  
  return Math.ceil(totalHeight / availableHeight);
}

/**
 * Split messages into books with max pages per book
 * Returns array of books with metadata
 */
export function splitIntoBooks(
  messages: IMessage[], 
  maxPagesPerBook: number = 200
): Book[] {
  const books: Book[] = [];
  let currentBook: IMessage[] = [];
  let currentPages = 0;
  let bookNumber = 1;
  
  for (const msg of messages) {
    // Rough page estimate per message
    let msgPages = 0;
    if (msg.messageType === 'image') {
      msgPages = 0.4; // ~2.5 images per page
    } else if (msg.messageType === 'video' || msg.messageType === 'audio') {
      msgPages = 0.3; // ~3 videos per page
    } else {
      // Text: estimate based on length
      const textLength = (msg.text || '').length;
      msgPages = Math.max(0.1, textLength / 500); // ~500 chars per page
    }
    
    // Check if adding this message would exceed max pages
    if (currentPages + msgPages > maxPagesPerBook && currentBook.length > 0) {
      // Save current book
      books.push({
        bookNumber,
        messages: currentBook,
        estimatedPages: Math.ceil(currentPages),
        dateRange: {
          from: currentBook[0].date || currentBook[0].sendingTime || '',
          to: currentBook[currentBook.length - 1].date || currentBook[currentBook.length - 1].sendingTime || '',
        },
      });
      
      // Start new book
      bookNumber++;
      currentBook = [msg];
      currentPages = msgPages;
    } else {
      currentBook.push(msg);
      currentPages += msgPages;
    }
  }
  
  // Add last book
  if (currentBook.length > 0) {
    books.push({
      bookNumber,
      messages: currentBook,
      estimatedPages: Math.ceil(currentPages),
      dateRange: {
        from: currentBook[0].date || currentBook[0].sendingTime || '',
        to: currentBook[currentBook.length - 1].date || currentBook[currentBook.length - 1].sendingTime || '',
      },
    });
  }
  
  return books;
}

/**
 * Format date for display in alerts
 */
export function formatDateRange(dateStr: string): string {
  if (!dateStr) return 'Unknown';
  
  // Parse DD/MM/YYYY format
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      return `${day}/${month}/${year}`;
    }
  }
  
  return dateStr;
}
