/* Login Reducer
 * handles login states in the app
 */
import { createSlice } from "@reduxjs/toolkit";
import { store } from "../Store";

const initialState = {
  snackbarVisible: false,
  snackbarMessage: "",
  navigateTo: null,
  dateModifierVisible: false,
};

const snackBarSlice = createSlice({
  name: "snackbar",
  initialState,
  reducers: {
    enableSnackbar: (state, action) => {
      return {
        ...state,
        snackbarVisible: true,
        snackbarMessage: action.payload,
      };
    },
    disableSnackbar: (state) => {
      return {
        ...state,
        snackbarVisible: false,
        snackbarMessage: "",
      };
    },
    navigateTo: (state, action) => {
      return {
        ...state,
        navigateTo: action?.payload,
      };
    },
    setDateModifierVisible: (state, action) => {
      return {
        ...state,
        dateModifierVisible: action?.payload,
      };
    },
  },
});

export const {
  enableSnackbar,
  disableSnackbar,
  navigateTo,
  setDateModifierVisible,
} = snackBarSlice.actions;
export default snackBarSlice.reducer;
