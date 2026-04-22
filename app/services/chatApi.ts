import { IItem } from '../interfaces/api-responses/IItem';
import { IChat } from '../interfaces/IChat';
import { IMessage, MessageType } from '../interfaces/IMessage';
import { Message } from '../screens/BookList/types';
import { apiClient } from './client';
import { AxiosError, AxiosResponse } from 'axios';

export function createChat(payload: {
  platform?: string;
  author: string;
  bookConfig: any;
}): Promise<AxiosResponse<{ status: string; data: IChat }>> {
  return apiClient.post('/chats', {
    platform: payload.platform || 'whatsapp',
    author: payload.author,
    bookConfig: payload.bookConfig,
  });
}

export function uploadChatMedia(chatId: string, formData: FormData, onProgress?: (percent: number) => void) {
  return apiClient.post(`/chats/${chatId}/media`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    maxBodyLength: Infinity,
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });
}

export function getChat(chatId: string) {
  return apiClient.get(`/chats/${chatId}`);
}

/**
 * Get messages for a chat (for preview). Use high limit to fetch all for book preview.
 */
export function getMessagesByChat(
  chatId: string,
  params?: { page?: number; limit?: number }
): Promise<AxiosResponse<{ status: string; data: IMessage[]; meta?: { total: number } }>> {
  return apiClient.get(`/messages/${chatId}`, { params: params || { limit: 2000 } });
}

export function bulkMessages(
  chatId: string,
  messages: MessagePayload[],
): Promise<AxiosResponse<{ data: IMessage[] }>> {
  return apiClient.post('/messages/bulk', {
    chatId: chatId,
    messages: messages,
  });
}

interface MessagePayload {
  text: string;
  senderName: string;
  sendingTime: string; // '10:30 AM'
  date: string; // '12/12/2025'
  messageType: MessageType;
  url?: string; // Optional URL for media messages
}
