import React from 'react';
import {Pressable, StyleSheet, Text, View, ImageBackground} from 'react-native';
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

export const SquareBookPage: React.FC<Props> = ({
  chat,
  page,
  width,
  height,
  pageNumber = 1,
  onPressAdd,
}) => {
  const isEmptyPage = !page.messages.length;
  const size = Math.min(width, height);

  return (
    <View style={[styles.pageWrapper, {width, height}]}>
      {/* Outer frame with gradient border */}
      <LinearGradient
        colors={['#8B7355', '#D4A574', '#8B7355']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={[styles.outerFrame, {width: size - 16, height: size - 16}]}>

        {/* Inner page */}
        <View style={styles.innerPage}>
          {/* Decorative pattern background */}
          <View style={styles.patternOverlay}>
            {[...Array(6)].map((_, row) => (
              <View key={row} style={styles.patternRow}>
                {[...Array(6)].map((_, col) => (
                  <View
                    key={col}
                    style={[
                      styles.patternDot,
                      (row + col) % 2 === 0 && styles.patternDotAlt,
                    ]}
                  />
                ))}
              </View>
            ))}
          </View>

          {/* Top decorative border */}
          <View style={styles.topBorder}>
            <View style={styles.borderLine} />
            <View style={styles.borderOrnament}>
              <View style={styles.ornamentDiamond} />
              <View style={styles.ornamentCircle} />
              <View style={styles.ornamentDiamond} />
            </View>
            <View style={styles.borderLine} />
          </View>

          {/* Content area */}
          <View style={styles.contentArea}>
            {isEmptyPage ? (
              <Pressable onPress={onPressAdd} style={styles.emptyContent}>
                <View style={styles.addButton}>
                  <Text style={styles.addButtonText}>+</Text>
                </View>
                <Text style={styles.addLabel}>Add Messages</Text>
              </Pressable>
            ) : (
              <View style={styles.messagesContainer}>
                {page.messages.map(msg => (
                  <MessageItem chat={chat} key={msg._id} message={msg} />
                ))}
              </View>
            )}
          </View>

          {/* Bottom decorative border */}
          <View style={styles.bottomBorder}>
            <View style={styles.borderLine} />
            <View style={styles.pageNumberContainer}>
              <Text style={styles.pageNumber}>{pageNumber}</Text>
            </View>
            <View style={styles.borderLine} />
          </View>

          {/* Corner flourishes */}
          <View style={[styles.cornerFlourish, styles.topLeftCorner]}>
            <View style={styles.flourishV} />
            <View style={styles.flourishH} />
          </View>
          <View style={[styles.cornerFlourish, styles.topRightCorner]}>
            <View style={styles.flourishV} />
            <View style={styles.flourishH} />
          </View>
          <View style={[styles.cornerFlourish, styles.bottomLeftCorner]}>
            <View style={styles.flourishV} />
            <View style={styles.flourishH} />
          </View>
          <View style={[styles.cornerFlourish, styles.bottomRightCorner]}>
            <View style={styles.flourishV} />
            <View style={styles.flourishH} />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  pageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerFrame: {
    borderRadius: 8,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  innerPage: {
    flex: 1,
    backgroundColor: '#FDF8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  patternOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
    padding: 20,
  },
  patternRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 1,
  },
  patternDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B7355',
  },
  patternDotAlt: {
    transform: [{rotate: '45deg'}],
    borderRadius: 0,
  },
  topBorder: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  bottomBorder: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  borderLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#D4A574',
    opacity: 0.5,
  },
  borderOrnament: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  ornamentDiamond: {
    width: 6,
    height: 6,
    backgroundColor: '#D4A574',
    transform: [{rotate: '45deg'}],
  },
  ornamentCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D4A574',
    marginHorizontal: 6,
  },
  pageNumberContainer: {
    marginHorizontal: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#D4A574',
    borderRadius: 10,
  },
  pageNumber: {
    fontSize: 11,
    color: '#FDF8F0',
    fontWeight: '600',
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  messagesContainer: {
    flex: 1,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D4A574',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButtonText: {
    fontSize: 28,
    color: '#FDF8F0',
    fontWeight: '300',
  },
  addLabel: {
    fontSize: 14,
    color: '#8B7355',
    fontWeight: '500',
  },
  cornerFlourish: {
    position: 'absolute',
    width: 24,
    height: 24,
  },
  flourishV: {
    position: 'absolute',
    width: 3,
    height: 20,
    backgroundColor: '#D4A574',
    borderRadius: 1.5,
  },
  flourishH: {
    position: 'absolute',
    width: 20,
    height: 3,
    backgroundColor: '#D4A574',
    borderRadius: 1.5,
  },
  topLeftCorner: {
    top: 8,
    left: 8,
  },
  topRightCorner: {
    top: 8,
    right: 8,
    transform: [{scaleX: -1}],
  },
  bottomLeftCorner: {
    bottom: 8,
    left: 8,
    transform: [{scaleY: -1}],
  },
  bottomRightCorner: {
    bottom: 8,
    right: 8,
    transform: [{scale: -1}],
  },
});
