import { fireEvent, render, waitFor, act } from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import CreateAccount from "./../app/screens/CreateAccount"; // Adjust the path
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { register } from "./../app/services/calls"; // Adjust the path
import { onLogin } from "./../app/store/Slice/userSlice"; // Adjust the path

jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    configure: jest.fn(),
    signOut: jest.fn(),
    signIn: jest.fn(),
  },
}));
jest.mock("react-native-keyboard-aware-scroll-view", () => {
  const KeyboardAwareScrollView = ({ children }) => children;
  return { KeyboardAwareScrollView };
});

jest.mock("./../app/services/calls", () => ({
  register: jest.fn(),
}));
jest.mock("./../app/store/Slice/userSlice", () => ({
  onLogin: jest.fn(),
}));

const mockStore = configureStore([]);
const store = mockStore({});

describe("CreateAccount Component", () => {
  const mockNavigation = { navigate: jest.fn(), dispatch: jest.fn() };

  test("displays error message when fields are empty", async () => {
    const { getByText } = render(
      <Provider store={store}>
        <CreateAccount navigation={mockNavigation} />
      </Provider>
    );

    await act(async () => {
      fireEvent.press(getByText("Sign up"));
    });

    jest.spyOn(Alert, "alert");
  });

  test("displays error message for invalid email", async () => {
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <CreateAccount navigation={mockNavigation} />
      </Provider>
    );

    await act(async () => {
      fireEvent.changeText(getByPlaceholderText("Name"), "Test User");
      fireEvent.changeText(getByPlaceholderText("Email"), "invalidemail");
      fireEvent.changeText(getByPlaceholderText("Password"), "password123");
      fireEvent.changeText(
        getByPlaceholderText("Confirm Password"),
        "password123"
      );
      fireEvent.press(getByText("Sign up"));
    });

    jest.spyOn(Alert, "alert");
  });

  test("handles successful registration", async () => {
    register.mockResolvedValue({
      status: 200,
      data: { user: { id: 1, name: "Test User" }, token: "test-token" },
    });

    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <CreateAccount navigation={mockNavigation} />
      </Provider>
    );

    await act(async () => {
      fireEvent.changeText(getByPlaceholderText("Name"), "Test User");
      fireEvent.changeText(getByPlaceholderText("Email"), "test@example.com");
      fireEvent.changeText(getByPlaceholderText("Password"), "Password124");
      fireEvent.changeText(
        getByPlaceholderText("Confirm Password"),
        "Password124"
      );

      fireEvent.press(getByText("Sign up"));
    });
  });

  test("handles Google Sign-In", async () => {
    GoogleSignin.signIn.mockResolvedValue({
      user: {
        email: "testuser@gmail.com",
        idToken: "test-token",
      },
    });

    const { getByText } = render(
      <Provider store={store}>
        <CreateAccount navigation={mockNavigation} />
      </Provider>
    );

    await act(async () => {
      fireEvent.press(getByText("Continue with Google"));
    });

    await waitFor(() => {
      expect(GoogleSignin.configure).toHaveBeenCalled();
      expect(GoogleSignin.signOut).toHaveBeenCalled();
      expect(GoogleSignin.signIn).toHaveBeenCalled();
    });
  });
});
