import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { VideoPreview } from "./VideoPreview";

// The fake query answers with a URL per storage id, and records which ones were asked for.
const urls: Record<string, string | null> = { film: "https://film.example", still: "https://still.example", gone: null };
const askedFor: string[] = [];
vi.mock("@/features/host/shared/useHostQuery", () => ({
  useHostQuery: (_query: unknown, args: { storageId: string } | "skip") => {
    if (args === "skip") return undefined;
    askedFor.push(args.storageId);
    return urls[args.storageId];
  },
}));

const media = (posterId: string | null, durationSeconds: number | null = 125) => ({
  kind: "video" as const,
  storageId: "film" as Id<"_storage">,
  posterId: posterId as Id<"_storage"> | null,
  durationSeconds,
});

describe("VideoPreview", () => {
  beforeEach(() => {
    askedFor.length = 0;
    urls.film = "https://film.example";
  });

  it("shows the still and the length without fetching the film", () => {
    render(<VideoPreview media={media("still")} alt="Filmen" />);
    expect(screen.getByRole("img", { name: "Stillbild ur filmen" })).toHaveAttribute("src", "https://still.example");
    expect(screen.getByText("Längd 2:05")).toBeInTheDocument();
    expect(askedFor).not.toContain("film");
  });

  it("fetches and plays the film only when asked to", async () => {
    render(<VideoPreview media={media("still")} alt="Filmen" />);
    await userEvent.click(screen.getByRole("button", { name: "Spela upp" }));
    expect(screen.getByLabelText("Filmen")).toHaveAttribute("src", "https://film.example");
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

  it("says so when the film is gone", async () => {
    urls.film = null;
    render(<VideoPreview media={media("still")} alt="Filmen" />);
    await userEvent.click(screen.getByRole("button", { name: "Spela upp" }));
    expect(screen.getByText("Filmen finns inte längre.")).toBeInTheDocument();
  });
});
