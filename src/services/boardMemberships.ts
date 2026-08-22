import { ApiClient } from './api';

export type BoardMembershipStatus = 'not_requested' | 'pending' | 'approved' | 'rejected' | 'suspended';
export interface BoardMembership { status: BoardMembershipStatus; requestedAt: string | null; reviewedAt: string | null; reviewNote: string | null }
export interface BoardMembershipRequest { studentId: number; username: string; grade: number; classNo: number; schoolNumber: number; requestedAt: string }

export const boardMembershipService = {
  status() { return ApiClient.get<BoardMembership>('/board-memberships/status'); },
  request() { return ApiClient.post<{ status: BoardMembershipStatus }>('/board-memberships/request'); },
  pending() { return ApiClient.get<BoardMembershipRequest[]>('/board-memberships/admin/requests'); },
  review(studentId: number, decision: 'approved' | 'rejected', note = '') {
    return ApiClient.put<{ studentId: number; status: BoardMembershipStatus }>(`/board-memberships/admin/requests/${studentId}`, { decision, note });
  },
};
