export type Grade = {
  id: string;
  value: number;
  assessment_type: string;
  graded_on: string;
  note: string | null;
  semester: 1 | 2;
  created_at: string;
};

export type Subject = {
  id: string;
  name: string;
  icon: string;
  color_token: string;
  sort_order: number;
  grades: Grade[];
};

