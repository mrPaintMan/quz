import Link from "next/link";
import { QuzIcon } from "./QuzIcon";
import { QuzWordmark } from "./QuzWordmark";

// The logo every screen shows top left. Phones get the round icon, most of them also held sideways, so the header keeps room for its content.
export function HomeLogoLink() {
  return (
    <Link
      href="/"
      aria-label="Quz"
      className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <QuzIcon className="size-9 md:hidden" />
      <QuzWordmark className="hidden h-9 w-auto md:block" />
    </Link>
  );
}
