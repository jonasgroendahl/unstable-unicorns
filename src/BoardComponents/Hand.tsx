import React, { useState } from "react";
import { GameState, Moves, Player } from "../types/game-types";
import { Ctx } from "boardgame.io";
import {
  getCurrentAction,
  getCurrentPlayerStage,
  isMyTurnAndView,
} from "../game/helper";
import { Card } from "./Card";

interface IHandProps {
  G: GameState;
  player: Player;
  ctx: Ctx;
  playerID: string;
  moves: Moves;
}

export const Hand: React.FC<IHandProps> = ({
  G,
  player,
  ctx,
  playerID,
  moves,
}) => {
  const playerChosen =
    G.cardEffectState?.actionState?.[G.cardEffectState.actionIndex]
      ?.playerChosen;
  const isSelected = playerChosen === playerID;
  const cardBeingPlayed = G.deck[Number(G.cardBeingPlayed)];
  const isMainPlayer = playerID === player.id;
  const currentAction = getCurrentAction(G);
  const currentPlayerStage = getCurrentPlayerStage(ctx);

  const [_, setSelectedCards] = useState<string[]>([]);

  const handleSelect = (cardId: string) => {
    setSelectedCards((prev) => {
      // toggle
      if (prev.includes(cardId)) {
        return prev.filter((c) => c !== cardId);
      }

      if (prev.length >= (currentAction?.count ?? 1)) {
        return prev;
      }

      return prev.concat(cardId);
    });
  };

  return (
    <div>
      <div className="flex gap-3">
        {G.hands[player.id].map((card) => {
          const cardType =
            cardBeingPlayed.effect?.actions?.[
              G.cardEffectState?.actionIndex ?? 0
            ]?.type;

          const cardCanBeChosen =
            isSelected &&
            isMainPlayer &&
            (!cardType || cardType === G.deck[Number(card)].type);

          return (
            <div className="relative">
              <Card
                player={player}
                ctx={ctx}
                playerID={playerID}
                variant="hand"
                G={G}
                cardId={card}
                onClick={() => handleSelect(card)}
                isActive={cardCanBeChosen}
              />
              {currentPlayerStage === "actionTurn" &&
                isMyTurnAndView(ctx, player.id, playerID) && (
                  <button
                    className="bg-green-100 p-1 rounded-sm"
                    onClick={() => moves.playCard(card)}
                  >
                    play
                  </button>
                )}
              {playerID === player.id && playerChosen === player.id && (
                <button
                  className="bg-red-100 p-1 rounded-sm"
                  onClick={() =>
                    moves.selectCard({ cardIds: [card], playerId: player.id })
                  }
                >
                  choose
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
