export type CategoryId = 'INT' | 'WLT' | 'VIT' | 'SOC' | 'EXP';

export interface Category {
  id: CategoryId;
  name: string;
  nameJa: string;
  description: string;
  color: string;
  icon: string;
}

