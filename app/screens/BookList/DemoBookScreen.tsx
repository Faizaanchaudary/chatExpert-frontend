import React, {useState} from 'react';
import {
  SafeAreaView,
  Dimensions,
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import {OpenBookPage} from './components/OpenBookPage';
import {SquareBookPage} from './components/SquareBookPage';
import {SAMPLE_CHAT, SAMPLE_PAGES, SAMPLE_SPREADS} from '../../utils/sampleChatData';

const COLORS = {
  primary: '#2C3E50',
  accent: '#C9A86C',
  background: '#F8F6F0',
  textSecondary: '#8B8680',
  border: '#E8E4DC',
};

type BookType = 'open' | 'square';

const DemoBookScreen: React.FC = () => {
  const {width, height} = Dimensions.get('window');
  const pageHeight = height * 0.75;
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [bookType, setBookType] = useState<BookType>('open');

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / width);
    setCurrentPageIndex(pageIndex);
  };

  const items = bookType === 'open' ? SAMPLE_SPREADS : SAMPLE_PAGES;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat Book Demo</Text>
        <View style={styles.headerDivider} />
        <Text style={styles.headerCount}>
          {currentPageIndex + 1} / {items.length}
        </Text>
      </View>

      {/* Book Type Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, bookType === 'open' && styles.toggleButtonActive]}
          onPress={() => setBookType('open')}>
          <Text style={[styles.toggleText, bookType === 'open' && styles.toggleTextActive]}>
            Open Book
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, bookType === 'square' && styles.toggleButtonActive]}
          onPress={() => setBookType('square')}>
          <Text style={[styles.toggleText, bookType === 'square' && styles.toggleTextActive]}>
            Square Book
          </Text>
        </TouchableOpacity>
      </View>

      {/* Book Display */}
      <View style={styles.bookContainer}>
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
            ? SAMPLE_SPREADS.map((spread, index) => (
                <OpenBookPage
                  chat={SAMPLE_CHAT}
                  key={spread.id}
                  leftPage={spread.leftPage}
                  rightPage={spread.rightPage}
                  width={width}
                  height={pageHeight}
                  leftPageNumber={spread.leftPageNumber}
                  rightPageNumber={spread.rightPageNumber}
                />
              ))
            : SAMPLE_PAGES.map((page, index) => (
                <SquareBookPage
                  chat={SAMPLE_CHAT}
                  key={page.id}
                  page={page}
                  width={width}
                  height={pageHeight}
                  pageNumber={index + 1}
                />
              ))}
        </ScrollView>

        {/* Page indicator dots */}
        <View style={styles.pageIndicator}>
          {items.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentPageIndex === index && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Showing {SAMPLE_CHAT.totalMessages} messages from Sarah & Mike
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default DemoBookScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
    marginBottom: 8,
    borderRadius: 1,
  },
  headerCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.border,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.accent,
  },
  toggleText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  bookContainer: {
    flex: 1,
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
  infoContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
