import { BoardProps } from "boardgame.io/react";
import React from "react";
import { GameState, Moves } from "./game-types";
import { useInterval } from "usehooks-ts";

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

  const currentPlayerId = playerID ?? ctx.currentPlayer;

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

  console.log("playerID", playerID);

  return (
    <div>
      <p>
        {ctx.phase} {ctx.activePlayers?.[ctx.currentPlayer]}
      </p>
      <p>playerID: {playerID}</p>
      <p>Current player: {ctx.currentPlayer}</p>
      <p>Deck: {G.deck.length}</p>
      <p>Draw pile: {G.drawPile.length}</p>
      <p>Hand: {G.hands[ctx.currentPlayer].join(", ")}</p>
      <p>Winner: {gameover?.winner}</p>
      <p>Hand</p>
      <div style={{ display: "flex" }}>
        {G.hands[currentPlayerId].map((card, i) => (
          <div
            key={`player_hand_${i}`}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <img
              src={`/card/square/${G.deck[Number(card)].image}.png`}
              height={100}
              width={100}
              style={{ objectFit: "cover" }}
            />
            <button onClick={() => moves.playCard(card)}>play</button>
          </div>
        ))}
      </div>
      <p>Stable:</p>
      <div style={{ display: "flex" }}>
        {G.stables[currentPlayerId].map((stableCard, i) => (
          <div
            key={`player_stable_${i}`}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <img
              src={`/card/square/${G.deck[Number(stableCard)].image}.png`}
              height={100}
              width={100}
              style={{ objectFit: "cover" }}
            />
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          moves.skip();
        }}
      >
        Skip
      </button>
      <button
        onClick={() => {
          moves.drawCard();
        }}
      >
        Draw card
      </button>
      <button
        onClick={() => {
          moves.discardCard(G.hands[ctx.currentPlayer][0]);
        }}
      >
        Discard card
      </button>
      <button
        onClick={() => {
          moves.endNeigh();
        }}
      >
        end neigh
      </button>
      <div>
        {G.neighDecision?.[G.neighDecision.length - 1]?.[playerID] !==
          undefined && (
          <div>
            <p>Neigh status:</p>
            <p>
              {G.neighDecision?.[G.neighDecision.length - 1]?.[playerID]
                ? "neighed... :)"
                : "didnt neigh"}
            </p>
          </div>
        )}
        <button onClick={() => moves.makeNeighDecision(true)}>Neigh</button>
        <button onClick={() => moves.makeNeighDecision(false)}>
          Dont Neigh
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex" }}>
          {G.players
            .filter((player) => player.id !== playerID)
            .map((player, index) => (
              <div key={`${player.id}_stb_${index}`}>
                <p>Player: {player.id}</p>
                <p>Hand: {G.hands[player.id].join(", ")}</p>
                <p>Stable: {G.stables[player.id].join(", ")}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
