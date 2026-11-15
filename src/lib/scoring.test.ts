import { describe, it, expect } from "vitest";
import { bestTimeOf, finalTimeOf, formatTimeInput, rank } from "./scoring";
describe("scoring", () => {
  it("vide ou 0 = 180s", () => expect(bestTimeOf(["", 0, ""])).toBe(180));
  it("best = min", () => expect(bestTimeOf(["90.5", "", "100"])).toBe(90.5));
  it("pénalité 20%", () => expect(finalTimeOf(100, true)).toBeCloseTo(120));
  it("tri croissant", () => expect(rank([{ finalTime: 5 } as any, { finalTime: 2 } as any])[0]?.finalTime).toBe(2));
  it("nettoie la saisie sans déplacer le point", () => {
    expect(formatTimeInput("")).toBe("");
    expect(formatTimeInput("40.2")).toBe("40.2");
    expect(formatTimeInput("402")).toBe("402");
    expect(formatTimeInput("40,25")).toBe("40.25");
    expect(formatTimeInput("40.256")).toBe("40.25");
    expect(formatTimeInput("12.3.4")).toBe("12.34");
    expect(formatTimeInput("1234")).toBe("123");
  });
});
