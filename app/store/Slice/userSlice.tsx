/* Login Reducer
 * handles login states in the app
 */
import {createSlice} from '@reduxjs/toolkit';
import {IUser} from '../../interfaces/IUser';

//discuss
const initialState: {
  user?: IUser;
  token?: string | null;
  socialLogin: any;
  savedChats: Array<{id: string; chat: any}>;
  cartChats: Array<{id: string; chat: any; details?: any}>;
  currentAddress: any;
} = {
  // user: {
  //   _id: '',
  //   access_token: '',
  //   email: 'john@dummy.co',
  //   fullName: 'John Doe',
  //   phoneNumber: '+92343453343',
  //   profilePictureUrl: '',
  // },
  // token: 'abcdedfjskdfjdl',
  socialLogin: undefined,
  savedChats: [],
  cartChats: [],
  currentAddress: null,
};

const loginSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    onLogin: (state, action) => {
      return {
        ...state,
        user: action.payload,
        token: action?.payload?.access_token,
      };
    },
    onUpdate: (state, action) => {
      return {
        ...state,
        user: action.payload,
      };
    },
    setAddress: (state, action) => {
      return {
        ...state,
        currentAddress: action.payload,
      };
    },
    enableSocialLogin: state => {
      return {
        ...state,
        socialLogin: true,
      };
    },
    saveChat: (state, action) => {
      const {id, chat} = action.payload;
      const chatIndex = state.savedChats.findIndex(item => item.id === id);

      if (chatIndex !== -1) {
        // Update existing chat
        state.savedChats[chatIndex].chat = chat;
      } else {
        // Add new chat
        state.savedChats.push({id, chat});
      }
    },
    deleteChat: (state, action) => {
      const id = action.payload;
      // Filter out the chat with the matching id
      state.savedChats = state.savedChats.filter(item => item.id !== id);
    },

    addCart: (state, action) => {
      const {id, chat, details} = action.payload;
      const chatIndex = state.cartChats.findIndex(item => item.id === id);

      if (chatIndex !== -1) {
        // Update existing chat
        state.cartChats[chatIndex].chat = chat;
        // Also update details if provided
        if (details) {
          state.cartChats[chatIndex].details = details;
        }
      } else {
        // Add new chat
        state.cartChats.push({id, chat, details});
      }
    },
    setCart: (state, action) => {
      return {
        ...state,
        cartChats: action.payload,
      };
    },
    removeCart: (state, action) => {
      const id = action.payload;
      // Filter out the chat with the matching id
      state.cartChats = state.cartChats.filter(item => item.id !== id);
    },
    onLogout: state => {
      return {
        ...state,
        user: undefined,
        token: undefined,
        socialLogin: undefined,
      };
    },
  },
});

export const {
  onLogin,
  setCart,
  onLogout,
  onUpdate,
  enableSocialLogin,
  saveChat,
  deleteChat,
  addCart,
  removeCart,
  setAddress,
} = loginSlice.actions;
export default loginSlice.reducer;
