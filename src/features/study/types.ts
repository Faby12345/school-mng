export type StudyFlashcard = {
  id: string;
  question: string;
  answer: string;
  source: "manual" | "generated";
  created_at: string;
  updated_at: string;
};

export type StudyTopic = {
  id: string;
  title: string;
  notes: string;
  updated_at: string;
  flashcards: { id: string }[];
};

export type StudySubject = {
  id: string;
  name: string;
  icon: string;
  color_token: string;
  lessons: Array<{
    id: string;
    flashcards: { id: string }[];
  }>;
};
