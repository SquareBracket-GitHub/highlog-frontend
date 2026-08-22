import { ApiClient } from './api';

export interface MealDish {
  name: string;
  allergens: string[];
}

export interface Meal {
  type: string;
  date: string;
  dishes: MealDish[];
  calories: string;
  nutrition: string;
  origin: string;
}

export interface MealsByDate {
  date: string;
  meals: Meal[];
  fetchedAt: string;
  cached: boolean;
}

export const mealService = {
  getByDate(date: string) {
    return ApiClient.get<MealsByDate>(`/meals?date=${encodeURIComponent(date)}`);
  },
};
