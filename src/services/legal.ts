import { ApiClient } from './api';

export const legalService = {
  status() { return ApiClient.get<{ agreed: boolean; version: string }>('/legal/consent-status'); },
  accept() { return ApiClient.post<{ agreed: boolean; version: string }>('/legal/consent', {
    serviceTerms: true, privacyPolicy: true, anonymousBoardNotice: true, ageOrGuardianConfirmed: true,
  }); },
};
