import { Client } from "boardgame.io/react";
import { type Game } from "boardgame.io";
import { Board } from "./Board";
import { UnstableUnicornsGame } from "./game";

const Game = Client({ game: UnstableUnicornsGame, board: Board });

export default Game;
