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
  return apiClient.get(`/messages/${chatId}`, { params: params || {limit: 2000} });
}

/**
 * Fetch ALL messages for a chat by paginating through all pages.
 * Safe for chats with any number of messages.
 */
export async function getAllMessagesByChat(chatId: string): Promise<IMessage[]> {
  const PAGE_SIZE = 2000;
  let page = 1;
  let allMessages: IMessage[] = [];

  try {
    while (true) {
      const response = await apiClient.get(`/messages/${chatId}`, {
        params: { page, limit: PAGE_SIZE },
      });
      
      const data = response.data?.data ?? response.data;
      const arr: IMessage[] = Array.isArray(data) ? data : [];
      
      allMessages = allMessages.concat(arr);

      const total: number = response.data?.meta?.total ?? 0;
      
      if (allMessages.length >= total || arr.length < PAGE_SIZE) {
        break;
      }
      page++;
    }

    return allMessages;
  } catch (error: any) {
    console.error('❌ [getAllMessagesByChat] Error:', error.message);
    throw error;
  }
}

export function bulkMessages(
  chatId: string,
  messages: MessagePayload[],
  onProgress?: (percent: number) => void,
): Promise<AxiosResponse<{ data: IMessage[] }>> {
  return apiClient.post(
    '/messages/bulk',
    {
      chatId: chatId,
      messages: messages,
    },
    {
      maxBodyLength: Infinity,
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    },
  );
}

interface MessagePayload {
  text: string;
  senderName: string;
  sendingTime: string; // '10:30 AM'
  date: string; // '12/12/2025'
  messageType: MessageType;
  url?: string; // Optional URL for media messages
}
