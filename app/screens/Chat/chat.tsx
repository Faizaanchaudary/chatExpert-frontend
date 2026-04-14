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
import { estimatePages, splitIntoBooks, formatDateRange, Book } from '../../utils/bookSplitting';

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
import { saveCurrentChat, saveCurrentChatMessages } from '../../store/Slice/chatSlice';
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
  const estimatedTotalHeight = chatMessages.length * ESTIMATED_ITEM_SIZE;
  const stableMaxScroll = Math.max(1, estimatedTotalHeight - screenHeight);

  const thumbTravel = Math.max(0, trackLayout.height - 20);
  const maxScroll = Math.max(1, contentHeight - screenHeight);

  const thumbPosition = scrollY.interpolate({
    inputRange: [0, stableMaxScroll],
    outputRange: [0, thumbTravel],
    extrapolate: 'clamp',
  });



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
        console.log('Error in chat creation:', msg);
      });
  }, [user?._id, bookConfig]);

  useEffect(() => {
    if (user?._id) {
      console.log('Creating chat for user:', user._id);
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
      console.log('⚠️ User not logged in, skipping IntentReceived listener setup');
      return;
    }
    const eventEmitter = new NativeEventEmitter();

    const subscription = eventEmitter.addListener('IntentReceived', uri => {
      if (uri) {
        // Process regardless of focus state, but show warning
        if (isFocused) {
          console.log('✅ Screen is focused, processing URI...');
          loadViaRoute(uri);
        } else {
          console.warn('⚠️ Screen not focused, but will process anyway');
          // Process anyway - focus check might be stale
          loadViaRoute(uri);
        }
      } else {
        console.error('❌ No URI received in intent');
        Alert.alert('Error', 'No file received from WhatsApp.');
      }
    });

    console.log('✅ Listener registered successfully');

    return () => {
      console.log('🔄 Removing IntentReceived listener');
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
      console.log('Starting to load WhatsApp export from URI:', uri);

      const zipFileUri = uri;
      let zipFilePath;

      // Handle different URI schemes
      if (Platform.OS === 'android' && zipFileUri.startsWith('content://')) {
        // content:// URIs need to be copied via ContentResolver
        console.log('Converting content:// URI to file path...');
        const destPath = `${RNFS.TemporaryDirectoryPath}/${Math.random()}.zip`;

        try {
          // Use ContentResolverModule for content:// URIs (fixes WhatsApp permission issue)
          const { ContentResolverModule } = NativeModules;
          if (ContentResolverModule) {
            console.log('Using ContentResolverModule to copy file...');
            await ContentResolverModule.copyContentUriToFile(zipFileUri, destPath);
            console.log('✅ File copied using ContentResolver');
          } else {
            // Fallback to RNFS (may fail with WhatsApp URIs)
            console.log('⚠️ ContentResolverModule not found, using RNFS...');
            await RNFS.copyFile(zipFileUri, destPath);
          }
        } catch (copyError: any) {
          console.error('Error copying file:', copyError);
          throw new Error(`Failed to copy file: ${copyError.message}`);
        }

        zipFilePath = destPath;
        console.log('File copied to:', destPath);
      } else if (zipFileUri.startsWith('file://')) {
        // file:// URIs - strip the prefix to get raw path
        zipFilePath = zipFileUri.replace('file://', '');
        console.log('Using file:// URI, stripped path:', zipFilePath);
      } else {
        // Raw file path
        zipFilePath = zipFileUri;
      }

      // Define the target extraction path
      const targetPath = `${RNFS.DocumentDirectoryPath}/extracted`;

      // Check if the extraction folder already exists and delete it if it does
      const folderExists = await RNFS.exists(targetPath);
      if (folderExists) {
        console.log('Removing old extracted directory...');
        await RNFS.unlink(targetPath);
      }

      // Unzip the file
      console.log('Unzipping file...');
      const unzippedPath = await unzip(zipFilePath, targetPath);
      console.log('Unzipped to:', unzippedPath);

      console.log('Getting file information...');
      const filesMetaData = await getFilesInformation(unzippedPath);
      console.log(
        `Found ${filesMetaData.mediaFiles.length} media files and text file`,
      );

      // Process the extracted chat file
      console.log('Reading chat content...');
      const rawChatContent = await getFileContent(filesMetaData.textFile);
      console.log('Chat content length:', rawChatContent.length);

      // Deterministic parser (NO LLM): build media map + parse sequentially.
      const mediaFilesMap = buildMediaFilesMap(
        filesMetaData.mediaFiles.map(f => ({ name: f.name, path: f.path })),
      );
      const parsed = parseWhatsAppChatTextDetailed(rawChatContent, mediaFilesMap);

      console.log('Messages parsed:', parsed.messages.length);
      console.log('Media linked:', parsed.mediaLinked);
      if (parsed.messages.length === 0) {
        const previewLines = rawChatContent
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n')
          .split('\n')
          .slice(0, 8);
        console.log('Parser debug: first lines of chat.txt:', previewLines);
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
  //       console.log('here 5');
  //       if (chatData) setChatData(chatData); // Update state with the new chat data
  //     }
  //   } catch (error) {
  //     if (DocumentPicker.isCancel(error)) {
  //       console.log('User canceled the picker');
  //     } else {
  //       console.error('Error picking ZIP file:', error);
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
                console.log('WhatsApp launched successfully');
              } else {
                Alert.alert(
                  'Not available',
                  'Use "Pick exported ZIP file" to choose your chat export.',
                  [{ text: 'OK' }, { text: 'Pick ZIP file', onPress: () => handlePickFile() }],
                );
              }
            } catch (error: any) {
              console.warn('Could not open WhatsApp:', error?.message || '');
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
                console.log('WhatsApp Business launched successfully');
              } else {
                Alert.alert(
                  'Not available',
                  'Use "Pick exported ZIP file" to choose your chat export.',
                  [{ text: 'OK' }, { text: 'Pick ZIP file', onPress: () => handlePickFile() }],
                );
              }
            } catch (error: any) {
              console.warn('Could not open WhatsApp Business:', error?.message || '');
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
      // console.log("Filtered", chatDataFiltered);
      // chatCardRefs.current.forEach((chatCardRef: any) => {
      //   console.log("chatCardRef", chatCardRef);
      //   if (chatCardRef && chatCardRef.check) {
      //     chatCardRef.check();
      //   }
      // });
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
      let updatedChat: IChat | null = null;

      let qrMap: Record<string, string> = {};
      let thumbnailMap: Record<string, string> = {};

      if (whatsappChatData?.mediaFiles?.length) {
        const data = new FormData();
        whatsappChatData.mediaFiles.forEach(file => {
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
          // When upload reaches 100%, show processing state
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

      // Filter only checked messages
      const checkedMessages = chatMessages.filter(m => m.isCheck === true);
      
      const messagesPayload = checkedMessages.map((m, messageIndex) => {
        const payload: any = {
          date: m.date || '',
          messageType: ((m.messageType === 'unknown' ? 'text' : m.messageType) as MessageType),
          senderName: m.senderName,
          sendingTime: m.sendingTime,
          text: m.text,
        };

        // If message has media (image/video/audio), find the uploaded URL from chat
        if ((m.messageType === 'image' || m.messageType === 'video' || m.messageType === 'audio') && m.localPath) {
          // Extract filename from localPath
          const filename = m.localPath.split('/').pop();
          
          if (chatToUse.mediaFiles && Array.isArray(chatToUse.mediaFiles)) {
            // Count how many media messages came before this one IN CHECKED MESSAGES
            let mediaCountBeforeThis = 0;
            for (let i = 0; i < messageIndex; i++) {
              const prevMsg = checkedMessages[i];
              if ((prevMsg.messageType === 'image' || prevMsg.messageType === 'video' || prevMsg.messageType === 'audio') && prevMsg.localPath) {
                mediaCountBeforeThis++;
              }
            }
            
            // Try index-based matching first (handles duplicate filenames)
            let uploadedFile = chatToUse.mediaFiles[mediaCountBeforeThis];
            
            // Verify filename matches (safety check)
            if (uploadedFile && uploadedFile.name === filename) {
              payload.url = uploadedFile.url;
              // Attach qrUrl for video/audio
              if ((m.messageType === 'video' || m.messageType === 'audio') && filename && qrMap[filename]) {
                payload.qrUrl = qrMap[filename];
              }
              // Attach thumbnailUrl for videos only
              if (m.messageType === 'video' && filename && thumbnailMap[filename]) {
                payload.thumbnailUrl = thumbnailMap[filename];
              }
            } else {
              // Fallback: search by filename only
              uploadedFile = chatToUse.mediaFiles.find((mf: any) => mf.name === filename);
              if (uploadedFile?.url) {
                payload.url = uploadedFile.url;
                if ((m.messageType === 'video' || m.messageType === 'audio') && filename && qrMap[filename]) {
                  payload.qrUrl = qrMap[filename];
                }
                // Attach thumbnailUrl for videos only
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
      // Merge qrUrl and thumbnailUrl into local messages so Redux has them for preview - ONLY CHECKED MESSAGES
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

      // Generate a unique ID for this saved chat
      const savedChatId = uuidv4();

      // Save to current chat (for immediate viewing)
      dispatch(saveCurrentChat(finalChat));
      dispatch(saveCurrentChatMessages(finalMessages));

      // Save to savedChats array (for persistence as separate cards)
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

      // Check if we're in photo book flow
      const photoBookFlow = route?.params?.photoBookFlow;
      const format = route?.params?.format;
      const bookspecs = route?.params?.bookspecs;

      if (photoBookFlow && finalChat?._id) {
        // NEW: Calculate books metadata for multi-book support
        const estimatedPages = estimatePages(finalMessages, format || 'standard_14_8x21');
        let booksMetadata = undefined;
        
        if (estimatedPages > 200) {
          const splitBooks = splitIntoBooks(finalMessages, 200);
          booksMetadata = splitBooks.map(b => ({
            bookNumber: b.bookNumber,
            messageCount: b.messages.length,
            estimatedPages: b.estimatedPages,
            dateRange: b.dateRange,
          }));
          
          console.log(`📚 Chat will be split into ${booksMetadata.length} books`);
        }
        
        // Navigate to PageSelection instead of going back
        navigation.navigate('PageSelection', {
          chatId: finalChat._id,
          format: format,
          bookspecs: bookspecs,
          books: booksMetadata, // NEW: Pass books metadata
        });
      } else {
        navigation.goBack();
      }

      // console.log('Messages uploaded', response.data.data);
    } catch (error) {
      console.log('Messages upload failed :: ', error);
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

    // console.log('Filter length', filter.length);

    // let chatBubbles = await Promise.all(
    //   filter.map((item: any, index: number) => {
    //     return {...item, id: index, bookspecs: route?.params?.bookspecs};
    //   }),
    // );

    // // console.log('Added ID:', JSON.stringify(addedId, null, 2));

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

  // Scroll to a specific message by ID
  const scrollToMessage = useCallback((messageId: string) => {
    const index = chatMessages.findIndex(msg => msg._id === messageId);
    if (index !== -1 && scrollViewRef.current) {
      scrollViewRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5, // Center the message on screen
      });
    }
  }, [chatMessages]);

  // Search functionality: Find all matching messages
  useEffect(() => {
    if (search.trim()) {
      const matches = chatMessages
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
  }, [search, chatMessages, scrollToMessage]);

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
                    onPress: () => console.log('Cancel Pressed'),
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
                    onPress: () => console.log('Cancel Pressed'),
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
      {chatMessages.length > 0 ? (

        <>
          <FlashList
            ref={scrollViewRef}
            data={chatMessages}
            renderItem={renderChats}
            extraData={{search, searchMatches, currentMatchIndex}} // Force re-render on search changes
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
          {chatMessages?.length > 0 ? (
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
          {chatMessages?.length > 0 ? (
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
        returnSorted={val => {
          console.log('val', val);
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
