import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProblemList } from "./ProblemList";

describe("ProblemList", () => {
  it("says the question is ready when nothing is missing", () => {
    render(<ProblemList problems={[]} />);
    expect(screen.getByRole("status")).toHaveTextContent("Frågan är klar.");
  });

  it("lists what is missing", () => {
    render(<ProblemList problems={[{ message: "Ange resmålet." }, { message: "Lägg till minst en ledtråd." }]} />);
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "Ange resmålet.",
      "Lägg till minst en ledtråd.",
    ]);
  });
});
