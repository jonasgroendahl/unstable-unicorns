import React from "react";
import { GameState, Moves } from "../types/game-types";
import { Ctx } from "boardgame.io";
import { getCurrentPlayerStage, isMyTurn } from "../game/helper";

interface IDeckProps {
  G: GameState;
  ctx: Ctx;
  moves: Moves;
  playerID: string;
}

export const Deck: React.FC<IDeckProps> = ({ G, moves, playerID, ctx }) => {
  const cardBeingPlayed = G.deck[Number(G.cardBeingPlayed)];

  const currentAction =
    cardBeingPlayed.effect?.actions?.[G.cardEffectState?.actionIndex ?? 0];

  const currentPlayer = playerID === ctx.currentPlayer;

  console.log(currentAction);

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
          backgroundColor: "lightblue",
          justifyContent: "center",
        }}
      >
        {G.deck.length}
        {(getCurrentPlayerStage(ctx) === "draw" ||
          getCurrentPlayerStage(ctx) === "actionTurn") &&
          isMyTurn(ctx, playerID) && (
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => {
                moves.drawCard();
              }}
            >
              Draw
            </button>
          )}
      </div>
      {currentPlayer &&
        currentAction?.action === "search" &&
        currentAction.from === "deck" && (
          <div>
            {G.drawPile.map((card) => (
              <div key={`drawPile${card}`}>
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
