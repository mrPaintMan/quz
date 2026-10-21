import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { VideoPreview } from "./VideoPreview";

// The still's URL comes from a query; the film's signed link from a mutation, only on play.
const stillUrls: Record<string, string | null> = { still: "https://still.example", gone: null };
vi.mock("@/features/host/shared/useHostQuery", () => ({
  useHostQuery: (_query: unknown, args: { storageId: string } | "skip") => (args === "skip" ? undefined : stillUrls[args.storageId]),
}));
const getFilmUrl = vi.fn();
vi.mock("@/features/host/shared/useHostMutation", () => ({ useHostMutation: () => getFilmUrl }));

const media = (posterId: string | null, durationSeconds: number | null = 125) => ({
  kind: "video" as const,
  r2Key: "film-key",
  posterId: posterId as Id<"_storage"> | null,
  durationSeconds,
});

describe("VideoPreview", () => {
  beforeEach(() => {
    getFilmUrl.mockReset().mockResolvedValue("https://r2.example/film-key");
  });

  it("shows the still and the length without asking for the film", () => {
    render(<VideoPreview media={media("still")} alt="Filmen" />);
    expect(screen.getByRole("img", { name: "Stillbild ur filmen" })).toHaveAttribute("src", "https://still.example");
    expect(screen.getByText("Längd 2:05")).toBeInTheDocument();
    expect(getFilmUrl).not.toHaveBeenCalled();
  });

  it("asks for a link to the film and plays it when asked to", async () => {
    render(<VideoPreview media={media("still")} alt="Filmen" />);
    await userEvent.click(screen.getByRole("button", { name: "Spela upp" }));
    expect(getFilmUrl).toHaveBeenCalledWith({ r2Key: "film-key" });
    expect(await screen.findByLabelText("Filmen")).toHaveAttribute("src", "https://r2.example/film-key");
  });

  it("says so when the film can't be played", async () => {
    render(<VideoPreview media={media("still")} alt="Filmen" />);
    await userEvent.click(screen.getByRole("button", { name: "Spela upp" }));
    fireEvent.error(await screen.findByLabelText("Filmen"));
    expect(screen.getByText("Filmen kunde inte spelas. Ladda upp den igen.")).toBeInTheDocument();
  });

  it("says so when there is no still and no known length", () => {
    render(<VideoPreview media={media(null, null)} alt="Filmen" />);
    expect(screen.getByText("Ingen stillbild. Ladda upp filmen igen för att få en.")).toBeInTheDocument();
    expect(screen.queryByText(/Längd/)).not.toBeInTheDocument();
  });

  it("says so when the still is gone", () => {
    render(<VideoPreview media={media("gone")} alt="Filmen" />);
    expect(screen.getByText("Ingen stillbild. Ladda upp filmen igen för att få en.")).toBeInTheDocument();
  });
});
