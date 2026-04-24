import {Alert, FlatList, StyleSheet, Text, View} from 'react-native';
import React, {useState, useEffect, useCallback} from 'react';
import {styles} from './style';
import DraftCard from '../../../Components/DraftCard';
import moment from 'moment';
import {sleep} from 'rn-declarative';
import {useSelector} from 'react-redux';
import {getUserPhotoBooks} from '../../../services/photoBookApi';
import {useFocusEffect} from '@react-navigation/native';

interface DraftTabProps {
  navigation?: any;
}

interface DraftItem {
  id: string;
  bookNumber: string;
  pages: string;
  date: string;
  bookSpecs?: any;
  photoBookId?: string;
}

const DraftTab: React.FC<DraftTabProps> = ({navigation}) => {
  const [draftCardData, setDraftCardData] = useState<DraftItem[]>([]);
  const {savedChats} = useSelector((state: any) => state.user);
  const [backendPhotoBooks, setBackendPhotoBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  
  // Fetch photobooks from backend - refetch when screen comes into focus
  const fetchPhotoBooks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getUserPhotoBooks(1, 50);
      const photoBooks = response.data?.data || [];
      
      // Filter only draft status
      const drafts = photoBooks.filter((pb: any) => pb.status === 'draft');
      
      // Filter out drafts with 0 messages (broken/incomplete uploads)
      const draftsWithMessages = drafts.filter((pb: any) => {
        // Check if it's a multi-book photobook
        if (pb.books && Array.isArray(pb.books) && pb.books.length > 0) {
          // For multi-book: check if any book has messages
          const totalMessagesInBooks = pb.books.reduce((sum: number, book: any) => {
            return sum + (book.messageCount || 0);
          }, 0);
          
          if (totalMessagesInBooks === 0) {
            console.warn('⚠️ [DraftTab] Filtering out empty multi-book draft:', pb._id);
            return false;
          }
        } else {
          // For single book: check chatId.totalMessages
          const totalMessages = pb.chatId?.totalMessages || 0;
          if (totalMessages === 0) {
            console.warn('⚠️ [DraftTab] Filtering out empty single-book draft:', pb._id);
            return false;
          }
        }
        return true;
      });
      
      setBackendPhotoBooks(draftsWithMessages);
    } catch (error) {
      console.error('❌ [DraftTab] Error fetching photobooks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchPhotoBooks();
  }, [fetchPhotoBooks]);

  // Refetch when screen comes into focus (after uploading books)
  useFocusEffect(
    useCallback(() => {
      fetchPhotoBooks();
    }, [fetchPhotoBooks])
  );
  
  // console.log("Savedss", savedChats[3]?.chat[0][0]?.bookSpecs);
  useEffect(() => {
    
    const allDrafts: DraftItem[] = [];
    
    // Add savedChats (local drafts)
    if (savedChats && savedChats.length > 0) {
      // Transform saved chats to match DraftCard format
      const formattedChats = savedChats.map((chat: any) => {
        // Safely extract bookSpecs - handle different chat structures
        let bookSpecs = null;
        if (chat?.chat) {
          if (Array.isArray(chat.chat) && chat.chat[0]) {
            if (Array.isArray(chat.chat[0]) && chat.chat[0][0]) {
              bookSpecs = chat.chat[0][0]?.bookSpecs;
            } else if (chat.chat[0]?.bookSpecs) {
              bookSpecs = chat.chat[0].bookSpecs;
            }
          } else if (chat.chat?.bookConfig) {
            bookSpecs = chat.chat.bookConfig;
          } else if (chat.chat?.bookSpecs) {
            bookSpecs = chat.chat.bookSpecs;
          }
        }

        return {
          id: chat?.id,
          bookNumber: `Draft ${chat?.id?.substring(0, 8) || 'unknown'}`,
          pages: chat.chat?.messages?.length
            ? `${chat.chat.messages.length} messages`
            : Array.isArray(chat.chat) 
              ? `${chat.chat.length} pages`
              : '',
          date: chat.chat?.timestamp
            ? moment(chat.chat.timestamp).format('DD-MM-YY')
            : moment().format('DD-MM-YY'),
          bookSpecs: bookSpecs,
        };
      });

      allDrafts.push(...formattedChats);
    }
    
    // Add backend photobooks (draft status)
    backendPhotoBooks.forEach((photoBook: any) => {
      // chatId might be populated (object) or just a string
      const chatIdString = typeof photoBook.chatId === 'string' 
        ? photoBook.chatId 
        : photoBook.chatId?._id || photoBook.chatId;
      
      // Check if not already in savedChats
      const exists = savedChats?.some((chat: any) => chat.id === chatIdString);
      if (!exists && chatIdString) {
        const bookCount = photoBook.books?.length || 0;
        const pagesDisplay = bookCount > 1
          ? `${bookCount} books`
          : `${photoBook.pageCount || 0} pages`;
        allDrafts.push({
          id: chatIdString,
          bookNumber: `Draft ${chatIdString.substring(0, 8)}`,
          pages: pagesDisplay,
          date: moment(photoBook.createdAt).format('DD-MM-YY'),
          bookSpecs: {
            format: photoBook.format,
            pageCount: photoBook.pageCount,
          },
          photoBookId: photoBook._id,
        });
      }
    });

    // Sort by date (newest first)
    const sortedChats = allDrafts.sort((a: DraftItem, b: DraftItem) => {
        return (
          moment(b.date, 'DD-MM-YY').valueOf() -
          moment(a.date, 'DD-MM-YY').valueOf()
        );
      });

      setDraftCardData(sortedChats);
  }, [savedChats, backendPhotoBooks]);

  return (
    <View style={styles.mainContainer}>
      <Text style={styles.textStyle}>Draft</Text>
      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={{color: 'black'}}>Loading drafts...</Text>
        </View>
      ) : (
        <FlatList
          data={draftCardData}
          ListEmptyComponent={() => {
            return (
              <View style={styles.emptyContainer}>
                <Text style={{color: 'black'}}>No drafts found</Text>
              </View>
            );
          }}
          keyExtractor={(item, index) => {
            // Use photoBookId if available (backend draft), otherwise use chatId
            // Add index as fallback to ensure uniqueness
            return item?.photoBookId || item?.id || `draft-${index}`;
          }}
          renderItem={({item, index}) => {
          const foundChat = savedChats?.find(
            (chat: {id: string; chat: any}) => chat.id === item?.id,
          );
          const chatLength = Array.isArray(foundChat?.chat) 
            ? foundChat.chat.length 
            : foundChat?.chat?.messages?.length || 0;
          
          return (
            <DraftCard
              length={chatLength}
              item={item}
              onDeleted={fetchPhotoBooks}
              continuePress={() => {
                // Log book status when opened
                if (item?.photoBookId) {
                  console.log('📖 [DraftTab] Opening draft with photoBookId:', {
                    photoBookId: item.photoBookId,
                    chatId: item?.id,
                    format: item?.bookSpecs?.format || 'standard_14_8x21',
                    hasBookSpecs: !!item?.bookSpecs,
                  });
                } else {
                  console.log('📖 [DraftTab] Opening local draft (no photoBookId):', {
                    chatId: item?.id,
                    format: item?.bookSpecs?.format || 'standard_14_8x21',
                  });
                }
                
                // If this draft has a photoBookId, navigate directly to preview
                if (item?.photoBookId) {
                  navigation.navigate('PhotoBookPreview', {
                    photoBookId: item.photoBookId,
                    chatId: item?.id,
                    format: item?.bookSpecs?.format || 'standard_14_8x21',
                    bookspecs: item?.bookSpecs,
                  });
                  return;
                }
                
                // Local draft only (no backend photobook yet)
                navigation.navigate('PhotoBookPreview', {
                  chatId: item?.id,
                  format: item?.bookSpecs?.format || 'standard_14_8x21',
                  bookspecs: item?.bookSpecs,
                });
              }}
            />
          );
        }}
      />
      )}
    </View>
  );
};

export default DraftTab;
