import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  Linking,
  TouchableOpacity,
} from 'react-native';
import CustomHeader from '../../Components/CustomHeader';
import CustomButton from '../../Components/CustomButton';
import { COLORS } from '../../utils/colors';
import { hp, wp, rfs } from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';
import {
  generatePhotoBookPdf,
  getPhotoBookById,
  updatePhotoBookThemeConfig,
  PhotoBook,
} from '../../services/photoBookApi';
import { createGelatoOrder } from '../../services/photoBookApi';
import { getMessagesByChat, getAllMessagesByChat } from '../../services/chatApi';
import { useAppDispatch, useAppSelector } from '../../store/Store';
import {
  setThemeConfigForProject,
  loadThemeConfigForProject,
  setSavingTheme,
} from '../../store/Slice/themeConfigSlice';
import { updateBookUploadStatus } from '../../store/Slice/chatSlice';
import { themes, resolveThemeConfig, getTheme, ThemeConfigStored } from '../../themes';
import { BookPreviewPages } from './BookPreviewPages';
import { ThemeSelector } from './ThemeSelector';
import { OptionsPanel } from './OptionsPanel';
import { TitleEditorModal } from './TitleEditorModal';
import { IMessage } from '../../interfaces/IMessage';
import { filterSystemMessages } from '../../utils/systemMessageFilter';

const A5_ASPECT = 210 / 148;

interface PhotoBookPreviewProps {
  navigation?: any;
  route?: any;
}

const PhotoBookPreview: React.FC<PhotoBookPreviewProps> = ({
  navigation,
  route,
}) => {
  const { photoBookId, format, pageCount, totalPrice, chatId, needsCalculation, mediaFiles: routeMediaFiles, bookspecs } =
    route?.params || {};
  
  // 🔥 NEW: Calculation mode state
  const [isCalculating, setIsCalculating] = useState(!!needsCalculation);
  const [calculatedPages, setCalculatedPages] = useState<IMessage[][] | null>(null);
  const [booksToUpload, setBooksToUpload] = useState<any[] | null>(null);
  const [uploadingBooks, setUploadingBooks] = useState(false);
  const [enrichedBooks, setEnrichedBooks] = useState<any[] | null>(null); // books with qrUrl/thumbnailUrl after upload
  const [isDraftRecalculating, setIsDraftRecalculating] = useState(false); // recalculating pages from draft
  const [draftBooks, setDraftBooks] = useState<any[] | null>(null); // recalculated books from draft
  
  const [photoBook, setPhotoBook] = useState<PhotoBook | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [previewAreaWidth, setPreviewAreaWidth] = useState<number>(0);
  const [titleEditorVisible, setTitleEditorVisible] = useState(false);
  
  // NEW: Multi-book support
  const [currentBookNumber, setCurrentBookNumber] = useState(1);
  const [totalBooks, setTotalBooks] = useState(1);

  const token = useAppSelector((state: any) => state?.user?.token);
  const user = useAppSelector((state: any) => state?.user?.user);
  const currentAddress = useAppSelector(
    (state: any) => state?.user?.currentAddress
  );
  const themeConfigState = useAppSelector((state: any) =>
    photoBookId ? state?.themeConfig?.byPhotoBookId?.[photoBookId] : null
  );
  const savingTheme = useAppSelector(
    (state: any) => state?.themeConfig?.savingPhotoBookId
  );
  const reduxChatId = useAppSelector((state: any) => state?.chats?.currentChat?._id);
  const reduxMessages = useAppSelector((state: any) => state?.chats?.chatMessages) as
    | IMessage[]
    | undefined;
  // NEW: Get book upload status from Redux
  const bookUploadStatus = useAppSelector(
    (state: any) => state?.chats?.bookUploadStatus?.[chatId] || {}
  );
  const bookMessages = useAppSelector(
    (state: any) => state?.chats?.bookMessages?.[chatId] || {}
  );
  const dispatch = useAppDispatch();

  // 🔥 NEW: Callback when pages are calculated
  const handlePagesCalculated = useCallback((pages: IMessage[][]) => {
    // Guard: Only process once during initial calculation
    if (booksToUpload) {
      console.log('⏭️ Skipping calculation - already calculated');
      return;
    }
    
    console.log(`🎯 Pages calculated: ${pages.length} pages`);
    setCalculatedPages(pages);
    
    if (needsCalculation && pages.length > 0) {
      // Import the splitting utility
      const { splitBooksWithMediaByActualPages, formatDateRange } = require('../../utils/accurateBookSplitting');
      
      if (pages.length > 200) {
        // Multi-book: Split at exactly 200 pages
        const books = splitBooksWithMediaByActualPages(pages, routeMediaFiles || [], 200);
        console.log(`📚 Split into ${books.length} books:`);
        books.forEach(b => {
          console.log(`  Book ${b.bookNumber}: ${b.actualPages} pages, ${b.messages.length} messages`);
        });
        
        setBooksToUpload(books);
        
        // Show alert
        Alert.alert(
          '📚 Large Chat Detected',
          `Your chat has ${pages.length} pages.\n\n` +
          `We'll split it into ${books.length} books:\n\n` +
          books.map(b => 
            `• Book ${b.bookNumber}: ${formatDateRange(b.dateRange.from)} - ${formatDateRange(b.dateRange.to)} (${b.actualPages} pages)`
          ).join('\n') +
          `\n\nClick "Upload & Generate PDF" to continue.`,
          [{ text: 'OK' }]
        );
      } else {
        // Single book
        const allMessages = pages.flat();
        const book = {
          bookNumber: 1,
          messages: allMessages,
          actualPages: pages.length,
          mediaFiles: routeMediaFiles || [],
          dateRange: {
            from: allMessages[0]?.date || allMessages[0]?.sendingTime || '',
            to: allMessages[allMessages.length - 1]?.date || allMessages[allMessages.length - 1]?.sendingTime || '',
          },
        };
        
        setBooksToUpload([book]);
        console.log(`📖 Single book: ${pages.length} pages, ${allMessages.length} messages`);
      }
      
      setIsCalculating(false);
    }
  }, [needsCalculation, routeMediaFiles, booksToUpload]);

  // NEW: Callback when pages are recalculated from draft
  const handleDraftPagesCalculated = useCallback((pages: IMessage[][]) => {
    if (pages.length === 0) return;

    console.log(`🔄 [draftRecalc] Total pages calculated: ${pages.length}`);

    const { splitBooksWithMediaByActualPages } = require('../../utils/accurateBookSplitting');

    if (pages.length > 200) {
      const books = splitBooksWithMediaByActualPages(pages, [], 200);
      console.log(`📚 [draftRecalc] Split into ${books.length} books:`);
      books.forEach((b: any) => {
        console.log(`  Book ${b.bookNumber}: ${b.actualPages} pages, ${b.messages.length} messages | first msg: "${b.messages[0]?.senderName}" last msg: "${b.messages[b.messages.length-1]?.senderName}"`);
      });
      setDraftBooks(books);
      setTotalBooks(books.length);
    } else {
      const allMessages = pages.flat();
      console.log(`📖 [draftRecalc] Single book: ${pages.length} pages, ${allMessages.length} messages`);
      setDraftBooks([{ bookNumber: 1, messages: allMessages, actualPages: pages.length }]);
      setTotalBooks(1);
    }
    setIsDraftRecalculating(false);
  }, []);
  const handleUploadAndGeneratePdf = async () => {
    if (!booksToUpload || booksToUpload.length === 0) {
      Alert.alert('Error', 'No books to upload');
      return;
    }
    
    if (!chatId) {
      Alert.alert('Error', 'Chat ID is missing');
      return;
    }
    
    setUploadingBooks(true);
    
    try {
      // Step 1: Create photobook with books metadata
      console.log(`📚 Creating photobook with ${booksToUpload.length} books...`);
      console.log(`📚 ChatId: ${chatId}, Format: ${format}`);
      
      const { createPhotoBook } = require('../../services/photoBookApi');
      
      // Calculate startMessageIndex for each book
      let cumulativeIndex = 0;
      const booksMetadata = booksToUpload.map((b: any) => {
        const metadata = {
          bookNumber: b.bookNumber,
          messageCount: b.messages.length,
          startMessageIndex: cumulativeIndex,
          estimatedPages: b.actualPages,
          dateRange: b.dateRange,
        };
        cumulativeIndex += b.messages.length;
        return metadata;
      });
      
      console.log(`📚 Books metadata:`, JSON.stringify(booksMetadata, null, 2));
      
      // Always send 30 as pageCount for single book (backend validates 30-200)
      const pageCountForBackend = 30;
      
      const createResponse = await createPhotoBook(
        chatId,
        format || 'standard_14_8x21',
        pageCountForBackend,
        booksMetadata
      );
      
      console.log(`📚 Create response:`, createResponse.data);
      const createdPhotoBook = createResponse.data?.data || createResponse.data;
      const newPhotoBookId = createdPhotoBook._id;
      console.log(`✅ PhotoBook created: ${newPhotoBookId}`);
      
      // Step 2: Upload ALL books sequentially
      const { uploadChatMedia, bulkMessages } = require('../../services/chatApi');
      const { getMimeType } = require('../../utils/mediaUtils');
      
      let qrMap: Record<string, string> = {};
      let thumbnailMap: Record<string, string> = {};
      let updatedChat: any = null;
      
      // Upload media files ONCE (all books share the same media)
      const allMediaFiles = booksToUpload.flatMap((b: any) => b.mediaFiles);
      if (allMediaFiles.length > 0) {
        console.log(`📤 Uploading ${allMediaFiles.length} media files...`);
        const data = new FormData();
        allMediaFiles.forEach((file: any) => {
          const fileUri = file.path.startsWith('file://') ? file.path : `file://${file.path}`;
          data.append('files', {
            uri: fileUri,
            name: file.name,
            type: getMimeType(file.name),
          } as any);
        });
        
        const chatResponse = await uploadChatMedia(chatId, data, (percent: number) => {
          console.log(`📤 Media upload progress: ${percent}%`);
        });
        updatedChat = chatResponse.data.data;
        qrMap = chatResponse.data.qrMap || {};
        thumbnailMap = chatResponse.data.thumbnailMap || {};
        console.log(`✅ Media files uploaded`);
      }
      
      // Upload messages for each book
      const enrichedBooksData: any[] = [];
      let globalMessageIndex = 0; // Track global message index across all books
      
      for (let i = 0; i < booksToUpload.length; i++) {
        const book = booksToUpload[i];
        const bookNumber = book.bookNumber;
        const bookStartIndex = globalMessageIndex; // Save start index for this book
        
        try {
          console.log(`📤 Uploading Book ${bookNumber}: ${book.messages.length} messages (starting at index ${bookStartIndex})`);
          
          // Update status to uploading
          dispatch(updateBookUploadStatus({
            chatId,
            bookNumber,
            status: 'uploading',
            progress: 0,
          }));
          
          // Prepare messages payload
          const enrichedMessages: any[] = [];
          const messagesPayload = book.messages.map((m: any, messageIndex: number) => {
            const payload: any = {
              date: m.date || '',
              messageType: m.messageType === 'unknown' ? 'text' : m.messageType,
              senderName: m.senderName,
              sendingTime: m.sendingTime,
              text: m.text,
              orderIndex: bookStartIndex + messageIndex, // CRITICAL: Preserve exact message order
            };
            
            // Build enriched message (for preview update)
            const enriched: any = { ...m };
            
            // Media URL mapping
            if ((m.messageType === 'image' || m.messageType === 'video' || m.messageType === 'audio') && m.localPath) {
              const filename = m.localPath.split('/').pop();
              
              if (updatedChat?.mediaFiles && Array.isArray(updatedChat.mediaFiles)) {
                const uploadedFile = updatedChat.mediaFiles.find((mf: any) => mf.name === filename);
                if (uploadedFile?.url) {
                  payload.url = uploadedFile.url;
                  enriched.url = uploadedFile.url;
                  if ((m.messageType === 'video' || m.messageType === 'audio') && filename && qrMap[filename]) {
                    payload.qrUrl = qrMap[filename];
                    enriched.qrUrl = qrMap[filename];
                  }
                  if (m.messageType === 'video' && filename && thumbnailMap[filename]) {
                    payload.thumbnailUrl = thumbnailMap[filename];
                    enriched.thumbnailUrl = thumbnailMap[filename];
                  }
                }
              }
            }
            
            enrichedMessages.push(enriched);
            return payload;
          });
          
          await bulkMessages(chatId, messagesPayload);
          
          console.log(`✅ Book ${bookNumber} uploaded successfully`);
          
          // Store enriched messages for preview
          enrichedBooksData.push({ ...book, messages: enrichedMessages });
          
          // Update global index for next book
          globalMessageIndex += book.messages.length;
          
          // Update status to completed
          dispatch(updateBookUploadStatus({
            chatId,
            bookNumber,
            status: 'completed',
            progress: 100,
          }));
          
        } catch (error: any) {
          console.error(`❌ Book ${bookNumber} upload failed:`, error);
          
          // Update status to failed
          dispatch(updateBookUploadStatus({
            chatId,
            bookNumber,
            status: 'failed',
            progress: 0,
            error: error.message || 'Upload failed',
          }));
          
          // Continue with next book
          continue;
        }
      }
      
      // Step 3: Load the created photobook
      console.log(`📖 Loading photobook ${newPhotoBookId}...`);
      const { getPhotoBookById } = require('../../services/photoBookApi');
      const photoBookResponse = await getPhotoBookById(newPhotoBookId);
      const loadedPhotoBook = photoBookResponse.data?.data || photoBookResponse.data;
      
      console.log(`✅ PhotoBook loaded:`, loadedPhotoBook?._id);
      setPhotoBook(loadedPhotoBook);
      
      // Store enriched books (with qrUrl/thumbnailUrl) for preview
      if (enrichedBooksData.length > 0) {
        setEnrichedBooks(enrichedBooksData);
      }
      
      console.log(`🧹 Clearing booksToUpload...`);
      setBooksToUpload(null); // Clear booksToUpload so UI switches to normal mode
      setUploadingBooks(false);
      
      console.log(`✅ Upload complete! PhotoBook: ${loadedPhotoBook?._id}, booksToUpload cleared`);
      Alert.alert('Success', 'Books uploaded successfully! You can now generate PDF.');
      
    } catch (error: any) {
      console.error('❌ Upload failed:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      Alert.alert('Error', `Upload failed: ${error.response?.data?.message || error.message || 'Unknown error'}`);
      setUploadingBooks(false);
    }
  };

  const themeId = themeConfigState?.themeId ?? 'classic';
  const overrides = themeConfigState?.overrides ?? {};
  const resolvedConfig = resolveThemeConfig(themeId, overrides);

  // NEW: Load books metadata from photoBook OR booksToUpload
  useEffect(() => {
    console.log('📚 [useEffect] Setting totalBooks');
    console.log('📚 [useEffect] booksToUpload:', booksToUpload?.length);
    console.log('📚 [useEffect] photoBook?.books:', photoBook?.books?.length);
    
    if (booksToUpload && booksToUpload.length > 0) {
      console.log('📚 [useEffect] Setting totalBooks from booksToUpload:', booksToUpload.length);
      setTotalBooks(booksToUpload.length);
    } else if (photoBook?.books && photoBook.books.length > 0) {
      console.log('📚 [useEffect] Setting totalBooks from photoBook.books:', photoBook.books.length);
      setTotalBooks(photoBook.books.length);
    } else {
      console.log('📚 [useEffect] Single book mode');
      setTotalBooks(1);
    }
  }, [photoBook, booksToUpload]);

  // NEW: Check if all books are uploaded
  const allBooksUploaded = React.useMemo(() => {
    if (!photoBook?.books || photoBook.books.length === 0) return true; // Single book
    
    return photoBook.books.every((book: any) => {
      const status = bookUploadStatus[book.bookNumber];
      return status && status.status === 'completed';
    });
  }, [photoBook, bookUploadStatus]);

  // Check if PDF is generated (single or multi-book)
  // Also true while generatingPdf so UI switches immediately on click
  const pdfGenerated = React.useMemo(() => {
    if (generatingPdf) return true; // Switch UI immediately when generation starts
    if (photoBook?.books && photoBook.books.length > 0) {
      return photoBook.books.some((b: any) => b.generatedPdfUrl);
    }
    return !!photoBook?.generatedPdfUrl;
  }, [photoBook, generatingPdf]);

  // NEW: Filter messages for current book
  const currentBookMessages = React.useMemo(() => {
    // Before upload: use calculated books
    if (booksToUpload && booksToUpload.length > 0) {
      const book = booksToUpload.find((b: any) => b.bookNumber === currentBookNumber);
      if (book) return book.messages;
    }
    
    // After upload (in-session): use enriched books with qrUrl/thumbnailUrl
    if (enrichedBooks && enrichedBooks.length > 0) {
      const book = enrichedBooks.find((b: any) => b.bookNumber === currentBookNumber);
      if (book) return book.messages;
    }

    // Draft mode: use recalculated books
    if (draftBooks && draftBooks.length > 0) {
      const book = draftBooks.find((b: any) => b.bookNumber === currentBookNumber);
      if (book) return book.messages;
    }
    
    // Single book mode
    if (!photoBook?.books || photoBook.books.length === 0) {
      return messages;
    }

    // Still recalculating - return all messages so BookPreviewPages can measure
    if (isDraftRecalculating) {
      return messages;
    }
    
    return messages;
  }, [messages, photoBook, currentBookNumber, bookMessages, booksToUpload, enrichedBooks, draftBooks, isDraftRecalculating]);

  // Add console logs for page calculation comparison
  React.useEffect(() => {
    if (currentBookMessages && currentBookMessages.length > 0) {
      const previewPageCount = pageCount || photoBook?.pageCount || 30;
      console.log(`📄 PAGE CALCULATION COMPARISON:`);
      console.log(`📄 Book ${currentBookNumber}: ${currentBookMessages.length} messages`);
      console.log(`📄 Preview showing: ${previewPageCount} pages`);
      console.log(`📄 Route pageCount:`, pageCount);
      console.log(`📄 PhotoBook pageCount:`, photoBook?.pageCount);
      
      if (photoBook?.books && photoBook.books.length > 0) {
        const currentBook = photoBook.books.find((b: any) => b.bookNumber === currentBookNumber);
        if (currentBook) {
          console.log(`📄 Book metadata estimatedPages: ${currentBook.estimatedPages}`);
          console.log(`📄 Book metadata messageCount: ${currentBook.messageCount}`);
        }
      }
    }
  }, [currentBookMessages, currentBookNumber, pageCount, photoBook]);

  const loadPhotoBook = useCallback(async () => {
    console.log('📖 [loadPhotoBook] START');
    console.log('📖 [loadPhotoBook] photoBookId:', photoBookId);
    
    if (!photoBookId) {
      console.log('❌ [loadPhotoBook] No photoBookId, returning');
      return;
    }
    
    try {
      console.log('📡 [loadPhotoBook] Fetching photobook from API...');
      const response = await getPhotoBookById(photoBookId);
      const data = response.data?.data ?? response.data;
      console.log('✅ [loadPhotoBook] PhotoBook loaded:', JSON.stringify(data, null, 2));
      console.log('📖 [loadPhotoBook] PhotoBook chatId:', data?.chatId);
      console.log('📖 [loadPhotoBook] PhotoBook status:', data?.status);
      console.log('📖 [loadPhotoBook] PhotoBook books:', data?.books);
      console.log('📖 [loadPhotoBook] PhotoBook books length:', data?.books?.length);
      console.log('📖 [loadPhotoBook] FULL RESPONSE:', JSON.stringify(response.data, null, 2));
      
      setPhotoBook(data);
      if (data?.theme_config) {
        console.log('🎨 [loadPhotoBook] Loading theme config');
        dispatch(
          loadThemeConfigForProject({
            photoBookId,
            themeConfig: {
              themeId: data.theme_config.themeId,
              overrides: data.theme_config.overrides || {},
            },
          })
        );
      }
      if (data?.previewUrl) {
        console.log('🖼️ [loadPhotoBook] Setting preview URL:', data.previewUrl);
        setPreviewUrl(data.previewUrl);
      }
    } catch (e) {
      console.error('❌ [loadPhotoBook] Error:', e);
      Alert.alert('Error', 'Failed to load photo book');
    }
  }, [photoBookId, dispatch]);

  const loadMessages = useCallback(async () => {
    console.log('🔍 [loadMessages] START');
    console.log('🔍 [loadMessages] needsCalculation:', needsCalculation);
    console.log('🔍 [loadMessages] chatId:', chatId);
    console.log('🔍 [loadMessages] photoBook?.chatId:', photoBook?.chatId);
    console.log('🔍 [loadMessages] reduxChatId:', reduxChatId);
    console.log('🔍 [loadMessages] reduxMessages length:', reduxMessages?.length);
    
    // 🔥 NEW: In calculation mode, messages are already in Redux from chat screen
    if (needsCalculation) {
      console.log('📥 Calculation mode: Using messages from Redux');
      if (reduxMessages && reduxMessages.length > 0) {
        console.log('✅ Setting messages from Redux:', reduxMessages.length);
        setMessages(filterSystemMessages(reduxMessages));
      } else {
        console.log('❌ No Redux messages available');
      }
      return;
    }
    
    const cid = chatId || (photoBook as PhotoBook)?.chatId;
    console.log('🔍 [loadMessages] Resolved cid:', cid);
    
    if (!cid) {
      console.log('❌ [loadMessages] No chatId available, returning');
      return;
    }
    
    try {
      // Prefer Redux messages to guarantee deterministic order in UI.
      const resolvedCid =
        typeof cid === 'object' ? (cid as any)?._id : cid;
      
      console.log('🔍 [loadMessages] resolvedCid:', resolvedCid);
      console.log('🔍 [loadMessages] Checking Redux: reduxChatId === resolvedCid?', reduxChatId === resolvedCid);
      
      if (
        reduxChatId &&
        resolvedCid &&
        reduxChatId === resolvedCid &&
        Array.isArray(reduxMessages) &&
        reduxMessages.length > 0
      ) {
        console.log('✅ [loadMessages] Using Redux messages:', reduxMessages.length);
        setMessages(filterSystemMessages(reduxMessages));
        return;
      }

      console.log('📡 [loadMessages] Fetching messages from API for chatId:', resolvedCid);
      const arr = await getAllMessagesByChat(
        typeof cid === 'object' ? (cid as any)?._id : cid
      );
      setMessages(filterSystemMessages(arr));
    } catch (error) {
      console.error('❌ [loadMessages] Error:', error);
      setMessages([]);
    }
  }, [chatId, photoBook, reduxChatId, reduxMessages, needsCalculation]);

  useEffect(() => {
    loadPhotoBook();
  }, [photoBookId]);

  // 🔥 NEW: Load messages immediately in calculation mode
  useEffect(() => {
    if (needsCalculation && reduxMessages && reduxMessages.length > 0) {
      console.log(`📥 Loading ${reduxMessages.length} messages from Redux for calculation`);
      setMessages(filterSystemMessages(reduxMessages));
      setLoading(false);
    }
  }, [needsCalculation, reduxMessages]);

  useEffect(() => {
    console.log('🔄 [useEffect] photoBook.chatId changed');
    console.log('🔄 [useEffect] photoBook?.chatId:', photoBook?.chatId);
    console.log('🔄 [useEffect] photoBook?.status:', photoBook?.status);
    console.log('🔄 [useEffect] photoBook?.books:', photoBook?.books);
    console.log('🔄 [useEffect] reduxChatId:', reduxChatId);
    console.log('🔄 [useEffect] reduxMessages length:', reduxMessages?.length);
    
    if (photoBook?.chatId) {
      const cid = typeof photoBook.chatId === 'object' ? (photoBook.chatId as any)?._id : photoBook.chatId;
      console.log('🔄 [useEffect] Resolved cid:', cid);
      
      if (cid) {
        // 🔥 IMPORTANT: For draft photobooks, DON'T use Redux messages
        // Only use backend messages that were actually uploaded
        if (photoBook.status === 'draft' && !photoBook.generatedPdfUrl) {
          console.log('⚠️ [useEffect] Draft photobook with no PDF - fetching messages from backend');
          console.log('📡 [useEffect] Fetching messages from API for cid:', cid);
          getAllMessagesByChat(cid)
            .then((arr) => {
              if (arr.length === 0) {
                setMessages([]);
              } else {
                setMessages(filterSystemMessages(arr));
              }
            })
            .catch((error) => {
              console.error('❌ [useEffect] Error fetching messages:', error);
              setMessages([]);
            });
          return;
        }
        
        // For non-draft or PDF-generated photobooks, prefer Redux messages
        if (
          reduxChatId &&
          reduxChatId === cid &&
          Array.isArray(reduxMessages) &&
          reduxMessages.length > 0
        ) {
          setMessages(filterSystemMessages(reduxMessages));
          return;
        }

        getAllMessagesByChat(cid)
          .then((arr) => {
            setMessages(filterSystemMessages(arr));
          })
          .catch((error) => {
            console.error('❌ [useEffect] Error fetching messages:', error);
            setMessages([]);
          });
      } else {
        console.log('❌ [useEffect] Could not resolve cid');
      }
    } else {
      console.log('❌ [useEffect] No photoBook.chatId');
    }
  }, [photoBook?.chatId, photoBook?.status, photoBook?.generatedPdfUrl, reduxChatId, reduxMessages]);

  useEffect(() => {
    if (loading && photoBook !== undefined && messages.length > 0) {
      setLoading(false);
    }
  }, [photoBook, loading, messages]);

  // When opening a multi-book draft and messages are loaded, trigger recalculation
  useEffect(() => {
    if (
      !needsCalculation &&
      !isDraftRecalculating &&
      !draftBooks &&
      photoBook?.books && photoBook.books.length > 0 &&
      messages.length > 0
    ) {
      setIsDraftRecalculating(true);
    }
  }, [photoBook, messages, needsCalculation, isDraftRecalculating, draftBooks]);

  const handleSelectTheme = (id: string) => {
    dispatch(setThemeConfigForProject({ photoBookId, themeId: id, overrides }));
  };

  const handleDateFormat = (v: 'full' | 'timeOnly' | 'hidden') => {
    dispatch(
      setThemeConfigForProject({
        photoBookId,
        themeId,
        overrides: { ...overrides, dateFormat: v },
      })
    );
  };
  const handleShowPageNumbers = (v: boolean) => {
    dispatch(
      setThemeConfigForProject({
        photoBookId,
        themeId,
        overrides: { ...overrides, showPageNumbers: v },
      })
    );
  };
  const handleSenderLabelStyle = (v: 'name' | 'initial' | 'hidden') => {
    dispatch(
      setThemeConfigForProject({
        photoBookId,
        themeId,
        overrides: { ...overrides, senderLabelStyle: v },
      })
    );
  };
  const handleFontFamily = (v: string) => {
    dispatch(
      setThemeConfigForProject({
        photoBookId,
        themeId,
        overrides: { ...overrides, fontFamily: v },
      })
    );
  };
  const handleFontSize = (v: number) => {
    dispatch(
      setThemeConfigForProject({
        photoBookId,
        themeId,
        overrides: { ...overrides, fontSize: v },
      })
    );
  };
  const handleMessageBold = (v: boolean) => {
    dispatch(
      setThemeConfigForProject({
        photoBookId,
        themeId,
        overrides: { ...overrides, messageBold: v },
      })
    );
  };
  const handleMessageItalic = (v: boolean) => {
    dispatch(
      setThemeConfigForProject({
        photoBookId,
        themeId,
        overrides: { ...overrides, messageItalic: v },
      })
    );
  };
  const handleImageLayout = (v: 'fullPage' | 'grid' | 'maxGrid') => {
    dispatch(
      setThemeConfigForProject({
        photoBookId,
        themeId,
        overrides: { ...overrides, imageLayout: v },
      })
    );
  };
  const handleDateStyle = (v: 'short' | 'long' | 'dayName') => {
    dispatch(
      setThemeConfigForProject({
        photoBookId,
        themeId,
        overrides: { ...overrides, dateStyle: v },
      })
    );
  };
  const handleDateLanguage = (v: 'en' | 'fr' | 'es') => {
    dispatch(
      setThemeConfigForProject({
        photoBookId,
        themeId,
        overrides: { ...overrides, dateLanguage: v },
      })
    );
  };

  const handleEditTitles = () => {
    setTitleEditorVisible(true);
  };

  // NEW: Retry upload for failed book
  const handleRetryUpload = async (bookNumber: number) => {
    Alert.alert(
      'Retry Upload',
      `Retry uploading Book ${bookNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Retry',
          onPress: async () => {
            try {
              console.log(`🔄 Retrying Book ${bookNumber}...`);
              
              // Update status to "uploading"
              dispatch(updateBookUploadStatus({
                chatId,
                bookNumber,
                status: 'uploading',
                progress: 0,
              }));
              
              // TODO: Implement actual retry logic
              // This would need to re-fetch the book chunk data and re-upload
              // For now, just show a message
              Alert.alert('Info', 'Retry functionality will be implemented. Please restart the upload from the chat screen.');
              
              // Reset to failed state for now
              dispatch(updateBookUploadStatus({
                chatId,
                bookNumber,
                status: 'failed',
                progress: 0,
                error: 'Retry not yet implemented',
              }));
              
            } catch (error: any) {
              Alert.alert('Error', `Retry failed: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  const handleSaveTitles = (customTitles: any) => {
    console.log('📥 Received titles in index.tsx:', JSON.stringify(customTitles, null, 2));
    dispatch(
      setThemeConfigForProject({
        photoBookId,
        themeId,
        overrides: { ...overrides, customTitles },
      })
    );
    console.log('✅ Dispatched to Redux with overrides:', { ...overrides, customTitles });
  };

  // Per-book PDF generation status (for UI tracking during generation)
  const [bookPdfStatus, setBookPdfStatus] = useState<Record<number, 'pending' | 'generating' | 'completed' | 'failed'>>({});

  const handleGeneratePdf = async () => {
    if (!token) {
      Alert.alert('Error', 'Please log in to continue');
      navigation.navigate('LogIn');
      return;
    }

    // Resolve the actual photobook ID — after upload flow, photoBook._id is the source of truth
    const resolvedPhotoBookId = photoBook?._id || photoBookId;
    if (!resolvedPhotoBookId) {
      Alert.alert('Error', 'No photo book found. Please upload first.');
      return;
    }

    setSaveError(null);
    setGeneratingPdf(true);

    // Init per-book status
    if (photoBook?.books && photoBook.books.length > 0) {
      const initial: Record<number, 'pending' | 'generating' | 'completed' | 'failed'> = {};
      photoBook.books.forEach((b: any) => { initial[b.bookNumber] = 'pending'; });
      setBookPdfStatus(initial);
    }

    const theme_config: ThemeConfigStored = {
      themeId,
      schemaVersion: 1,
      overrides,
    };
    try {
      dispatch(setSavingTheme(resolvedPhotoBookId));
      await updatePhotoBookThemeConfig(resolvedPhotoBookId, theme_config);
      dispatch(setSavingTheme(null));

      // Start polling while PDF generates
      let pollInterval: any = null;
      if (photoBook?.books && photoBook.books.length > 0) {
        // Mark book 1 as generating immediately
        setBookPdfStatus(prev => ({ ...prev, 1: 'generating' }));

        pollInterval = setInterval(async () => {
          try {
            const res = await getPhotoBookById(resolvedPhotoBookId);
            const latest = res.data?.data ?? res.data;
            if (latest?.books) {
              const newStatus: Record<number, any> = {};
              latest.books.forEach((b: any) => { newStatus[b.bookNumber] = b.status; });
              setBookPdfStatus(newStatus);
              setPhotoBook(latest);
            }
          } catch {}
        }, 3000); // Poll every 3 seconds
      }

      const response = await generatePhotoBookPdf(resolvedPhotoBookId);
      
      if (pollInterval) clearInterval(pollInterval);

      const updated = response.data?.data?.photoBook ?? response.data?.photoBook;
      if (updated) {
        setPhotoBook(updated);
        // Set final statuses
        if (updated.books) {
          const finalStatus: Record<number, any> = {};
          updated.books.forEach((b: any) => { finalStatus[b.bookNumber] = b.status; });
          setBookPdfStatus(finalStatus);
        }
      }
      await loadPhotoBook();

      const totalBooksGenerated = updated?.books?.length || 1;
      const message = totalBooksGenerated > 1
        ? `All ${totalBooksGenerated} PDFs generated successfully!`
        : 'PDF generated successfully! It is saved and you can view it below.';

      Alert.alert('Success', message, [{ text: 'OK' }]);
    } catch (error: any) {
      dispatch(setSavingTheme(null));
      setSaveError(error.response?.data?.message || error.message || 'Failed to generate PDF');
      Alert.alert('Error', error.response?.data?.message || 'Failed to generate PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!currentAddress) {
      Alert.alert('Error', 'Please select a shipping address first');
      navigation.navigate('Addresses');
      return;
    }
    // Check for PDF - works for both single and multi-book
    const hasPdf = photoBook?.generatedPdfUrl || 
      (photoBook?.books && photoBook.books.some((b: any) => b.generatedPdfUrl));
    if (!hasPdf) {
      Alert.alert('Error', 'Please generate PDF first');
      return;
    }
    setOrdering(true);
    try {
      const shippingAddress = {
        name: `${currentAddress.first_name} ${currentAddress.last_name}`,
        addressLine1: currentAddress.address_one,
        addressLine2: currentAddress.address_two || '',
        city: currentAddress.city,
        postalCode: currentAddress.postal_code || '',
        country: currentAddress.country,
        phoneNumber: currentAddress.phone_no,
      };
      const response = await createGelatoOrder(photoBook?._id || photoBookId, shippingAddress);
      const orderData = response.data?.data ?? response.data;
      const orderId =
        orderData?.orderId ||
        orderData?.gelatoOrder?._id ||
        orderData?.gelatoOrderId ||
        orderData?.id;
      const pUrl = orderData?.previewUrl || orderData?.orderPreviewUrl;
      if (pUrl) setPreviewUrl(pUrl);
      navigation.navigate('OrderSuccess', {
        orderId: orderId || 'unknown',
        photoBookId,
      });
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to create order'
      );
    } finally {
      setOrdering(false);
    }
  };

  const screenWidth = Dimensions.get('window').width;
  const containerWidth = Math.round(previewAreaWidth > 0 ? previewAreaWidth : screenWidth - wp(6));
  const previewHeight = containerWidth * A5_ASPECT;

  return (
    <View style={styles.container}>
      <CustomHeader text="Preview & Checkout" onPress={() => navigation.goBack()} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator
      >
        <Text style={styles.title}>Book Preview</Text>

        <View style={styles.twoColumn}>
          {!pdfGenerated && (
          <View style={styles.leftColumn}>
            <ThemeSelector
              selectedThemeId={themeId}
              onSelectTheme={handleSelectTheme}
            />
            <OptionsPanel
              overrides={overrides}
              onDateFormatChange={handleDateFormat}
              onShowPageNumbersChange={handleShowPageNumbers}
              onSenderLabelStyleChange={handleSenderLabelStyle}
              onFontFamilyChange={handleFontFamily}
              onFontSizeChange={handleFontSize}
              onMessageBoldChange={handleMessageBold}
              onMessageItalicChange={handleMessageItalic}
              onImageLayoutChange={handleImageLayout}
              onDateStyleChange={handleDateStyle}
              onDateLanguageChange={handleDateLanguage}
              onEditTitles={handleEditTitles}
            />
          </View>
          )}

          <View style={pdfGenerated ? styles.fullWidth : styles.previewSection}>
            {/* NEW: Book Selector for multi-book with upload status */}
            {totalBooks > 1 && (
              <View style={styles.bookSelector}>
                <Text style={styles.bookSelectorTitle}>Select Book:</Text>
                <View style={styles.bookButtons}>
                  {Array.from({ length: totalBooks }, (_, i) => i + 1).map(bookNum => {
                    return (
                      <View key={bookNum} style={styles.bookButtonContainer}>
                        <TouchableOpacity
                          style={[
                            styles.bookButton,
                            currentBookNumber === bookNum && styles.bookButtonActive,
                          ]}
                          onPress={() => {
                            console.log(`🔍 Switching to book ${bookNum}`);
                            setCurrentBookNumber(bookNum);
                          }}
                        >
                          <Text
                            style={[
                              styles.bookButtonText,
                              currentBookNumber === bookNum && styles.bookButtonTextActive,
                            ]}
                          >
                            Book {bookNum}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
                
                {/* Warning if not all books uploaded */}
                {!allBooksUploaded && photoBook && totalBooks > 1 && (
                  <View style={styles.uploadWarning}>
                    <Text style={styles.uploadWarningText}>
                      ⚠️ Please wait for all books to upload before generating PDF
                    </Text>
                  </View>
                )}
              </View>
            )}
            
            {/* 🔥 Calculation overlay (above disclaimer) */}
            {isCalculating && !booksToUpload && (
              <View style={styles.calculationOverlay}>
                <ActivityIndicator size="large" color={COLORS.lightBlue} />
                <Text style={styles.calculationText}>Your chat is too long!</Text>
                <Text style={styles.calculationSubtext}>
                  We're breaking your chat into multiple books.
                </Text>
                <Text style={styles.calculationSubtext}>
                  Please be patient, this may take 2-3 minutes...
                </Text>
              </View>
            )}

            {isDraftRecalculating && (
              <View style={styles.calculationOverlay}>
                <ActivityIndicator size="large" color={COLORS.lightBlue} />
                <Text style={styles.calculationText}>Loading preview...</Text>
                <Text style={styles.calculationSubtext}>Recalculating page layout...</Text>
              </View>
            )}

            {/* 🔥 Upload progress indicator */}
            {uploadingBooks && (
              <View style={styles.uploadProgressContainer}>
                <ActivityIndicator size="small" color={COLORS.lightBlue} />
                <Text style={styles.uploadProgressText}>Uploading books...</Text>
              </View>
            )}
            
            <Text style={styles.disclaimer}>
              Preview is approximate. Final PDF may have minor layout differences.
            </Text>
            
            {/* 🔥 Show preview when no PDF generated yet */}
            {!pdfGenerated && (
            <View
              style={styles.previewBoxWrapper}
              onLayout={(e) => {
                const w = e.nativeEvent.layout.width;
                if (w > 0) setPreviewAreaWidth(w);
              }}
            >
            {previewUrl ? (
              <Image source={{ uri: previewUrl }} style={styles.previewImage} />
            ) : pdfGenerated ? (
              <View style={styles.a5Wrapper}>
                <View style={[styles.pdfPlaceholder, { height: previewHeight }]}>
                  <Text style={styles.pdfIcon}>📄</Text>
                  <Text style={styles.pdfText}>
                    {generatingPdf ? 'Generating PDFs...' : 'PDFs ready!'}
                  </Text>
                  <Text style={styles.pdfSubtext}>
                    {generatingPdf
                      ? 'Please wait, generating remaining books...'
                      : 'View and download each book\'s PDF below.'}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.a5Wrapper}>
                <View
                  style={[
                    styles.a5Container,
                    {
                      width: '100%',
                      backgroundColor: COLORS.white2,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.12,
                      shadowRadius: 6,
                      elevation: 4,
                    },
                  ]}
                >
                  {messages.length > 0 ? (
                    <>
                      {(() => {
                        // 🔥 NEW: Use booksToUpload actualPages if available
                        let finalPageCount = pageCount || photoBook?.pageCount || 30;
                        
                        if (booksToUpload && booksToUpload.length > 0) {
                          const currentBook = booksToUpload.find((b: any) => b.bookNumber === currentBookNumber);
                          if (currentBook && currentBook.actualPages) {
                            finalPageCount = currentBook.actualPages;
                          }
                        } else if (photoBook?.books && photoBook.books.length > 0) {
                          const currentBook = photoBook.books.find((b: any) => b.bookNumber === currentBookNumber);
                          if (currentBook && currentBook.estimatedPages) {
                            finalPageCount = currentBook.estimatedPages;
                          }
                        }
                        
                        console.log(`📄 PASSING TO BookPreviewPages: ${currentBookMessages.length} messages, pageCount: ${finalPageCount}`);
                        return null;
                      })()}
                      <BookPreviewPages
                        messages={isDraftRecalculating ? messages : currentBookMessages}
                        pageCount={(() => {
                          // 🔥 NEW: Use booksToUpload actualPages if available
                          if (booksToUpload && booksToUpload.length > 0) {
                            const currentBook = booksToUpload.find((b: any) => b.bookNumber === currentBookNumber);
                            if (currentBook && currentBook.actualPages) {
                              return currentBook.actualPages;
                            }
                          }
                          
                          // For multi-book: use book's estimatedPages, for single book: use pageCount
                          if (photoBook?.books && photoBook.books.length > 0) {
                            const currentBook = photoBook.books.find((b: any) => b.bookNumber === currentBookNumber);
                            if (currentBook && currentBook.estimatedPages) {
                              return currentBook.estimatedPages;
                            }
                          }
                          return pageCount || photoBook?.pageCount || 30;
                        })()}
                        resolvedConfig={resolvedConfig}
                        containerWidth={Math.max(containerWidth, 300)}
                        format={format || photoBook?.format || 'standard_14_8x21'}
                        onPagesCalculated={
                          isDraftRecalculating ? handleDraftPagesCalculated :
                          (isCalculating && !booksToUpload ? handlePagesCalculated : undefined)
                        }
                      />
                    </>
                  ) : (
                    <View style={styles.emptyPreview}>
                      <ActivityIndicator size="small" color={COLORS.lightBlue} />
                      <Text style={styles.emptyText}>Loading messages…</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
            </View>
            )}
          </View>
        </View>

        {saveError ? (
          <Text style={styles.errorText}>{saveError}</Text>
        ) : null}

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Format:</Text>
            <Text style={styles.detailValue}>
              {format === 'square_14x14'
                ? 'Square (14×14 cm)'
                : 'Standard (14.8×21 cm)'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pages:</Text>
            <Text style={styles.detailValue}>
              {(() => {
                // Calculate TOTAL pages across ALL books
                if (booksToUpload && booksToUpload.length > 0) {
                  const totalPages = booksToUpload.reduce((sum, book) => sum + (book.actualPages || 0), 0);
                  return totalPages;
                } else if (photoBook?.books && photoBook.books.length > 0) {
                  const totalPages = photoBook.books.reduce((sum, book) => sum + (book.estimatedPages || 0), 0);
                  return totalPages;
                }
                return pageCount ?? photoBook?.pageCount ?? 30;
              })()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Price:</Text>
            <Text style={styles.detailValue}>
              ${(() => {
                // Calculate price for ALL books combined
                const { calculateTotalPrice } = require('../../utils/pricingUtils');
                const currentFormat = format || photoBook?.format || 'standard_14_8x21';
                
                if (booksToUpload && booksToUpload.length > 0) {
                  const totalPrice = booksToUpload.reduce((sum, book) => {
                    const bookPrice = calculateTotalPrice(currentFormat, book.actualPages || 30);
                    return sum + bookPrice;
                  }, 0);
                  return totalPrice.toFixed(2);
                } else if (photoBook?.books && photoBook.books.length > 0) {
                  const totalPrice = photoBook.books.reduce((sum, book) => {
                    const bookPrice = calculateTotalPrice(currentFormat, book.estimatedPages || 30);
                    return sum + bookPrice;
                  }, 0);
                  return totalPrice.toFixed(2);
                }
                
                // Single book fallback
                const actualPageCount = pageCount ?? photoBook?.pageCount ?? 30;
                const dynamicPrice = calculateTotalPrice(currentFormat, actualPageCount);
                return dynamicPrice.toFixed(2);
              })()}
            </Text>
          </View>
        </View>

        {/* 🔥 Upload Books button OR upload status (before photoBook is loaded) */}
        {booksToUpload && !photoBook && (
          uploadingBooks ? (
            // Show upload status for each book
            <View style={styles.uploadStatusContainer}>
              {Array.from({ length: booksToUpload.length }, (_, i) => i + 1).map(bookNum => {
                const statusData = bookUploadStatus[bookNum] || { status: 'pending', progress: 0 };
                const { status, error } = statusData;
                
                return (
                  <View key={bookNum} style={styles.uploadStatusRow}>
                    <Text style={styles.uploadStatusLabel}>Book {bookNum}:</Text>
                    {status === 'pending' && (
                      <Text style={styles.uploadStatusText}>⏳ Pending...</Text>
                    )}
                    {status === 'uploading' && (
                      <View style={styles.uploadStatusInline}>
                        <ActivityIndicator size="small" color={COLORS.lightBlue} />
                        <Text style={styles.uploadStatusTextUploading}>Uploading...</Text>
                      </View>
                    )}
                    {status === 'completed' && (
                      <Text style={styles.uploadStatusTextSuccess}>✅ Uploaded</Text>
                    )}
                    {status === 'failed' && (
                      <View style={styles.uploadStatusInline}>
                        <Text style={styles.uploadStatusTextFailed}>❌ Failed</Text>
                        <TouchableOpacity
                          style={styles.retryButtonSmall}
                          onPress={() => handleRetryUpload(bookNum)}
                        >
                          <Text style={styles.retryButtonTextSmall}>Retry</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            // Show Upload Books button
            <CustomButton
              text="Upload Books"
              onPress={handleUploadAndGeneratePdf}
              animating={false}
              disable={false}
            />
          )
        )}

        {!pdfGenerated && photoBook && (
          <CustomButton
            text={
              savingTheme
                ? 'Saving theme…'
                : generatingPdf
                ? 'Generating PDF…'
                : !allBooksUploaded
                ? 'Waiting for uploads…'
                : 'Generate PDF'
            }
            onPress={handleGeneratePdf}
            animating={savingTheme === photoBookId || generatingPdf}
            disable={savingTheme === photoBookId || generatingPdf || !allBooksUploaded}
          />
        )}
        {photoBook?.books && photoBook.books.length > 0 && pdfGenerated ? (
          // Multi-book: Show per-book status
          <>
            <View style={styles.pdfButtonsContainer}>
              {photoBook.books.map((book: any) => {
                const status = bookPdfStatus[book.bookNumber] || book.status || 'pending';
                const isGenerating = status === 'generating';
                const isCompleted = status === 'completed' && book.generatedPdfUrl;
                const isFailed = status === 'failed';
                const isPending = status === 'pending';

                return (
                  <View key={book.bookNumber} style={styles.bookPdfRow}>
                    {isCompleted ? (
                      <TouchableOpacity
                        style={styles.viewPdfButton}
                        onPress={() => Linking.openURL(book.generatedPdfUrl).catch(() => Alert.alert('Error', 'Could not open PDF'))}
                      >
                        <Text style={styles.viewPdfButtonText}>📄 View Book {book.bookNumber} PDF</Text>
                      </TouchableOpacity>
                    ) : isGenerating ? (
                      <View style={styles.bookPdfStatusRow}>
                        <ActivityIndicator size="small" color={COLORS.lightBlue} />
                        <Text style={styles.bookPdfStatusText}>Book {book.bookNumber} — Generating PDF...</Text>
                      </View>
                    ) : isFailed ? (
                      <View style={styles.bookPdfStatusRow}>
                        <Text style={styles.bookPdfFailedText}>❌ Book {book.bookNumber} — Failed</Text>
                        <TouchableOpacity style={styles.retryPdfButton} onPress={handleGeneratePdf}>
                          <Text style={styles.retryPdfButtonText}>Retry</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.bookPdfStatusRow}>
                        <ActivityIndicator size="small" color={COLORS.lightBlue} />
                        <Text style={styles.bookPdfStatusText}>Book {book.bookNumber} — Waiting...</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
            {photoBook.books.every((b: any) => b.generatedPdfUrl) && (
              <CustomButton
                text={ordering ? 'Creating Order…' : 'Create Order (All Books)'}
                onPress={handleCreateOrder}
                animating={ordering}
              />
            )}
          </>
        ) : photoBook?.generatedPdfUrl ? (
          // Single book: Show single button
          <>
            <TouchableOpacity
              style={styles.viewPdfButton}
              onPress={() => {
                const url = photoBook.generatedPdfUrl;
                if (url) Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open PDF'));
              }}
            >
              <Text style={styles.viewPdfButtonText}>View PDF</Text>
            </TouchableOpacity>
            <CustomButton
              text={ordering ? 'Creating Order…' : 'Create Order'}
              onPress={handleCreateOrder}
              animating={ordering}
            />
          </>
        ) : null}
      </ScrollView>

      <TitleEditorModal
        visible={titleEditorVisible}
        onClose={() => setTitleEditorVisible(false)}
        customTitles={overrides.customTitles || { years: {}, months: {} }}
        onSave={handleSaveTitles}
        messages={messages}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white2,
  },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: wp(3), paddingVertical: hp(2), paddingBottom: hp(6) },
  title: {
    fontSize: rfs(24),
    fontFamily: fonts.POPPINS.Bold,
    color: COLORS.textBlack,
    marginBottom: hp(2),
  },
  twoColumn: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: hp(2),
  },
  leftColumn: {
    width: '100%',
    maxWidth: 320,
    marginBottom: wp(4),
  },
  previewColumn: { flex: 1, minWidth: 200 },
  previewSection: {
    flex: 1,
    minWidth: 200,
    width: '100%',
  },
  fullWidth: {
    flex: 1,
    width: '100%',
  },
  bookPdfRow: {
    marginBottom: hp(1),
  },
  bookPdfStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    backgroundColor: COLORS.white2,
    borderRadius: 8,
  },
  bookPdfStatusText: {
    fontSize: rfs(13),
    color: COLORS.lightBlue,
    flex: 1,
  },
  bookPdfFailedText: {
    fontSize: rfs(13),
    color: 'red',
    flex: 1,
  },
  retryPdfButton: {
    backgroundColor: COLORS.lightBlue,
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: 6,
  },
  retryPdfButtonText: {
    color: COLORS.white2,
    fontSize: rfs(12),
    fontWeight: '600',
  },
  previewBoxWrapper: {
    width: '100%',
  },
  disclaimer: {
    fontSize: rfs(11),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textGray,
    marginBottom: hp(1),
    fontStyle: 'italic',
  },
  a5Wrapper: {
    width: '100%',
    marginBottom: hp(2),
    borderRadius: 4,
    overflow: 'hidden',
  },
  a5Container: {
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  emptyPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: rfs(14),
    color: COLORS.textGray,
    marginTop: hp(1),
  },
  previewImage: {
    width: '100%',
    height: hp(40),
    borderRadius: wp(2),
    backgroundColor: COLORS.lightGray,
  },
  pdfPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
  },
  pdfIcon: { fontSize: rfs(48), marginBottom: hp(1) },
  pdfText: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.textBlack,
  },
  pdfSubtext: {
    fontSize: rfs(12),
    color: COLORS.textGray,
    marginTop: hp(1),
    textAlign: 'center',
  },
  viewPdfButton: {
    backgroundColor: COLORS.lightGray,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
    marginBottom: hp(2),
    alignItems: 'center',
  },
  viewPdfButtonText: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.lightBlue,
  },
  errorText: {
    fontSize: rfs(12),
    color: '#c00',
    marginBottom: hp(1),
  },
  detailsContainer: {
    backgroundColor: COLORS.lightGray,
    borderRadius: wp(2),
    padding: wp(4),
    marginBottom: hp(3),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hp(1),
  },
  detailLabel: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textBlack,
  },
  detailValue: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.textBlack,
  },
  // NEW: Book selector styles
  bookSelector: {
    marginBottom: hp(2),
    padding: wp(3),
    backgroundColor: COLORS.lightGray,
    borderRadius: wp(2),
  },
  bookSelectorTitle: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.textBlack,
    marginBottom: hp(1),
  },
  bookButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(2),
  },
  bookButtonContainer: {
    alignItems: 'center',
  },
  bookButton: {
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    backgroundColor: COLORS.white2,
    borderRadius: wp(1.5),
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  bookButtonActive: {
    backgroundColor: COLORS.lightBlue,
    borderColor: COLORS.lightBlue,
  },
  bookButtonDisabled: {
    opacity: 0.5,
    backgroundColor: COLORS.lightGray,
  },
  bookButtonText: {
    fontSize: rfs(12),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textBlack,
  },
  bookButtonTextActive: {
    color: COLORS.white2,
    fontFamily: fonts.POPPINS.SemiBold,
  },
  bookButtonTextDisabled: {
    color: COLORS.gray,
  },
  uploadStatus: {
    fontSize: rfs(10),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.gray,
    marginTop: hp(0.5),
  },
  uploadStatusSuccess: {
    fontSize: rfs(10),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.green,
    marginTop: hp(0.5),
  },
  uploadStatusFailed: {
    fontSize: rfs(10),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.red,
    marginTop: hp(0.5),
  },
  failedContainer: {
    alignItems: 'center',
    marginTop: hp(0.5),
  },
  retryButton: {
    marginTop: hp(0.5),
    paddingVertical: hp(0.5),
    paddingHorizontal: wp(2),
    backgroundColor: COLORS.lightBlue,
    borderRadius: wp(1),
  },
  retryButtonText: {
    fontSize: rfs(10),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.white2,
  },
  uploadWarning: {
    marginTop: hp(2),
    padding: wp(2),
    backgroundColor: '#FFF3CD',
    borderRadius: wp(1.5),
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  uploadWarningText: {
    fontSize: rfs(12),
    fontFamily: fonts.POPPINS.Regular,
    color: '#856404',
    textAlign: 'center',
  },
  pdfButtonsContainer: {
    marginBottom: hp(2),
  },
  viewPdfButtonDisabled: {
    opacity: 0.5,
  },
  // 🔥 NEW: Calculation overlay styles
  calculationOverlay: {
    backgroundColor: COLORS.white2,
    borderRadius: wp(2),
    padding: wp(6),
    marginVertical: hp(3),
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.lightBlue,
    borderStyle: 'dashed',
  },
  calculationText: {
    fontSize: rfs(18),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.textBlack,
    marginTop: hp(2),
    textAlign: 'center',
  },
  calculationSubtext: {
    fontSize: rfs(12),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textGray,
    marginTop: hp(1),
    textAlign: 'center',
  },
  // 🔥 NEW: Upload prompt styles
  uploadPrompt: {
    backgroundColor: '#E3F2FD',
    borderRadius: wp(2),
    padding: wp(4),
    marginVertical: hp(2),
    borderLeftWidth: 4,
    borderLeftColor: COLORS.lightBlue,
  },
  uploadPromptTitle: {
    fontSize: rfs(18),
    fontFamily: fonts.POPPINS.Bold,
    color: COLORS.textBlack,
    marginBottom: hp(1),
  },
  uploadPromptText: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textBlack,
    marginBottom: hp(2),
  },
  // 🔥 NEW: Upload progress styles
  uploadProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: wp(3),
    borderRadius: wp(2),
    marginBottom: hp(1),
    gap: wp(2),
  },
  uploadProgressText: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.lightBlue,
  },
  // 🔥 Upload status list styles
  uploadStatusContainer: {
    backgroundColor: COLORS.white2,
    borderRadius: wp(2),
    padding: wp(4),
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  uploadStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1),
    justifyContent: 'space-between',
  },
  uploadStatusLabel: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.textBlack,
    minWidth: wp(20),
  },
  uploadStatusText: {
    fontSize: rfs(13),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.gray,
  },
  uploadStatusInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  uploadStatusTextUploading: {
    fontSize: rfs(13),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.lightBlue,
  },
  uploadStatusTextSuccess: {
    fontSize: rfs(13),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.green,
  },
  uploadStatusTextFailed: {
    fontSize: rfs(13),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.red,
  },
  retryButtonSmall: {
    paddingVertical: hp(0.5),
    paddingHorizontal: wp(2),
    backgroundColor: COLORS.lightBlue,
    borderRadius: wp(1),
  },
  retryButtonTextSmall: {
    fontSize: rfs(11),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.white2,
  },
});

export default PhotoBookPreview;
