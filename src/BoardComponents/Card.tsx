import React from "react";
import { GameState, Player } from "../types/game-types";
import { Ctx } from "boardgame.io";

interface ICardProps {
  onClick: () => void;
  isActive?: boolean;
  cardId: string;
  G: GameState;
  ctx: Ctx;
  variant: "stable" | "hand";
  player: Player;
  playerID: string;
}

export const Card: React.FC<ICardProps> = ({
  G,
  cardId,
  isActive,
  onClick,
  variant,
  player,
  playerID,
}) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-sm border-solid border-gray-700 border-2 "border-[5px]`}
    >
      <img
        src={
          variant === "hand" && playerID !== player.id
            ? `/card/UU-Back-Main.png`
            : `/card/square/${G.deck[Number(cardId)].image}.png`
        }
        className={`h-[60px] w-[55px] object-cover ${
          isActive ? "backdrop-filter backdrop-blur-sm" : ""
        }`}
      />
    </div>
  );
};
