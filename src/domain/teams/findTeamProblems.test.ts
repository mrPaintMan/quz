import { describe, expect, it } from "vitest";
import { findTeamProblems } from "./findTeamProblems";

const tomtarna = { name: "Tomtarna", colour: "red" as const };
const messagesFor = (...args: Parameters<typeof findTeamProblems>) => findTeamProblems(...args).map((problem) => problem.message);

describe("findTeamProblems", () => {
  it("lets a team join with a free name and colour", () => {
    expect(messagesFor({ name: "Nissarna", colour: "green" }, [tomtarna])).toEqual([]);
  });

  it("asks for a name", () => {
    expect(messagesFor({ name: "  ", colour: "green" }, [])).toEqual(["Skriv lagets namn."]);
  });

  it("refuses a name longer than 30 characters, not counting spaces around it", () => {
    expect(messagesFor({ name: ` ${"a".repeat(30)} `, colour: "green" }, [])).toEqual([]);
    expect(messagesFor({ name: "a".repeat(31), colour: "green" }, [])).toEqual(["Lagets namn får vara högst 30 tecken."]);
  });

  it("refuses a name another team has, whatever the case and spaces", () => {
    expect(messagesFor({ name: " tomtarna ", colour: "green" }, [tomtarna])).toEqual([
      "Ett annat lag heter redan så. Välj ett annat namn.",
    ]);
  });

  it("refuses a colour another team has", () => {
    expect(messagesFor({ name: "Nissarna", colour: "red" }, [tomtarna])).toEqual(["Ett annat lag har redan den färgen. Välj en annan."]);
  });
});
