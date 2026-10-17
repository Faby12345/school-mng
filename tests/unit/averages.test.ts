import { describe, expect, it } from "vitest";

import {
  calculateAverage,
  calculateGeneralAverage,
  calculateSubjectAverage,
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

  it("calculates the final course average for the school year", () => {
    expect(calculateSubjectAverage([{ value: 10 }, { value: 8 }, { value: 7 }, { value: 9 }])).toBe(8.5);
  });

  it("calculates the general average from subject averages", () => {
    const subjects = [
      { average: 8.5 },
      { average: 7 },
    ];

    expect(calculateGeneralAverage(subjects)).toBe(7.75);
  });
});

