import { Reminder, CompletionHistory } from '../types';
import { readJsonFile, writeJsonFile } from './storage';
import { addDays, addWeeks, addMonths, addYears, format } from 'date-fns';

const FILE_NAME = 'reminders.json';

export async function getReminders(): Promise<Reminder[]> {
  return readJsonFile<Reminder[]>(FILE_NAME, []);
}

export async function getReminder(id: string): Promise<Reminder | undefined> {
  const reminders = await getReminders();
  return reminders.find(r => r.id === id);
}

export async function saveReminder(reminder: Reminder): Promise<void> {
  const reminders = await getReminders();
  const index = reminders.findIndex(r => r.id === reminder.id);
  
  if (index >= 0) {
    reminders[index] = { ...reminder, updatedAt: new Date().toISOString() };
  } else {
    reminders.push({
      ...reminder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  await writeJsonFile(FILE_NAME, reminders);
}

export async function deleteReminder(id: string): Promise<void> {
  const reminders = await getReminders();
  const filtered = reminders.filter(r => r.id !== id);
  await writeJsonFile(FILE_NAME, filtered);
}

export function calculateNextDate(currentNextDate: string, frequency: Reminder['frequency']): string {
  if (frequency.unit === 'once') {
    return currentNextDate; // should probably not be called for 'once' or just return same
  }

  const date = new Date(currentNextDate);
  let nextDate = date;

  switch (frequency.unit) {
    case 'day':
      nextDate = addDays(date, frequency.interval);
      break;
    case 'week':
      nextDate = addWeeks(date, frequency.interval);
      break;
    case 'month':
      nextDate = addMonths(date, frequency.interval);
      break;
    case 'year':
      nextDate = addYears(date, frequency.interval);
      break;
  }

  return format(nextDate, 'yyyy-MM-dd');
}
