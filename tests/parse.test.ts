import { describe, expect, it } from "vitest";
import { paiseToInput, parsePercent, parseQty, parseRupees } from "@/lib/bill/parse";

describe("parseRupees", () => {
  it.each([
    ["850", 85000],
    ["850.5", 85050],
    ["850.05", 85005],
    ["0.1", 10],
    ["1,250.75", 125075],
    [" 850 ", 85000],
    ["850.", 85000],
  ])("%s -> %d paise", (input, paise) => expect(parseRupees(input)).toBe(paise));

  it.each(["", "abc", "8.505", "-5", "1e3", "12.3.4"])("rejects %s", (input) => expect(parseRupees(input)).toBeNull());

  it("never goes through floats: 0.29 is 29 paise, not 28.999…", () => {
    expect(parseRupees("0.29")).toBe(29);
    expect(parseRupees("1.15")).toBe(115);
  });
});

describe("parsePercent", () => {
  it.each([
    ["10", 10000],
    ["4.762", 4762],
    ["0.5", 500],
    ["100", 100000],
  ])("%s -> %d", (input, milli) => expect(parsePercent(input)).toBe(milli));

  it.each(["101", "4.7625", "-1", "x"])("rejects %s", (input) => expect(parsePercent(input)).toBeNull());
});

describe("parseQty and paiseToInput", () => {
  it("takes whole pieces only", () => {
    expect(parseQty("10")).toBe(10);
    expect(parseQty("1.5")).toBeNull();
    expect(parseQty("")).toBeNull();
  });

  it("shows paise back as typed", () => {
    expect(paiseToInput(85000)).toBe("850");
    expect(paiseToInput(85050)).toBe("850.50");
    expect(paiseToInput(5)).toBe("0.05");
  });
});
