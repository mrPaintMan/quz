import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { ActionErrorProvider } from "@/features/host/shared/ActionErrorProvider";
import { AllAnswers, orderTeams } from "./AllAnswers";

type Teams = Parameters<typeof orderTeams>[0];

const all = vi.fn();
const asked = vi.fn();
const judgeText = vi.fn();
vi.mock("@/features/host/shared/useHostQuery", () => ({
  useHostQuery: (_query: unknown, args: unknown) => {
    asked(args);
    return args === "skip" ? undefined : all();
  },
}));
vi.mock("@/features/host/shared/useHostMutation", () => ({ useHostMutation: () => judgeText }));

const gameId = "game1" as Id<"games">;
const questionId = "q1" as Id<"questions">;
const slot = (title: string, options: string[]) => ({ title, answer: null, options, isOpen: false, names: [] });
const text = (written: string, extra = {}) => ({ slot: 0, text: written.toLowerCase(), written, isJudged: true, target: 0, isExact: false, byAi: false, result: "right", ...extra });
const team = (teamId: string, name: string, texts: ReturnType<typeof text>[], points = 0) => ({ teamId, name, colour: "red", hasAnswered: texts.length > 0, points, texts });

const saffron = {
  slots: [slot("", ["Saffran"])],
  teams: [
    team("t1", "Tomtarna", [text("Saffran", { isExact: true })], 1),
    team("t2", "Renarna", [text("Safrann", { isJudged: false, target: null, result: "pending" })]),
    team("t3", "Glöggarna", [text("Kanel", { target: null, byAi: true, result: "wrong" })]),
    team("t4", "Pepparkakorna", [text("Safrann", { isJudged: false, target: null, result: "pending" })]),
    team("t5", "Knäckarna", []),
  ],
};

function renderAll(leaderboard = ["t1", "t3", "t5", "t4", "t2"]) {
  render(
    <ActionErrorProvider>
      <AllAnswers gameId={gameId} questionId={questionId} prompt="Vilken krydda?" unjudged={1} leaderboard={leaderboard} />
    </ActionErrorProvider>,
  );
}
const open = () => userEvent.click(screen.getByRole("button", { name: "Visa alla svar" }));
const block = (name: string) => within(screen.getByRole("region", { name }));

describe("AllAnswers", () => {
  beforeEach(() => {
    all.mockReturnValue(saffron);
    asked.mockReset();
    judgeText.mockReset().mockResolvedValue(null);
  });

  it("reads the answers only once opened", async () => {
    renderAll();
    expect(asked).toHaveBeenLastCalledWith("skip");
    await open();
    expect(asked).toHaveBeenLastCalledWith({ gameId, questionId });
    expect(screen.getByRole("heading", { name: "Vilken krydda?" })).toBeInTheDocument();
    expect(screen.getByText("Facit: Saffran · 4 lag svarade, 1 svar kvar att granska")).toBeInTheDocument();
  });

  it("puts teams waiting for a verdict first, then the rest as the leaderboard ranks them", async () => {
    renderAll();
    await open();
    expect(screen.getAllByRole("region").map((region) => region.getAttribute("aria-label"))).toEqual(["Pepparkakorna", "Renarna", "Tomtarna", "Glöggarna", "Knäckarna"]);
  });

  it("shows each team's points, or Bedöms… while a text waits, and who didn't answer", async () => {
    renderAll();
    await open();
    expect(block("Tomtarna").getByText("1 p")).toBeInTheDocument();
    expect(block("Renarna").getByText("Bedöms…")).toBeInTheDocument();
    expect(block("Knäckarna").getByText("Svarade inte.")).toBeInTheDocument();
  });

  it("shows a text the key spells as Rätt, with nothing to judge (D72)", async () => {
    all.mockReturnValue({ ...saffron, teams: [...saffron.teams, team("t6", "Glöggkokarna", [text("Saffran", { isExact: true })], 1)] });
    renderAll();
    await open();
    expect(block("Tomtarna").getByText("Rätt")).toBeInTheDocument();
    expect(block("Tomtarna").queryByRole("button")).not.toBeInTheDocument();
    expect(block("Tomtarna").queryByText(/Gäller även/)).not.toBeInTheDocument();
  });

  it("offers Rätt and Fel on the AI's verdicts, marked, the hosts' own and the texts that wait", async () => {
    all.mockReturnValue({ ...saffron, teams: [...saffron.teams, team("t6", "Glöggkokarna", [text("Saffron")], 1)] });
    renderAll();
    await open();
    expect(block("Glöggarna").getByRole("button", { name: "Fel" })).toHaveAttribute("aria-pressed", "true");
    expect(block("Glöggarna").getByTitle("Bedömt av AI")).toBeInTheDocument();
    expect(block("Glöggkokarna").getByRole("button", { name: "Rätt" })).toHaveAttribute("aria-pressed", "true");
    expect(block("Glöggkokarna").queryByTitle("Bedömt av AI")).not.toBeInTheDocument();
    expect(block("Renarna").getByRole("button", { name: "Fel" })).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(block("Glöggarna").getByRole("button", { name: "Rätt" }));
    expect(judgeText).toHaveBeenCalledWith({ gameId, questionId, slot: 0, text: "kanel", target: 0 });
  });

  it("says which other teams a verdict also counts for", async () => {
    renderAll();
    await open();
    expect(block("Renarna").getByText("Gäller även Pepparkakorna")).toBeInTheDocument();
    expect(block("Tomtarna").queryByText(/Gäller även/)).not.toBeInTheDocument();
  });

  it("puts a sub-question's title before each text, and gives each sub-question's answer on top", async () => {
    all.mockReturnValue({ slots: [slot("a) Artist", ["ABBA"]), slot("b) Låt", ["Waterloo"])], teams: [team("t1", "Tomtarna", [text("ABBA"), text("Waterlo", { slot: 1 })])] });
    renderAll();
    await open();
    expect(block("Tomtarna").getByText("a) Artist ·")).toBeInTheDocument();
    expect(block("Tomtarna").getByText("b) Låt ·")).toBeInTheDocument();
    expect(screen.getByText(/^Facit: a\) Artist ABBA · b\) Låt Waterloo · /)).toBeInTheDocument();
  });

  it("says when a text is another form of one already counted", async () => {
    all.mockReturnValue({ slots: [slot("", ["Vodka"])], teams: [team("t1", "Tomtarna", [text("Vodka"), text("Wodka", { result: "repeat" })], 1)] });
    renderAll();
    await open();
    expect(within(block("Tomtarna").getByText("Wodka").closest("li")!).getByText("Räknas redan")).toBeInTheDocument();
  });

  it("gives an exact spelling of an item already counted no Rätt, as it scores nothing", async () => {
    all.mockReturnValue({ slots: [slot("", ["Vodka"])], teams: [team("t1", "Tomtarna", [text("Vodka", { isExact: true }), text("Wodka", { isExact: true, result: "repeat" })], 1)] });
    renderAll();
    await open();
    const wodka = within(block("Tomtarna").getByText("Wodka").closest("li")!);
    expect(wodka.getByText("Räknas redan")).toBeInTheDocument();
    expect(wodka.queryByText("Rätt")).not.toBeInTheDocument();
  });

  it("keeps the blocks in the order they opened in while the hosts judge", async () => {
    const { rerender } = render(
      <ActionErrorProvider>
        <AllAnswers gameId={gameId} questionId={questionId} prompt="Vilken krydda?" unjudged={1} leaderboard={["t1", "t3", "t5", "t4", "t2"]} />
      </ActionErrorProvider>,
    );
    await open();
    const before = screen.getAllByRole("region").map((region) => region.getAttribute("aria-label"));
    all.mockReturnValue({ ...saffron, teams: saffron.teams.map((each) => ({ ...each, texts: each.texts.map((one) => ({ ...one, isJudged: true })) })) });
    rerender(
      <ActionErrorProvider>
        <AllAnswers gameId={gameId} questionId={questionId} prompt="Vilken krydda?" unjudged={0} leaderboard={["t2", "t1", "t3", "t5", "t4"]} />
      </ActionErrorProvider>,
    );
    expect(screen.getAllByRole("region").map((region) => region.getAttribute("aria-label"))).toEqual(before);
  });

  it("says while the answers load, and closes", async () => {
    all.mockReturnValue(undefined);
    renderAll();
    await open();
    expect(screen.getByText("Hämtar svaren…")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Stäng ✕" }));
    expect(screen.queryByText("Hämtar svaren…")).not.toBeInTheDocument();
  });
});

describe("orderTeams", () => {
  it("puts teams missing from the leaderboard last", () => {
    const teams = [team("t9", "Nya", [text("Saffran")]), team("t1", "Tomtarna", [text("Saffran")])] as unknown as Teams;
    expect(orderTeams(teams, ["t1"]).map((each) => each.name)).toEqual(["Tomtarna", "Nya"]);
  });
});
