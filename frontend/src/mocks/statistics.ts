import type { VisitedStatistics } from '@/types';
import { MOCK_CURRENT_USER_ID, MOCK_USER_IDS } from './ids';

export const mockVisitedStatisticsByUser: Record<string, VisitedStatistics> = {
  [MOCK_CURRENT_USER_ID]: {
    totalPlaces: 47,
    countries: ['Франция', 'Италия', 'Япония', 'Турция', 'Иордания', 'Таиланд'],
    countryCodes: ['FR', 'IT', 'JP', 'TR', 'JO', 'TH'],
    years: [2023, 2024, 2025],
  },
  [MOCK_USER_IDS.maria]: {
    totalPlaces: 31,
    countries: ['Чехия', 'Австрия', 'Италия', 'Франция'],
    countryCodes: ['CZ', 'AT', 'IT', 'FR'],
    years: [2023, 2024, 2025],
  },
  [MOCK_USER_IDS.dmitry]: {
    totalPlaces: 22,
    countries: ['Россия'],
    countryCodes: ['RU'],
    years: [2024, 2025],
  },
  [MOCK_USER_IDS.elena]: {
    totalPlaces: 28,
    countries: ['Россия', 'Турция'],
    countryCodes: ['RU', 'TR'],
    years: [2024, 2025],
  },
  [MOCK_USER_IDS.anna]: {
    totalPlaces: 35,
    countries: ['Испания', 'Нидерланды', 'Португалия', 'Германия'],
    countryCodes: ['ES', 'NL', 'PT', 'DE'],
    years: [2023, 2024, 2025],
  },
};

export const mockPublicVisitedStatistics: VisitedStatistics = {
  totalPlaces: 312,
  countries: [
    'Россия', 'Франция', 'Италия', 'Испания', 'Япония', 'Турция',
    'Чехия', 'Португалия', 'Индонезия', 'Грузия',
  ],
  countryCodes: ['RU', 'FR', 'IT', 'ES', 'JP', 'TR', 'CZ', 'PT', 'ID', 'GE'],
  years: [2023, 2024, 2025],
};
