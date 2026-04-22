/**
 * Accurate Book Splitting Utilities
 * Splits books based on ACTUAL page calculations from BookPreviewPages
 * Uses real layout measurements, not estimations
 */

import { IMessage } from '../interfaces/IMessage';

export interface AccurateBook {
  bookNumber: number;
  messages: IMessage[];
  actualPages: number;
  dateRange: {
    from: string;
    to: string;
  };
}

/**
 * Split messages into books based on ACTUAL page breaks
 * 
 * @param pages - Array of pages from BookPreviewPages (each page is array of messages)
 * @param maxPagesPerBook - Maximum pages per book (default 200)
 * @returns Array of books with exact page counts
 */
export function splitBooksByActualPages(
  pages: IMessage[][],
  maxPagesPerBook: number = 200
): AccurateBook[] {
  const books: AccurateBook[] = [];
  let bookNumber = 1;
  let currentBookPages: IMessage[][] = [];
  
  for (const page of pages) {
    // Check if adding this page would exceed max pages
    if (currentBookPages.length >= maxPagesPerBook && currentBookPages.length > 0) {
      // Save current book
      const allMessages = currentBookPages.flat();
      books.push({
        bookNumber,
        messages: allMessages,
        actualPages: currentBookPages.length,
        dateRange: {
          from: allMessages[0]?.date || allMessages[0]?.sendingTime || '',
          to: allMessages[allMessages.length - 1]?.date || allMessages[allMessages.length - 1]?.sendingTime || '',
        },
      });
      
      // Start new book
      bookNumber++;
      currentBookPages = [page];
    } else {
      // Add page to current book
      currentBookPages.push(page);
    }
  }
  
  // Add last book
  if (currentBookPages.length > 0) {
    const allMessages = currentBookPages.flat();
    books.push({
      bookNumber,
      messages: allMessages,
      actualPages: currentBookPages.length,
      dateRange: {
        from: allMessages[0]?.date || allMessages[0]?.sendingTime || '',
        to: allMessages[allMessages.length - 1]?.date || allMessages[allMessages.length - 1]?.sendingTime || '',
      },
    });
  }
  
  return books;
}

/**
 * Split messages AND media files into books based on actual pages
 */
export function splitBooksWithMediaByActualPages(
  pages: IMessage[][],
  mediaFiles: any[], // ReadDirItem[]
  maxPagesPerBook: number = 200
): Array<AccurateBook & { mediaFiles: any[] }> {
  const books = splitBooksByActualPages(pages, maxPagesPerBook);
  
  // Assign media files to each book
  return books.map(book => {
    const bookMediaFiles: any[] = [];
    
    for (const msg of book.messages) {
      if ((msg.messageType === 'image' || msg.messageType === 'video' || msg.messageType === 'audio') && msg.localPath) {
        const filename = msg.localPath.split('/').pop();
        const mediaFile = mediaFiles.find((f: any) => f.name === filename);
        if (mediaFile && !bookMediaFiles.find((f: any) => f.name === filename)) {
          bookMediaFiles.push(mediaFile);
        }
      }
    }
    
    return {
      ...book,
      mediaFiles: bookMediaFiles,
    };
  });
}

/**
 * Format date for display
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
