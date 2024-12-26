import { Ctx } from "boardgame.io";
import React from "react";
import { GameState, Moves } from "../types/game-types";
import { getCurrentPlayerStage } from "../game/helper";
import { useInterval } from "usehooks-ts";

interface INeighStatusProps {
  ctx: Ctx;
  G: GameState;
  moves: Moves;
}

export const NeighStatus: React.FC<INeighStatusProps> = ({ G, ctx, moves }) => {
  useInterval(
    () => {
      console.log("checking neigh decision every 3 seconds...");

      const latestNeighDecision = G.neighDecision?.[G.neighDecision.length - 1];

      if (Object.values(latestNeighDecision).length === G.players.length) {
        moves.endNeigh();
      }
    },
    // Delay in milliseconds or null to stop it
    ctx.activePlayers &&
      Object.values(ctx.activePlayers).every((state) => state === "neighPhase")
      ? 3000
      : null
  );

  if (getCurrentPlayerStage(ctx) !== "neighPhase") {
    return null;
  }

  return (
    <div className="bg-red-200 p-5 flex gap-2">
      {G.players.map((player) => {
        let text = "";

        if (
          G.neighDecision?.[G.neighDecision.length - 1]?.[player.id] ===
          undefined
        ) {
          text = "Not yet decided 🤔";
        } else {
          text = G.neighDecision?.[G.neighDecision.length - 1]?.[player.id]
            ? "Neigh ✅"
            : "No Neigh ⛔";
        }
        return (
          <div className="border-2 border-s-slate-200 p-2" key={player.id}>
            <p className="text-xs">Player {player.id}</p>
            <p className="text-sm">{text}</p>
          </div>
        );
      })}
      {import.meta.env.DEV && (
        <button className="bg-red-400 p-1" onClick={() => moves.endNeigh()}>
          [DEV] End Neigh
        </button>
      )}
    </div>
  );
};
