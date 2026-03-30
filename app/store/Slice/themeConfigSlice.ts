/**
 * Theme config per photo book (project).
 * Persisted so theme selection and overrides are stored per project and can be synced to backend.
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ThemeConfigState, ThemeConfigOverrides } from '../../themes/types';

type ThemeConfigByProject = Record<string, ThemeConfigState>;

interface ThemeConfigSliceState {
  byPhotoBookId: ThemeConfigByProject;
  savingPhotoBookId: string | null;
}

const initialState: ThemeConfigSliceState = {
  byPhotoBookId: {},
  savingPhotoBookId: null,
};

const themeConfigSlice = createSlice({
  name: 'themeConfig',
  initialState,
  reducers: {
    setThemeConfigForProject: (
      state,
      action: PayloadAction<{ photoBookId: string; themeId: string; overrides?: ThemeConfigOverrides }>
    ) => {
      const { photoBookId, themeId, overrides = {} } = action.payload;
      state.byPhotoBookId[photoBookId] = {
        themeId,
        overrides: { ...state.byPhotoBookId[photoBookId]?.overrides, ...overrides },
      };
    },
    loadThemeConfigForProject: (
      state,
      action: PayloadAction<{ photoBookId: string; themeConfig: ThemeConfigState | null }>
    ) => {
      const { photoBookId, themeConfig } = action.payload;
      if (themeConfig) {
        state.byPhotoBookId[photoBookId] = themeConfig;
      }
    },
    setSavingTheme: (state, action: PayloadAction<string | null>) => {
      state.savingPhotoBookId = action.payload;
    },
  },
});

export const {
  setThemeConfigForProject,
  loadThemeConfigForProject,
  setSavingTheme,
} = themeConfigSlice.actions;
export default themeConfigSlice.reducer;
