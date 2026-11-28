import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import type { Screen } from "@convex/games/screen";
import { screenKey } from "@/domain/screenSequence/isSameScreen";
import { usePreloadFilms } from "./usePreloadFilms";

const getNextFilmUrl = vi.fn();
vi.mock("convex/react", () => ({ useMutation: () => getNextFilmUrl }));

const intro: Screen = { kind: "roundIntro", roundId: "r1" as Id<"rounds"> };
const trip: Screen = { kind: "question", questionId: "q1" as Id<"questions"> };
const tripAnswer: Screen = { kind: "answer", questionId: "q1" as Id<"questions"> };
const film: Screen = { kind: "film", roundId: "r1" as Id<"rounds">, filmId: "f1" };

// A download the test finishes when it chooses, as a slow network would.
function slowDownload() {
  let finish: () => void = () => {};
  const response = new Promise<Response>((resolve) => (finish = () => resolve(new Response("film"))));
  return { response, finish: () => act(async () => finish()) };
}

describe("usePreloadFilms", () => {
  const fetchFilm = vi.fn();
  const revoked: string[] = [];
  let copies = 0;

  beforeEach(() => {
    getNextFilmUrl.mockReset().mockResolvedValue(null);
    fetchFilm.mockReset().mockImplementation(async () => new Response("film"));
    vi.stubGlobal("fetch", fetchFilm);
    revoked.length = 0;
    copies = 0;
    vi.spyOn(URL, "createObjectURL").mockImplementation(() => `blob:copy-${++copies}`);
    vi.spyOn(URL, "revokeObjectURL").mockImplementation((url) => void revoked.push(url));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  async function showing(first: Screen) {
    const hook = await act(async () => renderHook(({ screen }) => usePreloadFilms(screen), { initialProps: { screen: first } }));
    return { ...hook, show: (screen: Screen) => act(async () => hook.rerender({ screen })) };
  }

  it("downloads the next screen's film and hands out the copy by its screen", async () => {
    getNextFilmUrl.mockResolvedValueOnce({ screen: trip, url: "https://films/trip.mp4" });
    const { result } = await showing(intro);
    expect(getNextFilmUrl).toHaveBeenCalledWith({ screen: intro });
    expect(fetchFilm).toHaveBeenCalledWith("https://films/trip.mp4", expect.anything());
    expect(result.current.get(screenKey(trip))).toBe("blob:copy-1");
  });

  it("keeps the showing film's copy while it plays, and lets it go after", async () => {
    getNextFilmUrl.mockResolvedValueOnce({ screen: trip, url: "https://films/trip.mp4" });
    const { result, show } = await showing(intro);
    await show(trip);
    expect(result.current.get(screenKey(trip))).toBe("blob:copy-1");
    expect(revoked).toEqual([]);
    await show(tripAnswer);
    expect(result.current.size).toBe(0);
    expect(revoked).toEqual(["blob:copy-1"]);
  });

  it("stops a download its screen showed before it finished, so the film streams alone", async () => {
    const download = slowDownload();
    let aborted = false;
    fetchFilm.mockImplementationOnce(async (_url: string, { signal }: RequestInit) => {
      signal!.addEventListener("abort", () => (aborted = true));
      return download.response;
    });
    getNextFilmUrl.mockResolvedValueOnce({ screen: trip, url: "https://films/trip.mp4" });
    const { result, show } = await showing(intro);
    await show(trip);
    expect(aborted).toBe(true);
    await download.finish();
    expect(result.current.size).toBe(0);
  });

  it("asks only once while game updates hand out equal screens", async () => {
    const { show } = await showing(intro);
    await show({ ...intro });
    expect(getNextFilmUrl).toHaveBeenCalledTimes(1);
  });

  it("ignores a next film that arrives after the screen has changed", async () => {
    let answer: (next: { screen: Screen; url: string }) => void = () => {};
    getNextFilmUrl.mockReturnValueOnce(new Promise((resolve) => (answer = resolve)));
    const { result, show } = await showing(tripAnswer);
    await show(intro);
    await act(async () => answer({ screen: film, url: "https://films/film.mp4" }));
    expect(fetchFilm).not.toHaveBeenCalled();
    expect(result.current.size).toBe(0);
  });

  it("leaves the film to stream when its download fails", async () => {
    fetchFilm.mockResolvedValueOnce(new Response("", { status: 403 }));
    getNextFilmUrl.mockResolvedValueOnce({ screen: trip, url: "https://films/trip.mp4" });
    const { result } = await showing(intro);
    expect(result.current.size).toBe(0);
  });

  it("lets every copy go when the TV stops showing the game", async () => {
    getNextFilmUrl.mockResolvedValueOnce({ screen: trip, url: "https://films/trip.mp4" });
    const { unmount } = await showing(intro);
    unmount();
    expect(revoked).toEqual(["blob:copy-1"]);
  });
});
