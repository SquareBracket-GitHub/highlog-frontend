import { ApiClient } from './api';

export interface PersonalTimetableEntry {
  id: number;
  day: string;
  period: number;
  subjectName: string;
  className: string;
  color: string;
}

export type SavePersonalTimetableEntry = Omit<PersonalTimetableEntry, 'id'>;

export const personalTimetableService = {
  getMine() {
    return ApiClient.get<PersonalTimetableEntry[]>('/personal-timetables/me');
  },
  save(entry: SavePersonalTimetableEntry) {
    return ApiClient.put<PersonalTimetableEntry>('/personal-timetables/me', entry);
  },
  remove(day: string, period: number) {
    return ApiClient.delete<{ day: string; period: number }>(
      `/personal-timetables/me/${encodeURIComponent(day)}/${period}`
    );
  },
};
