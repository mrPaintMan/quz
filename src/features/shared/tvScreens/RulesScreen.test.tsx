import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RulesScreen } from "./RulesScreen";

describe("RulesScreen", () => {
  it("shows the rules and the evening's overview", () => {
    render(<RulesScreen roundCount={5} questionCount={20} activityCount={2} />);
    expect(screen.getByText("Svara i mobilen")).toBeInTheDocument();
    expect(screen.getByText("Tomtefar och tomtemor dömer")).toBeInTheDocument();
    const overview = screen.getByRole("region", { name: "Kvällens upplägg" });
    expect(overview).toHaveTextContent("5omgångar");
    expect(overview).toHaveTextContent("20frågor");
    expect(overview).toHaveTextContent("2aktiviteter");
  });

  it("uses the singular for one", () => {
    render(<RulesScreen roundCount={1} questionCount={1} activityCount={1} />);
    expect(screen.getByRole("region", { name: "Kvällens upplägg" })).toHaveTextContent("1omgång1fråga1aktivitet");
  });
});
