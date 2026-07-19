export type FrequencyUnit = 'once' | 'month' | 'year' | 'day' | 'week';

export interface Frequency {
  interval: number; // e.g. 1, 2, 3...
  unit: FrequencyUnit;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string; // name of the lucide-react icon
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  startDate: string; // ISO 8601 YYYY-MM-DD
  frequency: Frequency;
  nextDate: string; // ISO 8601 YYYY-MM-DD
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
}

export interface CompletionHistory {
  id: string;
  reminderId: string;
  plannedDate: string; // The date it was scheduled for
  completionDate: string; // When it was actually done
}
