import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import RNTextSize, { TSMeasureParams } from 'react-native-text-size-latest';
import { IMessage } from '../../../interfaces/IMessage';
import {
  AUDIO_HEIGHT,
  BANNER_HEIGHT,
  IMAGE_HEIGHT,
  VIDEO_HEIGHT,
} from '../constants';
import { Page, Spread } from '../types';
import { BookDimensions } from '../utils/bookDimensions';

interface UseSpreadPaginatedMessagesProps {
  messages: IMessage[];
  bookDimensions: BookDimensions;
  defaultFontSize?: number;
  defaultLineHeight?: number;
  defaultMargin?: number;
}

export const useSpreadPaginatedMessages = ({
  messages,
  bookDimensions,
  defaultFontSize = 12,
  defaultLineHeight = 16,
  defaultMargin = 6,
}: UseSpreadPaginatedMessagesProps) => {
  const [spreads, setSpreads] = useState<Spread[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  const prevMessagesRef = useRef<IMessage[]>([]);

  const memoizedMessages = useMemo(() => {
    if (JSON.stringify(prevMessagesRef.current) === JSON.stringify(messages)) {
      return prevMessagesRef.current;
    }
    prevMessagesRef.current = messages;
    return messages;
  }, [messages]);

  const paginate = useCallback(async () => {
    setLoading(true);

    const { pageWidth, pageHeight } = bookDimensions;

    // Account for page padding and banners
    const contentHeight = pageHeight - BANNER_HEIGHT * 2 - 40; // 40 for padding
    const contentWidth = pageWidth - 20; // 20 for padding

    let currentPage: IMessage[] = [];
    const pagesList: Page[] = [];
    let currentHeight = 0;

    for (const msg of memoizedMessages) {
      let messageHeight = 0;

      switch (msg.messageType) {
        case 'text': {
          const params: TSMeasureParams = {
            text: msg.text || '',
            width: contentWidth * 0.8, // Message bubble takes 80% of width
            fontSize: defaultFontSize,
            lineHeight: defaultLineHeight,
          };

          const result = await RNTextSize.measure(params);
          // Add space for sender name, time, and padding
          messageHeight = result.height + defaultMargin * 2 + 24;
          break;
        }

        case 'image':
          messageHeight = IMAGE_HEIGHT + defaultMargin * 2 + 24;
          break;

        case 'video':
          messageHeight = VIDEO_HEIGHT + defaultMargin * 2 + 24;
          break;

        case 'audio':
          messageHeight = AUDIO_HEIGHT + defaultMargin * 2 + 24;
          break;

        default:
          messageHeight = 50;
      }

      // If exceeds container height, create a new page
      if (currentHeight + messageHeight > contentHeight && currentPage.length > 0) {
        pagesList.push({
          id: `page-${pagesList.length}`,
          messages: currentPage,
        });
        currentPage = [];
        currentHeight = 0;
      }

      currentPage.push(msg);
      currentHeight += messageHeight;
    }

    // Add last page
    if (currentPage.length > 0) {
      pagesList.push({
        id: `page-${pagesList.length}`,
        messages: currentPage,
      });
    }

    setTotalPages(pagesList.length);

    // Group pages into spreads (pairs)
    const spreadsList: Spread[] = [];

    for (let i = 0; i < pagesList.length; i += 2) {
      const leftPage = pagesList[i] || null;
      const rightPage = pagesList[i + 1] || null;

      spreadsList.push({
        id: `spread-${spreadsList.length}`,
        leftPage,
        rightPage,
        leftPageNumber: i + 1,
        rightPageNumber: i + 2,
        isFirstSpread: spreadsList.length === 0,
        isLastSpread: i + 2 >= pagesList.length,
      });
    }

    // If no pages, create an empty spread
    if (spreadsList.length === 0) {
      spreadsList.push({
        id: 'spread-empty',
        leftPage: { id: 'page-empty-left', messages: [], isEmptyView: true },
        rightPage: { id: 'page-empty-right', messages: [], isEmptyView: true },
        leftPageNumber: 1,
        rightPageNumber: 2,
        isFirstSpread: true,
        isLastSpread: true,
      });
    }

    setSpreads(spreadsList);
    setLoading(false);
  }, [memoizedMessages, bookDimensions, defaultFontSize, defaultLineHeight, defaultMargin]);

  useEffect(() => {
    paginate();
  }, [paginate]);

  return { spreads, loading, totalPages };
};
