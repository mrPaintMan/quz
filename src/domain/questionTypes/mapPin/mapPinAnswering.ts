import type { Coordinates, MapView } from "@convex/questions/types/mapPin/mapPinContent";
import type { AnsweringRules } from "@/domain/answering/answeringRules";
import type { TeamColour } from "@/domain/teams/teamColours";
import { distanceMeters, formatDistance } from "./distanceMeters";

// While asked, where the map starts; on the answer screen the target, its radius and every team's
// pin with what it scored and how far off it was (D60).
export type MapPinShown = { type: "mapPin"; initialView: MapView };
export type TeamPin = { teamId: string; name: string; colour: TeamColour; pin: Coordinates; points: number; distanceMeters: number };
export type MapPinRevealed = { type: "mapPin"; initialView: MapView; target: Coordinates | null; radiusMeters: number | null; pins: TeamPin[] };

// A pin within the radius, the edge included, scores the question's points (D27).
const isWithin = (pin: Coordinates, target: Coordinates, radiusMeters: number | null) =>
  radiusMeters !== null && distanceMeters(pin, target) <= radiusMeters;

export const mapPinAnswering: AnsweringRules<"mapPin", MapPinShown, MapPinRevealed> = {
  show: ({ initialView }) => ({ type: "mapPin", initialView }),
  reveal: ({ initialView, target, radiusMeters, points }, graded) => ({
    type: "mapPin",
    initialView,
    target,
    radiusMeters,
    // Most points first, then the closest; teams without a pin have nothing to show.
    pins:
      target === null || !graded
        ? []
        : graded.answers
            .flatMap(({ pin }, index) => {
              const team = graded.teams[index];
              if (!pin || !team) return [];
              const scored = isWithin(pin, target, radiusMeters) ? (points ?? 0) : 0;
              return [{ teamId: team._id, name: team.name, colour: team.colour, pin, points: scored, distanceMeters: distanceMeters(pin, target) }];
            })
            .sort((a, b) => b.points - a.points || a.distanceMeters - b.distanceMeters),
  }),
  revealsAnswers: true,
  revealsTeams: true,
  // The teams' pins for the phones, without the right place or its radius (D59, D60).
  revealToTeams: (content, graded) => ({ ...mapPinAnswering.reveal(content, graded), target: null, radiusMeters: null }),
  imageIds: () => [],
  // The pin starts where the map does, so a team that sends without moving answers the middle.
  startingAnswer: ({ initialView }) => ({ type: "mapPin", pin: initialView.center }),
  isComplete: (_shown, { pin }) => pin !== null && Math.abs(pin.lat) <= 90 && Math.abs(pin.lng) <= 180,
  // The pin, by how far off it was, scoring the question's points within the radius.
  outcomes: ({ target, radiusMeters, points }, answers) =>
    answers.map(({ pin }) => {
      const scores = pin !== null && target !== null && isWithin(pin, target, radiusMeters);
      const given = pin !== null && target !== null ? `${formatDistance(distanceMeters(pin, target))} från rätt plats` : "";
      const scored = scores ? (points ?? 0) : 0;
      return { points: scored, parts: [{ label: "", given, result: scores ? "right" : "wrong", correct: "", points: scored }] };
    }),
};
