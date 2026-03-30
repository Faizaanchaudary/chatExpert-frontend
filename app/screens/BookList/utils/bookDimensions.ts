import { Dimensions } from 'react-native';

export interface BookDimensions {
  pageWidth: number;
  pageHeight: number;
  spreadWidth: number;
  spreadHeight: number;
  spineWidth: number;
  aspectRatio: number;
  isSquare: boolean;
}

export interface BookSpec {
  price: string;
  title: string;
  dimensions: string;
}

const SPINE_WIDTH_RATIO = 0.04; // 4% of spread width
const SCREEN_WIDTH_RATIO = 0.95; // Use 95% of screen width
const MAX_HEIGHT_RATIO = 0.7; // Max 70% of screen height

/**
 * Parse dimension string like "13 x 20 cm" into width and height numbers
 */
export function parseDimensions(dimensionStr: string): { width: number; height: number } {
  const match = dimensionStr.match(/(\d+)\s*x\s*(\d+)/i);
  if (!match) {
    // Default to square if parsing fails
    return { width: 17, height: 17 };
  }
  return {
    width: parseInt(match[1], 10),
    height: parseInt(match[2], 10),
  };
}

/**
 * Calculate book dimensions scaled to fit the screen
 */
export function getBookDimensions(
  screenWidth: number,
  screenHeight: number,
  bookSpec: BookSpec
): BookDimensions {
  const { width: widthCm, height: heightCm } = parseDimensions(bookSpec.dimensions);
  const isSquare = widthCm === heightCm;

  // Calculate available space
  const availableWidth = screenWidth * SCREEN_WIDTH_RATIO;
  const availableHeight = screenHeight * MAX_HEIGHT_RATIO;

  // Calculate spread dimensions (2 pages + spine)
  // Spread width in cm = 2 * pageWidth + spineWidth
  const spreadWidthCm = widthCm * 2 * (1 + SPINE_WIDTH_RATIO);
  const spreadAspectRatio = heightCm / spreadWidthCm;

  // Start with available width
  let spreadWidth = availableWidth;
  let spreadHeight = spreadWidth * spreadAspectRatio;

  // If height exceeds available, scale down
  if (spreadHeight > availableHeight) {
    spreadHeight = availableHeight;
    spreadWidth = spreadHeight / spreadAspectRatio;
  }

  // Calculate individual component dimensions
  const spineWidth = spreadWidth * SPINE_WIDTH_RATIO;
  const pageWidth = (spreadWidth - spineWidth) / 2;
  const pageHeight = spreadHeight;

  return {
    pageWidth,
    pageHeight,
    spreadWidth,
    spreadHeight,
    spineWidth,
    aspectRatio: heightCm / widthCm,
    isSquare,
  };
}

/**
 * Get book dimensions using current screen size
 */
export function useBookDimensions(bookSpec: BookSpec): BookDimensions {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  return getBookDimensions(screenWidth, screenHeight, bookSpec);
}
