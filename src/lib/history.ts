import { CompletionHistory } from '../types';
import { readJsonFile, writeJsonFile } from './storage';
import { getReminder, saveReminder, calculateNextDate } from './reminders';

const FILE_NAME = 'history.json';

export async function getHistory(): Promise<CompletionHistory[]> {
  return readJsonFile<CompletionHistory[]>(FILE_NAME, []);
}

export async function getReminderHistory(reminderId: string): Promise<CompletionHistory[]> {
  const history = await getHistory();
  return history.filter(h => h.reminderId === reminderId);
}

export async function completeReminder(reminderId: string, completionDate: string): Promise<void> {
  const reminder = await getReminder(reminderId);
  if (!reminder) throw new Error('Reminder not found');

  const history = await getHistory();
  
  const completionRecord: CompletionHistory = {
    id: Date.now().toString(),
    reminderId,
    plannedDate: reminder.nextDate,
    completionDate
  };
  
  history.push(completionRecord);
  await writeJsonFile(FILE_NAME, history);

  // Update reminder's nextDate if it's recurring
  if (reminder.frequency.unit !== 'once') {
    // Requirements say "Nouvelle échéance : 20 janvier année suivante" based on original date
    // Actually the prompt says: 
    // "Vidange. Prévue : 10 janvier. Effectuée : 20 janvier. Nouvelle échéance : 20 janvier année suivante"
    // Wait, the prompt implies the new due date is based on the *completion date*!
    // Let's recalculate based on completionDate.
    reminder.nextDate = calculateNextDate(completionDate, reminder.frequency);
    await saveReminder(reminder);
  } else {
    // If it's a one-off, maybe we can delete it or just leave it. Leaving it is safer.
  }
}
