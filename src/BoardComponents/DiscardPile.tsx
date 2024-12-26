import React from "react";
import { GameState, Moves } from "../types/game-types";
import { Ctx } from "boardgame.io";

interface IDiscardPileProps {
  G: GameState;
  ctx: Ctx;
  moves: Moves;
  playerID: string;
}

export const DiscardPile: React.FC<IDiscardPileProps> = ({
  G,
  moves,
  playerID,
  ctx,
}) => {
  const cardBeingPlayed = G.deck[Number(G.cardBeingPlayed)];

  const currentAction =
    cardBeingPlayed.effect?.actions?.[G.cardEffectState?.actionIndex ?? 0];

  const currentPlayer = playerID === ctx.currentPlayer;

  return (
    <div>
      <div
        style={{
          height: 80,
          width: 50,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          borderRadius: 4,
          alignItems: "center",
          backgroundColor: "yellowgreen",
          justifyContent: "center",
        }}
      >
        {G.discardPile.length}
      </div>
      {currentPlayer &&
        currentAction?.action === "draw" &&
        currentAction.from === "discard_pile" && (
          <div>
            {G.discardPile.map((card) => (
              <div key={`discard_${card}`}>
                <img
                  src={`/card/square/${G.deck[Number(card)].image}.png`}
                  height={50}
                  width={50}
                  style={{ objectFit: "cover" }}
                />
                <button
                  onClick={() => {
                    moves.selectCard({
                      cardIds: [card],
                      playerId: "special",
                    });
                  }}
                >
                  select
                </button>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};
