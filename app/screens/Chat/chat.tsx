import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  BackHandler,
  Dimensions,
  Image,
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useIsFocused, useRoute } from '@react-navigation/native';
import moment from 'moment';
import DocumentPicker from 'react-native-document-picker';
import RNFS, { ReadDirItem } from 'react-native-fs';
import { unzip } from 'react-native-zip-archive';
import { useDispatch, useSelector } from 'react-redux';
import { useMediaContext } from 'rn-declarative';
import { icn } from '../../assets/icons';
import ChatCard from '../../Components/ChatCard';
import ChooseColorForEditModal from '../../Components/ChooseColorForEditModal';
import CustomButton from '../../Components/CustomButton';
import CustomHeader from '../../Components/CustomHeader';
import DateFormatModal from '../../Components/DateFormatModal';
import EditModal from '../../Components/EditModal';
import FontsModal from '../../Components/FontsModal';
import SearchBarHeader from '../../Components/SearchBarHeader';
import SelectionModal from '../../Components/SelectionModal';
import SortMessageModal from '../../Components/SortMessageModal';

import fonts from '../../utils/fonts';
import { hp, wp } from '../../utils/reponsiveness';
import { styles } from './style';
import {
  getFileContent,
  getFilesInformation,
} from '../../utils/import-chat-helpers';
import {
  IMessage,
  MessageType,
} from '../../interfaces/IMessage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

// NEW: Import book splitting utilities
import { estimatePages, splitIntoBooks, splitIntoBooksWithMedia, formatDateRange, Book, BookChunk } from '../../utils/bookSplitting';

// 🔥 new import
import { FlashList } from '@shopify/flash-list';
import { DUMMY_MESSAGES } from '../../utils/seedMessages';

import {
  buildMediaFilesMap,
  parseWhatsAppChatTextDetailed,
} from '../../../src/parsers/whatsappParser';
import {
  bulkMessages,
  createChat,
  uploadChatMedia,
} from '../../services/chatApi';
import { useAppDispatch, useAppSelector } from '../../store/Store';
import { getMimeType } from '../../utils/mediaUtils';
import { IChat } from '../../interfaces/IChat';
import { saveCurrentChat, saveCurrentChatMessages, updateBookUploadStatus, appendBookMessages, clearBookData } from '../../store/Slice/chatSlice';
import { saveChat } from '../../store/Slice/userSlice';
import { IBookConfig } from '../../interfaces/IBookConfig';
import { filterSystemMessages, getMostFrequentSenderName } from '../../utils/systemMessageFilter';

interface ChatProps {
  navigation?: any;
}

const Chat: React.FC<ChatProps> = ({ navigation }) => {
  const route = useRoute();
  const token = useAppSelector(state => state.user.token);

  const [chat, setChat] = useState<IChat>();
  const [chatMessages, setChatMessages] = useState<IMessage[]>([]);
  const [chatDataFiltered, setChatDataFiltered] = useState<IMessage[]>([]);
  const [whatsappChatData, setWhatsappChatData] = useState<{
    mediaFiles: ReadDirItem[];
    chatText: string;
  }>();

  const [dated, setDated] = useState('');
  const [datedTo, setDatedTo] = useState('');
  // const [fontFamily, setFontFamily] = useState(fonts.ROBOTO.Medium);
  // Default book configuration
  const [bookConfig, setBookConfig] = useState<IBookConfig>({
    fontFamily: fonts.ROBOTO.Medium,
    fontSize: 10,
    fontStyle: 'regular',
    chatBackground: '#E5DDD5',
    hideName: false,
    senderBackground: '#D9FDD3',
    senderTextColor: '#111B21',
    receiverBackground: '#FFFFFF',
    receiverTextColor: '#111B21',
    dateFormat: 'DD/MM/YYYY hh:mm A',
  });

  const [tutorialVisible, setTutorialVisible] = useState(false);
  const [showFormatDateModal, setShowFormatDateModal] = useState(false);
  const [showSortMessageModal, setShowSortMessageModal] = useState(false);

  const [showColorEditModal, setShowColorEditModal] = useState('');
  const [showFontModal, setShowFontsModal] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [searchBarState, setSearchBarState] = useState(false);
  const [search, setSearch] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [sortOrder, setSortOrder] = useState('of');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false); // Backend processing state
  
  // Search functionality states
  const [searchMatches, setSearchMatches] = useState<string[]>([]); // Array of message IDs that match
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0); // Current highlighted match

  // const [hideName, setHideName] = useState(false);
  // const [dateFormat, setDateFormat] = useState('DD/MM/YYYY hh:mm A');

  const scrollViewRef = useRef<any>(null);

  const { isPhone, isTablet, isDesktop } = useMediaContext();
  const { height: screenHeight } = Dimensions.get('window');

  const [contentHeight, setContentHeight] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;

  const [trackLayout, setTrackLayout] = useState({ y: 0, height: 0 });

  // Use estimated total height for stable scrollbar (FlashList contentHeight fluctuates due to virtualization)
  const ESTIMATED_ITEM_SIZE = 60;

  const thumbTravel = Math.max(0, trackLayout.height - 20);
  const maxScroll = Math.max(1, contentHeight - screenHeight);



  const [isLoading, setIsLoading] = useState(false);
  const [chatCreationError, setChatCreationError] = useState<string | null>(null);

  const isFocused = useIsFocused();
  const { CustomIntent } = NativeModules;
  const user = useAppSelector(state => state.user.user);
  const dispatch = useAppDispatch();

  const createChatOnce = useCallback(() => {
    if (!user?._id) return;
    setChatCreationError(null);
    createChat({
      author: user._id,
      bookConfig,
    })
      .then(res => {
        if (res?.data?.data) setChat(res.data.data);
      })
      .catch(err => {
        const msg = err?.response?.data?.message || err?.message || 'Could not create chat';
        setChatCreationError(msg);
        console.error('Error in chat creation:', msg);
      });
  }, [user?._id, bookConfig]);

  useEffect(() => {
    if (user?._id) {
      createChatOnce();
    }
  }, [user?._id, createChatOnce]);

  // When user imports messages and we still have no chat, create one so Done can work
  useEffect(() => {
    if (user?._id && chatMessages.length > 0 && !chat?._id && !chatCreationError) {
      createChatOnce();
    }
  }, [user?._id, chatMessages.length, chat?._id, chatCreationError, createChatOnce]);

  useEffect(() => {
    if (!user) {
      return;
    }
    const eventEmitter = new NativeEventEmitter();

    const subscription = eventEmitter.addListener('IntentReceived', uri => {
      if (uri) {
        // Process regardless of focus state, but show warning
        if (isFocused) {
          loadViaRoute(uri);
        } else {
          // Process anyway - focus check might be stale
          loadViaRoute(uri);
        }
      } else {
        console.error('❌ No URI received in intent');
        Alert.alert('Error', 'No file received from WhatsApp.');
      }
    });

    return () => {
      subscription.remove();
    };
  }, [user, isFocused]);

  const loadViaRoute = async (uri: any) => {
    try {
      if (!uri) {
        Alert.alert('Error', 'No file URI provided');
        return;
      }

      setIsLoading(true);

      const zipFileUri = uri;
      let zipFilePath;

      // Handle different URI schemes
      if (Platform.OS === 'android' && zipFileUri.startsWith('content://')) {
        // content:// URIs need to be copied via ContentResolver
        const destPath = `${RNFS.TemporaryDirectoryPath}/${Math.random()}.zip`;

        try {
          // Use ContentResolverModule for content:// URIs (fixes WhatsApp permission issue)
          const { ContentResolverModule } = NativeModules;
          if (ContentResolverModule) {
            await ContentResolverModule.copyContentUriToFile(zipFileUri, destPath);
          } else {
            // Fallback to RNFS (may fail with WhatsApp URIs)
            await RNFS.copyFile(zipFileUri, destPath);
          }
        } catch (copyError: any) {
          console.error('Error copying file:', copyError);
          throw new Error(`Failed to copy file: ${copyError.message}`);
        }

        zipFilePath = destPath;
      } else if (zipFileUri.startsWith('file://')) {
        // file:// URIs - strip the prefix to get raw path
        zipFilePath = zipFileUri.replace('file://', '');
      } else {
        // Raw file path
        zipFilePath = zipFileUri;
      }

      // Define the target extraction path
      const targetPath = `${RNFS.DocumentDirectoryPath}/extracted`;

      // Check if the extraction folder already exists and delete it if it does
      const folderExists = await RNFS.exists(targetPath);
      if (folderExists) {
        await RNFS.unlink(targetPath);
      }

      // Unzip the file
      const unzippedPath = await unzip(zipFilePath, targetPath);

      const filesMetaData = await getFilesInformation(unzippedPath);

      // Process the extracted chat file
      const rawChatContent = await getFileContent(filesMetaData.textFile);

      // Deterministic parser (NO LLM): build media map + parse sequentially.
      const mediaFilesMap = buildMediaFilesMap(
        filesMetaData.mediaFiles.map(f => ({ name: f.name, path: f.path })),
      );
      const parsed = parseWhatsAppChatTextDetailed(rawChatContent, mediaFilesMap);

      if (parsed.messages.length === 0) {
        const previewLines = rawChatContent
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n')
          .split('\n')
          .slice(0, 8);
      }

      const parsedAsChatMessages: IMessage[] = parsed.messages.map(m => ({
        _id: m.id,
        senderName: m.sender,
        text: m.text,
        date: m.date,
        sendingTime: m.time,
        messageType: (m.type === 'document' ? 'text' : m.type) as any,
        isCheck: true,
        ...(m.mediaUri ? { localPath: m.mediaUri } : {}),
      }));

      // Remove system / meta messages but preserve user message order.
      const userMessages = filterSystemMessages(parsedAsChatMessages);
      const meName = getMostFrequentSenderName(userMessages);
      const finalMessages = userMessages.map(m => ({
        ...m,
        sender:
          meName != null &&
          (m.senderName || '').trim() === meName &&
          (m.senderName || '').trim().toLowerCase() !== 'system',
      }));
      
      setChatMessages(finalMessages);

      setWhatsappChatData({
        mediaFiles: filesMetaData.mediaFiles,
        chatText: rawChatContent,
      });

      // NEW: Detect large chats and show warning
      // Use standard format for estimation (most common)
      const estimatedPages = estimatePages(finalMessages, 'standard_14_8x21');
      
      if (estimatedPages > 200) {
        const splitBooks = splitIntoBooks(finalMessages, 200);
        
        Alert.alert(
          '📚 Large Chat Detected',
          `Chat loaded successfully!\nFound ${filesMetaData.mediaFiles.length} media files\n\n` +
          `Your chat has ${finalMessages.length} messages (~${estimatedPages} pages).\n\n` +
          `We'll split it into ${splitBooks.length} books for better quality:\n\n` +
          splitBooks.map(b => 
            `• Book ${b.bookNumber}: ${formatDateRange(b.dateRange.from)} - ${formatDateRange(b.dateRange.to)} (~${b.estimatedPages} pages)`
          ).join('\n') +
          `\n\nYou can preview and order all books together.`,
          [{ text: 'OK, Continue' }]
        );
      } else {
        // Single book - show success message
        Alert.alert(
          'Success',
          `Chat loaded successfully!\nFound ${filesMetaData.mediaFiles.length} media files`,
        );
      }
    } catch (error: any) {
      console.error('Error loading WhatsApp export:', error);
      Alert.alert(
        'Error Loading Chat',
        `Failed to load WhatsApp export: ${error?.message || 'Unknown error'}\n\nPlease try exporting the chat again.`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  // const handlePickFolderTest = async () => {
  //   try {
  //     // Pick the ZIP file
  //     const file = await DocumentPicker.pick({
  //       type: [DocumentPicker.types.zip],
  //     });

  //     if (file && file[0].uri) {
  //       const zipFileUri = file[0].uri;

  //       // Check if the URI is content URI and then handle it accordingly
  //       let zipFilePath;
  //       if (Platform.OS === 'android' && zipFileUri.startsWith('content://')) {
  //         const destPath = `${RNFS.TemporaryDirectoryPath}/${file[0].name}`;
  //         await RNFS.copyFile(zipFileUri, destPath);
  //         zipFilePath = destPath;
  //       } else {
  //         zipFilePath = zipFileUri;
  //       }

  //       // Define the target extraction path
  //       const targetPath = `${RNFS.DocumentDirectoryPath}/extracted`;

  //       // Check if the extraction folder already exists and delete it if it does
  //       const folderExists = await RNFS.exists(targetPath);
  //       if (folderExists) {
  //         await RNFS.unlink(targetPath); // Delete the old extracted directory
  //       }

  //       setIsLoading(true);
  //       // Unzip the file
  //       const unzippedPath = await unzip(zipFilePath, targetPath);

  //       // Process the extracted chat file
  //       const chatData = await processChatFile(
  //         unzippedPath,
  //         route.params?.bookspecs,
  //       );

  //       if (chatData) setChatData(chatData); // Update state with the new chat data
  //     }
  //   } catch (error) {
  //     if (DocumentPicker.isCancel(error)) {

  //     } else {

  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  /** Pick a WhatsApp export ZIP from device (fallback when opening WhatsApp fails) */
  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.zip],
        allowMultiSelection: false,
      });
      if (result?.[0]?.uri) {
        setIsLoading(true);
        await loadViaRoute(result[0].uri);
      }
    } catch (err: any) {
      if (!DocumentPicker.isCancel(err)) {
        console.error('Error picking ZIP:', err);
        Alert.alert('Error', err?.message || 'Failed to pick file.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickFolder = () => {
    Alert.alert(
      'Import chat',
      'Export a chat from WhatsApp or WhatsApp Business (Chat → Export) as ZIP, then choose how to import:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Pick exported ZIP file', onPress: () => handlePickFile() },
        {
          text: 'Open WhatsApp',
          onPress: async () => {
            try {
              if (CustomIntent?.openApp) {
                await CustomIntent.openApp('com.whatsapp');
              } else {
                Alert.alert(
                  'Not available',
                  'Use "Pick exported ZIP file" to choose your chat export.',
                  [{ text: 'OK' }, { text: 'Pick ZIP file', onPress: () => handlePickFile() }],
                );
              }
            } catch (error: any) {
              Alert.alert(
                'Could not open WhatsApp',
                'Use "Pick exported ZIP file" to choose your chat export from the app.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Pick ZIP file', onPress: () => handlePickFile() },
                ],
              );
            }
          },
        },
        {
          text: 'Open WhatsApp Business',
          onPress: async () => {
            try {
              if (CustomIntent?.openApp) {
                await CustomIntent.openApp('com.whatsapp.w4b');
              } else {
                Alert.alert(
                  'Not available',
                  'Use "Pick exported ZIP file" to choose your chat export.',
                  [{ text: 'OK' }, { text: 'Pick ZIP file', onPress: () => handlePickFile() }],
                );
              }
            } catch (error: any) {
              Alert.alert(
                'Could not open WhatsApp Business',
                'Use "Pick exported ZIP file" to choose your chat export from the app.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Pick ZIP file', onPress: () => handlePickFile() },
                ],
              );
            }
          },
        },
      ],
    );
  };

  const returnColor = (val: any) => {
    if (val?.type == 'Chat Background') {
      setBookConfig(
        (prev: IBookConfig | undefined) =>
        ({
          ...prev,
          chatBackground: `${val?.color?.backgroundColor}`,
        } as IBookConfig),
      );
    }
    if (val?.type == 'Received Message Background') {
      setBookConfig(
        (prev: IBookConfig | undefined) =>
        ({
          ...prev,
          receiverBackground: `${val?.color?.backgroundColor}`,
        } as IBookConfig),
      );
    }
    if (val?.type == 'Received Message Color') {
      setBookConfig(
        (prev: IBookConfig | undefined) =>
        ({
          ...prev,
          receiverTextColor: `${val?.color?.backgroundColor}`,
        } as IBookConfig),
      );
    }
    if (val?.type == 'Sent Message Background') {
      setBookConfig(
        (prev: IBookConfig | undefined) =>
        ({
          ...prev,
          senderBackground: `${val?.color?.backgroundColor}`,
        } as IBookConfig),
      );
    }
    if (val?.type == 'Sent Message Color') {
      setBookConfig(
        (prev: IBookConfig | undefined) =>
        ({
          ...prev,
          senderTextColor: `${val?.color?.backgroundColor}`,
        } as IBookConfig),
      );
    }
  };

  const sortMessages = (val: any) => {
    const filter = val?.filter((item: any) => {
      return item?.checkBox == true;
    });

    setSortOrder(filter[0]?.text == 'Newest First' ? 'nf' : 'of');
  };

  // NEW: Get messages to display (filtered by date if dates selected)
  const messagesToDisplay = React.useMemo(() => {
    if (!dated || !datedTo) {
      return chatMessages;
    }
    
    // dated and datedTo are JavaScript Date objects from DateRangePicker
    const fromDate = new Date(dated);
    const toDate = new Date(datedTo);
    // Set toDate to end of day so messages on that day are included
    toDate.setHours(23, 59, 59, 999);
    
    const filtered = chatMessages.filter(m => {
      const rawDate = m.date || m.sendingTime || '';
      
      // Parse DD/MM/YYYY format (WhatsApp date format)
      let msgDate: Date | null = null;
      if (rawDate.includes('/')) {
        const parts = rawDate.split('/');
        if (parts.length >= 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // months are 0-indexed
          const year = parseInt(parts[2], 10);
          msgDate = new Date(year, month, day);
        }
      } else if (rawDate) {
        msgDate = new Date(rawDate);
      }
      
      if (!msgDate || isNaN(msgDate.getTime())) {
        return false;
      }
      
      return msgDate >= fromDate && msgDate <= toDate;
    });
    
    // Date filtering completed
    
    setChatDataFiltered(filtered);
    return filtered;
  }, [chatMessages, dated, datedTo]);

  // Calculate scroll values after messagesToDisplay is defined
  const estimatedTotalHeight = messagesToDisplay.length * ESTIMATED_ITEM_SIZE;
  const stableMaxScroll = Math.max(1, estimatedTotalHeight - screenHeight);

  const thumbPosition = scrollY.interpolate({
    inputRange: [0, stableMaxScroll],
    outputRange: [0, thumbTravel],
    extrapolate: 'clamp',
  });

  const deselectAll = (array: any, setArray: any) => {
    // Log the index to ensure it's correct

    // Make a deep copy of the array by cloning the object at the index
    const updatedArr = array.map((item: any) => {
      return { ...item, isCheck: false }; // Toggle the 'isCheck' property
    });

    // Update the state with the new array
    setArray(updatedArr);
  };

  const deselect = (array: any, setArray: any, filtered: any) => {
    // Make a deep copy of the array by cloning the object at the index
    const updatedArr = array.map((item: any) => {
      if (filtered.some((filteredItem: any) => filteredItem.id === item.id)) {
        return { ...item, isCheck: false }; // Toggle the 'isCheck' property
      } else {
        return { ...item }; // Keep the item as is
      }
    });

    const filteredCheck = filtered.map((item: any) => {
      return { ...item, isCheck: false }; // Toggle the 'isCheck' property for all filtered items
    });

    // Update the state with the new array
    setArray(updatedArr);
    setChatDataFiltered(filteredCheck);
  };

  const select = (array: IMessage[], filtered: IMessage[]) => {
    // Make a deep copy of the array by cloning the object at the index
    const updatedArr = array.map((item: any) => {
      if (filtered.some((filteredItem: any) => filteredItem.id === item.id)) {
        return { ...item, isCheck: true }; // Toggle the 'isCheck' property
      } else {
        return { ...item }; // Keep the item as is
      }
    });

    const filteredCheck = filtered.map(item => {
      return { ...item, isCheck: true }; // Toggle the 'isCheck' property for all filtered items
    });

    // Update the state with the new array
    setChatDataFiltered(filteredCheck);
  };

  const selectAll = (array: any, setArray: any) => {
    // Log the index to ensure it's correct

    // Make a deep copy of the array by cloning the object at the index
    const updatedArr = array.map((item: any) => {
      return { ...item, isCheck: true }; // Toggle the 'isCheck' property
    });

    // Update the state with the new array
    setArray(updatedArr);
  };

  const onSelectAll = () => {
    if (dated) {

      select(chatMessages, chatDataFiltered);
      // });
      return;
    }
    // chatCardRefs.current.forEach((chatCardRef: any) => {
    //   if (chatCardRef && chatCardRef.check) {
    //     chatCardRef.check();
    //   }
    selectAll(chatMessages, setChatMessages);
    // });
  };

  const onDeselectAll = () => {
    if (dated) {
      // chatCardRefs.current.forEach((chatCardRef: any) => {
      //   if (chatCardRef && chatCardRef.uncheck) {
      //     chatCardRef.uncheck();
      //   }
      // });
      deselect(chatMessages, setChatMessages, chatDataFiltered);
      // });
      return;
    }
    // chatCardRefs.current.forEach((chatCardRef: any) => {
    //   if (chatCardRef && chatCardRef.uncheck) {
    //     chatCardRef.uncheck();
    //   }

    deselectAll(chatMessages, setChatMessages);
    // });
  };

  /**
   * Upload a single book (media + messages)
   * Returns { success: boolean, error?: string, qrMap, thumbnailMap }
   */
  const uploadSingleBook = async (
    chatId: string,
    bookChunk: BookChunk,
    onProgress?: (percent: number) => void
  ): Promise<{ success: boolean; error?: string; qrMap?: Record<string, string>; thumbnailMap?: Record<string, string> }> => {
    try {
      let qrMap: Record<string, string> = {};
      let thumbnailMap: Record<string, string> = {};
      let updatedChat: IChat | null = null;
      
      // Upload media files for this book
      if (bookChunk.mediaFiles.length > 0) {
        const data = new FormData();
        bookChunk.mediaFiles.forEach((file: any) => {
          const fileUri = file.path.startsWith('file://') ? file.path : `file://${file.path}`;
          data.append('files', {
            uri: fileUri,
            name: file.name,
            type: getMimeType(file.name),
          } as any);
        });
        
        const chatResponse = await uploadChatMedia(chatId, data, onProgress);
        updatedChat = chatResponse.data.data;
        qrMap = chatResponse.data.qrMap || {};
        thumbnailMap = chatResponse.data.thumbnailMap || {};
      }
      
      // Upload messages for this book
      const messagesPayload = bookChunk.messages.map((m, messageIndex) => {
        const payload: any = {
          date: m.date || '',
          messageType: ((m.messageType === 'unknown' ? 'text' : m.messageType) as MessageType),
          senderName: m.senderName,
          sendingTime: m.sendingTime,
          text: m.text,
        };
        
        // Media URL mapping
        if ((m.messageType === 'image' || m.messageType === 'video' || m.messageType === 'audio') && m.localPath) {
          const filename = m.localPath.split('/').pop();
          
          if (updatedChat?.mediaFiles && Array.isArray(updatedChat.mediaFiles)) {
            let mediaCountBeforeThis = 0;
            for (let i = 0; i < messageIndex; i++) {
              const prevMsg = bookChunk.messages[i];
              if ((prevMsg.messageType === 'image' || prevMsg.messageType === 'video' || prevMsg.messageType === 'audio') && prevMsg.localPath) {
                mediaCountBeforeThis++;
              }
            }
            
            let uploadedFile = updatedChat.mediaFiles[mediaCountBeforeThis];
            
            if (uploadedFile && uploadedFile.name === filename) {
              payload.url = uploadedFile.url;
              if ((m.messageType === 'video' || m.messageType === 'audio') && filename && qrMap[filename]) {
                payload.qrUrl = qrMap[filename];
              }
              if (m.messageType === 'video' && filename && thumbnailMap[filename]) {
                payload.thumbnailUrl = thumbnailMap[filename];
              }
            } else {
              uploadedFile = updatedChat.mediaFiles.find((mf: any) => mf.name === filename);
              if (uploadedFile?.url) {
                payload.url = uploadedFile.url;
                if ((m.messageType === 'video' || m.messageType === 'audio') && filename && qrMap[filename]) {
                  payload.qrUrl = qrMap[filename];
                }
                if (m.messageType === 'video' && filename && thumbnailMap[filename]) {
                  payload.thumbnailUrl = thumbnailMap[filename];
                }
              }
            }
          }
        }
        
        return payload;
      });
      

      await bulkMessages(chatId, messagesPayload);
      
      return { success: true, qrMap, thumbnailMap };
    } catch (error: any) {
      console.error(`❌ Book ${bookChunk?.bookNumber || 'unknown'} upload failed:`, error);
      return { success: false, error: error.message || 'Upload failed' };
    }
  };

  /**
   * Upload remaining books in background (non-blocking, SEQUENTIAL)
   * Books upload ONE AT A TIME: Book 2 waits for Book 1, Book 3 waits for Book 2, etc.
   */
  const uploadRemainingBooksInBackground = (
    chatId: string,
    remainingBooks: BookChunk[],
    totalBooks: number
  ) => {
    // Use setTimeout to make it non-blocking (don't block navigation)
    setTimeout(async () => {
      // Upload books SEQUENTIALLY (one at a time)
      for (let i = 0; i < remainingBooks.length; i++) {
        const book = remainingBooks[i];
        
        try {
          // Update status to "uploading"
          dispatch(updateBookUploadStatus({
            chatId,
            bookNumber: book.bookNumber,
            status: 'uploading',
            progress: 0,
          }));
          
          // AWAIT here ensures Book 2 waits for Book 1 to finish
          const result = await uploadSingleBook(chatId, book, (progress) => {
            // Update progress in Redux
            dispatch(updateBookUploadStatus({
              chatId,
              bookNumber: book.bookNumber,
              status: 'uploading',
              progress,
            }));
          });
          
          if (result.success) {
            // Merge qrUrl and thumbnailUrl into messages
            const finalMessages = book.messages.map(m => {
              if ((m.messageType === 'video' || m.messageType === 'audio') && m.localPath) {
                const filename = m.localPath.split('/').pop();
                const updates: any = {};
                if (filename && result.qrMap && result.qrMap[filename]) {
                  updates.qrUrl = result.qrMap[filename];
                }
                if (m.messageType === 'video' && filename && result.thumbnailMap && result.thumbnailMap[filename]) {
                  updates.thumbnailUrl = result.thumbnailMap[filename];
                }
                if (Object.keys(updates).length > 0) {
                  return { ...m, ...updates };
                }
              }
              return m;
            });
            
            // Update status to "completed"
            dispatch(updateBookUploadStatus({
              chatId,
              bookNumber: book.bookNumber,
              status: 'completed',
              progress: 100,
            }));
            
            // Add messages to Redux
            dispatch(appendBookMessages({
              chatId,
              bookNumber: book.bookNumber,
              messages: finalMessages,
            }));
            
          } else {
            console.error(`❌ Book ${book.bookNumber} upload failed: ${result.error}`);
            
            // Update status to "failed"
            dispatch(updateBookUploadStatus({
              chatId,
              bookNumber: book.bookNumber,
              status: 'failed',
              progress: 0,
              error: result.error,
            }));
            
            // STOP uploading remaining books if one fails
            break;
          }
          
        } catch (error: any) {
          dispatch(updateBookUploadStatus({
            chatId,
            bookNumber: book.bookNumber,
            status: 'failed',
            progress: 0,
            error: error.message,
          }));
          
          // STOP uploading remaining books if one fails
          break;
        }
      }
    }, 100); // Start background upload after 100ms (non-blocking)
  };

  const onPressDone = async () => {
    try {
      if (!user?._id) return;

      let chatToUse = chat;
      if (!chatToUse?._id) {
        setIsSubmitting(true);
        try {
          const res = await createChat({ author: user._id, bookConfig });
          if (res?.data?.data) {
            chatToUse = res.data.data;
            setChat(chatToUse);
          }
        } catch (err: any) {
          const msg = err?.response?.data?.message || err?.message || 'Could not create chat';
          setChatCreationError(msg);
          Alert.alert('Error', msg);
          setIsSubmitting(false);
          return;
        }
        setIsSubmitting(false);
      }

      if (!chatToUse?._id) {
        Alert.alert('Error', 'Could not create chat. Please try again.');
        return;
      }

      setIsSubmitting(true);

      // Filter only checked messages (from displayed messages, respecting date filter)
      const checkedMessages = messagesToDisplay.filter(m => m.isCheck === true);
      
      const format = (route?.params as any)?.format || 'standard_14_8x21';
      
      // Calculate if multi-book (> 200 pages)
      const estimatedPages = estimatePages(checkedMessages, format);
      console.log(`📚 estimatedPages: ${estimatedPages}, format: ${format}`);
      
      if (estimatedPages > 200) {
        // ========================================
        // MULTI-BOOK FLOW (> 200 pages)
        // ========================================
        console.log(`📚 ========== MULTI-BOOK FLOW START ==========`);
        console.log(`📚 Total estimated pages: ${estimatedPages}`);
        console.log(`📚 Total media files: ${whatsappChatData?.mediaFiles?.length || 0}`);
        console.log(`📚 Format: ${format}`);
        
        const bookChunks = splitIntoBooksWithMedia(
          checkedMessages,
          whatsappChatData?.mediaFiles || [],
          200,
          format
        );
        
        console.log(`📚 Created ${bookChunks.length} book chunks:`);
        bookChunks.forEach((book, index) => {
          console.log(`📚 Book ${book.bookNumber}: ${book.messages.length} messages, ~${book.estimatedPages} pages`);
        });
        
        // Book chunks created
        
        // Upload Book 1 first (BLOCKING - user waits)
        const book1Result = await uploadSingleBook(
          chatToUse._id, 
          bookChunks[0],
          (progress) => {
            setUploadProgress(progress);
            if (progress === 100) {
              setIsProcessing(true);
            }
          }
        );
        
        if (!book1Result.success) {
          Alert.alert('Error', `Book 1 upload failed: ${book1Result.error}`);
          setIsSubmitting(false);
          return;
        }
        
        // Merge qrUrl and thumbnailUrl into Book 1 messages
        const book1FinalMessages = bookChunks[0].messages.map(m => {
          if ((m.messageType === 'video' || m.messageType === 'audio') && m.localPath) {
            const filename = m.localPath.split('/').pop();
            const updates: any = {};
            if (filename && book1Result.qrMap && book1Result.qrMap[filename]) {
              updates.qrUrl = book1Result.qrMap[filename];
            }
            if (m.messageType === 'video' && filename && book1Result.thumbnailMap && book1Result.thumbnailMap[filename]) {
              updates.thumbnailUrl = book1Result.thumbnailMap[filename];
            }
            if (Object.keys(updates).length > 0) {
              return { ...m, ...updates };
            }
          }
          return m;
        });
        
        console.log(`📚 Book 1 final messages prepared: ${book1FinalMessages.length} messages`);
        console.log(`📚 chatToUse structure prepared`);
        console.log(`📚 bookConfig ready`);
        
        // Prepare books metadata for navigation
        const booksMetadata = bookChunks.map((b, index) => {
          return {
            bookNumber: b.bookNumber || (index + 1),
            messageCount: b.messages?.length || 0,
            estimatedPages: b.estimatedPages || 0,
            dateRange: b.dateRange || { from: '', to: '' },
          };
        });
        
        console.log(`📚 Books metadata prepared:`, booksMetadata);
        
        // Save Book 1 to Redux - create a clean chat object
        const finalChat: IChat = {
          _id: chatToUse._id,
          author: chatToUse.author,
          mediaFiles: chatToUse.mediaFiles || [],
          createdAt: chatToUse.createdAt,
          updatedAt: chatToUse.updatedAt,
          platform: 'whatsapp',
          totalMessages: book1FinalMessages.length,
          status: 'active',
          importedAt: new Date().toISOString(),
          bookConfig: bookConfig || {
            fontFamily: fonts.ROBOTO.Medium,
            fontSize: 10,
            fontStyle: 'regular',
            chatBackground: '#E5DDD5',
            hideName: false,
            senderBackground: '#D9FDD3',
            senderTextColor: '#111B21',
            receiverBackground: '#FFFFFF',
            receiverTextColor: '#111B21',
            dateFormat: 'DD/MM/YYYY hh:mm A',
          },
        };
        
        console.log(`📚 Final chat prepared with bookConfig`);
        
        try {
          dispatch(saveCurrentChat(finalChat));
          console.log(`📚 saveCurrentChat dispatched successfully`);
        } catch (err) {
          console.error(`📚 Error in saveCurrentChat:`, err);
          throw err;
        }
        
        try {
          dispatch(saveCurrentChatMessages(book1FinalMessages));
          console.log(`📚 saveCurrentChatMessages dispatched successfully`);
        } catch (err) {
          console.error(`📚 Error in saveCurrentChatMessages:`, err);
          throw err;
        }
        
        const chatIdStr = chatToUse?._id || '';
        console.log(`📚 Redux saved. Dispatching status updates...`);
        console.log(`📚 chatIdStr: ${chatIdStr}`);
        console.log(`📚 bookChunks length: ${bookChunks.length}`);
        
        if (!chatIdStr) {
          Alert.alert('Error', 'Chat ID is missing. Please try again.');
          setIsSubmitting(false);
          return;
        }
        
        // Validate bookChunks structure
        if (!bookChunks || bookChunks.length === 0) {
          Alert.alert('Error', 'Book chunks are missing. Please try again.');
          setIsSubmitting(false);
          return;
        }
        
        // Clear any existing book data for this chat (fresh start)
        try {
          dispatch(clearBookData({ chatId: chatIdStr }));
        } catch (err) {
          console.error('Error clearing book data:', err);
        }
        
        // Small delay to ensure Redux state is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Initialize Book 1 status as completed
        try {
          if (!chatIdStr) {
            throw new Error('Chat ID is missing');
          }
          
          if (!book1FinalMessages || book1FinalMessages.length === 0) {
            throw new Error('Book 1 messages are missing');
          }
          
          console.log('🔧 DEBUG: About to dispatch updateBookUploadStatus for Book 1');
          console.log('🔧 DEBUG: chatIdStr:', chatIdStr);
          console.log('🔧 DEBUG: book1FinalMessages length:', book1FinalMessages.length);
          
          dispatch(updateBookUploadStatus({
            chatId: chatIdStr,
            bookNumber: 1,
            status: 'completed',
            progress: 100,
          }));
          
          console.log('🔧 DEBUG: Successfully dispatched updateBookUploadStatus for Book 1');

        } catch (err) {
          console.error(`📚 Error dispatching Book 1 status:`, err);
        }
        
        // Store Book 1 messages
        try {
          if (!chatIdStr || !book1FinalMessages || book1FinalMessages.length === 0) {
            throw new Error('Invalid data for Book 1 messages');
          }
          
          console.log('🔧 DEBUG: About to dispatch appendBookMessages for Book 1');
          
          dispatch(appendBookMessages({
            chatId: chatIdStr,
            bookNumber: 1,
            messages: book1FinalMessages,
          }));
          
          console.log('🔧 DEBUG: Successfully dispatched appendBookMessages for Book 1');

        } catch (err) {
          console.error(`📚 Error appending Book 1 messages:`, err);
        }
        
        // Initialize remaining books as pending
        for (let i = 1; i < bookChunks.length; i++) {
          const book = bookChunks[i];
          
          if (!book || !book.bookNumber) {
            console.error(`📚 Invalid book at index ${i}:`, book);
            continue;
          }
          
          try {
            if (!chatIdStr) {
              throw new Error('Chat ID is missing');
            }
            
            if (typeof book.bookNumber !== 'number' || book.bookNumber < 1) {
              throw new Error(`Invalid book number: ${book.bookNumber}`);
            }
            
            console.log(`🔧 DEBUG: About to dispatch updateBookUploadStatus for Book ${book.bookNumber}`);
            
            dispatch(updateBookUploadStatus({
              chatId: chatIdStr,
              bookNumber: book.bookNumber,
              status: 'pending',
              progress: 0,
            }));
            
            console.log(`🔧 DEBUG: Successfully dispatched updateBookUploadStatus for Book ${book.bookNumber}`);
          } catch (err) {
            console.error(`📚 Error dispatching status for book ${book.bookNumber}:`, err);
          }
        }
        console.log(`📚 All books initialized`);
        
        // Navigate to PageSelection immediately after Book 1
        console.log(`📚 Navigating to PageSelection...`);
        navigation.navigate('PageSelection', {
          chatId: chatIdStr,
          format: format,
          bookspecs: (route?.params as any)?.bookspecs,
          books: booksMetadata,
        });
        
        setIsSubmitting(false);
        setUploadProgress(0);
        setIsProcessing(false);
        
        // Upload remaining books in background (NON-BLOCKING)
        if (bookChunks.length > 1) {
          uploadRemainingBooksInBackground(
            chatIdStr, 
            bookChunks.slice(1),
            bookChunks.length
          );
        }
        
      } else {
        // ========================================
        // SINGLE-BOOK FLOW (≤ 200 pages)
        // NO CHANGES - Use existing logic
        // ========================================
        console.log(`📖 Single book - no split needed (${estimatedPages} pages)`);
        
        let updatedChat: IChat | null = null;
        let qrMap: Record<string, string> = {};
        let thumbnailMap: Record<string, string> = {};

        // Filter media files to only those referenced by checked messages
        const filteredMediaFiles = (whatsappChatData?.mediaFiles || []).filter(file => {
          return checkedMessages.some(m => 
            (m.messageType === 'image' || m.messageType === 'video' || m.messageType === 'audio') &&
            m.localPath &&
            m.localPath.split('/').pop() === file.name
          );
        });
        


        if (filteredMediaFiles.length > 0) {          const data = new FormData();
          filteredMediaFiles.forEach(file => {
            const fileUri = file.path.startsWith('file://')
              ? file.path
              : `file://${file.path}`;

            data.append('files', {
              uri: fileUri,
              name: file.name,
              type: getMimeType(file.name),
            });
          });

          const chatResponse = await uploadChatMedia(chatToUse._id, data, (percent) => {
            setUploadProgress(percent);
            if (percent === 100) {
              setIsProcessing(true);
            }
          });
          updatedChat = chatResponse.data.data;
          qrMap = chatResponse.data.qrMap || {};
          thumbnailMap = chatResponse.data.thumbnailMap || {};

          if (updatedChat) {
            setChat(updatedChat);
            chatToUse = updatedChat;
            setUploadProgress(0);
            setIsProcessing(false);
          }
        }

        // Upload messages
        const messagesPayload = checkedMessages.map((m, messageIndex) => {
          const payload: any = {
            date: m.date || '',
            messageType: ((m.messageType === 'unknown' ? 'text' : m.messageType) as MessageType),
            senderName: m.senderName,
            sendingTime: m.sendingTime,
            text: m.text,
          };

          // Media URL mapping logic (existing)
          if ((m.messageType === 'image' || m.messageType === 'video' || m.messageType === 'audio') && m.localPath) {
            const filename = m.localPath.split('/').pop();
            
            if (chatToUse.mediaFiles && Array.isArray(chatToUse.mediaFiles)) {
              let mediaCountBeforeThis = 0;
              for (let i = 0; i < messageIndex; i++) {
                const prevMsg = checkedMessages[i];
                if ((prevMsg.messageType === 'image' || prevMsg.messageType === 'video' || prevMsg.messageType === 'audio') && prevMsg.localPath) {
                  mediaCountBeforeThis++;
                }
              }
              
              let uploadedFile = chatToUse.mediaFiles[mediaCountBeforeThis];
              
              if (uploadedFile && uploadedFile.name === filename) {
                payload.url = uploadedFile.url;
                if ((m.messageType === 'video' || m.messageType === 'audio') && filename && qrMap[filename]) {
                  payload.qrUrl = qrMap[filename];
                }
                if (m.messageType === 'video' && filename && thumbnailMap[filename]) {
                  payload.thumbnailUrl = thumbnailMap[filename];
                }
              } else {
                uploadedFile = chatToUse.mediaFiles.find((mf: any) => mf.name === filename);
                if (uploadedFile?.url) {
                  payload.url = uploadedFile.url;
                  if ((m.messageType === 'video' || m.messageType === 'audio') && filename && qrMap[filename]) {
                    payload.qrUrl = qrMap[filename];
                  }
                  if (m.messageType === 'video' && filename && thumbnailMap[filename]) {
                    payload.thumbnailUrl = thumbnailMap[filename];
                  }
                }
              }
            }
          }

          return payload;
        });

        await bulkMessages(chatToUse._id, messagesPayload);

        const finalChat = { ...(updatedChat || chatToUse), bookConfig: bookConfig };
        const finalMessages = checkedMessages.map(m => {
          if ((m.messageType === 'video' || m.messageType === 'audio') && m.localPath) {
            const filename = m.localPath.split('/').pop();
            const updates: any = {};
            if (filename && qrMap[filename]) {
              updates.qrUrl = qrMap[filename];
            }
            if (m.messageType === 'video' && filename && thumbnailMap[filename]) {
              updates.thumbnailUrl = thumbnailMap[filename];
            }
            if (Object.keys(updates).length > 0) {
              return { ...m, ...updates };
            }
          }
          return m;
        });

        const savedChatId = uuidv4();
        dispatch(saveCurrentChat(finalChat));
        dispatch(saveCurrentChatMessages(finalMessages));
        dispatch(
          saveChat({
            id: savedChatId,
            chat: {
              ...finalChat,
              messages: finalMessages,
              timestamp: new Date().toISOString(),
            },
          }),
        );

        const photoBookFlow = (route?.params as any)?.photoBookFlow;

        if (photoBookFlow && finalChat?._id) {
          navigation.navigate('PageSelection', {
            chatId: finalChat._id,
            format: format,
            bookspecs: (route?.params as any)?.bookspecs,
          });
        } else {
          navigation.goBack();
        }
      }
      
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('Error', 'Chat not saved correctly. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
      setIsProcessing(false);
    }

    // const jsonManipulator = chatData?.map(item => {
    //   if (item?.isCheck) {
    //     // Determine the limit based on the device (tablet or phone)

    //     const charLimit = isTablet ? 300 : 200;

    //     // If the senderMessage is shorter than the limit, return the item as is
    //     if (item?.text?.length <= charLimit) {
    //       return {
    //         item,
    //         fontFamily,
    //         fontSize,
    //         fontStyle,
    //         chatBackground,
    //         hideName,
    //         senderBackground,
    //         senderTextColor,
    //         receiverBackground,
    //         receiverTextColor,
    //         dateFormat,
    //       };
    //     } else {
    //       // If the message is longer, split it into multiple parts
    //       const messageParts = item?.text.match(
    //         new RegExp(`.{1,${charLimit}}`, 'g'),
    //       );
    //       const newItems = messageParts?.map(part => ({
    //         ...item,
    //         senderMessage: part,
    //         fontFamily,
    //         fontSize,
    //         fontStyle,
    //         chatBackground,
    //         hideName,
    //         senderBackground,
    //         senderTextColor,
    //         receiverBackground,
    //         receiverTextColor,
    //         dateFormat,

    //         // Optionally, adjust the sendingTime for each part if needed
    //         sendingTime: item?.sendingTime,
    //         // Adjust other properties as necessary
    //       }));

    //       return newItems; // Return the array of split messages
    //     }
    //   }
    // });

    // // Flatten the array in case some messages were split into multiple parts
    // const flattenedJsonManipulator = [].concat(...jsonManipulator);
    // const filter: any[] = flattenedJsonManipulator?.filter(item => {
    //   return item != undefined;
    // });



    // let chatBubbles = await Promise.all(
    //   filter.map((item: any, index: number) => {
    //     return {...item, id: index, bookspecs: route?.params?.bookspecs};
    //   }),
    // );



    // // // return;

    // // // route?.params?.setChat({ nonchat: addedId, chat: chatData });
    // route?.params?.setFontFamily(fontFamily);
    // route?.params?.setFontStyle(fontStyle);
    // route?.params?.addChatToPage(chatBubbles, route?.params?.index);

    // navigation.goBack();
  };

  const handleToggleCheck = useCallback((messageId: string) => {
    setChatMessages(prev =>
      prev.map(m =>
        m._id === messageId ? { ...m, isCheck: !m.isCheck } : m,
      ),
    );
  }, []);

  // Scroll to a specific message by ID (in displayed messages)
  const scrollToMessage = useCallback((messageId: string) => {
    const index = messagesToDisplay.findIndex(msg => msg._id === messageId);
    if (index !== -1 && scrollViewRef.current) {
      scrollViewRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5, // Center the message on screen
      });
    }
  }, [messagesToDisplay]);

  // Search functionality: Find all matching messages (in displayed messages only)
  useEffect(() => {
    if (search.trim()) {
      const matches = messagesToDisplay
        .filter(msg => 
          msg.text?.toLowerCase().includes(search.toLowerCase())
        )
        .map(msg => msg._id);
      
      setSearchMatches(matches);
      setCurrentMatchIndex(matches.length > 0 ? 0 : -1);
      
      // Auto-scroll to first match
      if (matches.length > 0) {
        scrollToMessage(matches[0]);
      }
    } else {
      setSearchMatches([]);
      setCurrentMatchIndex(-1);
    }
  }, [search, messagesToDisplay, scrollToMessage]);

  // Navigate to next search match
  const handleNextMatch = useCallback(() => {
    if (searchMatches.length === 0) return;
    
    const nextIndex = (currentMatchIndex + 1) % searchMatches.length;
    setCurrentMatchIndex(nextIndex);
    scrollToMessage(searchMatches[nextIndex]);
  }, [searchMatches, currentMatchIndex, scrollToMessage]);

  // Navigate to previous search match
  const handlePrevMatch = useCallback(() => {
    if (searchMatches.length === 0) return;
    
    const prevIndex = currentMatchIndex === 0 
      ? searchMatches.length - 1 
      : currentMatchIndex - 1;
    setCurrentMatchIndex(prevIndex);
    scrollToMessage(searchMatches[prevIndex]);
  }, [searchMatches, currentMatchIndex, scrollToMessage]);

  // 📌 FlashList render – full-width row so ChatCard alignSelf (left/right) works
  const renderChats = useCallback(
    ({ item, index }: { item: IMessage; index: number }) => {
      const isCurrentMatch = searchMatches.length > 0 && 
        item._id === searchMatches[currentMatchIndex];
      const isMatch = searchMatches.includes(item._id);
      
      return (
        <View style={styles.messageRow}>
          <ChatCard
            item={item}
            index={index}
            stylesConfig={bookConfig}
            checkPress={() => handleToggleCheck(item._id)}
            searchQuery={search}
            isCurrentMatch={isCurrentMatch}
            isMatch={isMatch}
          />
        </View>
      );
    },
    [bookConfig, handleToggleCheck, search, searchMatches, currentMatchIndex],
  );

  return (
    <View style={styles.mainContainer}>
      {searchBarState ? (
        <SearchBarHeader
          setSearchBarState={setSearchBarState}
          value={search}
          onChangeText={(txt: any) => setSearch(txt)}
          onPressNext={handleNextMatch}
          onPressPrev={handlePrevMatch}
          matchCount={searchMatches.length}
          currentMatch={searchMatches.length > 0 ? currentMatchIndex + 1 : 0}
        />
      ) : (
        <CustomHeader
          text="Chat"
          rightText={chatMessages.length ? 'Clear' : undefined}
          onPressRight={() => {
            if (chatMessages.length) {
              Alert.alert(
                'Discard Changes?',
                'Are you sure you want to discard the changes?',
                [
                  {
                    text: 'No',
                    onPress: () => {},
                    style: 'cancel', // Optional: styles the button as a cancel button
                  },
                  {
                    text: 'Yes',
                    onPress: () => {
                      setChatMessages([]);
                      dispatch(saveCurrentChatMessages([]));
                      dispatch(saveCurrentChat(null));
                    },
                  },
                ],
                { cancelable: false }, // Prevent dismissing by tapping outside the alert
              );
            }
          }}
          onPress={() => {
            if (chatMessages?.length > 0) {
              Alert.alert(
                'Discard Changes?',
                'Are you sure you want to discard your changes and go back?',
                [
                  {
                    text: 'No',
                    onPress: () => {},
                    style: 'cancel', // Optional: styles the button as a cancel button
                  },
                  {
                    text: 'Yes',
                    onPress: () => navigation.goBack(),
                  },
                ],
                { cancelable: false }, // Prevent dismissing by tapping outside the alert
              );
            } else {
              navigation.goBack();
            }
          }}
        />
      )}

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={'black'} />
        </View>
      ) : null}

      {dated ? (
        <>
          <Text style={{ color: 'black' }}>
            Results for{' '}
            {moment(dated).format('DD-MM-YY') +
              '  -  ' +
              moment(datedTo).format('DD-MM-YY')}
          </Text>
          <Text
            onPress={() => {
              setDated('');
              setDatedTo('');
            }}
            style={{ color: 'black', fontWeight: 'bold', paddingVertical: 10 }}>
            Clear Filter
          </Text>
        </>
      ) : null}
      {messagesToDisplay.length > 0 ? (

        <>
          <FlashList
            ref={scrollViewRef}
            data={messagesToDisplay}
            renderItem={renderChats}
            extraData={{search, searchMatches, currentMatchIndex, dated, datedTo}} // Force re-render on search/date changes
            getItemType={item => {
              if (item.messageType) return item.messageType;
              return 'text';
            }}
            keyExtractor={item => item._id}
            estimatedItemSize={60} // ⚡ important for perf
            onContentSizeChange={(_, h) => setContentHeight(h)}
            onScroll={Animated.event(
              [{nativeEvent: {contentOffset: {y: scrollY}}}],
              { useNativeDriver: false },
            )}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainerStyle}
          />

          {/* custom scroll thumb */}
          <TouchableOpacity
            activeOpacity={1}
            onLayout={(e) => {
              const { y, height } = e.nativeEvent.layout;
              setTrackLayout({ y, height });
            }}
            style={{
              flex: 1,
              position: 'absolute',
              right: 10,
              top: 50,
              backgroundColor: '#E2E2E2',
              height: screenHeight - hp(17),
              borderRadius: 20,
            }}
            onPress={(e) => {
              const tapY = Math.max(0, Math.min(e.nativeEvent.pageY - trackLayout.y, trackLayout.height));
              const ratio = tapY / trackLayout.height;
              const scrollTo = ratio * stableMaxScroll;
              scrollViewRef.current?.scrollToOffset({ offset: scrollTo, animated: true });
            }}>
            {contentHeight > screenHeight && (
              <Animated.View
                style={{
                  width: 10,
                  backgroundColor: 'grey',
                  borderRadius: 40,
                  height: 20,
                  transform: [{ translateY: thumbPosition }],
                }}
              />
            )}
          </TouchableOpacity>
        </>
      ) : chatMessages.length > 0 ? (
        // Show message when date filter returns no results
        <View style={styles.loaderContainer}>
          <Text style={{ color: 'black', textAlign: 'center', marginTop: 50 }}>
            No messages found in selected date range.{'\n'}
            Try adjusting the date filter or clear it to see all messages.
          </Text>
        </View>
      ) : (
        <>
          <TouchableOpacity onPress={handlePickFolder}>
            <Image source={icn.plusButton} style={styles.imgPlus} />
            <Text style={styles.imgPlusText} onPress={handlePickFolder}>
              Import
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setChatMessages(DUMMY_MESSAGES)}>
            <Text
              style={[
                styles.imgPlusText,
                { fontSize: 13, textDecorationLine: 'underline' },
              ]}>
              Load Dummy Data
            </Text>
          </TouchableOpacity>

          {/* <TouchableOpacity
            onPress={handlePickFolderTest}
            style={{marginTop: 10}}>
            <Text
              style={[
                styles.imgPlusText,
                {fontSize: 13, textDecorationLine: 'underline'},
              ]}
              onPress={handlePickFolderTest}>
              Load the chat manually
            </Text>
          </TouchableOpacity> */}
        </>
      )}
      {!searchBarState && (
        <>
          {messagesToDisplay?.length > 0 ? (
            <TouchableOpacity
              style={styles.threeDotIcnContainer}
              onPress={() => setShowSelectionModal(true)}>
              <Image source={icn.threeDotIcn} style={styles.threeDotIcnStyle} />
            </TouchableOpacity>
          ) : null}
        </>
      )}
      {!searchBarState && (
        <View style={styles.bottomButtonContainer}>
          {messagesToDisplay?.length > 0 ? (
            <CustomButton
              text="Edit"
              oddContainerStyle={styles.customButtonOddContainer}
              oddTextStyle={styles.oddTextStyle}
              onPress={() => setShowEditModal(true)}
            />
          ) : (
            <View style={styles.customButtonOddContainer} />
          )}

          {chatMessages?.length > 0 ? (
            <View style={styles.bottomRightRow}>
              {!chat?._id && !isSubmitting && (
                <View style={[styles.chatReadyRow, { marginRight: wp(2), maxWidth: wp(28) }]}>
                  {chatCreationError ? (
                    <TouchableOpacity onPress={createChatOnce}>
                      <Text style={styles.chatReadyError} numberOfLines={1}>
                        Tap to retry
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.chatReadyText} numberOfLines={1}>
                      Preparing...
                    </Text>
                  )}
                </View>
              )}
              <CustomButton
                animating={isSubmitting}
                disable={isSubmitting}
                text={
                  isProcessing 
                    ? 'Processing media...' 
                    : uploadProgress > 0 && uploadProgress < 100 
                      ? `Uploading ${uploadProgress}%` 
                      : 'Done'
                }
                oddContainerStyle={[styles.customButtonOddContainer, styles.doneButton]}
                oddTextStyle={styles.oddTextStyle}
                onPress={onPressDone}
              />
            </View>
          ) : null}
        </View>
      )}
      {searchBarState && (
        <CustomButton
          text="Done"
          oddContainerStyle={styles.customButtonOddContainerForSearch}
          oddTextStyle={styles.oddTextStyle}
          onPress={() => {
            setSearchBarState(false);
            setSearch('');
            setSearchMatches([]);
            setCurrentMatchIndex(-1);
          }}
        />
      )}
      {/* //Modals */}
      <EditModal
        dateFormat={bookConfig.dateFormat}
        sortOrder={sortOrder}
        setShowEditModal={setShowEditModal}
        showEditModal={showEditModal}
        returnHideName={val =>
          setBookConfig(
            (prev: IBookConfig | undefined) =>
              ({ ...prev, hideName: val } as IBookConfig),
          )
        }
        setShowSortMessageModal={setShowSortMessageModal}
        setShowFormatDateModal={setShowFormatDateModal}
        setShowColorEditModal={(val: any) => {
          setShowColorEditModal(val);
        }}
        colors={{
          cb: bookConfig.chatBackground,
          sb: bookConfig.senderBackground,
          st: bookConfig.senderTextColor,
          rb: bookConfig.receiverBackground,
          rt: bookConfig.receiverTextColor,
        }}
        setShowFontsModal={setShowFontsModal}
        returnFontSize={val =>
          setBookConfig(
            (prev: IBookConfig | undefined) =>
              ({ ...prev, fontSize: val } as IBookConfig),
          )
        }
      />
      <SortMessageModal
        setShowSortMessageModal={setShowSortMessageModal}
        showSortMessageModal={showSortMessageModal}
        setShowEditModal={setShowEditModal}
        returnSorted={(val: any) => {
          sortMessages(val);
        }}
      />
      <DateFormatModal
        setShowFormatDateModal={setShowFormatDateModal}
        showFormatDateModal={showFormatDateModal}
        setShowEditModal={setShowEditModal}
        setDateFormat={val =>
          setBookConfig(
            (prev: IBookConfig | undefined) =>
              ({ ...prev, dateFormat: val } as IBookConfig),
          )
        }
      />
      <ChooseColorForEditModal
        setShowColorEditModal={setShowColorEditModal}
        showColorEditModal={showColorEditModal}
        setShowEditModal={setShowEditModal}
        returnColor={val => {
          returnColor(val);
        }}
      />
      <FontsModal
        seeFontStyle={true}
        setShowFontsModal={setShowFontsModal}
        visible={showFontModal}
        setShowEditModal={setShowEditModal}
        fontFamily={bookConfig?.fontFamily || fonts.ROBOTO.Medium}
        fontStyles={bookConfig?.fontStyle || 'regular'}
        setFontFamily={(val: string) =>
          setBookConfig(
            (prev: IBookConfig | undefined) =>
              ({ ...prev, fontFamily: val } as IBookConfig),
          )
        }
        setFontStyles={(val: string) =>
          setBookConfig(
            (prev: IBookConfig | undefined) =>
              ({ ...prev, fontStyle: val } as IBookConfig),
          )
        }
      />
      <SelectionModal
        setShowSelectionModal={setShowSelectionModal}
        showSelectionModal={showSelectionModal}
        setSearchBarState={setSearchBarState}
        returnFromDate={val => {
          setDated(val);
        }}
        returnToDate={val => {
          setDatedTo(val);
        }}
        onPressDeselectAll={() => {
          onDeselectAll();
        }}
        onPressSelectAll={() => {
          onSelectAll();
        }}
      />
      {/*<TutorialView
              visible={tutorialVisible}
              onDismiss={() => setTutorialVisible(false)}
            />*/}
    </View>
  );
};

export default React.memo(Chat);
