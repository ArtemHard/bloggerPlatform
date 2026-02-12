export enum Resolution {
  P144 = 'P144',
  P240 = 'P240',
  P360 = 'P360',
  P480 = 'P480',
  P720 = 'P720',
  P1080 = 'P1080',
  P1440 = 'P1440',
  P2160 = 'P2160'
}

export interface Video {
  id: number;
  title: string;
  author: string;
  canBeDownloaded: boolean; // По умолчанию false
  minAgeRestriction: number | null; // От 1 до 18, по умолчанию null (нет ограничения)
  createdAt: string; // Формат: date-time
  publicationDate: string; // Формат: date-time, по умолчанию +1 день от createdAt
  availableResolutions: Resolution[]; // Массив разрешений
}


