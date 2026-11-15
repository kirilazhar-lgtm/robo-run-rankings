import { describe, it, expect } from "vitest";
import { bestTimeOf, finalTimeOf, formatTimeInput, rank } from "./scoring";
describe("scoring", () => {
  it("vide ou 0 = 180s", () => expect(bestTimeOf(["", 0, ""])).toBe(180));
  it("best = min", () => expect(bestTimeOf(["90.5", "", "100"])).toBe(90.5));
  it("pénalité 20%", () => expect(finalTimeOf(100, true)).toBeCloseTo(120));
  it("tri croissant", () => expect(rank([{ finalTime: 5 } as any, { finalTime: 2 } as any])[0]?.finalTime).toBe(2));
  it("formatte la saisie en secondes.centisecondes", () => {
    expect(formatTimeInput("")).toBe("");
    expect(formatTimeInput("1")).toBe("0.01");
    expect(formatTimeInput("12345")).toBe("123.45");
    expect(formatTimeInput("90.5")).toBe("9.05");
    expect(formatTimeInput("1234567")).toBe("123.45");
  });
});
