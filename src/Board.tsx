import { BoardProps } from "boardgame.io/react";
import React from "react";
import { GameState, Moves } from "./types/game-types";
import { PlayerHand } from "./BoardComponents/PlayerHand";
import { DiscardPile } from "./BoardComponents/DiscardPile";
import { Deck } from "./BoardComponents/Deck";
import { getCurrentPlayerStage } from "./game/helper";
import { NeighStatus } from "./BoardComponents/NeighStatus";

interface BoardCompProps extends BoardProps<GameState> {
  moves: Moves;
}

export const Board: React.FC<BoardCompProps> = ({
  moves,
  playerID,
  ctx,
  G,
}) => {
  const gameover = ctx.gameover as undefined | { winner: string };

  const currentPlayer = G.players.find((player) => player.id === playerID);
  const otherPlayers = G.players.filter((player) => player.id !== playerID);

  if (!playerID) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {G.players.map((player, index) => (
          <div key={`${player.id}_stb_${index}`}>
            <p>Player: {player.id}</p>
            <p>Hand: {G.hands[player.id].join(", ")}</p>
            <p>Stable: {G.stables[player.id].join(", ")}</p>
          </div>
        ))}
      </div>
    );
  }

  console.log("playerID", playerID, gameover);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      <div className="grid">
        {/* Top row */}
        <div className="player-hand col-span-3">
          {otherPlayers.slice(0, 3).map((player, index) => (
            <PlayerHand
              key={`hand_${index}_${player.id}`}
              player={player}
              ctx={ctx}
              moves={moves}
              G={G}
              playerID={playerID}
            />
          ))}
        </div>

        {/* Middle row */}
        <div className="player-hand col-span-1">
          {otherPlayers[3] && (
            <PlayerHand
              key={`hand_3_${otherPlayers[3].id}`}
              player={otherPlayers[3]}
              ctx={ctx}
              moves={moves}
              G={G}
              playerID={playerID}
            />
          )}
        </div>
        <div>
          <div className="center gap-2 flex mb-1">
            <DiscardPile G={G} ctx={ctx} moves={moves} playerID={playerID} />
            <Deck G={G} ctx={ctx} moves={moves} playerID={playerID} />
            <p className="ml-4">{getCurrentPlayerStage(ctx)}</p>
          </div>
          <NeighStatus moves={moves} G={G} ctx={ctx} />
        </div>
        <div className="player-hand col-span-1">
          {otherPlayers[4] && (
            <PlayerHand
              key={`hand_4_${otherPlayers[4].id}`}
              player={otherPlayers[4]}
              ctx={ctx}
              moves={moves}
              G={G}
              playerID={playerID}
            />
          )}
        </div>

        {/* Bottom row */}
        <div className="player-hand col-span-3">
          {otherPlayers.slice(5, 7).map((player, index) => (
            <PlayerHand
              key={`hand_${index + 5}_${player.id}`}
              player={player}
              ctx={ctx}
              moves={moves}
              G={G}
              playerID={playerID}
            />
          ))}
        </div>
      </div>

      {/* Current player's hand at the bottom */}
      <div className="absolute-bottom">
        {currentPlayer && (
          <PlayerHand
            player={currentPlayer}
            ctx={ctx}
            moves={moves}
            G={G}
            playerID={playerID}
          />
        )}
      </div>
    </div>
  );
};
