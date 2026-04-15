/* Chat Reducer
 * handles chats
 */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IChat} from '../../interfaces/IChat';
import {IMessage} from '../../interfaces/IMessage';

interface IChatState {
  currentChat: IChat | null;
  chatMessages?: IMessage[];
  draftChats: IChat[];
  loadingMessages?: boolean;
  loadingMoreMessages?: boolean;
  loadingCurrentChat?: boolean;
  // NEW: Track book upload status per chat
  bookUploadStatus: {
    [chatId: string]: {
      [bookNumber: number]: {
        status: 'pending' | 'uploading' | 'completed' | 'failed';
        progress: number; // 0-100
        error?: string;
      };
    };
  };
  // NEW: Store messages per book
  bookMessages: {
    [chatId: string]: {
      [bookNumber: number]: IMessage[];
    };
  };
}

interface SavedChatPayload {
  chat: IChat | null;
  messages: IMessage[];
}

const initialState: IChatState = {
  currentChat: null,
  draftChats: [],
  bookUploadStatus: {},
  bookMessages: {},
  loadingMessages: false,
  loadingMoreMessages: false,
  loadingCurrentChat: false,
};

const chatSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    saveCurrentChat: (state, action: PayloadAction<IChat | null>) => {
      return {
        ...state,
        currentChat: action.payload,
        loadingCurrentChat: false,
      };
    },
    saveCurrentChatMessages: (state, action: PayloadAction<any[]>) => {
      return {
        ...state,
        chatMessages: action.payload,
        loadingMessages: false,
      };
    },
    loadSavedChat: (state, action: PayloadAction<SavedChatPayload>) => {
      return {
        ...state,
        currentChat: action.payload.chat,
        chatMessages: action.payload.messages,
        loadingCurrentChat: false,
        loadingMessages: false,
      };
    },
    clearCurrentChat: state => {
      return {
        ...state,
        currentChat: null,
        chatMessages: [],
      };
    },
    // NEW: Update book upload status
    updateBookUploadStatus: (
      state,
      action: PayloadAction<{
        chatId: string;
        bookNumber: number;
        status: 'pending' | 'uploading' | 'completed' | 'failed';
        progress: number;
        error?: string;
      }>
    ) => {
      const { chatId, bookNumber, status, progress, error } = action.payload;
      
      // Ensure the nested structure exists with proper initialization
      if (!state.bookUploadStatus) {
        state.bookUploadStatus = {};
      }
      if (!state.bookUploadStatus[chatId]) {
        state.bookUploadStatus[chatId] = {};
      }
      
      // Set the book status
      state.bookUploadStatus[chatId][bookNumber] = { 
        status, 
        progress, 
        ...(error ? { error } : {})
      };
    },
    // NEW: Append book messages
    appendBookMessages: (
      state,
      action: PayloadAction<{
        chatId: string;
        bookNumber: number;
        messages: IMessage[];
      }>
    ) => {
      const { chatId, bookNumber, messages } = action.payload;
      
      // Ensure the nested structure exists with proper initialization
      if (!state.bookMessages) {
        state.bookMessages = {};
      }
      if (!state.bookMessages[chatId]) {
        state.bookMessages[chatId] = {};
      }
      
      // Set the book messages
      state.bookMessages[chatId][bookNumber] = messages || [];
    },
    // NEW: Clear book data for a chat (for debugging)
    clearBookData: (
      state,
      action: PayloadAction<{ chatId: string }>
    ) => {
      const { chatId } = action.payload;
      
      if (state.bookUploadStatus && state.bookUploadStatus[chatId]) {
        delete state.bookUploadStatus[chatId];
      }
      
      if (state.bookMessages && state.bookMessages[chatId]) {
        delete state.bookMessages[chatId];
      }
    },
  },
});

export const {
  saveCurrentChat,
  saveCurrentChatMessages,
  loadSavedChat,
  clearCurrentChat,
  updateBookUploadStatus,
  appendBookMessages,
  clearBookData,
} = chatSlice.actions;
export default chatSlice.reducer;
