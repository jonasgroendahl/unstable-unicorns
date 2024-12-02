import { BoardProps } from "boardgame.io/react";
import React from "react";
import { GameState, Moves } from "./game-types";

interface BoardCompProps extends BoardProps<GameState> {
  moves: Moves;
}

export const Board: React.FC<BoardCompProps> = ({ moves, ctx }) => {
  return (
    <div>
      <p>{ctx.phase}</p>
      <p>This is a great board! :)</p>
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
          moves.playCard();
        }}
      >
        Play card
      </button>
    </div>
  );
};
