export type GradeForAverage = {
  value: number;
  semester: 1 | 2;
};

export type AverageSummary = {
  semester1: number | null;
  semester2: number | null;
  year: number | null;
};

export function calculateAverage(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function calculateSubjectAverages(grades: readonly GradeForAverage[]): AverageSummary {
  return {
    semester1: calculateAverage(grades.filter((grade) => grade.semester === 1).map((grade) => grade.value)),
    semester2: calculateAverage(grades.filter((grade) => grade.semester === 2).map((grade) => grade.value)),
    year: calculateAverage(grades.map((grade) => grade.value)),
  };
}

export function calculateGeneralAverage(
  subjects: readonly { averages: AverageSummary }[],
  period: keyof AverageSummary,
): number | null {
  const subjectAverages = subjects
    .map((subject) => subject.averages[period])
    .filter((value): value is number => value !== null);

  return calculateAverage(subjectAverages);
}

export function formatAverage(value: number | null): string {
  return value === null ? "—" : value.toFixed(2);
}

