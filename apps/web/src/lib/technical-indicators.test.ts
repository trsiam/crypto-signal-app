import { describe, expect, it } from "vitest";

import {
  calculateEma,
  calculateMacd,
  calculateRsi,
  calculateSma,
} from "./technical-indicators";

describe("calculateSma", () => {
  it("returns an array of the same length as the input", () => {
    const values = [1, 2, 3, 4, 5];

    const result = calculateSma(values, 3);

    expect(result).toHaveLength(values.length);
  });

  it("keeps values before a complete window as null", () => {
    const result = calculateSma([1, 2, 3, 4, 5], 3);

    expect(result.slice(0, 2)).toEqual([null, null]);
  });

  it("computes the first complete SMA value correctly", () => {
    const result = calculateSma([1, 2, 3, 4, 5], 3);

    expect(result[2]).toBe(2);
  });

  it("computes later SMA values correctly", () => {
    const result = calculateSma([1, 2, 3, 4, 5], 3);

    expect(result[3]).toBe(3);
    expect(result[4]).toBe(4);
  });
});

describe("calculateRsi", () => {
  it("returns an array with the same length as the input", () => {
    const values = [1, 2, 3, 4, 5, 6];

    const result = calculateRsi(values, 3);

    expect(result).toHaveLength(values.length);
  });

  it("keeps leading values before enough data as null", () => {
    const result = calculateRsi([1, 2, 3, 4, 5, 6], 3);

    expect(result.slice(0, 3)).toEqual([null, null, null]);
  });

  it("returns 100 for a steadily increasing series", () => {
    const result = calculateRsi([1, 2, 3, 4, 5, 6], 3);

    expect(result[3]).toBe(100);
    expect(result[4]).toBe(100);
    expect(result[5]).toBe(100);
  });

  it("returns 0 for a steadily decreasing series", () => {
    const result = calculateRsi([6, 5, 4, 3, 2, 1], 3);

    expect(result[3]).toBe(0);
    expect(result[4]).toBe(0);
    expect(result[5]).toBe(0);
  });
});

describe("calculateEma", () => {
  it("returns an array with the same length as the input", () => {
    const values = [1, 2, 3, 4, 5];

    const result = calculateEma(values, 3);

    expect(result).toHaveLength(values.length);
  });

  it("keeps initial values null until the EMA is initialized", () => {
    const result = calculateEma([1, 2, 3, 4, 5], 3);

    expect(result.slice(0, 2)).toEqual([null, null]);
  });

  it("computes the first initialized EMA value correctly", () => {
    const result = calculateEma([1, 2, 3, 4, 5], 3);

    expect(result[2]).toBe(2);
  });

  it("follows the recursive EMA formula for later values", () => {
    const result = calculateEma([1, 2, 3, 4, 5], 3);

    expect(result[3]).toBeCloseTo(3);
    expect(result[4]).toBeCloseTo(4);
  });
});

describe("calculateMacd", () => {
  it("returns an array with the same length as the input", () => {
    const values = [1, 2, 3, 4, 5, 6];

    const result = calculateMacd(values, 2, 3, 2);

    expect(result).toHaveLength(values.length);
  });

  it("returns objects with macd, signal, and histogram properties", () => {
    const result = calculateMacd([1, 2, 3, 4, 5, 6], 2, 3, 2);

    expect(result[0]).toEqual({
      macd: null,
      signal: null,
      histogram: null,
    });
  });

  it("makes MACD values available only after enough history", () => {
    const result = calculateMacd([1, 2, 3, 4, 5, 6], 2, 3, 2);

    expect(result[0].macd).toBeNull();
    expect(result[1].macd).toBeNull();
    expect(result[2].macd).toBeCloseTo(0.5);
    expect(result[3].macd).toBeCloseTo(0.5);
  });

  it("computes signal values according to the implementation", () => {
    const result = calculateMacd([1, 2, 3, 4, 5, 6], 2, 3, 2);

    expect(result[2].signal).toBeNull();
    expect(result[3].signal).toBeCloseTo(0.5);
    expect(result[4].signal).toBeCloseTo(0.5);
    expect(result[5].signal).toBeCloseTo(0.5);
  });

  it("sets histogram to macd minus signal within floating-point tolerance", () => {
    const result = calculateMacd([1, 2, 3, 4, 5, 6], 2, 3, 2);

    result.forEach((point) => {
      if (point.macd === null || point.signal === null) {
        expect(point.histogram).toBeNull();
        return;
      }

      expect(point.histogram).toBeCloseTo(point.macd - point.signal);
    });
  });
});
