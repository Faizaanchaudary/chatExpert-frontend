import { fireEvent, render, waitFor, act } from "@testing-library/react-native";
import React from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import LostYourPassword from "./../app/screens/LostYourPassword"; // Adjust the path
import { forgotPassword, vertifyOtp } from "./../app/services/calls"; // Adjust the path

jest.mock("./../app/services/calls", () => ({
  forgotPassword: jest.fn(),
  vertifyOtp: jest.fn(),
}));

const mockStore = configureStore([]);
const store = mockStore({});

describe("LostYourPassword Component", () => {
  const mockNavigation = { navigate: jest.fn() };

  afterEach(() => {
    jest.clearAllMocks(); // Clear any mock calls after each test
  });

  test("displays error when fields are empty", async () => {
    const { getByText } = render(
      <Provider store={store}>
        <LostYourPassword navigation={mockNavigation} />
      </Provider>
    );

    await act(async () => {
      fireEvent.press(getByText("Continue"));
    });

    // Expect no calls to forgotPassword
    expect(forgotPassword).not.toHaveBeenCalled();
  });

  test("displays error when email is invalid", async () => {
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <LostYourPassword navigation={mockNavigation} />
      </Provider>
    );

    await act(async () => {
      fireEvent.changeText(getByPlaceholderText("Name"), "Test User");
      fireEvent.changeText(getByPlaceholderText("Email"), "invalidEmail");
      fireEvent.press(getByText("Continue"));
    });

    // Expect no calls to forgotPassword
    expect(forgotPassword).not.toHaveBeenCalled();
  });

  test("handles successful password reset request", async () => {
    forgotPassword.mockResolvedValue({ status: 200 });

    const { getByPlaceholderText, getByText, getByTestId } = render(
      <Provider store={store}>
        <LostYourPassword navigation={mockNavigation} />
      </Provider>
    );
    const button = getByTestId("continueButton");
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText("Name"), "Test User");
    });
    fireEvent.changeText(getByPlaceholderText("Email"), "test@example.com");
    fireEvent.press(getByTestId("continueButton"));
    fireEvent(button, "click");

    await expect(forgotPassword).toHaveBeenCalled();

    // });
  });

  test("handles failed password reset request", async () => {
    forgotPassword.mockRejectedValue({
      response: {
        data: { error: "Failed to send reset link" },
      },
    });

    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <LostYourPassword navigation={mockNavigation} />
      </Provider>
    );

    await act(async () => {
      fireEvent.changeText(getByPlaceholderText("Name"), "Test User");
      fireEvent.changeText(getByPlaceholderText("Email"), "test@example.com");
      fireEvent.press(getByText("Continue"));
    });
    fireEvent(getByText("Continue"), "click");

    await expect(forgotPassword).toHaveBeenCalled();
  });
});
