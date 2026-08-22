import { ApiClient } from './api';

export type InquiryStatus = 'open' | 'answered' | 'closed';
export interface InquiryStudent { id: number; username: string; grade: number; classNo: number; schoolNumber: number }
export interface Inquiry {
  id: number;
  title: string;
  content: string;
  status: InquiryStatus;
  adminResponse: string | null;
  createdAt: string;
  updatedAt: string;
  respondedAt: string | null;
  student?: InquiryStudent;
}

export const inquiryService = {
  mine() { return ApiClient.get<Inquiry[]>('/inquiries/mine'); },
  create(title: string, content: string) { return ApiClient.post<{ id: number }>('/inquiries', { title, content }); },
  all() { return ApiClient.get<Inquiry[]>('/inquiries/admin'); },
  respond(id: number, response: string, close = false) { return ApiClient.put<{ id: number; status: InquiryStatus }>(`/inquiries/admin/${id}/response`, { response, close }); },
};
