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
}

interface SavedChatPayload {
  chat: IChat | null;
  messages: IMessage[];
}

const initialState: IChatState = {
  currentChat: null,
  draftChats: [],
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
  },
});

export const {
  saveCurrentChat,
  saveCurrentChatMessages,
  loadSavedChat,
  clearCurrentChat,
} = chatSlice.actions;
export default chatSlice.reducer;
