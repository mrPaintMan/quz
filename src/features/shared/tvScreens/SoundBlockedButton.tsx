// Over the clip when the browser won't play sound before someone clicks the TV page. One click
// is enough for the evening; a browser setting avoids it altogether (docs/deploy.md).
export function SoundBlockedButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute inset-0 m-auto h-fit w-fit rounded-[1.2cqw] bg-primary px-[3cqw] py-[1.6cqw] text-[2.4cqw] font-semibold text-primary-foreground"
    >
      Klicka för att slå på ljudet
    </button>
  );
}
