import { apiClient } from './client';
import { AxiosResponse } from 'axios';

export interface ContactFormData {
  firstName: string;
  email: string;
  phoneNumber: string;
  reason?: string | null;
  message: string;
}

export interface ContactResponse {
  status: string;
  message: string;
  data: {
    id: string;
    submittedAt: string;
  };
}

/**
 * Submit contact us form
 */
export function submitContactForm(
  formData: ContactFormData
): Promise<AxiosResponse<ContactResponse>> {
  return apiClient.post('/contact', formData);
}