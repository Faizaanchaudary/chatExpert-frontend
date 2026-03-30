import { fireEvent, render, act } from "@testing-library/react-native";
import React from "react";
import EmailVerificationModal from "./../app/Components/EmailVerificationModal/index"; // Adjust the path

describe("EmailVerificationModal Component", () => {
  const mockOnChangeText = jest.fn();
  const mockConfirmOnPress = jest.fn();
  const mockSendAgain = jest.fn();
  const mockWithOutFeedback = jest.fn();

  afterEach(() => {
    jest.clearAllMocks(); // Clear any mock calls after each test
  });

  test("renders correctly when visible", () => {
    const { getByText } = render(
      <EmailVerificationModal
        visible={true}
        resendTime={30}
        value="123456"
        onChangeText={mockOnChangeText}
        confirmOnPress={mockConfirmOnPress}
        sendAgain={mockSendAgain}
      />
    );

    expect(getByText("Verify your Email")).toBeTruthy();
    expect(getByText("00:30 Sec")).toBeTruthy();
  });

  test("does not render when not visible", () => {
    const { queryByText } = render(
      <EmailVerificationModal
        visible={false}
        resendTime={30}
        value="123456"
        onChangeText={mockOnChangeText}
        confirmOnPress={mockConfirmOnPress}
        sendAgain={mockSendAgain}
      />
    );

    expect(queryByText("Verify your Email")).toBeNull();
  });

  test("handles code input change", () => {
    const { getByPlaceholderText } = render(
      <EmailVerificationModal
        visible={true}
        resendTime={30}
        value=""
        onChangeText={mockOnChangeText}
        confirmOnPress={mockConfirmOnPress}
        sendAgain={mockSendAgain}
      />
    );

    fireEvent.changeText(getByPlaceholderText("Code here"), "123456");
    expect(mockOnChangeText).toHaveBeenCalledWith("123456");
  });

  test("handles confirm button press", async () => {
    const { getByText } = render(
      <EmailVerificationModal
        visible={true}
        resendTime={30}
        value="123456"
        onChangeText={mockOnChangeText}
        confirmOnPress={mockConfirmOnPress}
        sendAgain={mockSendAgain}
      />
    );

    await act(async () => {
      fireEvent.press(getByText("confirm"));
    });

    expect(mockConfirmOnPress).toHaveBeenCalled();
  });

  test("handles resend code link when time reaches zero", async () => {
    const { getByText } = render(
      <EmailVerificationModal
        visible={true}
        resendTime={0}
        value="123456"
        onChangeText={mockOnChangeText}
        confirmOnPress={mockConfirmOnPress}
        sendAgain={mockSendAgain}
      />
    );

    await act(async () => {
      fireEvent.press(getByText("Send again"));
    });

    expect(mockSendAgain).toHaveBeenCalled();
  });

  test("does not show 'Send again' link when resendTime is greater than zero", () => {
    const { queryByText } = render(
      <EmailVerificationModal
        visible={true}
        resendTime={10}
        value="123456"
        onChangeText={mockOnChangeText}
        confirmOnPress={mockConfirmOnPress}
        sendAgain={mockSendAgain}
      />
    );

    expect(queryByText("Send again")).toBeNull();
  });
});
