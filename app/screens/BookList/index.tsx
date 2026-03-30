import React, {useEffect, useState, useMemo} from 'react';
import {
  SafeAreaView,
  Dimensions,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  FlatList,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {IMessage} from '../../interfaces/IMessage';
import {icn} from '../../assets/icons';
import {rhp, rwp} from '../../utils/reponsiveness';
import {store, useAppDispatch, useAppSelector} from '../../store/Store';
import {usePaginatedMessages} from './hooks/usePaginatedMessages';
import {MessagePage} from './components/MessagePage';
import {SquareBookPage} from './components/SquareBookPage';
import {OpenBookPage} from './components/OpenBookPage';
import {loadSavedChat} from '../../store/Slice/chatSlice';
import {IChat} from '../../interfaces/IChat';
import moment from 'moment';

// Book type enum for clarity
type BookType = 'standard' | 'square' | 'open';

const getBookType = (bookSpecs: any): BookType => {
  const title = bookSpecs?.title?.toLowerCase() || '';
  if (title.includes('square')) return 'square';
  if (title.includes('open')) return 'open';
  return 'standard';
};

// Note: we intentionally preserve the original chat message order
// so that the preview and book pages match WhatsApp's timeline.

interface BookListProps {
  navigation?: any;
  route?: any;
}

type RootState = ReturnType<typeof store.getState>;

const COLORS = {
  primary: '#2C3E50',
  accent: '#C9A86C',
  background: '#F8F6F0',
  cardBg: '#FFFEF7',
  text: '#2C3E50',
  textSecondary: '#8B8680',
  border: '#E8E4DC',
};

const BookList: React.FC<BookListProps> = ({navigation, route}) => {
  const {width, height} = Dimensions.get('window');
  const pageHeight = height * 0.75;
  const dispatch = useAppDispatch();

  const uniqueId = route?.params?.uniqueId;
  const bookSpecs = route?.params?.bookspecs;
  const photoBookFlow = route?.params?.photoBookFlow;
  const format = route?.params?.format;
  const bookspecs = route?.params?.bookspecs;

  const {currentChat, chatMessages} = useAppSelector(state => state.chats);
  const {savedChats} = useAppSelector(state => state.user);

  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(
    uniqueId || null,
  );
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  useEffect(() => {
    if (selectedChatId && savedChats?.length > 0) {
      setIsLoadingDraft(true);
      const savedChat = savedChats.find(item => item.id === selectedChatId);

      if (savedChat?.chat) {
        let messages: IMessage[] = [];
        let chat: IChat | null = null;

        if (Array.isArray(savedChat.chat)) {
          const pages = savedChat.chat;
          messages = pages.flatMap((page: any) => {
            if (page?.messages) return page.messages;
            if (page?.item) return [page.item];
            return [];
          });

          if (pages[0]?.[0]?.bookSpecs || bookSpecs) {
            chat = {
              _id: selectedChatId,
              platform: 'whatsapp',
              totalMessages: messages.length,
              author: '',
              status: 'draft',
              importedAt: new Date().toISOString(),
              mediaFiles: pages[0]?.[0]?.mediaFiles || [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              bookConfig: pages[0]?.[0]?.bookSpecs || bookSpecs,
            } as IChat;
          }
        } else if (savedChat.chat?.messages) {
          messages = savedChat.chat.messages;
          chat = {
            ...savedChat.chat,
            _id: savedChat.chat._id || selectedChatId, // Use backend _id if available
            mediaFiles: savedChat.chat.mediaFiles || [],
          } as IChat;
        }

        // Check if we're in photo book flow - navigate to PageSelection
        const photoBookFlow = route?.params?.photoBookFlow;
        const format = route?.params?.format;
        const bookspecs = route?.params?.bookspecs;

        if (photoBookFlow && chat?._id) {
          // Backend expects MongoDB chat _id; prefer savedChat.chat._id over synthetic selectedChatId
          const backendChatId = (savedChat.chat && typeof savedChat.chat === 'object' && !Array.isArray(savedChat.chat) && (savedChat.chat as any)._id) || chat._id;
          navigation.navigate('PageSelection', {
            chatId: backendChatId,
            format: format,
            bookspecs: bookspecs,
          });
          setIsLoadingDraft(false);
          return;
        }

        if (messages.length > 0) {
          dispatch(loadSavedChat({chat, messages}));
        }
      }

      // When in photo book flow with uniqueId but chat not in savedChats, use Redux currentChat and redirect
      if (route?.params?.photoBookFlow && selectedChatId && currentChat?._id === selectedChatId) {
        navigation.navigate('PageSelection', {
          chatId: currentChat._id,
          format: route?.params?.format,
          bookspecs: route?.params?.bookspecs,
        });
        setIsLoadingDraft(false);
        return;
      }
      setIsLoadingDraft(false);
    }
  }, [selectedChatId, savedChats, dispatch, bookSpecs, route?.params, navigation, currentChat]);

  // Preserve original message order from chat for preview / checkout
  const orderedMessages = useMemo(() => chatMessages || [], [chatMessages]);

  const {pages, loading} = usePaginatedMessages({
    messages: orderedMessages,
    containerWidth: width,
    containerHeight: pageHeight - 100, // Account for decorations
    defaultFontSize: currentChat?.bookConfig?.fontSize,
  });

  // In photo book flow we never show the single-book preview; only list or redirect.
  const showChatList = !selectedChatId && savedChats?.length > 0;

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / width);
    setCurrentPageIndex(pageIndex);
  };

  const renderChatCard = ({item, index}: {item: {id: string; chat: any}; index: number}) => {
    const messages = item.chat?.messages || [];
    const messageCount = messages.length;
    const timestamp = item.chat?.timestamp;

    const excludedNames = ['system', 'test'];
    const participantNames = [
      ...new Set(
        messages
          .map((msg: IMessage) => msg.senderName)
          .filter(
            (name: string) =>
              name &&
              name.trim() !== '' &&
              !excludedNames.includes(name.toLowerCase()),
          ),
      ),
    ];
    const chatTitle =
      participantNames.length > 0
        ? participantNames.join(' & ')
        : `Chat ${item.id.substring(0, 8)}`;

    return (
      <TouchableOpacity
        style={styles.chatCard}
        activeOpacity={0.7}
        onPress={() => {
          if (route?.params?.photoBookFlow) {
            // Backend expects MongoDB chat _id; use chat._id from saved chat when available
            const backendChatId = item.chat?._id || item.id;
            navigation.navigate('PageSelection', {
              chatId: backendChatId,
              format: route?.params?.format,
              bookspecs: route?.params?.bookspecs,
            });
            return;
          }
          setSelectedChatId(item.id);
        }}>
        <View style={styles.chatCardIcon}>
          <Text style={styles.chatCardIconText}>
            {chatTitle.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.chatCardContent}>
          <Text style={styles.chatCardTitle} numberOfLines={1}>
            {chatTitle}
          </Text>
          <Text style={styles.chatCardSubtitle}>
            {messageCount} messages
          </Text>
          {timestamp && (
            <Text style={styles.chatCardDate}>
              {moment(timestamp).format('DD MMM YYYY')}
            </Text>
          )}
        </View>
        <View style={styles.chatCardArrowContainer}>
          <Text style={styles.chatCardArrowText}>›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const allPages = [...pages, {id: 'empty-last', messages: [], isEmptyView: true}];
  const totalPages = allPages.length;

  // Determine book type from specs
  const bookType = getBookType(bookSpecs || currentChat?.bookConfig);

  // Create spreads for open book view (pairs of pages)
  const spreads = useMemo(() => {
    const result = [];
    for (let i = 0; i < allPages.length; i += 2) {
      result.push({
        id: `spread-${i}`,
        leftPage: allPages[i] || null,
        rightPage: allPages[i + 1] || null,
        leftPageNumber: i + 1,
        rightPageNumber: i + 2,
      });
    }
    return result;
  }, [allPages]);

  // Render page based on book type
  const renderPage = (page: any, index: number) => {
    const onPressAdd = () => {
      const photoBookFlow = route?.params?.photoBookFlow;
      const format = route?.params?.format;
      const bookspecs = route?.params?.bookspecs;
      navigation.navigate('Chat', {
        photoBookFlow: photoBookFlow,
        format: format,
        bookspecs: bookspecs,
      });
    };

    switch (bookType) {
      case 'square':
        return (
          <SquareBookPage
            chat={currentChat}
            key={page.id}
            page={page}
            width={width}
            height={pageHeight}
            pageNumber={index + 1}
            onPressAdd={onPressAdd}
          />
        );
      default:
        return (
          <MessagePage
            chat={currentChat}
            key={page.id}
            page={page}
            width={width}
            height={pageHeight}
            pageNumber={index + 1}
            onPressAdd={onPressAdd}
          />
        );
    }
  };

  // Render spread for open book view
  const renderSpread = (spread: any, index: number) => {
    return (
      <OpenBookPage
        chat={currentChat}
        key={spread.id}
        leftPage={spread.leftPage}
        rightPage={spread.rightPage}
        width={width}
        height={pageHeight}
        leftPageNumber={spread.leftPageNumber}
        rightPageNumber={spread.rightPageNumber}
        onPressAdd={() => {
          const photoBookFlow = route?.params?.photoBookFlow;
          const format = route?.params?.format;
          const bookspecs = route?.params?.bookspecs;
          navigation.navigate('Chat', {
            photoBookFlow: photoBookFlow,
            format: format,
            bookspecs: bookspecs,
          });
        }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (selectedChatId && savedChats?.length > 1) {
              setSelectedChatId(null);
            } else {
              navigation.navigate('BottomTab', {screen: 'ShopTab'});
            }
          }}>
          <Image source={icn.backArrowIcn} style={styles.backIcon} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {(showChatList || photoBookFlow) ? 'Your Books' : 'Your Book'}
          </Text>
          <View style={styles.headerDivider} />
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.headerCount}>
            {(showChatList || photoBookFlow)
              ? `${savedChats?.length ?? 0} ${(savedChats?.length ?? 0) === 1 ? 'Book' : 'Books'}`
              : bookType === 'open'
                ? `${currentPageIndex + 1} / ${spreads.length}`
                : `${currentPageIndex + 1} / ${totalPages}`}
          </Text>
        </View>
      </View>

      {/* Content */}
      {loading || isLoadingDraft ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Loading your book...</Text>
        </View>
      ) : (showChatList || photoBookFlow) ? (
        <FlatList
          data={savedChats}
          keyExtractor={item => item.id}
          renderItem={renderChatCard}
          contentContainerStyle={styles.chatListContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>Your Collection</Text>
          }
          ListFooterComponent={
            <TouchableOpacity
              style={styles.addNewCard}
              activeOpacity={0.7}
              onPress={() => {
                // Pass photo book flow params if coming from CreateYourDesign
                const photoBookFlow = route?.params?.photoBookFlow;
                const format = route?.params?.format;
                const bookspecs = route?.params?.bookspecs;
                
                navigation.navigate('Chat', {
                  photoBookFlow: photoBookFlow,
                  format: format,
                  bookspecs: bookspecs,
                });
              }}>
              <View style={styles.addNewIconContainer}>
                <Text style={styles.addNewIcon}>+</Text>
              </View>
              <Text style={styles.addNewText}>Import New Chat</Text>
            </TouchableOpacity>
          }
        />
      ) : pages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>📖</Text>
          </View>
          <Text style={styles.emptyTitle}>No Books Yet</Text>
          <Text style={styles.emptySubtitle}>
            Import a chat to create your first book
          </Text>
          <TouchableOpacity
            style={styles.importButton}
            activeOpacity={0.7}
            onPress={() => {
              const photoBookFlow = route?.params?.photoBookFlow;
              const format = route?.params?.format;
              const bookspecs = route?.params?.bookspecs;
              navigation.navigate('Chat', {
                photoBookFlow: photoBookFlow,
                format: format,
                bookspecs: bookspecs,
              });
            }}>
            <Text style={styles.importButtonText}>Import Chat</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.bookContainer}>
          {/* Book type indicator */}
          <View style={styles.bookTypeIndicator}>
            <Text style={styles.bookTypeText}>
              {bookType === 'square' ? '◼ Square Book' : bookType === 'open' ? '📖 Open Book' : '📄 Standard Book'}
            </Text>
          </View>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
            snapToInterval={width}
            contentContainerStyle={styles.pagesContainer}>
            {bookType === 'open'
              ? spreads.map((spread, index) => renderSpread(spread, index))
              : allPages.map((page, index) => renderPage(page, index))}
          </ScrollView>

          {/* Page indicator dots */}
          <View style={styles.pageIndicator}>
            {(bookType === 'open' ? spreads : allPages).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentPageIndex === index && styles.dotActive,
                ]}
              />
            ))}
          </View>

          {/* Photo Book Flow - Continue Button */}
          {photoBookFlow && currentChat?._id && (
            <View style={styles.continueButtonContainer}>
              <TouchableOpacity
                style={styles.continueButton}
                activeOpacity={0.7}
                onPress={() => {
                  navigation.navigate('PageSelection', {
                    chatId: currentChat._id,
                    format: format,
                    bookspecs: bookspecs,
                  });
                }}>
                <Text style={styles.continueButtonText}>
                  Continue to Order
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Order Photo Book Button - Show when viewing any book (not in photo book flow) */}
          {!photoBookFlow && currentChat?._id && pages.length > 0 && (
            <View style={styles.continueButtonContainer}>
              <TouchableOpacity
                style={styles.orderButton}
                activeOpacity={0.7}
                onPress={() => {
                  // Determine format from bookSpecs or currentChat.bookConfig
                  const bookFormat = bookSpecs || currentChat?.bookConfig;
                  let format = 'square_14x14'; // default
                  
                  if (bookFormat) {
                    if (bookFormat.format === 'standard_14_8x21' || bookFormat.format === 'standard') {
                      format = 'standard_14_8x21';
                    } else if (bookFormat.format === 'square_14x14' || bookFormat.format === 'square') {
                      format = 'square_14x14';
                    }
                  }

                  navigation.navigate('PageSelection', {
                    chatId: currentChat._id,
                    format: format,
                    bookspecs: bookSpecs || currentChat?.bookConfig,
                  });
                }}>
                <Text style={styles.orderButtonText}>
                  Order Photo Book
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

export default BookList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    height: rhp(22),
    width: rwp(22),
    resizeMode: 'contain',
    tintColor: COLORS.primary,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  headerDivider: {
    width: 30,
    height: 2,
    backgroundColor: COLORS.accent,
    marginTop: 4,
    borderRadius: 1,
  },
  headerRight: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  headerCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  chatListContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 20,
    marginBottom: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  chatCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  chatCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  chatCardIconText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chatCardContent: {
    flex: 1,
  },
  chatCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  chatCardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  chatCardDate: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '500',
  },
  chatCardArrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatCardArrowText: {
    fontSize: 20,
    color: COLORS.textSecondary,
    fontWeight: '300',
  },
  addNewCard: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  addNewIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addNewIcon: {
    fontSize: 20,
    color: COLORS.textSecondary,
    fontWeight: '300',
  },
  addNewText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  importButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  importButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  bookContainer: {
    flex: 1,
  },
  bookTypeIndicator: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  bookTypeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  pagesContainer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: COLORS.accent,
    width: 24,
  },
  continueButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.cardBg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  continueButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  orderButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
