import {useEffect, useState, useCallback, useRef, useMemo} from 'react';
import RNTextSize, {TSMeasureParams} from 'react-native-text-size-latest';
import {IMessage} from '../../../interfaces/IMessage';
import {
  AUDIO_HEIGHT,
  BANNER_HEIGHT,
  IMAGE_HEIGHT,
  VIDEO_HEIGHT,
} from '../constants';
import {Page} from '../types';

interface UsePaginatedMessagesProps {
  messages: IMessage[];
  containerWidth: number;
  containerHeight: number;
  defaultFontSize?: number;
  defaultLineHeight?: number;
  defaultMargin?: number;
}

export const usePaginatedMessages = ({
  messages,
  containerWidth,
  containerHeight,
  defaultFontSize = 16,
  defaultLineHeight = 20,
  defaultMargin = 8,
}: UsePaginatedMessagesProps) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  // Use a ref to store the previous messages for deep comparison
  const prevMessagesRef = useRef<IMessage[]>([]);

  // Memoize messages only if their content changes deeply
  const memoizedMessages = useMemo(() => {
    if (JSON.stringify(prevMessagesRef.current) === JSON.stringify(messages)) {
      return prevMessagesRef.current; // Return the previous reference if deep equality
    }
    prevMessagesRef.current = messages; // Update ref with new messages
    return messages; // Return the new messages reference
  }, [messages]);

  const paginate = useCallback(async () => {
    setLoading(true);

    let currentPage: IMessage[] = [];
    const pagesList: Page[] = [];
    let currentHeight = 0;

    for (const msg of memoizedMessages) {
      let messageHeight = 0;

      switch (msg.messageType) {
        case 'text': {
          const params: TSMeasureParams = {
            text: msg.text || '',
            width: containerWidth - 20,
            fontSize: defaultFontSize,
            lineHeight: defaultLineHeight,
          };

          const result = await RNTextSize.measure(params);
          messageHeight = result.height + defaultMargin * 2;
          break;
        }

        case 'image':
          // approximate height for image preview
          messageHeight = IMAGE_HEIGHT + defaultMargin * 2;
          break;

        case 'video':
          // approximate video player height
          messageHeight = VIDEO_HEIGHT + defaultMargin * 2;
          break;

        case 'audio':
          // small audio bar
          messageHeight = AUDIO_HEIGHT + defaultMargin * 2;
          break;

        default:
          messageHeight = 50;
      }

      // if exceeds container height, create a new page
      if (
        currentHeight + messageHeight + BANNER_HEIGHT * 2 > containerHeight &&
        currentPage.length > 0
      ) {
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

    // add last page
    if (currentPage.length > 0) {
      pagesList.push({
        id: `page-${pagesList.length}`,
        messages: currentPage,
      });
    }

    setPages(pagesList);
    setLoading(false);
  }, [
    memoizedMessages,
    containerHeight,
    containerWidth,
    defaultFontSize,
    defaultLineHeight,
  ]);

  useEffect(() => {
    paginate();
  }, [paginate]);

  return {pages, loading};
};
