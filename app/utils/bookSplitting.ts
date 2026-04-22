/**
 * Book Splitting Utilities
 * Helper functions for splitting large chats into multiple 200-page books
 */

import { IMessage } from '../interfaces/IMessage';
import { calculateTotalPages, splitIntoBooksByPages } from './paginationUtils';

export interface Book {
  bookNumber: number;
  messages: IMessage[];
  estimatedPages: number;
  dateRange: {
    from: string;
    to: string;
  };
}

// NEW: Book chunk with media files for upload
export interface BookChunk {
  bookNumber: number;
  messages: IMessage[];
  mediaFiles: any[]; // ReadDirItem[] from react-native-fs
  estimatedPages: number;
  dateRange: {
    from: string;
    to: string;
  };
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'failed';
  uploadProgress: number; // 0-100
}

/**
 * Estimate total pages from messages
 * NOW USES SHARED PAGINATION LOGIC
 */
export function estimatePages(messages: IMessage[], format: string): number {
  return calculateTotalPages(messages, format as any);
}

/**
 * Split messages into books with max pages per book
 * 
 * IMPORTANT: Uses empirical data from real preview rendering
 * Real data shows ~800 messages = 200 pages for typical WhatsApp chats
 * This accounts for date headers, text wrapping, and actual rendering
 */
export function splitIntoBooks(
  messages: IMessage[], 
  maxPagesPerBook: number = 200
): Book[] {
  const books: Book[] = [];
  
  // Empirical ratio: ~800 messages = 200 pages (from real preview data)
  // This accounts for date headers (68+48+44px), text wrapping, etc.
  const MESSAGES_PER_200_PAGES = 800;
  const messagesPerBook = Math.floor((MESSAGES_PER_200_PAGES * maxPagesPerBook) / 200);
  
  let bookNumber = 1;
  
  for (let i = 0; i < messages.length; i += messagesPerBook) {
    const bookMessages = messages.slice(i, i + messagesPerBook);
    
    books.push({
      bookNumber,
      messages: bookMessages,
      estimatedPages: maxPagesPerBook,
      dateRange: {
        from: bookMessages[0].date || bookMessages[0].sendingTime || '',
        to: bookMessages[bookMessages.length - 1].date || bookMessages[bookMessages.length - 1].sendingTime || '',
      },
    });
    
    bookNumber++;
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


/**
 * Split messages AND media files into books (by pages)
 * Returns array of book chunks with messages + media
 */
export function splitIntoBooksWithMedia(
  messages: IMessage[],
  mediaFiles: any[], // ReadDirItem[]
  maxPagesPerBook: number = 200,
  format: string = 'standard_14_8x21'
): BookChunk[] {
  // First split messages into books by PAGES
  const messageBooks = splitIntoBooks(messages, maxPagesPerBook);
  
  // Then assign media files to each book based on message references
  const bookChunks: BookChunk[] = [];
  
  for (const book of messageBooks) {
    const bookMediaFiles: any[] = [];
    
    // For each message in this book, find its media file
    for (const msg of book.messages) {
      if ((msg.messageType === 'image' || msg.messageType === 'video' || msg.messageType === 'audio') && msg.localPath) {
        const filename = msg.localPath.split('/').pop();
        const mediaFile = mediaFiles.find((f: any) => f.name === filename);
        if (mediaFile && !bookMediaFiles.find((f: any) => f.name === filename)) {
          bookMediaFiles.push(mediaFile);
        }
      }
    }
    
    bookChunks.push({
      bookNumber: book.bookNumber,
      messages: book.messages,
      mediaFiles: bookMediaFiles,
      estimatedPages: book.estimatedPages,
      dateRange: book.dateRange,
      uploadStatus: 'pending',
      uploadProgress: 0,
    });
  }
  
  return bookChunks;
}
