import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { QuzWordmark } from "@/features/shared/brand/QuzWordmark";

export function HomePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-10 px-4">
      <h1>
        <QuzWordmark title="Quz" className="h-32 w-auto sm:h-40" />
      </h1>
      <Link href="/admin" className={buttonVariants({ variant: "outline", size: "lg" })}>
        För domare
      </Link>
    </main>
  );
}
