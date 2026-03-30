import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useCallback,
} from 'react';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import FileViewer from 'react-native-file-viewer';
import ImagePicker from 'react-native-image-crop-picker';
import Video from 'react-native-video';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  ImageBackground,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';

import ImageResizer from '@bam.tech/react-native-image-resizer';
import LinearGradient from 'react-native-linear-gradient';
import AddTextModal from '../AddTextModal';
import AIPaginationModal from '../AIPaginationModal';
import {useRoute} from '@react-navigation/native';
import {enableSnackbar} from '../../store/Slice/snackbarSlice';
import {store} from '../../store/Store';
import {uploadContent} from '../../services/calls';
import {addCart, saveChat} from '../../store/Slice/userSlice';
import MessageMeasurer from '../BookList/MessageMeasurer';
import {hp, wp} from '../../utils/reponsiveness';
import {IMessageBubble} from '../../interfaces/IMessage';
import {
  getElementTop,
  getRightForGreyLine,
  getRightForLine,
} from '../../utils/pageUtils';
import PageContainer from './PageContainer';
import {updateGroupItemById} from '../../utils/updateGroupItemById';
import ChatBubble from './ChatBubble';
import {isImage} from '../../utils/mediaUtils';
import MessageRenderer from './MessageRenderer';
import {styles} from './style';
import {Page, PageElement} from '../../interfaces/IPage';
import {ExtendedViewRenderer} from './ExtendedViewRenderer';
import {DefaultViewRenderer} from './DefaultViewRenderer';

const {width, height} = Dimensions.get('window');

/**
 * -----------------------
 * Pure helpers (no hooks)
 * -----------------------
 */

const estimateMessageHeight = (message: IMessageBubble): number => {
  if (message?.type === 'toptext' || message?.type === 'bottomtext') return 35;
  if (message?.type === 'middleimage')
    return message?.middleimage ? hp(30) : hp(25);

  const text = message.item?.text || message?.text || '';
  const fontSize = message?.fontSize || 14;

  let totalHeight = 0;
  totalHeight += fontSize + 8; // sender line

  if (text.trim()) {
    const lineHeight = fontSize * 1.3;
    const bubbleWidth = width * 0.7;
    const charWidth = fontSize * 0.45;
    const effectiveWidth = bubbleWidth - 20;
    const charsPerLine = Math.floor(effectiveWidth / charWidth);
    const explicitBreaks = (text.match(/\n/g) || []).length;
    const textLines = Math.ceil(text.length / charsPerLine);
    const totalLines = Math.max(textLines, explicitBreaks + 1);
    totalHeight += totalLines * lineHeight;
  }

  if (message.item?.remotePath) {
    if (isImage(message.item.remotePath)) {
      const imageSize = wp(25);
      totalHeight += imageSize + 20;
    } else {
      const qrSize = wp(15);
      totalHeight += qrSize + 15;
    }
    if (text.trim()) totalHeight += 15; // spacing for mixed content
  }

  totalHeight += 20; // bubble padding
  totalHeight += 10; // spacing between bubbles

  const safetyMultiplier = message.item?.remotePath ? 1.1 : 1.02;
  return Math.ceil(totalHeight * safetyMultiplier);
};

const smartTextSplit = (text: string, maxChars: number): string[] => {
  if (text.length <= maxChars) return [text];
  const chunks: string[] = [];
  let currentIndex = 0;
  while (currentIndex < text.length) {
    let chunkEnd = currentIndex + maxChars;
    if (chunkEnd < text.length) {
      const searchStart = Math.max(
        currentIndex + Math.floor(maxChars * 0.6),
        currentIndex + 1,
      );
      let bestBreakPoint = chunkEnd;
      for (let i = chunkEnd; i >= searchStart; i--) {
        const char = text[i];
        if (' \n.,;!?'.includes(char)) {
          bestBreakPoint = i + 1;
          break;
        }
      }
      chunkEnd = bestBreakPoint;
    }
    const chunk = text.substring(currentIndex, chunkEnd).trim();
    if (chunk.length > 0) chunks.push(chunk);
    currentIndex = chunkEnd;
  }
  return chunks;
};

const enhanceResolution = async (uri: string) => {
  try {
    const response = await ImageResizer.createResizedImage(
      uri,
      2480,
      3508,
      'JPEG',
      100,
    );
    return response.uri;
  } catch (error) {
    if (__DEV__) console.warn('Error resizing image:', error);
    return uri; // fallback to original if resizing fails
  }
};

/**
 * -----------------------
 * Component
 * -----------------------
 */

const ChatViewer = forwardRef(
  (
    {
      messages,
      returnPages,
      returnChat,
      extendedView,
      importTool,
      setCurrentPage,
      stoploader,
      setExtendedView,
      bookSpecs,
    }: any,
    ref,
  ) => {
    const route = useRoute();

    const [pages, setPages] = useState<Page[]>([]);
    const [shadow, setShadow] = useState(true);
    const [editItem, setEditItem] = useState<any>(null);
    const flatListRef = useRef<any>(null);
    const [isMeasuring, setIsMeasuring] = useState(false);
    const [measurementHandler, setMeasurementHandler] = useState<any>(null);
    const [messagesToConvert, setMessagesToConvert] = useState<any[]>([]);
    const [insertAtIndex, setInsertAtIndex] = useState(0);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showBottomSheet, setShowBottomSheet] = useState(false);
    const [selectedPageIndex, setSelectedPageIndex] = useState(-1);
    const [showAIPaginationModal, setShowAIPaginationModal] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState('');

    const lastShownDateRef = useRef<string>('');
    const viewShotRefs = useRef<any[]>([]);

    // Derived layout values
    const {
      TOTAL_PAGE_HEIGHT,
      PAGE_HEIGHT,
      SCALE_FACTOR,
      EFFECTIVE_PAGE_HEIGHT,
      TARGET_PAGE_FILL,
      CHAT_BUBBLE_PADDING,
    } = useMemo(() => {
      const isSquare = bookSpecs?.title?.includes('Square');
      const TOTAL = isSquare ? height - hp(35) : height - hp(25);
      const PAGE = TOTAL * 0.9; // 90% of total height
      const SCALE = 0.85; // must match render scale
      const EFFECTIVE = PAGE * SCALE;
      const TARGET = EFFECTIVE * 0.7; // 70% target fill (matches original intent)
      return {
        TOTAL_PAGE_HEIGHT: TOTAL,
        PAGE_HEIGHT: PAGE,
        SCALE_FACTOR: SCALE,
        EFFECTIVE_PAGE_HEIGHT: EFFECTIVE,
        TARGET_PAGE_FILL: TARGET,
        CHAT_BUBBLE_PADDING: 8,
      };
    }, [bookSpecs?.title]);

    /**
     * -----------------------
     * Imperative API
     * -----------------------
     */
    useImperativeHandle(ref, () => ({
      print: handleCapture,
      addChatBackgroundValue: (newValue: any) => {
        setPages(prev =>
          prev.map(inner =>
            inner.map(item => ({...item, chatBackground: newValue})),
          ),
        );
      },
      changeFontSize: (newFontSize: number, newFontFmaily: string) => {
        setPages(prev =>
          prev.map(inner =>
            inner.map(item => ({
              ...item,
              fontStyle: newFontSize,
              fontFamily: newFontFmaily,
            })),
          ),
        );
      },
      saveChat: (uniqueId: string) => {
        if (!uniqueId || !pages.length) return;
        store.dispatch(saveChat({id: uniqueId, chat: pages}));
      },
      addToCart: (uniqueId: string) => {
        if (!uniqueId || !pages.length) return;
        store.dispatch(
          addCart({
            id: uniqueId,
            chat: pages,
            details: {
              eBookOnlyCheckBox: false,
              quantity: 1,
              eBookCheckBox: false,
              checkBoxWithImage: false,
              bookSpecs,
            },
          }),
        );
      },
      loadSavedChat: (savedChatPages: Page[]) => {
        if (!Array.isArray(savedChatPages) || !savedChatPages.length) return;
        try {
          setPages(savedChatPages);
          returnPages?.(savedChatPages);
          if (returnChat) {
            const flattened: any[] = [];
            savedChatPages.forEach(
              page =>
                Array.isArray(page) &&
                page.forEach(msg => msg && flattened.push(msg)),
            );
            returnChat(flattened);
          }
        } catch (e) {
          if (__DEV__) console.warn('loadSavedChat error', e);
        }
      },
      convertMessagesToPages: (
        messageBubbles: IMessageBubble[],
        insAtIndex: number,
      ) => {
        setIsLoading(true);
        setMessagesToConvert(messageBubbles);
        setInsertAtIndex(insAtIndex);

        (async () => {
          try {
            const SCALE = SCALE_FACTOR;
            const effectivePageHeight = PAGE_HEIGHT * SCALE;
            const targetPageFill = effectivePageHeight * 0.7; // keep consistent

            // 1) Preprocess (dedupe + split long)
            const processed: any[] = [];
            const seen = new Set<string>();

            for (const m of messageBubbles) {
              if (
                m?.type === 'toptext' ||
                m?.type === 'bottomtext' ||
                m?.type === 'middleimage'
              ) {
                processed.push({...m, heightEstimate: 0});
                continue;
              }
              const messageText = m?.text || m?.item?.text || '';
              if (!messageText.trim()) {
                processed.push({...m, heightEstimate: 0});
                continue;
              }
              if (seen.has(messageText)) continue; // dedupe by text
              seen.add(messageText);

              const fontSize = m?.fontSize || 14;
              const bubbleWidth = width * 0.7;
              const charWidth = fontSize * 0.45;
              const charsPerLine = Math.floor((bubbleWidth - 20) / charWidth);

              const senderInfoHeight = fontSize + 8;
              const bubblePadding = 20;
              const messageSpacing = 10;
              const mediaHeight = m.item?.remotePath
                ? isImage(m.item.remotePath)
                  ? wp(25) + 20
                  : wp(15) + 15
                : 0;
              const availableHeightForText =
                targetPageFill -
                senderInfoHeight -
                bubblePadding -
                messageSpacing -
                mediaHeight;
              const lineHeight = fontSize * 1.3;
              const maxLinesPerMessage = Math.floor(
                availableHeightForText / lineHeight,
              );
              const characterThreshold = Math.max(
                charsPerLine * maxLinesPerMessage,
                300,
              ); // adaptive threshold

              if (messageText.length > characterThreshold) {
                const chunks = smartTextSplit(messageText, characterThreshold);
                chunks.forEach((chunk, idx) => {
                  const newMsg: IMessageBubble = {
                    ...m,
                    id: `${m.id}_chunk_${idx}_${Date.now()}_${Math.random()}`,
                    heightEstimate: 0,
                  };
                  if (m.text) newMsg.text = chunk;
                  else if (m.item) {
                    newMsg.item = {...m.item, text: chunk};
                    if (idx > 0 && newMsg.item.remotePath)
                      delete newMsg.item.remotePath;
                  }
                  processed.push(newMsg);
                });
              } else {
                processed.push({...m, heightEstimate: 0});
              }
            }

            // 2) Height estimates
            for (const m of processed)
              m.heightEstimate = estimateMessageHeight(m);

            // 3) Pagination
            const messageHeights = processed.map(p => p.heightEstimate);
            let currentPage: IMessageBubble[] = [];
            let currentHeight = 0;
            const allPages: Page[] = [];
            let lastGoodBreakPoint = 0;

            const isGoodBreakPoint = (ratio: number) =>
              ratio >= 0.65 && ratio <= 0.7;

            for (let i = 0; i < processed.length; i++) {
              const m = processed[i];
              const h = m.heightEstimate;

              if (h > targetPageFill) {
                if (currentPage.length) {
                  allPages.push([...currentPage]);
                  currentPage = [];
                  currentHeight = 0;
                }
                allPages.push([m]);
                continue;
              }

              if (currentHeight + h > targetPageFill) {
                const hasImages =
                  m.item?.remotePath && isImage(m.item.remotePath);
                const minRequired = hasImages ? 1 : 2;
                const oversized = h > targetPageFill * 0.6;

                if (currentPage.length >= minRequired || oversized) {
                  if (
                    lastGoodBreakPoint > 0 &&
                    lastGoodBreakPoint < currentPage.length - 1
                  ) {
                    const moveNext = currentPage.splice(lastGoodBreakPoint);
                    allPages.push([...currentPage]);
                    currentPage = [...moveNext, m];
                    currentHeight =
                      moveNext.reduce(
                        (s, x: any) => s + (x.heightEstimate || 0),
                        0,
                      ) + h;
                  } else {
                    allPages.push([...currentPage]);
                    currentPage = [m];
                    currentHeight = h;
                  }
                  lastGoodBreakPoint = 0;
                } else {
                  currentPage.push(m);
                  currentHeight += h;
                }
              } else {
                currentPage.push(m);
                currentHeight += h;
                const fillRatio = currentHeight / (PAGE_HEIGHT * SCALE);
                if (isGoodBreakPoint(fillRatio))
                  lastGoodBreakPoint = currentPage.length;
              }
            }
            if (currentPage.length) allPages.push([...currentPage]);

            // 4) Enhance page metadata, add top/bottom text shells
            const timestamp = Date.now();
            const first = pages?.[0]?.[0];
            const defaults = {
              chatBackground: first?.chatBackground || 'white',
              fontFamily: first?.fontFamily || 'Roboto-Medium',
              fontSize: first?.fontSize || 12,
              fontStyle: first?.fontStyle || 'regular',
            };

            const enhanced = allPages.map((page, pIdx) => {
              const topText = {
                id: `toptext_${pIdx}_${timestamp}_${Math.random()}`,
                topText: '',
                type: 'toptext',
                ...defaults,
                bookSpecs,
              } as any;
              const bottomText = {
                id: `bottomtext_${pIdx}_${timestamp}_${Math.random()}`,
                topText: '',
                type: 'bottomtext',
                ...defaults,
                bookSpecs,
              } as any;
              const mapped = page.map((m, mIdx) => ({
                ...m,
                id: m.id
                  ? `${m.id}_p${pIdx}_m${mIdx}_${timestamp}`
                  : `generated_p${pIdx}_m${mIdx}_${timestamp}_${Math.random()}`,
                chatBackground: m.chatBackground || defaults.chatBackground,
                fontFamily: m.fontFamily || defaults.fontFamily,
                fontSize: m.fontSize || defaults.fontSize,
                fontStyle: m.fontStyle || defaults.fontStyle,
              }));
              return [topText, ...mapped, bottomText];
            });

            setPages(prev => {
              let newPages = [...prev];
              if (insAtIndex >= 0 && insAtIndex < newPages.length)
                newPages.splice(insAtIndex, 0, ...enhanced);
              else newPages = [...newPages, ...enhanced];
              returnPages?.(newPages);
              return newPages;
            });
          } catch (e) {
            if (__DEV__) console.warn('pagination error', e);
          } finally {
            setIsLoading(false);
          }
        })();
      },
      addPageAtCurrentIndex: (currentIndex: number) => {
        if (!pages.length) return;
        const timestamp = Date.now();
        const base = pages[0]?.[0] || ({} as any);
        const newPage: any[] = [
          {
            id: `toptext_${timestamp}_${Math.random()}`,
            topText: '',
            type: 'toptext',
            chatBackground: base.chatBackground,
            fontFamily: base.fontFamily,
            fontSize: base.fontSize,
            fontStyle: base.fontStyle,
          },
          {
            id: `middleimage_${timestamp}_${Math.random()}`,
            topText: '',
            chatBackground: base.chatBackground,
            type: 'middleimage',
          },
          {
            id: `bottomtext_${timestamp}_${Math.random()}`,
            topText: '',
            chatBackground: base.chatBackground,
            fontFamily: base.fontFamily,
            fontSize: base.fontSize,
            fontStyle: base.fontStyle,
            type: 'bottomtext',
          },
        ];
        setPages(prev => {
          const temp = [...prev];
          temp.splice(currentIndex, 0, newPage as any);
          returnPages?.(temp);
          return temp;
        });
        setTimeout(
          () =>
            flatListRef.current?.scrollToIndex({
              index: currentIndex,
              animated: true,
              viewPosition: 1,
            }),
          400,
        );
      },
      showAIPagination: () => {
        if (!messages?.length) {
          Alert.alert(
            'No Messages',
            'Please add some messages before using AI pagination.',
          );
          return;
        }
        setShowAIPaginationModal(true);
      },
    }));

    /**
     * -----------------------
     * Effects
     * -----------------------
     */
    useEffect(() => {
      if (stoploader || (messages && messages.length)) return;
      const timestamp = Date.now();
      const tempPage: Page[] = [
        [
          {
            id: `initial_toptext_${timestamp}_${Math.random()}`,
            topText: '',
            chatBackground: 'white',
            fontFamily: 'Roboto-Medium',
            fontSize: 12,
            fontStyle: 'regular',
            type: 'toptext',
            bookSpecs,
          },
          {
            id: `initial_middleimage_${timestamp}_${Math.random()}`,
            topText: '',
            chatBackground: 'white',
            type: 'middleimage',
            fontFamily: 'Roboto-Medium',
            fontSize: 12,
            fontStyle: 'regular',
            bookSpecs,
          },
          {
            id: `initial_bottomtext_${timestamp}_${Math.random()}`,
            topText: '',
            chatBackground: 'white',
            fontFamily: 'Roboto-Medium',
            fontSize: 12,
            fontStyle: 'regular',
            type: 'bottomtext',
            bookSpecs,
          },
        ],
      ];
      setPages(tempPage);
      returnPages?.(tempPage);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stoploader]);

    /**
     * -----------------------
     * Handlers
     * -----------------------
     */
    const addImageFunction = useCallback((message: any) => {
      ImagePicker.openPicker({
        width: 300,
        height: 400,
        mediaType: 'photo',
        cropping: true,
      }).then(async image => {
        try {
          const data = new FormData();
          data.append('files', {
            uri: image?.path,
            name: 'photo1.jpg',
            type: '*/*',
          } as any);
          data.append(
            'title',
            `${(Math.random() * 232 * Math.random()).toFixed(0)}`,
          );
          data.append(
            'name',
            `${(Math.random() * 232 * Math.random()).toFixed(0)}`,
          );
          const res = await uploadContent(data);
          if (res?.status == 200 || res?.status == 201) {
            setPages(prev =>
              updateGroupItemById(
                prev,
                message?.id,
                'middleimage',
                res?.data?.url?.[0],
                false,
              ),
            );
          } else {
            store.dispatch(enableSnackbar('Failed to upload image'));
          }
        } catch (err) {
          store.dispatch(enableSnackbar('Failed to upload image'));
        }
      });
    }, []);

    const handleCapture = useCallback(async () => {
      setShadow(false);
      setTimeout(async () => {
        try {
          const captures = await Promise.all(
            viewShotRefs.current.map(ref => ref?.capture?.()),
          );
          const enhancedImages = await Promise.all(
            captures.map(enhanceResolution),
          );
          const htmlContent = enhancedImages
            .map(
              uri => `
          <div style="page-break-after: always; width: 100%; height: 100%;">
            <img src="${uri}" style="width: 100%; height: 100%; object-fit: contain; background-color: white; image-rendering: crisp-edges;" />
          </div>`,
            )
            .join('');
          const options = {
            html: `<html><body>${htmlContent}</body></html>`,
            fileName: 'chat_export',
            directory: 'Documents',
            height: height - 200,
            width: width - 100,
          };
          const pdf = await RNHTMLtoPDF.convert(options);
          if (pdf?.filePath)
            await FileViewer.open(pdf.filePath, {showOpenWithDialog: true});
        } catch (error) {
          if (__DEV__) console.warn('Capture failed:', error);
        } finally {
          setShadow(true);
        }
      }, 400);
    }, []);

    // const measureMessage = useCallback((message: any, index: number) => {
    //   if (message?.type === 'toptext' || message?.type === 'bottomtext')
    //     return Promise.resolve({index, height: 35});
    //   if (message?.type === 'middleimage')
    //     return Promise.resolve({
    //       index,
    //       height: message?.middleimage ? hp(30) : hp(25),
    //     });
    //   const finalHeight = estimateMessageHeight(message);
    //   return Promise.resolve({index, height: finalHeight});
    // }, []);

    // const measureAllMessages = useCallback(async () => {
    //   const measurements: any[] = [];
    //   const BATCH_SIZE = 15;
    //   for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    //     const batch = messages.slice(i, i + BATCH_SIZE);
    //     const batchMeasurements = await Promise.all(
    //       batch.map((msg: any, idx: number) => measureMessage(msg, i + idx)),
    //     );
    //     measurements.push(...batchMeasurements);
    //   }
    //   return measurements;
    // }, [measureMessage, messages]);

    // const calculatePageBreaks = useCallback(
    //   (measurements: any[]) => {
    //     const resultPages: Page[] = [];
    //     let currentPage: any[] = [];
    //     let currentHeight = 0;
    //     let currentBubbleCount = 0;

    //     const PAGE_PADDING = 50;
    //     const EFFECTIVE = PAGE_HEIGHT - PAGE_PADDING;
    //     const TARGET = EFFECTIVE * 0.8; // 80% fill target (UI choice)

    //     measurements.forEach(({index, height}) => {
    //       const message = messages[index];
    //       const totalHeight = height + CHAT_BUBBLE_PADDING;
    //       const messageText = message?.text || message?.item?.text || '';
    //       const isShortMessage = messageText.replace(/\s+/g, '').length < 300;

    //       if (currentHeight + totalHeight > TARGET) {
    //         if (currentBubbleCount < 1 && isShortMessage) {
    //           if (currentPage.length > 0) {
    //             const lastMessage = currentPage.pop();
    //             const lastMessageHeight =
    //               (lastMessage as any).measuredHeight ||
    //               estimateMessageHeight(lastMessage);
    //             currentHeight -= lastMessageHeight + CHAT_BUBBLE_PADDING;
    //             currentBubbleCount--;
    //           }
    //         }
    //         if (currentPage.length > 0) {
    //           resultPages.push([...currentPage]);
    //           currentPage = [];
    //           currentHeight = 0;
    //           currentBubbleCount = 0;
    //         }
    //         if (totalHeight > TARGET) {
    //           const splitMessages = handleOverflowMessage(
    //             message,
    //             totalHeight,
    //             PAGE_HEIGHT,
    //           );
    //           resultPages.push(...(splitMessages as any));
    //           return;
    //         }
    //       }

    //       currentPage.push(message);
    //       currentHeight += totalHeight;
    //       currentBubbleCount++;

    //       if (isShortMessage && currentBubbleCount < 3) {
    //         const nextIndex = index + 1;
    //         if (nextIndex < measurements.length) {
    //           const nextMessage = messages[nextIndex];
    //           const nextMessageText =
    //             nextMessage?.text || nextMessage?.item?.text || '';
    //           const nextIsShort =
    //             nextMessageText.replace(/\s+/g, '').length < 300;
    //           if (
    //             nextIsShort &&
    //             currentHeight +
    //               (measurements[nextIndex].height + CHAT_BUBBLE_PADDING) <=
    //               TARGET
    //           ) {
    //             return; // allow more short messages on this page
    //           }
    //         }
    //         if (currentBubbleCount < 2 && currentPage.length > 1) {
    //           const lastMessage = currentPage.splice(-1);
    //           if (currentPage.length > 0) resultPages.push([...currentPage]);
    //           currentPage = lastMessage as any;
    //           currentHeight = (lastMessage as any).reduce(
    //             (sum: number, msg: any) =>
    //               sum +
    //               (msg.measuredHeight || estimateMessageHeight(msg)) +
    //               CHAT_BUBBLE_PADDING,
    //             0,
    //           );
    //           currentBubbleCount = 1;
    //         }
    //       }
    //     });

    //     if (currentPage.length > 0) resultPages.push(currentPage as any);
    //     return resultPages;
    //   },
    //   [CHAT_BUBBLE_PADDING, PAGE_HEIGHT, messages],
    // );

    // const handleOverflowMessage = useCallback(
    //   (message: any, heightValue: number, PAGE_HEIGHT_LOCAL: number) => {
    //     const MAX_MESSAGE_HEIGHT = PAGE_HEIGHT_LOCAL * 0.7; // 70% page height
    //     if (heightValue <= MAX_MESSAGE_HEIGHT) return [[message]];
    //     if (message.item?.text || message.text)
    //       return splitLongTextMessage(message, PAGE_HEIGHT_LOCAL);
    //     return [[{...message, height: MAX_MESSAGE_HEIGHT}]];
    //   },
    //   [],
    // );

    // const splitLongTextMessage = useCallback(
    //   (message: any, PAGE_HEIGHT_LOCAL: number) => {
    //     const text = message.item?.text || message.text || '';
    //     const fontSize = message?.fontSize || 14;
    //     const lineHeight = fontSize * 1.3;
    //     const bubbleWidth = width * 0.7;
    //     const charWidth = fontSize * 0.45;
    //     const charsPerLine = Math.floor((bubbleWidth - 20) / charWidth);

    //     const targetPageFill = PAGE_HEIGHT_LOCAL * 0.7;
    //     const senderInfoHeight = fontSize + 8;
    //     const bubblePadding = 20;
    //     const messageSpacing = 10;
    //     const mediaHeight = message.item?.path
    //       ? isImage(message.item.path)
    //         ? wp(25) + 20
    //         : wp(15) + 15
    //       : 0;

    //     const availableHeightForText =
    //       targetPageFill -
    //       senderInfoHeight -
    //       bubblePadding -
    //       messageSpacing -
    //       mediaHeight;
    //     const maxLinesPerChunk = Math.floor(
    //       availableHeightForText / lineHeight,
    //     );
    //     const maxCharsPerChunk = Math.max(charsPerLine * maxLinesPerChunk, 1);

    //     if (text.length <= maxCharsPerChunk) return [[message]];

    //     const chunks = smartTextSplit(text, maxCharsPerChunk);
    //     return chunks.map((chunk, i) => [
    //       {
    //         ...message,
    //         id: `${message.id}_part${i}_${Date.now()}_${Math.random()}`,
    //         ...(message.text ? {text: chunk} : {}),
    //         ...(message.item
    //           ? {
    //               item: {
    //                 ...message.item,
    //                 text: chunk,
    //                 ...(i > 0 && message.item.path ? {path: undefined} : {}),
    //               },
    //             }
    //           : {}),
    //       },
    //     ]);
    //   },
    //   [],
    // );

    // const paginateMessages = useCallback(async () => {
    //   try {
    //     setIsLoading(true);
    //     const measuredHeights = await measureAllMessages();
    //     const newPages = calculatePageBreaks(measuredHeights);
    //     setPages(newPages);
    //     returnPages?.(newPages);
    //   } catch (e) {
    //     if (__DEV__) console.warn('Pagination error:', e);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // }, [calculatePageBreaks, measureAllMessages, returnPages]);

    /**
     * -----------------------
     * Conditional measuring render
     * -----------------------
     */
    // useEffect(() => {
    //   if (measurementHandler) {
    //     setIsMeasuring(true);
    //   }
    // }, [measurementHandler, messages]);

    /**
     * -----------------------
     * UI event helpers
     * -----------------------
     */
    // const handleLongPress = useCallback(
    //   (index: number) => {
    //     if (!extendedView) {
    //       setSelectedPageIndex(index);
    //       setShowBottomSheet(true);
    //     }
    //   },
    //   [extendedView],
    // );

    const handleDeletePage = useCallback(() => {
      if (selectedPageIndex < 0 || selectedPageIndex >= pages.length) return;
      if (pages.length <= 1) {
        Alert.alert(
          'Cannot Delete',
          'You must have at least one page in your chat.',
          [{text: 'OK', onPress: () => setShowBottomSheet(false)}],
        );
        return;
      }

      Alert.alert('Delete Page', 'Are you sure you want to delete this page?', [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setShowBottomSheet(false),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPages(prev => {
              const updated = [...prev];
              updated.splice(selectedPageIndex, 1);
              returnPages?.(updated);
              return updated;
            });
            setShowBottomSheet(false);
            setTimeout(() => {
              const len = pages.length - 1;
              if (selectedPageIndex >= len && len > 0)
                flatListRef.current?.scrollToIndex({
                  index: len - 1,
                  animated: true,
                });
            }, 300);
          },
        },
      ]);
    }, [pages.length, returnPages, selectedPageIndex]);

    const BottomSheet = useCallback(
      () => (
        <Modal
          animationType="slide"
          transparent
          visible={showBottomSheet}
          onRequestClose={() => setShowBottomSheet(false)}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'flex-end',
            }}
            activeOpacity={1}
            onPress={() => setShowBottomSheet(false)}>
            <View
              style={{
                backgroundColor: 'white',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: 20,
                elevation: 5,
                shadowColor: '#000',
                shadowOffset: {width: 0, height: -3},
                shadowOpacity: 0.27,
                shadowRadius: 4.65,
              }}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 15,
                  borderBottomWidth: pages.length > 1 ? 1 : 0,
                  borderBottomColor: '#f0f0f0',
                  marginBottom: pages.length > 1 ? 10 : 0,
                }}
                onPress={() => {
                  (ref as any)?.current?.addPageAtCurrentIndex?.(
                    selectedPageIndex,
                  );
                  setShowBottomSheet(false);
                }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: '#E8F4FF',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 15,
                  }}>
                  <Text
                    style={{
                      color: '#4688BA',
                      fontSize: 24,
                      fontWeight: 'bold',
                    }}>
                    +
                  </Text>
                </View>
                <Text style={{fontSize: 16, color: '#4688BA'}}>Add Page</Text>
              </TouchableOpacity>
              {pages.length > 1 && (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 15,
                  }}
                  onPress={handleDeletePage}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: '#FFEEEE',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 15,
                    }}>
                    <Text
                      style={{color: 'red', fontSize: 18, fontWeight: 'bold'}}>
                      X
                    </Text>
                  </View>
                  <Text style={{fontSize: 16, color: 'red'}}>Delete Page</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      ),
      [handleDeletePage, pages.length, selectedPageIndex, showBottomSheet],
    );

    const handleAIPaginationComplete = useCallback(
      (aiPages: any[][], metrics: any) => {
        const enhancedPages = aiPages.map((page, pageIndex) =>
          page.map((message: any, messageIndex: number) => ({
            ...message,
            id: message.id
              ? `ai_${message.id}_p${pageIndex}_m${messageIndex}_${Date.now()}`
              : `ai_generated_p${pageIndex}_m${messageIndex}_${Date.now()}_${Math.random()}`,
            chatBackground:
              message.chatBackground ||
              pages[0]?.[0]?.chatBackground ||
              'white',
            fontFamily:
              message.fontFamily ||
              pages[0]?.[0]?.fontFamily ||
              'Roboto-Medium',
            fontSize: message.fontSize || pages[0]?.[0]?.fontSize || 12,
            fontStyle:
              message.fontStyle || pages[0]?.[0]?.fontStyle || 'regular',
            senderTextColor:
              message.senderTextColor ||
              pages[0]?.[0]?.senderTextColor ||
              'black',
            receiverTextColor:
              message.receiverTextColor ||
              pages[0]?.[0]?.receiverTextColor ||
              'black',
            senderBackground:
              message.senderBackground ||
              pages[0]?.[0]?.senderBackground ||
              '#DCF8C6',
            receiverBackground:
              message.receiverBackground ||
              pages[0]?.[0]?.receiverBackground ||
              '#FFFFFF',
            bookSpecs,
          })),
        );

        setPages(enhancedPages);
        returnPages?.(enhancedPages);

        Alert.alert(
          'AI Pagination Applied',
          `Successfully created ${enhancedPages.length} pages with ${(
            metrics.averageFill * 100
          ).toFixed(1)}% average fill ratio.`,
          [{text: 'OK'}],
        );
      },
      [bookSpecs, pages, returnPages],
    );

    const renderItem = useCallback(
      ({item, index}: {item: Page; index: number}) => {
        if (extendedView) {
          return (
            <ExtendedViewRenderer
              item={item}
              index={index}
              PAGE_HEIGHT={PAGE_HEIGHT}
              shadow={shadow}
              viewShotRefs={viewShotRefs}
              bookSpecs={bookSpecs}
              importTool={importTool}
              addImageFunction={addImageFunction}
              setEditItem={setEditItem}
              lastShownDateRef={lastShownDateRef}
              setSelectedVideo={setSelectedVideo}
              setShowVideoModal={setShowVideoModal}
              setExtendedView={setExtendedView}
              setCurrentPage={setCurrentPage}
              setCurrentPageIndex={setCurrentPageIndex}
              flatListRef={flatListRef}
            />
          );
        }
        return (
          <DefaultViewRenderer
            item={item}
            index={index}
            PAGE_HEIGHT={PAGE_HEIGHT}
            shadow={shadow}
            viewShotRefs={viewShotRefs}
            bookSpecs={bookSpecs}
            importTool={importTool}
            addImageFunction={addImageFunction}
            setEditItem={setEditItem}
            lastShownDateRef={lastShownDateRef}
            setSelectedVideo={setSelectedVideo}
            setShowVideoModal={setShowVideoModal}
          />
        );
      },
      [
        extendedView,
        PAGE_HEIGHT,
        shadow,
        viewShotRefs,
        bookSpecs,
        importTool,
        addImageFunction,
        setEditItem,
        lastShownDateRef,
        setSelectedVideo,
        setShowVideoModal,
        setExtendedView,
        setCurrentPage,
        setCurrentPageIndex,
        flatListRef,
      ],
    );

    if (!pages?.length || isLoading) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white',
          }}>
          <ActivityIndicator
            size="large"
            color="#4688BA"
            style={{position: 'absolute', top: hp('35%')}}
          />
          <Text style={{marginTop: 50, color: '#777', fontSize: 16}}>
            Preparing your messages...
          </Text>
        </View>
      );
    }

    return (
      <>
        {isMeasuring && (
          <MessageMeasurer
            messages={messagesToConvert}
            onMeasured={convertedPages => {
              setPages(currentPages => {
                const tempPages = [...currentPages];
                tempPages.splice(insertAtIndex, 1, ...convertedPages);
                returnPages?.(tempPages);
                return tempPages;
              });
              setIsMeasuring(false);
            }}
          />
        )}

        <FlatList
          data={pages}
          ref={flatListRef}
          horizontal={!extendedView}
          numColumns={extendedView ? 2 : 1}
          key={extendedView ? 'grid' : 'list'}
          initialNumToRender={40}
          maxToRenderPerBatch={20}
          windowSize={5}
          removeClippedSubviews
          scrollEventThrottle={16}
          renderItem={renderItem}
          contentContainerStyle={{paddingBottom: 200}}
          style={{flex: 1, width, marginTop: -50}}
          columnWrapperStyle={
            extendedView ? {gap: 0, marginVertical: hp(-15)} : undefined
          }
          keyExtractor={(item, index) =>
            `page-${index}-${item[0]?.id || 'no-id'}`
          }
          viewabilityConfig={{
            itemVisiblePercentThreshold: 60,
            minimumViewTime: 100,
            waitForInteraction: false,
          }}
          onViewableItemsChanged={({viewableItems}) => {
            if (viewableItems?.length && !extendedView) {
              const currentVisibleIndex = viewableItems[0]?.index ?? 0;
              setCurrentPageIndex(currentVisibleIndex);
              setCurrentPage?.(currentVisibleIndex + 1);
            }
          }}
          onScrollToIndexFailed={({index, highestMeasuredFrameIndex}) => {
            if (!flatListRef.current) return;
            if (index > 50) {
              flatListRef.current.scrollToOffset({
                offset: index * width,
                animated: true,
              });
            } else {
              const buffer = Math.min(10, Math.floor(index * 0.3));
              const safeIndex = Math.max(0, index - buffer);
              flatListRef.current.scrollToIndex({
                index: safeIndex,
                animated: true,
              });
              setTimeout(() => {
                try {
                  flatListRef.current.scrollToIndex({
                    index,
                    animated: true,
                    viewPosition: 0,
                  });
                } catch (_) {
                  flatListRef.current.scrollToOffset({
                    offset: index * width,
                    animated: true,
                  });
                }
              }, 600);
            }
          }}
        />

        {/* Bottom Sheet */}
        <BottomSheet />

        {/* AI Pagination Modal */}
        <AIPaginationModal
          visible={showAIPaginationModal}
          onClose={() => setShowAIPaginationModal(false)}
          messages={messages}
          onPaginationComplete={handleAIPaginationComplete}
          bookSpecs={bookSpecs}
        />

        <AddTextModal
          visible={!!editItem && editItem?.buttonIndex != 1}
          characters={
            editItem?.field == 'toptext' || editItem?.field == 'bottomtext'
              ? 15
              : undefined
          }
          alterView
          onSubmitPress={(text: any) => {
            const newArr = updateGroupItemById(
              [...pages],
              editItem?.objectIndex,
              editItem?.focus,
              text?.replace(/(\r\n|\n|\r)/gm, ''),
              editItem?.focus == 'text',
            );
            setPages(newArr);
            setEditItem(null);
          }}
          headerPress={() => setEditItem(null)}
        />

        <Modal
          visible={showVideoModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowVideoModal(false)}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.9)',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              style={{position: 'absolute', top: 40, right: 20, zIndex: 1}}
              onPress={() => setShowVideoModal(false)}>
              <Text style={{color: 'white', fontSize: 20}}>✕</Text>
            </TouchableOpacity>
            <Video
              source={{uri: selectedVideo}}
              style={{width: '100%', height: '100%'}}
              controls
              resizeMode="contain"
            />
          </View>
        </Modal>
      </>
    );
  },
);

export default React.memo(ChatViewer);
