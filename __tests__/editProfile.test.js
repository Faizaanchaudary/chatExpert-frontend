import { fireEvent, render, waitFor, act } from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import EditProfile from "./../app/screens/EditProfile/index"; // Adjust the path
import ImagePicker from "react-native-image-crop-picker";
import { updateProfile } from "./../app/services/calls"; // Adjust the path
import { onUpdate } from "./../app/store/Slice/userSlice"; // Adjust the path

jest.mock("react-native-image-crop-picker", () => ({
  openPicker: jest.fn(),
}));
jest.mock("react-native-keyboard-aware-scroll-view", () => {
  const KeyboardAwareScrollView = ({ children }) => children;
  return { KeyboardAwareScrollView };
});

jest.mock("./../app/services/calls", () => ({
  updateProfile: jest.fn(),
}));
jest.mock("./../app/store/Slice/userSlice", () => ({
  onUpdate: jest.fn(),
}));

const mockStore = configureStore([]);
const store = mockStore({
  user: {
    user: {
      _id: "1",
      email: "testuser@example.com",
      fullName: "Test User",
      phoneNumber: "1234567890",
      profilePictureUrl: "test-url.jpg",
      major: "Computer Science", // Add other expected fields here
    },
  },
});

describe("EditProfile Component", () => {
  const mockNavigation = {
    navigate: jest.fn(),
    dispatch: jest.fn(),
    goBack: jest.fn(),
  };

  test("renders the user's current profile information", () => {
    const { getByPlaceholderText } = render(
      <Provider store={store}>
        <EditProfile navigation={mockNavigation} />
      </Provider>
    );

    expect(getByPlaceholderText("testuser@example.com").props.placeholder).toBe(
      "testuser@example.com"
    );
    expect(getByPlaceholderText("Test User").props.placeholder).toBe(
      "Test User"
    );
    expect(getByPlaceholderText("1234567890").props.placeholder).toBe(
      "1234567890"
    );
  });

  test("displays an error message when trying to update without changes", async () => {
    const { getByText } = render(
      <Provider store={store}>
        <EditProfile navigation={mockNavigation} />
      </Provider>
    );

    await act(async () => {
      fireEvent.press(getByText("Update"));
    });

    jest.spyOn(Alert, "alert");
  });

  test("handles successful profile update", async () => {
    updateProfile.mockResolvedValue({
      status: 200,
      data: {
        user: {
          _id: "1",
          fullName: "Updated User",
          phoneNumber: "9876543210",
          profilePictureUrl: "new-test-url.jpg",
        },
      },
    });

    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <EditProfile navigation={mockNavigation} />
      </Provider>
    );

    await act(async () => {
      fireEvent.changeText(
        getByPlaceholderText("testuser@example.com"),
        "Updated User"
      );
      fireEvent.changeText(getByPlaceholderText("1234567890"), "9876543210");
      fireEvent.press(getByText("Update"));
    });
  });

  test("handles image selection", async () => {
    ImagePicker.openPicker.mockResolvedValue({
      path: "new-image-path.jpg",
    });

    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <EditProfile navigation={mockNavigation} />
      </Provider>
    );

    await act(async () => {
      fireEvent.press(getByTestId("cameraIcon"));
    });

    await waitFor(() => {
      expect(ImagePicker.openPicker).toHaveBeenCalled();
    });
  });

  test("displays an error message when the profile update fails", async () => {
    updateProfile.mockRejectedValue({
      response: { data: { error: "Update failed" } },
    });

    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <EditProfile navigation={mockNavigation} />
      </Provider>
    );

    await act(async () => {
      fireEvent.changeText(
        getByPlaceholderText("testuser@example.com"),
        "Updated User"
      );
      fireEvent.changeText(getByPlaceholderText("1234567890"), "9876543210");
      fireEvent.press(getByText("Update"));
    });
    jest.spyOn(Alert, "alert");
  });
});
