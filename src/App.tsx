import { Client } from "boardgame.io/react";
import { type Game } from "boardgame.io";
import { Local } from "boardgame.io/multiplayer";
import { Board } from "./Board";
import { UnstableUnicornsGame } from "./game";

const Game = Client({
  game: UnstableUnicornsGame,
  board: Board,
  numPlayers: 2,
  debug: true,
  multiplayer: Local(),
});

export default Game;
