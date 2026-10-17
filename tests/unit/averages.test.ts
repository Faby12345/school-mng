import { describe, expect, it } from "vitest";

import {
  calculateAverage,
  calculateGeneralAverage,
  calculateSubjectAverages,
  formatAverage,
} from "../../src/features/grades/calculations";

describe("grade averages", () => {
  it("divides the grade sum by the grade count", () => {
    expect(calculateAverage([10, 8, 7, 9, 6])).toBe(8);
  });

  it("returns no average for an empty grade list", () => {
    expect(calculateAverage([])).toBeNull();
    expect(formatAverage(null)).toBe("—");
  });

  it("calculates both semesters and the whole year", () => {
    expect(
      calculateSubjectAverages([
        { value: 10, semester: 1 },
        { value: 8, semester: 1 },
        { value: 7, semester: 2 },
        { value: 9, semester: 2 },
      ]),
    ).toEqual({ semester1: 9, semester2: 8, year: 8.5 });
  });

  it("calculates the general average from subject averages", () => {
    const subjects = [
      { averages: { semester1: 9, semester2: 8, year: 8.5 } },
      { averages: { semester1: 7, semester2: null, year: 7 } },
    ];

    expect(calculateGeneralAverage(subjects, "semester1")).toBe(8);
    expect(calculateGeneralAverage(subjects, "semester2")).toBe(8);
    expect(calculateGeneralAverage(subjects, "year")).toBe(7.75);
  });
});

