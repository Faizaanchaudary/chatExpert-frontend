import React from 'react';
import {Pressable, Text} from 'react-native';
import ChatBubble from './ChatBubble'; // adjust path
import {hp} from '../../utils/reponsiveness';
import {PageElement} from '../../interfaces/IPage';

interface MessageRendererProps {
  pageElement: PageElement;
  index: number;
  extendedView: boolean;
  PAGE_HEIGHT: number;
  bookSpecs: any;
  lastShownDateRef: any;
  setEditItem: (item: any) => void;
  importTool: (args: any) => void;
  addImageFunction: (args: any) => void;
  setSelectedVideo: (path: string) => void;
  setShowVideoModal: (visible: boolean) => void;
  styles: any;
}

const MessageRenderer: React.FC<MessageRendererProps> = ({
  pageElement,
  index,
  extendedView,
  PAGE_HEIGHT,
  bookSpecs,
  lastShownDateRef,
  setEditItem,
  importTool,
  addImageFunction,
  setSelectedVideo,
  setShowVideoModal,
  styles,
}) => {
  if (!pageElement) return null;

  const {
    chatBackground,
    fontFamily,
    fontSize,
    fontStyle,
    id,
    topText,
    bottomtext,
    type,
    item,
    senderTextColor,
    receiverTextColor,
  } = pageElement;

  switch (type) {
    case 'toptext':
      return (
        <Pressable
          key={`toptext-${index}-${id}`}
          onPress={() => {
            if (!extendedView) {
              setEditItem({
                item: pageElement,
                type: 'noncover',
                buttonIndex: 2,
                objectIndex: id,
                field: 'toptext',
                focus: 'topText',
              });
            }
          }}
          style={[styles.topTextContainer, {top: hp(2)}]}>
          <Text
            style={[
              styles.dynamicText,
              {
                color: item?.sender
                  ? senderTextColor
                  : receiverTextColor || 'black',
                fontSize: fontSize,
                fontWeight: fontStyle == 'bold' ? 'bold' : 'normal',
                fontStyle: fontStyle == 'italic' ? 'italic' : 'normal',
                fontFamily: fontFamily,
                textDecorationLine:
                  fontStyle == 'underline' ? 'underline' : 'none',
              },
            ]}>
            {topText || '+'}
          </Text>
        </Pressable>
      );

    case 'bottomtext':
      return (
        <Pressable
          key={`bottomtext-${index}-${id}`}
          onPress={() => {
            if (!extendedView) {
              setEditItem({
                item: pageElement,
                type: 'noncover',
                buttonIndex: 2,
                objectIndex: id,
                field: 'toptext',
                focus: 'bottomtext',
              });
            }
          }}
          style={[styles.bottomTextContainer, {bottom: hp(2)}]}>
          <Text
            style={[
              styles.dynamicText,
              {
                color: item?.sender
                  ? senderTextColor
                  : receiverTextColor || 'black',
                fontSize: fontSize,
                fontWeight: fontStyle == 'bold' ? 'bold' : 'normal',
                fontStyle: fontStyle == 'italic' ? 'italic' : 'normal',
                fontFamily: fontFamily,
                textDecorationLine:
                  fontStyle == 'underline' ? 'underline' : 'none',
              },
            ]}>
            {bottomtext || '+'}
          </Text>
        </Pressable>
      );

    default: // chat bubble
      return (
        <ChatBubble
          key={`chat-bubble-${index}-${id}`}
          pageElement={pageElement}
          indexOfPage={index}
          PAGE_HEIGHT={PAGE_HEIGHT}
          bookSpecs={bookSpecs}
          extendedView={extendedView}
          lastShownDateRef={lastShownDateRef}
          onEditMessage={() => {
            setEditItem({
              item: pageElement,
              type: 'noncover',
              buttonIndex: 2,
              objectIndex: id,
              field: 'secondR',
              focus: 'text',
            });
          }}
          onPressMiddleImage={() => {
            if (!extendedView) {
              importTool({
                type: 'image',
                params: pageElement,
                function: addImageFunction,
                indexOfPage: index,
              });
            }
          }}
          onPressVideo={path => {
            setSelectedVideo(path);
            setShowVideoModal(true);
          }}
        />
      );
  }
};

export default MessageRenderer;
