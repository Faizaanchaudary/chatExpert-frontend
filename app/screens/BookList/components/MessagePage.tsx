import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {MessageItem} from './MessageItem';
import {Page} from '../types';
import {IChat} from '../../../interfaces/IChat';

interface Props {
  chat: IChat | null;
  page: Page;
  width: number;
  height: number;
  pageNumber?: number;
  onPressAdd?: () => void;
}

export const MessagePage: React.FC<Props> = ({
  chat,
  page,
  width,
  height,
  pageNumber = 1,
  onPressAdd,
}) => {
  const isEmptyPage = !page.messages.length;

  return (
    <View style={[styles.pageWrapper, {width, height}]}>
      {/* Page shadow */}
      <View style={styles.pageShadow} />

      {/* Main page container */}
      <View style={[styles.pageContainer, {width: width - 4, height: height - 4}]}>
        {/* Paper texture gradient */}
        <LinearGradient
          colors={['#FFFEF9', '#FBF9F3', '#F8F6F0']}
          style={StyleSheet.absoluteFillObject}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
        />

        {/* Decorative top border */}
        <View style={styles.topDecoration}>
          <View style={styles.decorativeLine} />
          <View style={styles.decorativeDiamond} />
          <View style={styles.decorativeLine} />
        </View>

        {/* Content area */}
        <View style={styles.contentArea}>
          {isEmptyPage ? (
            <Pressable onPress={onPressAdd} style={styles.emptyPageContent}>
              <View style={styles.addButtonCircle}>
                <Text style={styles.addButtonText}>+</Text>
              </View>
              <Text style={styles.addButtonLabel}>Import Chat</Text>
            </Pressable>
          ) : (
            <View style={styles.messagesContainer}>
              {page.messages.map(msg => (
                <MessageItem chat={chat} key={msg._id} message={msg} />
              ))}
            </View>
          )}
        </View>

        {/* Decorative bottom border */}
        <View style={styles.bottomDecoration}>
          <View style={styles.decorativeLine} />
          <Text style={styles.pageNumber}>{pageNumber}</Text>
          <View style={styles.decorativeLine} />
        </View>

        {/* Corner decorations */}
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageShadow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: -8,
    bottom: -8,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 4,
  },
  pageContainer: {
    backgroundColor: '#FFFEF7',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E8E4DC',
    overflow: 'hidden',
  },
  topDecoration: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  bottomDecoration: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  decorativeLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D4CFC4',
  },
  decorativeDiamond: {
    width: 8,
    height: 8,
    backgroundColor: '#C9A86C',
    transform: [{rotate: '45deg'}],
    marginHorizontal: 12,
  },
  pageNumber: {
    fontSize: 12,
    color: '#8B8680',
    fontStyle: 'italic',
    marginHorizontal: 16,
    fontFamily: 'serif',
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  messagesContainer: {
    flex: 1,
  },
  emptyPageContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5F3EE',
    borderWidth: 2,
    borderColor: '#D4CFC4',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButtonText: {
    fontSize: 32,
    color: '#A09A90',
    fontWeight: '300',
  },
  addButtonLabel: {
    fontSize: 14,
    color: '#8B8680',
    fontWeight: '500',
  },
  corner: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderColor: '#C9A86C',
  },
  topLeft: {
    top: 8,
    left: 8,
    borderLeftWidth: 2,
    borderTopWidth: 2,
  },
  topRight: {
    top: 8,
    right: 8,
    borderRightWidth: 2,
    borderTopWidth: 2,
  },
  bottomLeft: {
    bottom: 8,
    left: 8,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
  },
  bottomRight: {
    bottom: 8,
    right: 8,
    borderRightWidth: 2,
    borderBottomWidth: 2,
  },
});
