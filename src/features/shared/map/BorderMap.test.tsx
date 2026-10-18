import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BorderMapOptions } from "./createBorderMap";
import { BorderMap } from "./BorderMap";

const controller = { setView: vi.fn(), setRadius: vi.fn(), destroy: vi.fn() };
const createBorderMap = vi.fn<(...args: [unknown, HTMLElement, unknown, BorderMapOptions]) => typeof controller>(() => controller);

vi.mock("leaflet", () => ({ default: { leaflet: true } }));
const loadBorderShapes = vi.fn(() => Promise.resolve("shapes"));
vi.mock("@/features/shared/map/loadBorderShapes", () => ({ loadBorderShapes: () => loadBorderShapes() }));
vi.mock("@/features/shared/map/createBorderMap", () => ({
  createBorderMap: (...args: [unknown, HTMLElement, unknown, BorderMapOptions]) => createBorderMap(...args),
}));

const view = { center: { lat: 59.33, lng: 18.07 }, zoom: 5 };

function renderMap(onViewChange = vi.fn()) {
  const result = render(<BorderMap label="Karta" view={view} radiusMeters={50_000} onViewChange={onViewChange} />);
  return { ...result, onViewChange };
}

describe("BorderMap", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates the Leaflet map with the view and radius once the borders have loaded", async () => {
    renderMap();
    await waitFor(() => expect(createBorderMap).toHaveBeenCalled());
    const [leaflet, element, shapes, options] = createBorderMap.mock.calls[0];
    expect(leaflet).toEqual({ leaflet: true });
    expect(element).toBe(screen.getByTestId("border-map"));
    expect(shapes).toBe("shapes");
    expect(options).toMatchObject({ view, radiusMeters: 50_000 });
    expect(screen.getByRole("group", { name: "Karta" })).toBeInTheDocument();
  });

  it("passes the user's moves to the latest onViewChange", async () => {
    const { rerender } = renderMap();
    await waitFor(() => expect(createBorderMap).toHaveBeenCalled());
    const latest = vi.fn();
    rerender(<BorderMap label="Karta" view={view} radiusMeters={50_000} onViewChange={latest} />);
    createBorderMap.mock.calls[0][3].onUserMove(view);
    expect(latest).toHaveBeenCalledWith(view);
  });

  it("moves the map and redraws the radius when the props change", async () => {
    const { rerender, onViewChange } = renderMap();
    await waitFor(() => expect(createBorderMap).toHaveBeenCalled());
    const next = { center: { lat: 67.85, lng: 20.23 }, zoom: 6 };
    rerender(<BorderMap label="Karta" view={next} radiusMeters={80_000} onViewChange={onViewChange} />);
    expect(controller.setView).toHaveBeenLastCalledWith(next);
    expect(controller.setRadius).toHaveBeenLastCalledWith(80_000);
  });

  it("says so when the borders can't be loaded", async () => {
    loadBorderShapes.mockReturnValueOnce(Promise.reject(new Error("offline")));
    renderMap();
    expect(await screen.findByRole("alert")).toHaveTextContent("Kartan kunde inte laddas. Ladda om sidan.");
    expect(createBorderMap).not.toHaveBeenCalled();
  });

  it("removes the map when it leaves the page", async () => {
    const { unmount } = renderMap();
    await waitFor(() => expect(createBorderMap).toHaveBeenCalled());
    unmount();
    expect(controller.destroy).toHaveBeenCalled();
  });

  it("creates no map if it left the page before the borders loaded", async () => {
    const { unmount } = renderMap();
    unmount();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(createBorderMap).not.toHaveBeenCalled();
  });
});
