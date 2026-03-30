import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import LogIn from "../app/screens/LogIn/index"; // Adjust the path to the correct location of LogIn

jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    configure: jest.fn(),
    signOut: jest.fn(),
    signIn: jest.fn(),
  },
}));
jest.mock("@react-native-async-storage/async-storage", () => {});
jest.mock("react-native-keyboard-aware-scroll-view", () => {
  const KeyboardAwareScrollView = ({ children }) => children;
  return { KeyboardAwareScrollView };
});

// Create a mock store
const mockStore = configureStore([]);
const store = mockStore({});

describe("LogIn Component", () => {
  test("renders correctly", () => {
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <LogIn />
      </Provider>
    );

    // Check if the email input field is rendered
    expect(getByPlaceholderText("Email")).toBeTruthy();

    // Check if the password input field is rendered
    expect(getByPlaceholderText("Password")).toBeTruthy();

    // Check if the Sign In button is rendered
    expect(getByText("Sign in")).toBeTruthy();
  });
});

describe("LogIn Component", () => {
  const mockNavigation = { navigate: jest.fn(), dispatch: jest.fn() };

  test("handles Google Sign-In", async () => {
    GoogleSignin.signIn.mockResolvedValue({
      user: {
        email: "testuser@gmail.com",
        idToken: "test-token",
      },
    });

    const { getByText } = render(
      <Provider store={store}>
        <LogIn navigation={mockNavigation} />
      </Provider>
    );

    fireEvent.press(getByText("Continue with Google"));

    await waitFor(() => {
      expect(GoogleSignin.configure).toHaveBeenCalled();
      expect(GoogleSignin.signOut).toHaveBeenCalled();
      expect(GoogleSignin.signIn).toHaveBeenCalled();
    });
  });

  test("displays error message when email and password are empty", async () => {
    const { getByText } = render(
      <Provider store={store}>
        <LogIn navigation={mockNavigation} />
      </Provider>
    );

    fireEvent.press(getByText("Sign in"));

    jest.spyOn(Alert, "alert");
  });

  test("displays error message for invalid email", async () => {
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <LogIn navigation={mockNavigation} />
      </Provider>
    );

    fireEvent.changeText(getByPlaceholderText("Email"), "invalidemail");
    fireEvent.changeText(getByPlaceholderText("Password"), "password123");
    fireEvent.press(getByText("Sign in"));

    jest.spyOn(Alert, "alert");
  });

  test("displays error message for short password", async () => {
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <LogIn navigation={mockNavigation} />
      </Provider>
    );

    fireEvent.changeText(getByPlaceholderText("Email"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "123");
    fireEvent.press(getByText("Sign in"));

    jest.spyOn(Alert, "alert");
  });

  test("navigates to sign up screen", () => {
    const { getByText } = render(
      <Provider store={store}>
        <LogIn navigation={mockNavigation} />
      </Provider>
    );

    fireEvent.press(getByText("Sign up"));

    expect(mockNavigation.navigate).toHaveBeenCalledWith("CreateAccount");
  });

  test("navigates to lost password screen", () => {
    const { getByText } = render(
      <Provider store={store}>
        <LogIn navigation={mockNavigation} />
      </Provider>
    );

    fireEvent.press(getByText("Did you lost the password?"));

    expect(mockNavigation.navigate).toHaveBeenCalledWith("LostYourPassword");
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
        <LogIn navigation={mockNavigation} />
      </Provider>
    );

    fireEvent.press(getByText("Continue with Google"));

    await waitFor(() => {
      expect(GoogleSignin.configure).toHaveBeenCalled();
      expect(GoogleSignin.signOut).toHaveBeenCalled();
      expect(GoogleSignin.signIn).toHaveBeenCalled();
    });
  });

  test("handles successful login and navigation", async () => {
    const mockedNavigate = {
      navigate: jest.fn(),
      dispatch: jest.fn(),
      reset: jest.fn(),
    };

    const mockLoginResponse = {
      status: 200,
      data: { user: { id: 1, name: "Test User" }, token: "test-token" },
    };

    jest
      .spyOn(require("./../app/services/calls"), "login")
      .mockResolvedValue(mockLoginResponse);

    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <LogIn navigation={mockNavigation} />
      </Provider>
    );

    fireEvent.changeText(getByPlaceholderText("Email"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "password123");
    fireEvent.press(getByText("Sign in"));
  });
});
