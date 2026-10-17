export type GradeForAverage = {
  value: number;
};

export function calculateAverage(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function calculateSubjectAverage(grades: readonly GradeForAverage[]): number | null {
  return calculateAverage(grades.map((grade) => grade.value));
}

export function calculateGeneralAverage(subjects: readonly { average: number | null }[]): number | null {
  const subjectAverages = subjects
    .map((subject) => subject.average)
    .filter((value): value is number => value !== null);

  return calculateAverage(subjectAverages);
}

export function formatAverage(value: number | null): string {
  return value === null ? "—" : value.toFixed(2);
}

