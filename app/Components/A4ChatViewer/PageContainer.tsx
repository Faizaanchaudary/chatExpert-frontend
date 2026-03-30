import React from 'react';
import {Dimensions, View} from 'react-native';
import ViewShot from 'react-native-view-shot';

import {
  getMarginLeft,
  getPageMarginTop,
  getTransformedData,
} from '../../utils/pageUtils';
import {hp, wp} from '../../utils/reponsiveness';

const {width} = Dimensions.get('window');

interface PageContainerProps {
  index: number;
  item: any[];
  extendedView: boolean;
  isEven: boolean;
  shadow: boolean;
  PAGE_HEIGHT: number;
  viewShotRefs: React.MutableRefObject<any[]>;
  bookSpecs?: any;
  children: React.ReactNode;
}

const PageContainer: React.FC<PageContainerProps> = ({
  index,
  item,
  extendedView,
  isEven,
  shadow,
  PAGE_HEIGHT,
  viewShotRefs,
  bookSpecs,
  children,
}) => {
  return (
    <ViewShot
      key={`view-shot-normal-${index}-${item[0]?.id}`}
      ref={ref => (viewShotRefs.current[index] = ref)}
      options={{
        format: 'jpg',
        quality: 1,
        result: 'tmpfile',
      }}
      style={[
        {
          height: PAGE_HEIGHT,
          backgroundColor: !item[0]?.chatBackground?.image
            ? item[0]?.chatBackground
            : 'white',
          width: width,
          alignSelf: extendedView
            ? undefined
            : isEven
            ? 'flex-end'
            : 'flex-start',
          marginTop: getPageMarginTop(
            bookSpecs?.title?.includes('Square'),
            extendedView,
            index == 0 || index == 1,
          ),
          paddingHorizontal: wp(5),
          paddingTop: wp(12),
          justifyContent: 'flex-start',
          marginLeft: getMarginLeft(isEven, extendedView),
          transform: [
            {scale: extendedView ? 0.4 : 0.85},
            {translateX: getTransformedData(isEven, extendedView)},
          ],
        },
        shadow && {
          shadowColor: 'black',
          shadowOffset: {
            width: wp(0.5),
            height: hp(2),
          },
          shadowOpacity: 0.9,
          shadowRadius: wp(2.5),
          elevation: 10,
        },
      ]}>
      {children}
    </ViewShot>
  );
};

export default PageContainer;
