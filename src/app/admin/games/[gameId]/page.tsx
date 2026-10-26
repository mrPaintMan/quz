import type { Id } from "@convex/_generated/dataModel";
import { GameControl } from "@/features/host/liveControl/GameControl";

export default async function GameControlPage({ params }: PageProps<"/admin/games/[gameId]">) {
  const { gameId } = await params;
  return <GameControl gameId={gameId as Id<"games">} />;
}
