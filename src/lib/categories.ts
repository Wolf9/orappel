import { Category } from '../types';
import { readJsonFile, writeJsonFile } from './storage';

const FILE_NAME = 'categories.json';

export async function getCategories(): Promise<Category[]> {
  return readJsonFile<Category[]>(FILE_NAME, []);
}

export async function getCategory(id: string): Promise<Category | undefined> {
  const categories = await getCategories();
  return categories.find(c => c.id === id);
}

export async function saveCategory(category: Category): Promise<void> {
  const categories = await getCategories();
  const index = categories.findIndex(c => c.id === category.id);
  
  if (index >= 0) {
    categories[index] = category;
  } else {
    categories.push(category);
  }
  
  await writeJsonFile(FILE_NAME, categories);
}

export async function deleteCategory(id: string): Promise<void> {
  const categories = await getCategories();
  const filtered = categories.filter(c => c.id !== id);
  await writeJsonFile(FILE_NAME, filtered);
}
