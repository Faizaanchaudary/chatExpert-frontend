import {configureStore, combineReducers} from '@reduxjs/toolkit';
import userSlice from './Slice/userSlice';
import chatSlice from './Slice/chatSlice';
import snackbarSlice from './Slice/snackbarSlice';
import themeConfigSlice from './Slice/themeConfigSlice';

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';

// Persist config
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  blacklist: ['snackbar', 'temp'], // will not be persisted
};

// Combine all reducers
const rootReducer = combineReducers({
  user: userSlice,
  chats: chatSlice,
  snackbar: snackbarSlice,
  themeConfig: themeConfigSlice,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// ✅ Infer types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
