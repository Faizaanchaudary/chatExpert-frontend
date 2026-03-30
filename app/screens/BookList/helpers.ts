import {MESSAGE_PADDING_HORIZONTAL} from './constants';

export const getTextBubbleWidth = (
  text: string,
  maxWidth: number,
  fontSize: number,
) => {
  // Rough average character width in pixels (depends on font)
  const avgCharWidth = fontSize * 0.55;
  const estimatedWidth =
    text.length * avgCharWidth + MESSAGE_PADDING_HORIZONTAL * 2; // paddingHorizontal (12 * 2)
  return Math.min(estimatedWidth, maxWidth);
};
