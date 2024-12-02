export type Card = {
  id: string;
  name: string;
};

export type Player = {
  hand: Card[];
  stable: Card[];
  name: string;
};

export type GameState = {
  deck: Card[];
  discardPile: Card[];
  nusery: Card[];
  players: Player[];
};

export interface Moves {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: (...args: any[]) => void;
  drawCard: () => void;
  playCard: () => void;
}
