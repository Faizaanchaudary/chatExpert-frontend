import {Dimensions} from 'react-native';

import {hp, wp} from './reponsiveness';
const {width, height} = Dimensions.get('window');

// Improved positioning calculations that work consistently across devices
export const getPageMarginTop = (
  isSquare: boolean,
  isExtended: boolean,
  isFirstRow: boolean,
) => {
  if (isExtended) {
    // In extended view, use consistent spacing regardless of book type
    // Add device-specific adjustment for very small or very large screens
    const baseMargin = isFirstRow ? hp(8) : hp(2);
    const deviceAdjustment = height < 600 ? hp(-1) : height > 900 ? hp(1) : 0;
    return baseMargin + deviceAdjustment;
  } else {
    // In normal view, adjust for book type
    const baseMargin = isSquare ? hp(4) : hp(2.5);
    const deviceAdjustment =
      height < 600 ? hp(-0.5) : height > 900 ? hp(0.5) : 0;
    return baseMargin + deviceAdjustment;
  }
};

export const getElementTop = (
  isSquare: boolean,
  isExtended: boolean,
  isFirstRow: boolean,
) => {
  // Use the same logic as page margin for consistency
  return getPageMarginTop(isSquare, isExtended, isFirstRow);
};

export const getPageHeight = (
  isExtended: boolean,
  bookType: 'square' | 'standard',
) => {
  if (isExtended) {
    // In extended view, use more conservative height to prevent overflow
    return '85%';
  } else {
    return bookType === 'square' ? '88%' : '95%';
  }
};

export const getTransformedData = (isEven: boolean, isExtended: boolean) => {
  if (isExtended) {
    return isEven ? -wp(30) : -wp(47.5);
  }
  return isEven ? wp(5) : -wp(5);
};

export const getMarginLeft = (isEven: boolean, isExtended: boolean) => {
  if (isExtended) {
    return isEven ? -wp(8.75) : -wp(52.5);
  }
  return isEven ? 0 : -wp(5);
};

export const getRightForLine = (isEven: boolean, isExtended: boolean) => {
  if (isExtended) {
    return isEven ? wp(50.5) : width - wp(1.25);
  }
  return isEven ? wp(0.75) : width - wp(1.25);
};

export const getRightForGreyLine = (isEven: boolean, isExtended: boolean) => {
  if (isExtended) {
    return isEven ? wp(48.25) : width - wp(1.25);
  }
  return isEven ? -wp(1.25) : width - wp(2.5);
};
