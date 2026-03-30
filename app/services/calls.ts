import { store } from "../store/Store";
import { apiClient } from "./client";

export function register(name: any, email: any, password: any) {
  return apiClient.post("user/register", {
    fullName: name,
    password: password,
    confirmPassword: password,
    email: email,
  });
}

export function login(email: any, password: any) {
  return apiClient.post("user/login", {
    email: email,
    password: password,
  });
}

export function forgotPassword(email: any, name: any) {
  return apiClient.post("user/forgot-password", {
    email: email,
    name: name,
  });
}

export function vertifyOtp(code: any, email: string) {
  return apiClient.post("user/verifyreset-password", {
    email: email,
    verificationCode: code,
  });
}

export function resetPassword(email: any, password: string) {
  return apiClient.post("user/reset-password", {
    email: email,
    password: password,
    confirmPassword: password,
  });
}

export function updateProfile(data: any) {
  return apiClient.put("user/updatePhoneAndProfilePicture", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function uploadContent(data: any) {
  return apiClient.post("upload/upload-content", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function getAddresses() {
  const user = store.getState().user?.user;
  return apiClient.get("api/v1/address");
}

export function removeAddress(addressId: any) {
  return apiClient.delete(`api/v1/address/${addressId}`);
}

export function addAddress(data: any) {
  const user = store.getState().user?.user;
  return apiClient.post("api/v1/address/add", data);
}
