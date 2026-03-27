export interface VocabEntry {
  id: string;
  word: string;
  translation: string;
  example?: string;
  known: boolean;
  createdAt: Date;
}
