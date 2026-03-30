import {useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import {
  formatMessageTime,
  getDayFromTime,
  getFormattedDate,
} from '../../utils/dateUtils';
import {Image, Pressable, Text, TouchableOpacity, View} from 'react-native';
import {hp, rfs, rwp, wp} from '../../utils/reponsiveness';
import {COLORS} from '../../utils/colors';
import fonts from '../../utils/fonts';
import moment from 'moment';
import {isImage, isVideo} from '../../utils/mediaUtils';

import {icn} from '../../assets/icons';
import ImagePicker from 'react-native-image-crop-picker';
import {uploadContent} from '../../services/calls';
import {updateGroupItemById} from '../../utils/updateGroupItemById';
import {store} from '../../store/Store';
import {enableSnackbar} from '../../store/Slice/snackbarSlice';
import {IBookSpec, IMessageBubble} from '../../interfaces/IMessage';
import {PageElement} from '../../interfaces/IPage';
import MediaQR from '../MediaQR/MediaQR';

interface ChatBubbleProps {
  pageElement: PageElement;
  onMeasure?: (height: number) => void;
  indexOfPage: number;
  extendedView: boolean;
  PAGE_HEIGHT: number;
  bookSpecs: IBookSpec;
  lastShownDateRef: any;
  onEditMessage: (params: any) => void;
  onPressMiddleImage: () => void;
  onPressVideo: (path: string) => void;
}

const ChatBubble = ({
  pageElement,
  onMeasure,
  indexOfPage,
  extendedView,
  PAGE_HEIGHT,
  bookSpecs,
  lastShownDateRef,
  onEditMessage,
  onPressMiddleImage,
  onPressVideo,
}: ChatBubbleProps) => {
  const navigation = useNavigation();
  const [showDate, setShowDate] = useState(false);

  const {
    item: message,
    type,
    id,
    middleimage,
    senderTextColor,
    receiverTextColor,
    senderBackground,
    receiverBackground,
    fontFamily,
    fontSize,
    fontStyle,
  } = pageElement;

  useEffect(() => {
    if (message?.sendingTime) {
      const currentDay = getDayFromTime(message.sendingTime);
      if (currentDay && currentDay !== lastShownDateRef.current) {
        setShowDate(true);
        lastShownDateRef.current = currentDay;
      } else {
        setShowDate(false);
      }
    }
  }, [pageElement]);

  if (type == 'toptext' || type == 'middleimage' || type == 'bottomtext')
    return (
      <View
        key={`view-${indexOfPage}-${Math.random()}`}
        style={{
          justifyContent: 'space-evenly',
          alignContent: 'space-between',
        }}>
        {/* {message?.type == 'toptext' && (
          <Pressable
            key={`toptext-pressable-${indexOfPage}-${message?.id}`}
            onPress={() => {
              if (extendedView) {
              } else {
                // Normal edit functionality
                onEditMessage({
                  item: message,
                  type: 'noncover',
                  buttonIndex: 2,
                  objectIndex: message?.id,
                  field: 'toptext',
                  focus: 'topText',
                });
              }
            }}
            style={{
              width: '100%',
              height: 20,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              borderWidth: 1,
              borderStyle: 'dotted',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}>
            <Text
              key={`toptext-text-${indexOfPage}-${message?.id}`}
              style={{
                color: message.item?.sender
                  ? message?.senderTextColor
                  : message?.receiverTextColor
                  ? message?.receiverTextColor
                  : 'black',
                fontSize: message?.fontSize,
                fontWeight: message?.fontStyle == 'bold' ? 'bold' : 'normal',
                fontStyle: message?.fontStyle == 'italic' ? 'italic' : 'normal',
                fontFamily: message?.fontFamily,
                textDecorationLine:
                  message?.fontStyle == 'underline' ? 'underline' : 'none',
              }}>
              {message?.topText ? message?.topText : '+'}
            </Text>
          </Pressable>
        )} */}

        {type == 'middleimage' && (
          <Pressable
            key={`middleimage-pressable-${indexOfPage}-${id}`}
            onPress={() => {
              if (extendedView) {
              } else {
                // Normal functionality
                onPressMiddleImage();
              }
            }}
            style={{
              width: '100%',
              height: bookSpecs?.title?.includes('Square')
                ? PAGE_HEIGHT * 0.53
                : PAGE_HEIGHT * 0.58,
              borderWidth: !middleimage ? 1 : 0,
              borderStyle: 'dotted',
              alignItems: 'center',
              justifyContent: 'center',
              marginVertical: hp(8),
            }}>
            {!middleimage ? (
              <Text
                key={`middleimage-placeholder-text-${indexOfPage}-${id}`}
                style={{
                  color: message?.sender
                    ? senderTextColor
                    : receiverTextColor
                    ? receiverTextColor
                    : 'black',
                  fontSize: fontSize,
                  fontWeight: fontStyle == 'bold' ? 'bold' : 'normal',
                  fontStyle: fontStyle == 'italic' ? 'italic' : 'normal',
                  fontFamily: fontFamily,
                  textDecorationLine:
                    fontStyle == 'underline' ? 'underline' : 'none',
                }}>
                {middleimage ? middleimage : '+'}
              </Text>
            ) : (
              <Image
                key={`middleimage-image-${indexOfPage}-${message?.id}`}
                source={{uri: middleimage}}
                style={{
                  width: '100%',
                  height: bookSpecs?.title?.includes('Square')
                    ? PAGE_HEIGHT * 0.58
                    : PAGE_HEIGHT * 0.53,
                }}
                resizeMode="stretch"
              />
            )}
          </Pressable>
        )}

        {/* {message?.type == 'bottomtext' && (
          <Pressable
            key={`bottomtext-pressable-${indexOfPage}-${message?.id}`}
            onPress={() => {
              if (extendedView) {
              } else {
                // Normal edit functionality
                onEditMessage({
                  item: message,
                  type: 'noncover',
                  buttonIndex: 2,
                  objectIndex: message?.id,
                  field: 'toptext',
                  focus: 'bottomtext',
                });
              }
            }}
            style={{
              width: '100%',
              height: 20,
              borderWidth: 1,
              borderStyle: 'dotted',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              bottom: hp(2),
              left: 0,
              right: 0,
              zIndex: 1000,
            }}>
            <Text
              key={`bottomtext-text-${indexOfPage}-${message?.id}`}
              style={{
                color: message.item?.sender
                  ? message?.senderTextColor
                  : message?.receiverTextColor
                  ? message?.receiverTextColor
                  : 'black',
                fontSize: message?.fontSize,
                fontWeight: message?.fontStyle == 'bold' ? 'bold' : 'normal',
                fontStyle: message?.fontStyle == 'italic' ? 'italic' : 'normal',
                fontFamily: message?.fontFamily,
                textDecorationLine:
                  message?.fontStyle == 'underline' ? 'underline' : 'none',
              }}>
              {message?.bottomtext ? message?.bottomtext : '+'}
            </Text>
          </Pressable>
        )} */}
      </View>
    );

  return (
    <>
      {showDate && (
        <View
          style={{
            alignItems: 'center',
            marginVertical: hp(1),
          }}>
          <View
            style={{
              backgroundColor: COLORS.darkBlack,
              paddingHorizontal: wp(2),
              paddingVertical: hp(0.3),
              borderRadius: rwp(20),
            }}>
            <Text
              style={{
                color: COLORS.textWhite,
                fontSize: rfs(11),
                fontFamily: fonts.POPPINS.Medium,
              }}>
              {message?.sendingTime
                ? getFormattedDate(message?.sendingTime)
                : '--'}
            </Text>
          </View>
        </View>
      )}
      <Pressable
        key={`chat-bubble-${indexOfPage}-${message?.id || 'bubble'}`}
        onPress={() => {
          if (extendedView) {
          } else {
            onEditMessage({
              item: message,
              type: 'noncover',
              buttonIndex: 2,
              objectIndex: message?.id,
              field: 'secondR',
              focus: 'text',
            });
          }
        }}
        onLayout={event => {
          if (onMeasure) {
            onMeasure(event.nativeEvent.layout.height);
          }
        }}>
        <Text
          key={`chat-header-${message?.id}-${Math.random()}`}
          style={{
            color: message?.sender ? senderTextColor : receiverTextColor,
            fontSize: fontSize,
            fontWeight: fontStyle == 'bold' ? 'bold' : 'normal',
            fontStyle: fontStyle == 'italic' ? 'italic' : 'normal',
            fontFamily: fontFamily,
            textDecorationLine: fontStyle == 'underline' ? 'underline' : 'none',
            alignSelf: message?.sender ? 'flex-end' : 'flex-start',
          }}>
          {message?.senderName ? message?.senderName : message?.receiverName}{' '}
          {'  '} {formatMessageTime(message?.sendingTime)}
        </Text>
        <View
          key={`chat-content-${message?.id}-${Math.random()}`}
          style={{
            backgroundColor: message?.remotePath
              ? 'white'
              : message?.sender
              ? senderBackground
              : receiverBackground,
            padding: 10,
            marginVertical: 5,
            borderRadius: 10,
            alignSelf: message?.sender ? 'flex-end' : 'flex-start',
            maxWidth: '80%', // Limit width to prevent overflow
            maxHeight: message?.remotePath ? hp(15) : undefined, // Strict height limit for messages with media
          }}>
          {!message?.remotePath ? (
            <Text
              key={`chat-text-${message?.id}-${Math.random()}`}
              style={{
                color: message?.sender ? senderTextColor : receiverTextColor,
                fontSize: fontSize,
                fontWeight: fontStyle == 'bold' ? 'bold' : 'normal',
                fontStyle: fontStyle == 'italic' ? 'italic' : 'normal',
                fontFamily: fontFamily,
                textDecorationLine:
                  fontStyle == 'underline' ? 'underline' : 'none',
              }}>
              {message?.text || 'message not found'}
            </Text>
          ) : (
            <View
              key={`chat-media-${message?.id}-${Math.random()}`}
              style={{
                alignItems: 'center',
                maxHeight: hp(13), // Stricter max height
                overflow: 'hidden', // Hide overflow content
              }}>
              {isImage(message?.remotePath) || isVideo(message?.remotePath) ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: wp(2),
                  }}>
                  {isImage(message?.remotePath) ? (
                    <Image
                      key={`media-image-${message?.id}-${Math.random()}`}
                      style={{
                        width: wp(15), // Responsive width
                        height: wp(15), // Responsive and square
                        borderRadius: wp(1.25),
                      }}
                      source={{uri: message?.remotePath}}
                      resizeMode="cover"
                    />
                  ) : (
                    <TouchableOpacity
                      onPress={() => {
                        if (message?.remotePath && onPressVideo)
                          onPressVideo(message?.remotePath);
                      }}
                      style={{
                        borderRadius: wp(1.25),
                        width: wp(15),
                        height: wp(15),
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'black',
                      }}>
                      <Image
                        key={`media-image-${message?.id}-${Math.random()}`}
                        style={{
                          width: wp(5), // Responsive width
                          height: wp(5), // Responsive and square
                          borderRadius: wp(1.25),
                        }}
                        source={icn.playPauseIcn}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  )}
                  {isVideo(message?.remotePath) ? null : (
                    <MediaQR
                      key={`qr-${message?.id}-${Math.random()}`}
                      remotePath={message?.remotePath}
                      size={wp(15)} // Responsive QR code size
                    />
                  )}
                </View>
              ) : (
                <MediaQR
                  key={`qr-${message?.id}-${Math.random()}`}
                  remotePath={message?.remotePath}
                  size={wp(15)} // Responsive QR code size
                />
              )}
            </View>
          )}
        </View>
      </Pressable>
    </>
  );
};

export default ChatBubble;
