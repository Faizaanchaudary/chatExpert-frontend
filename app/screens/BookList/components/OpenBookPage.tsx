import React from 'react';
import {Pressable, StyleSheet, Text, View, Image} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {MessageItem} from './MessageItem';
import {Page} from '../types';
import {IChat} from '../../../interfaces/IChat';

interface Props {
  chat: IChat | null;
  leftPage: Page | null;
  rightPage: Page | null;
  width: number;
  height: number;
  leftPageNumber?: number;
  rightPageNumber?: number;
  onPressAdd?: () => void;
}

export const OpenBookPage: React.FC<Props> = ({
  chat,
  leftPage,
  rightPage,
  width,
  height,
  leftPageNumber = 1,
  rightPageNumber = 2,
  onPressAdd,
}) => {
  const spreadWidth = width - 20;
  const spreadHeight = height * 0.85;
  const pageWidth = (spreadWidth - 20) / 2; // Account for spine
  const spineWidth = 20;

  const renderPageContent = (page: Page | null, pageNum: number, side: 'left' | 'right') => {
    const isEmpty = !page || page.messages.length === 0;

    return (
      <View style={[styles.pageContent, side === 'left' ? styles.leftPage : styles.rightPage]}>
        {/* Page texture gradient */}
        <LinearGradient
          colors={side === 'left'
            ? ['#F5F0E6', '#FAF7F0', '#FFFDF5']
            : ['#FFFDF5', '#FAF7F0', '#F5F0E6']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Inner shadow from spine */}
        <LinearGradient
          colors={side === 'left'
            ? ['transparent', 'rgba(0,0,0,0.08)']
            : ['rgba(0,0,0,0.08)', 'transparent']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={[styles.spineShadow, side === 'left' ? styles.spineShadowLeft : styles.spineShadowRight]}
        />

        {/* Page header with decorative line */}
        <View style={styles.pageHeader}>
          <View style={styles.headerLine} />
          <View style={styles.headerOrnament} />
          <View style={styles.headerLine} />
        </View>

        {/* Content */}
        <View style={styles.contentArea}>
          {isEmpty ? (
            <Pressable onPress={onPressAdd} style={styles.emptyContent}>
              <View style={styles.emptyImagePlaceholder}>
                <Text style={styles.emptyIcon}>📷</Text>
              </View>
              <Text style={styles.emptyText}>Add content</Text>
            </Pressable>
          ) : (
            <View style={styles.messagesWrapper}>
              {page?.messages.slice(0, Math.ceil(page.messages.length / 2) + (side === 'left' ? 0 : 1)).map((msg, idx) => {
                // Alternate between showing as image placeholder and text for visual variety
                if (idx === 0 && side === 'left' && page.messages.length > 2) {
                  return (
                    <View key={msg._id} style={styles.featuredImageArea}>
                      <LinearGradient
                        colors={['#E8E4DC', '#D4CFC4']}
                        style={styles.featuredImageGradient}>
                        <Text style={styles.featuredImageIcon}>📷</Text>
                        <Text style={styles.featuredImageText}>Photo Memory</Text>
                      </LinearGradient>
                    </View>
                  );
                }
                return <MessageItem chat={chat} key={msg._id} message={msg} />;
              })}
            </View>
          )}
        </View>

        {/* Page footer with number */}
        <View style={styles.pageFooter}>
          <Text style={[styles.pageNumber, side === 'left' ? styles.pageNumberLeft : styles.pageNumberRight]}>
            {pageNum}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.wrapper, {width, height}]}>
      {/* Book spread container */}
      <View style={[styles.bookSpread, {width: spreadWidth, height: spreadHeight}]}>
        {/* Book shadow */}
        <View style={styles.bookShadow} />

        {/* Book cover/border */}
        <LinearGradient
          colors={['#5D4E37', '#8B7355', '#5D4E37']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.bookCover}>

          {/* Left page */}
          <View style={[styles.pageContainer, {width: pageWidth}]}>
            {renderPageContent(leftPage, leftPageNumber, 'left')}
          </View>

          {/* Spine */}
          <View style={[styles.spine, {width: spineWidth}]}>
            <LinearGradient
              colors={['#3D3225', '#5D4E37', '#3D3225']}
              style={styles.spineGradient}>
              {/* Spine details */}
              <View style={styles.spineLineTop} />
              <View style={styles.spineDot} />
              <View style={styles.spineDot} />
              <View style={styles.spineDot} />
              <View style={styles.spineLineBottom} />
            </LinearGradient>
          </View>

          {/* Right page */}
          <View style={[styles.pageContainer, {width: pageWidth}]}>
            {renderPageContent(rightPage, rightPageNumber, 'right')}
          </View>
        </LinearGradient>

        {/* Page curl effect - bottom right */}
        <View style={styles.pageCurl}>
          <LinearGradient
            colors={['#E8E4DC', '#FAF7F0']}
            start={{x: 0, y: 1}}
            end={{x: 1, y: 0}}
            style={styles.pageCurlGradient}
          />
        </View>
      </View>

      {/* Spread indicator */}
      <View style={styles.spreadIndicator}>
        <Text style={styles.spreadText}>
          Pages {leftPageNumber} - {rightPageNumber}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookSpread: {
    position: 'relative',
  },
  bookShadow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: -10,
    bottom: -10,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 4,
  },
  bookCover: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 4,
    padding: 6,
    overflow: 'hidden',
  },
  pageContainer: {
    backgroundColor: '#FAF7F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  pageContent: {
    flex: 1,
    position: 'relative',
  },
  leftPage: {},
  rightPage: {},
  spineShadow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 30,
    zIndex: 1,
  },
  spineShadowLeft: {
    right: 0,
  },
  spineShadowRight: {
    left: 0,
  },
  spine: {
    marginHorizontal: 2,
  },
  spineGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  spineLineTop: {
    width: 8,
    height: 2,
    backgroundColor: '#8B7355',
    borderRadius: 1,
  },
  spineLineBottom: {
    width: 8,
    height: 2,
    backgroundColor: '#8B7355',
    borderRadius: 1,
  },
  spineDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8B7355',
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D4CFC4',
  },
  headerOrnament: {
    width: 6,
    height: 6,
    backgroundColor: '#C9A86C',
    transform: [{rotate: '45deg'}],
    marginHorizontal: 8,
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  messagesWrapper: {
    flex: 1,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8E4DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyIcon: {
    fontSize: 24,
  },
  emptyText: {
    fontSize: 12,
    color: '#8B8680',
  },
  featuredImageArea: {
    height: 80,
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  featuredImageGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredImageIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  featuredImageText: {
    fontSize: 10,
    color: '#8B7355',
    fontStyle: 'italic',
  },
  pageFooter: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    paddingTop: 4,
  },
  pageNumber: {
    fontSize: 10,
    color: '#8B8680',
    fontStyle: 'italic',
  },
  pageNumberLeft: {
    textAlign: 'left',
  },
  pageNumberRight: {
    textAlign: 'right',
  },
  pageCurl: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 20,
    height: 20,
    overflow: 'hidden',
  },
  pageCurlGradient: {
    width: 28,
    height: 28,
    borderRadius: 14,
    position: 'absolute',
    bottom: -14,
    right: -14,
  },
  spreadIndicator: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(93, 78, 55, 0.1)',
    borderRadius: 12,
  },
  spreadText: {
    fontSize: 12,
    color: '#5D4E37',
    fontWeight: '500',
  },
});
