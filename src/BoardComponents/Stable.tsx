import React from "react";
import { GameState, Player } from "../types/game-types";
import { getCurrentAction } from "../game/helper";
import { Ctx } from "boardgame.io";
import { Card } from "./Card";

interface IStableProps {
  G: GameState;
  ctx: Ctx;
  playerID: string;
  player: Player;
}

export const Stable: React.FC<IStableProps> = ({
  G,
  ctx,
  playerID,
  player,
}) => {
  const currentAction = getCurrentAction(G);
  const playerChosen =
    G.cardEffectState?.actionState?.[G.cardEffectState.actionIndex]
      ?.playerChosen;

  const isSelected = playerChosen === playerID;

  return (
    <div
      className={`flex gap-3 w-[500px] p-1 rounded-sm border border-solid ${
        isSelected &&
        (currentAction?.action === "steal" ||
          currentAction?.action === "sacrifice")
          ? "border-green-300"
          : "border-black"
      }`}
    >
      {G.stables[player.id].map((card) => {
        return (
          <Card
            player={player}
            ctx={ctx}
            playerID={playerID}
            variant="stable"
            isActive={false}
            G={G}
            cardId={card}
            onClick={() => {}}
          />
        );
      })}
    </div>
  );
};
