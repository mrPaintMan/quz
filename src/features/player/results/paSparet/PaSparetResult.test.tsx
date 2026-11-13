import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { OutcomePart } from "@/domain/answering/outcome";
import { PaSparetResult } from "./PaSparetResult";

const renderResult = (brakeClueIndex: number | null, result: OutcomePart["result"], points = 0) =>
  render(
    <PaSparetResult
      shown={{ type: "paSparet" }}
      answer={{ type: "paSparet", guess: "Kiruna", brakeClueIndex }}
      outcome={{ points, parts: [{ label: "", given: "Kiruna", result, correct: "", points }] }}
      imageUrls={{}}
      revealed={null}
      teamId="t1"
    />,
  );

describe("PaSparetResult", () => {
  it("lights a right guess up with the points it braked at", () => {
    renderResult(1, "right", 8);
    expect(screen.getByText("+8 p")).toBeInTheDocument();
    expect(screen.getByText("Bromsade vid 8 p")).toBeInTheDocument();
  });

  it("says when the guess waits for a verdict", () => {
    renderResult(1, "pending");
    expect(screen.getByText("Bedöms…")).toBeInTheDocument();
  });

  it("says when the team never pulled the brake", () => {
    renderResult(null, "wrong");
    expect(screen.getByText("Ni bromsade inte.")).toBeInTheDocument();
    expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
  });
});
