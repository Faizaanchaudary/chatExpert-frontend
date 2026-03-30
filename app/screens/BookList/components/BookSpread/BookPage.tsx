import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Page } from '../../types';
import { IChat } from '../../../../interfaces/IChat';
import { MessageItem } from '../MessageItem';

interface BookPageProps {
  page: Page | null;
  side: 'left' | 'right';
  pageNumber: number;
  dimensions: { width: number; height: number };
  chat: IChat | null;
  isEmptyPage?: boolean;
}

export const BookPage: React.FC<BookPageProps> = ({
  page,
  side,
  pageNumber,
  dimensions,
  chat,
  isEmptyPage = false,
}) => {
  const { width, height } = dimensions;

  return (
    <View style={[styles.pageContainer, { width, height }]}>
      {/* Inner shadow along spine edge */}
      <LinearGradient
        colors={['rgba(0,0,0,0.1)', 'transparent']}
        start={{ x: side === 'left' ? 1 : 0, y: 0 }}
        end={{ x: side === 'left' ? 0.85 : 0.15, y: 0 }}
        style={[
          styles.innerShadow,
          side === 'left' ? styles.innerShadowLeft : styles.innerShadowRight,
        ]}
        pointerEvents="none"
      />

      {/* Page content */}
      <View style={styles.contentContainer}>
        {isEmptyPage || !page || page.messages.length === 0 ? (
          <View style={styles.emptyPage}>
            <Text style={styles.emptyText}>+</Text>
          </View>
        ) : (
          <View style={styles.messagesContainer}>
            {page.messages.map(msg => (
              <MessageItem key={msg._id} message={msg} chat={chat} />
            ))}
          </View>
        )}
      </View>

      {/* Page number */}
      <View
        style={[
          styles.pageNumberContainer,
          side === 'left' ? styles.pageNumberLeft : styles.pageNumberRight,
        ]}>
        <Text style={styles.pageNumber}>{pageNumber}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    backgroundColor: '#FFFEF7', // Paper-like off-white
    position: 'relative',
    overflow: 'hidden',
  },
  innerShadow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 15,
    zIndex: 10,
  },
  innerShadowLeft: {
    right: 0,
  },
  innerShadowRight: {
    left: 0,
  },
  contentContainer: {
    flex: 1,
    padding: 12,
    paddingBottom: 30, // Space for page number
  },
  messagesContainer: {
    flex: 1,
  },
  emptyPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 48,
    color: '#ccc',
  },
  pageNumberContainer: {
    position: 'absolute',
    bottom: 8,
  },
  pageNumberLeft: {
    left: 12,
  },
  pageNumberRight: {
    right: 12,
  },
  pageNumber: {
    fontSize: 10,
    color: '#666',
  },
});
