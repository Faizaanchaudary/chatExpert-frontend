import React from 'react';
import { Text, View, Image, StyleSheet, Dimensions } from 'react-native';
import { IMessage } from '../../../interfaces/IMessage';
import {
  AUDIO_HEIGHT,
  DEFAULT_FONT_SIZE,
  IMAGE_HEIGHT,
  IMAGE_WIDTH,
} from '../constants';
import { IChat } from '../../../interfaces/IChat';
import fonts from '../../../utils/fonts';
import QRCode from 'react-native-qrcode-svg';
import { wp } from '../../../utils/reponsiveness';

// Elegant color palette
const COLORS = {
  senderBubble: '#4A6FA5',
  senderText: '#FFFFFF',
  receiverBubble: '#F0EDE5',
  receiverText: '#3D3D3D',
  timestamp: '#9B9B9B',
  senderName: '#D4A574',
  shadow: 'rgba(0, 0, 0, 0.08)',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  message: IMessage;
  chat: IChat | null;
}

export const MessageItem: React.FC<Props> = ({ message, chat }) => {
  const {
    fontFamily,
    fontSize,
    fontStyle,
    senderTextColor,
    receiverTextColor,
  } = chat?.bookConfig || {};

  const isSender = true; // TODO: replace with actual sender check

  const findMediaUrl = (filename: string): string => {
    if (!chat?.mediaFiles || !filename) return '';

    let media = chat.mediaFiles.find(f => f.name === filename);

    if (!media) {
      const filenameOnly = filename.split('/').pop() || filename;
      media = chat.mediaFiles.find(f => {
        const mediaName = f.name?.split('/').pop() || f.name;
        return mediaName === filenameOnly;
      });
    }

    if (!media) {
      const lowerFilename = filename.toLowerCase();
      media = chat.mediaFiles.find(
        f =>
          f.name?.toLowerCase() === lowerFilename ||
          f.name?.toLowerCase().includes(lowerFilename) ||
          lowerFilename.includes(f.name?.toLowerCase()),
      );
    }

    return media?.url || '';
  };

  const renderMessageContent = () => {
    const bubbleStyle = isSender ? styles.senderBubble : styles.receiverBubble;
    const textColor = isSender
      ? senderTextColor || COLORS.senderText
      : receiverTextColor || COLORS.receiverText;

    switch (message.messageType) {
      case 'text':
        return (
          <View style={[styles.bubble, bubbleStyle]}>
            <Text
              style={[
                styles.messageText,
                {
                  fontSize: fontSize || DEFAULT_FONT_SIZE,
                  color: textColor,
                  fontFamily: fontFamily || fonts.ROBOTO.Regular,
                  fontWeight: fontStyle === 'bold' ? 'bold' : 'normal',
                  textDecorationLine:
                    fontStyle === 'underline' ? 'underline' : undefined,
                  fontStyle: fontStyle === 'italic' ? 'italic' : 'normal',
                },
              ]}>
              {message.text}
            </Text>
          </View>
        );

      case 'image':
        const imageUrl = findMediaUrl(message.text);
        if (!imageUrl) {
          return (
            <View style={[styles.mediaBubble, styles.imagePlaceholder]}>
              <Text style={styles.placeholderIcon}>📷</Text>
              <Text style={styles.placeholderText}>{message.text}</Text>
            </View>
          );
        }
        return (
          <View style={styles.mediaContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        );

      case 'video':
        const videoUrl = findMediaUrl(message.text);
        return (
          <View style={styles.qrContainer}>
            <View style={styles.qrWrapper}>
              <QRCode value={videoUrl || 'video'} size={wp(15)} />
            </View>
            <Text style={styles.qrLabel}>Scan for video</Text>
          </View>
        );

      case 'audio':
        return (
          <View style={styles.audioBubble}>
            <View style={styles.audioIconContainer}>
              <Text style={styles.audioIcon}>🎵</Text>
            </View>
            <View style={styles.audioWaveform}>
              {[...Array(12)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.waveformBar,
                    { height: 8 + Math.random() * 16 },
                  ]}
                />
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Header: sender name and time */}
      <View style={styles.header}>
        <Text style={styles.senderName}>{message.senderName}</Text>
        <View style={styles.timeDot} />
        <Text style={styles.timestamp}>{message.sendingTime}</Text>
      </View>

      {/* Message content */}
      {renderMessageContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginLeft: 4,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.senderName,
    letterSpacing: 0.3,
  },
  timeDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.timestamp,
    marginHorizontal: 6,
  },
  timestamp: {
    fontSize: 10,
    color: COLORS.timestamp,
    fontStyle: 'italic',
  },
  bubble: {
    maxWidth: SCREEN_WIDTH * 0.65,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  senderBubble: {
    backgroundColor: COLORS.senderBubble,
    borderBottomLeftRadius: 4,
  },
  receiverBubble: {
    backgroundColor: COLORS.receiverBubble,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  mediaContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: 12,
  },
  mediaBubble: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    backgroundColor: '#F5F3EE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E4DC',
  },
  placeholderIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  placeholderText: {
    fontSize: 10,
    color: COLORS.timestamp,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  qrContainer: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E4DC',
  },
  qrWrapper: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  qrLabel: {
    marginTop: 8,
    fontSize: 10,
    color: COLORS.timestamp,
    fontStyle: 'italic',
  },
  audioBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3EE',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E8E4DC',
    height: AUDIO_HEIGHT,
  },
  audioIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.senderBubble,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  audioIcon: {
    fontSize: 14,
  },
  audioWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  waveformBar: {
    width: 3,
    backgroundColor: COLORS.senderName,
    borderRadius: 1.5,
    marginHorizontal: 2,
  },
});
