import Link from "next/link";
import { QuzWordmark } from "@/features/shared/brand/QuzWordmark";

// The start page while no game runs: teams wait here, and the hosts find their way in.
export function NoGameRunning({ message }: { message: string }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-10 px-4 text-center">
      <h1>
        <QuzWordmark title="Quz" className="h-32 w-auto sm:h-40" />
      </h1>
      <p className="text-lg text-muted-foreground">{message}</p>
      <Link href="/admin" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
        För domare
      </Link>
    </main>
  );
}
