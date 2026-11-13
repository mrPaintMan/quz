import { DrawingPicture } from "@/features/shared/drawing/DrawingPicture";
import type { RevealedDisplayProps } from "@/features/shared/questionDisplays/QuestionDisplayProps";
import { TeamDot } from "@/features/shared/teams/TeamDot";

// The teams draw on their phones, so the question needs nothing beyond its prompt (D62).
export function DrawingQuestion() {
  return null;
}

// Every team's drawing side by side, with its team, for the room to see while the hosts score them
// (D62).
export function DrawingAnswer({ revealed }: RevealedDisplayProps<"drawing">) {
  if (revealed.drawings.length === 0) return <p className="text-[2.4cqw] text-muted-foreground">Inga teckningar.</p>;
  const count = revealed.drawings.length;
  const columns = count <= 4 ? 2 : 3;
  const rows = Math.ceil(count / columns);
  // The rows share the height left under the prompt, and each paper keeps its 4:3 within its cell.
  return (
    <ul
      className="grid min-h-0 flex-1 gap-[1.6cqw]"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}
    >
      {revealed.drawings.map((drawing) => (
        <li key={drawing.teamId} className="flex min-h-0 flex-col items-center gap-[0.6cqw]">
          <DrawingPicture strokes={drawing.strokes} label={`${drawing.name}s teckning`} className="min-h-0 w-full flex-1" />
          <span className="flex items-center gap-[0.6cqw] text-[1.8cqw]">
            <TeamDot colour={drawing.colour} className="size-[1.4cqw]" />
            {drawing.name}
          </span>
        </li>
      ))}
    </ul>
  );
}
