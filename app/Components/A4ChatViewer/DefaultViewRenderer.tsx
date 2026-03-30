// DefaultViewRenderer.tsx
import React from 'react';
import {View, Pressable, Text, ImageBackground} from 'react-native';
import PageContainer from './PageContainer';
import MessageRenderer from './MessageRenderer';
import {styles} from './style';

export const DefaultViewRenderer = ({
  item,
  index,
  PAGE_HEIGHT,
  shadow,
  viewShotRefs,
  bookSpecs,
  importTool,
  addImageFunction,
  setEditItem,
  lastShownDateRef,
  setSelectedVideo,
  setShowVideoModal,
}: any) => (
  <Pressable onPress={() => undefined}>
    <PageContainer
      PAGE_HEIGHT={PAGE_HEIGHT}
      extendedView={false}
      index={index}
      isEven={index % 2 === 0}
      item={item}
      shadow={shadow}
      viewShotRefs={viewShotRefs}
      bookSpecs={bookSpecs}>
      {item[0]?.chatBackground?.image && (
        <ImageBackground
          source={
            item[0]?.chatBackground?.code === false
              ? {uri: item[0]?.chatBackground?.path}
              : item[0]?.chatBackground?.image
          }
          style={styles.backgroundImage}
          resizeMode="stretch"
        />
      )}

      {item.map((pageElement: any, msgIndex: number) => (
        <MessageRenderer
          key={`${pageElement?.type}-${index}-${pageElement?.id || msgIndex}`}
          pageElement={pageElement}
          index={index}
          extendedView={false}
          PAGE_HEIGHT={PAGE_HEIGHT}
          bookSpecs={bookSpecs}
          lastShownDateRef={lastShownDateRef}
          setEditItem={setEditItem}
          importTool={importTool}
          addImageFunction={addImageFunction}
          setSelectedVideo={setSelectedVideo}
          setShowVideoModal={setShowVideoModal}
          styles={styles}
        />
      ))}
    </PageContainer>
  </Pressable>
);
