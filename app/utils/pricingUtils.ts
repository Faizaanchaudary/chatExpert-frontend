/**
 * Pricing utility based on the business document
 * Handles dynamic pricing for different formats and page counts
 */

// Pricing tables from the document
const PRICING_TABLES = {
  // Photobook (Softcover 140x140mm) - corresponds to square_14x14
  photobook_140x140: {
    28: 8.79,
    30: 9.02,
    32: 9.25,
    50: 13.00,
    200: 28.38,
  },
  // A6 Brochure (Glued Multi-page) - could be used for smaller format
  brochure_a6: {
    30: 8.82,
    32: 10.29,
    200: 17.64,
  },
  // A5 Brochure (Glued Multi-page) - corresponds to standard_14_8x21
  brochure_a5: {
    30: 10.70,
    32: 10.85,
    200: 23.28,
  },
};

/**
 * Get base price for a specific format and page count
 */
export const getBasePrice = (format: string, pageCount: number): number => {
  // Ensure minimum 30 pages for pricing
  const actualPageCount = Math.max(30, pageCount);
  
  let priceTable;
  
  // Map format to pricing table
  switch (format) {
    case 'square_14x14':
      priceTable = PRICING_TABLES.photobook_140x140;
      break;
    case 'standard_14_8x21':
      priceTable = PRICING_TABLES.brochure_a5;
      break;
    default:
      priceTable = PRICING_TABLES.photobook_140x140;
  }

  // Find the closest page count in the table
  const availablePageCounts = Object.keys(priceTable).map(Number).sort((a, b) => a - b);
  
  // If exact match exists, return it
  if (priceTable[actualPageCount as keyof typeof priceTable]) {
    return priceTable[actualPageCount as keyof typeof priceTable];
  }
  
  // Find the appropriate price range
  let basePageCount = 30;
  let basePrice = priceTable[30];
  
  for (const count of availablePageCounts) {
    if (actualPageCount >= count) {
      basePageCount = count;
      basePrice = priceTable[count as keyof typeof priceTable];
    } else {
      break;
    }
  }
  
  // If actualPageCount is higher than base, calculate additional cost
  if (actualPageCount > basePageCount) {
    const nextPageCount = availablePageCounts.find(count => count > basePageCount);
    if (nextPageCount) {
      const nextPrice = priceTable[nextPageCount as keyof typeof priceTable];
      const pricePerPage = (nextPrice - basePrice) / (nextPageCount - basePageCount);
      const additionalPages = actualPageCount - basePageCount;
      return basePrice + (additionalPages * pricePerPage);
    }
  }
  
  return basePrice;
};

/**
 * Get format display information
 */
export const getFormatInfo = (format: string) => {
  switch (format) {
    case 'square_14x14':
      return {
        title: 'Square Book',
        dimensions: '14 x 14 cm',
        description: 'Photobook (Softcover 140x140mm)',
      };
    case 'standard_14_8x21':
      return {
        title: 'Standard Book',
        dimensions: '14.8 x 21 cm',
        description: 'A5 Brochure (Glued Multi-page)',
      };
    default:
      return {
        title: 'Photo Book',
        dimensions: '14 x 14 cm',
        description: 'Standard format',
      };
  }
};

/**
 * Calculate total price with any additional costs
 */
export const calculateTotalPrice = (format: string, pageCount: number): number => {
  // Ensure minimum 30 pages for pricing
  const actualPageCount = Math.max(30, pageCount);
  const basePrice = getBasePrice(format, actualPageCount);
  // Round up to one decimal as per document requirement
  return Math.ceil(basePrice * 10) / 10;
};