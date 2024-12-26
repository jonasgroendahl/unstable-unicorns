import React, { Fragment } from "react";
import { GameState, Moves, Player } from "../types/game-types";
import { Ctx } from "boardgame.io";
import { Stable } from "./Stable";
import { Hand } from "./Hand";
import { isMyTurnAndView } from "../game/helper";

interface IPlayerHandProps {
  G: GameState;
  player: Player;
  ctx: Ctx;
  moves: Moves;
  playerID: string;
}

export const PlayerHand: React.FC<IPlayerHandProps> = ({
  G,
  player,
  ctx,
  moves,
  playerID,
}) => {
  const playerChosen =
    G.cardEffectState?.actionState?.[G.cardEffectState.actionIndex]
      ?.playerChosen;

  const currentPlayerStage = ctx.activePlayers?.[ctx.currentPlayer];

  const handleChoose = () => {
    console.log("player chosen", player.id);

    moves.selectPlayer(player.id);
  };

  const isMainPlayer = playerID === player.id;

  const canBeChosen =
    playerChosen === null && ctx.currentPlayer !== player.id && !isMainPlayer;

  const isSelected = playerChosen === playerID;

  return (
    <div>
      <div className="flex gap-2 mb-1">
        <h2 className={`mr-4 ${canBeChosen ? "text-green-500" : ""}`}>
          Player: {player.id}
        </h2>
        {currentPlayerStage === "neighPhase" && (
          <div className="flex items-center gap-1">
            {G.neighDecision?.[G.neighDecision.length - 1]?.[player.id] !==
              undefined && (
              <div className="flex items-center gap-2">
                <p>Neigh status:</p>
                <span>
                  {G.neighDecision?.[G.neighDecision.length - 1]?.[player.id]
                    ? "neighed... :)"
                    : "N/A"}
                </span>
              </div>
            )}
            {player.id === playerID && (
              <Fragment>
                <button
                  className="bg-green-50"
                  onClick={() => moves.makeNeighDecision(true)}
                >
                  Neigh
                </button>
                <button
                  className="bg-red-50"
                  onClick={() => moves.makeNeighDecision(false)}
                >
                  Dont Neigh
                </button>
              </Fragment>
            )}
          </div>
        )}
        <div className="flex-grow" />
        {currentPlayerStage === "endOfTurn" &&
          isMyTurnAndView(ctx, player.id, playerID) && (
            <button
              onClick={() => {
                moves.endTurn();
              }}
              className="bg-red-400 p-1"
            >
              End turn
            </button>
          )}
      </div>
      <Stable G={G} ctx={ctx} player={player} playerID={playerID} />
      {canBeChosen && <button onClick={handleChoose}>select player</button>}
      <p>{isSelected && isMainPlayer && "You have been chosen!"}</p>
      <div className="mt-1">
        <Hand
          G={G}
          ctx={ctx}
          moves={moves}
          player={player}
          playerID={playerID}
        />
      </div>
    </div>
  );
};
