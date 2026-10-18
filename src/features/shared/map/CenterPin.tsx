// The pin stays in the middle while the map moves underneath; its tip marks the centre.
export function CenterPin() {
  return (
    <svg
      aria-hidden="true"
      width="34"
      height="44"
      viewBox="0 0 30 40"
      className="pointer-events-none absolute top-[calc(50%-43px)] left-[calc(50%-17px)] z-[500] drop-shadow"
    >
      <path d="M15 39C15 39 2 23 2 14a13 13 0 0 1 26 0c0 9-13 25-13 25z" fill="var(--primary)" stroke="var(--background)" strokeWidth="2" />
      <circle cx="15" cy="14" r="5" fill="var(--background)" />
    </svg>
  );
}
