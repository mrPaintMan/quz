import type { ReactNode } from "react";

// A box with the film's own shape, as large as fits the space and centred in it, so what sits in
// its corners sits on the picture, not beside it. Both boxes are size containers: the outer one
// measures the space, and the frame lets what is inside it size itself in hundredths of the
// film (`cqw`, `cqh`).
export function FilmFrame({ aspectRatio, children }: { aspectRatio: number; children: ReactNode }) {
  return (
    <div className="flex size-full items-center justify-center" style={{ containerType: "size" }}>
      <div className="relative" style={{ aspectRatio, width: `min(100cqw, 100cqh * ${aspectRatio})`, containerType: "size" }}>
        {children}
      </div>
    </div>
  );
}
