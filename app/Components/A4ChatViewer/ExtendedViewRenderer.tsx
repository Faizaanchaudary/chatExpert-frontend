// ExtendedViewRenderer.tsx
import React from 'react';
import {View, Text, Pressable, ImageBackground} from 'react-native';
import PageContainer from './PageContainer';
import MessageRenderer from './MessageRenderer';
import {styles} from './style';

export const ExtendedViewRenderer = ({
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
  setExtendedView,
  setCurrentPage,
  setCurrentPageIndex,
  flatListRef,
}: any) => (
  <Pressable onPress={() => undefined}>
    <PageContainer
      PAGE_HEIGHT={PAGE_HEIGHT}
      extendedView
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
          extendedView
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

      {/* ExtendedView extras */}
      <View style={styles.pageIndicatorWrapper}>
        <View style={styles.pageNumberBox}>
          <Text style={styles.pageNumberText}>{index + 1}</Text>
        </View>
      </View>
      <Pressable
        style={styles.goToButton}
        onPress={() => {
          setExtendedView(false);
          setTimeout(() => {
            try {
              if (index > 30)
                flatListRef.current?.scrollToOffset({
                  offset: index * PAGE_HEIGHT,
                  animated: true,
                });
              else
                flatListRef.current?.scrollToIndex({
                  index,
                  animated: true,
                  viewPosition: 0,
                });
              setCurrentPage?.(index + 1);
              setCurrentPageIndex(index);
            } catch (err) {
              if (__DEV__) console.warn('Scroll failed:', err);
            }
          }, 300);
        }}>
        <Text style={styles.goToButtonText}>↗</Text>
      </Pressable>
    </PageContainer>
  </Pressable>
);
