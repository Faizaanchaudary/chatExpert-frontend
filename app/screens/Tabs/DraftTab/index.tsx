import {Alert, FlatList, StyleSheet, Text, View} from 'react-native';
import React, {useState, useEffect} from 'react';
import {styles} from './style';
import DraftCard from '../../../Components/DraftCard';
import moment from 'moment';
import {sleep} from 'rn-declarative';
import {useSelector} from 'react-redux';

interface DraftTabProps {
  navigation?: any;
}

interface DraftItem {
  id: string;
  bookNumber: string;
  pages: string;
  date: string;
}

const DraftTab: React.FC<DraftTabProps> = ({navigation}) => {
  const [draftCardData, setDraftCardData] = useState<DraftItem[]>([]);
  const {savedChats} = useSelector((state: any) => state.user);
  // console.log("Savedss", savedChats[3]?.chat[0][0]?.bookSpecs);
  useEffect(() => {
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

      // Sort by date (newest first)
      const sortedChats = formattedChats.sort((a: DraftItem, b: DraftItem) => {
        return (
          moment(b.date, 'DD-MM-YY').valueOf() -
          moment(a.date, 'DD-MM-YY').valueOf()
        );
      });

      setDraftCardData(sortedChats);
    } else {
      // Fallback to a sample draft if no saved chats
      setDraftCardData([]);
    }
  }, [savedChats]);

  return (
    <View style={styles.mainContainer}>
      <Text style={styles.textStyle}>Draft</Text>
      <FlatList
        data={draftCardData}
        ListEmptyComponent={() => {
          return (
            <View style={styles.emptyContainer}>
              <Text style={{color: 'black'}}>No drafts found</Text>
            </View>
          );
        }}
        keyExtractor={item => item?.id?.toString() || `draft-${item?.bookNumber}`}
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
              continuePress={() => {
                console.log('iteteet', item);
                navigation.navigate('BookList', {
                  uniqueId: item?.id,
                  isExtendedView: true,
                  bookspecs: item?.bookSpecs,
                });
              }}
            />
          );
        }}
      />
    </View>
  );
};

export default DraftTab;
