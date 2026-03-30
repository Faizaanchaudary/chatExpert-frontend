import { apiClient } from './client';
import { AxiosResponse } from 'axios';

export interface ThemeConfigStored {
  themeId: string;
  schemaVersion: number;
  overrides: {
    dateFormat?: 'full' | 'timeOnly' | 'hidden';
    showPageNumbers?: boolean;
    senderLabelStyle?: 'name' | 'initial' | 'hidden';
  };
}

export interface PhotoBook {
  _id: string;
  userId: string;
  chatId: string;
  format: 'square_14x14' | 'standard_14_8x21';
  pageCount: number;
  basePrice: number;
  additionalPagesPrice: number;
  totalPrice: number;
  generatedPdfUrl?: string;
  previewUrl?: string;
  status: 'draft' | 'pdf_generated' | 'ordered' | 'completed';
  theme_config?: ThemeConfigStored | null;
  createdAt: string;
  updatedAt: string;
}

export interface GelatoOrder {
  _id: string;
  userId: string;
  photoBookId: string;
  orderReferenceId: string;
  gelatoOrderId: string;
  connectedOrderIds: string[];
  fulfillmentStatus: string;
  financialStatus: string;
  currency: string;
  shipmentMethod?: string;
  trackingCode?: string;
  trackingUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create a new photo book draft
 */
export function createPhotoBook(
  chatId: string,
  format: 'square_14x14' | 'standard_14_8x21',
  pageCount: number
): Promise<AxiosResponse<{ status: string; data: PhotoBook }>> {
  return apiClient.post('photobooks', {
    chatId,
    format,
    pageCount,
  });
}

/**
 * Generate PDF for photo book
 */
export function generatePhotoBookPdf(
  photoBookId: string
): Promise<AxiosResponse<{ status: string; data: { photoBook: PhotoBook; pdfUrl: string } }>> {
  return apiClient.post(`photobooks/${photoBookId}/generate-pdf`);
}

/**
 * Create Gelato order from photo book
 */
export function createGelatoOrder(
  photoBookId: string,
  shippingAddress: any,
  returnAddress?: any
): Promise<AxiosResponse<{ status: string; data: { gelatoOrder: GelatoOrder; previewUrl?: string; orderId: string } }>> {
  return apiClient.post(`photobooks/${photoBookId}/order`, {
    shippingAddress,
    returnAddress,
  });
}

/**
 * Get photo book by ID
 */
export function getPhotoBookById(
  photoBookId: string
): Promise<AxiosResponse<{ status: string; data: PhotoBook }>> {
  return apiClient.get(`photobooks/${photoBookId}`);
}

/**
 * Update theme config for photo book (saved before PDF generation).
 */
export function updatePhotoBookThemeConfig(
  photoBookId: string,
  theme_config: ThemeConfigStored
): Promise<AxiosResponse<{ status: string; data: PhotoBook }>> {
  return apiClient.patch(`photobooks/${photoBookId}`, { theme_config });
}

/**
 * Get user's photo books
 */
export function getUserPhotoBooks(
  page: number = 1,
  limit: number = 10
): Promise<AxiosResponse<{ status: string; data: PhotoBook[]; meta: any }>> {
  return apiClient.get('photobooks', {
    params: { page, limit },
  });
}

/**
 * Get order history
 */
export function getOrderHistory(
  page: number = 1,
  limit: number = 10
): Promise<AxiosResponse<{ status: string; data: GelatoOrder[]; meta: any }>> {
  return apiClient.get('orders/history', {
    params: { page, limit },
  });
}

/**
 * Get order by ID
 */
export function getOrderById(
  orderId: string
): Promise<AxiosResponse<{ status: string; data: GelatoOrder }>> {
  return apiClient.get(`orders/${orderId}`);
}
