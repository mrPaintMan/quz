import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LobbyScreen } from "./LobbyScreen";

describe("LobbyScreen", () => {
  it("shows the quiz, a QR code and the address to join at, and the teams so far", () => {
    render(<LobbyScreen quizTitle="Julquiz 2026" joinUrl={new URL("https://quz.nu/")} teams={[{ _id: "t1", name: "Tomtarna", colour: "red" }]} />);
    expect(screen.getByRole("heading", { level: 1, name: "Julquiz 2026" })).toBeInTheDocument();
    expect(screen.getByTitle("QR-kod till quz.nu")).toBeInTheDocument();
    expect(screen.getByText("quz.nu")).toBeInTheDocument();
    expect(screen.getByText("Tomtarna")).toBeInTheDocument();
  });

  it("waits for the first team", () => {
    render(<LobbyScreen quizTitle="Julquiz" joinUrl={new URL("http://localhost:3000/")} teams={[]} />);
    expect(screen.getByText("Väntar på första laget…")).toBeInTheDocument();
    expect(screen.getByText("localhost:3000")).toBeInTheDocument();
  });
});
