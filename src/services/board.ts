import { ApiClient } from './api';

export interface BoardPostSummary {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  commentCount: number;
  isMine: boolean;
}

export interface BoardComment {
  id: number;
  content: string;
  createdAt: string;
  nickname: string;
  isMine: boolean;
}

export interface BoardPost extends BoardPostSummary { comments: BoardComment[] }

export interface BoardPage { posts: BoardPostSummary[]; page: number; total: number; hasMore: boolean }

export interface BoardAuthor {
  postId: number;
  student: { id: number; username: string; loginId: string; grade: number; classNo: number; schoolNumber: number };
}

export const boardService = {
  list(page = 1) { return ApiClient.get<BoardPage>(`/board?page=${page}&limit=20`); },
  get(id: number) { return ApiClient.get<BoardPost>(`/board/${id}`); },
  create(data: { title: string; content: string }) { return ApiClient.post<{ id: number }>('/board', data); },
  update(id: number, data: { title: string; content: string }) { return ApiClient.put<{ id: number }>(`/board/${id}`, data); },
  remove(id: number) { return ApiClient.delete<{ id: number }>(`/board/${id}`); },
  comment(id: number, content: string) { return ApiClient.post<{ id: number }>(`/board/${id}/comments`, { content }); },
  removeComment(id: number) { return ApiClient.delete<{ id: number }>(`/board/comments/${id}`); },
  revealAuthor(id: number, reason: string) { return ApiClient.post<BoardAuthor>(`/board/admin/posts/${id}/author`, { reason }); },
  moderateRemove(id: number, reason: string) {
    return ApiClient.request<{ id: number }>(`/board/admin/posts/${id}`, { method: 'DELETE', body: JSON.stringify({ reason }) });
  },
};
