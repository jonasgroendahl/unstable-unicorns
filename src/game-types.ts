export type CardType =
  | "baby"
  | "basic"
  | "magical"
  | "upgrade"
  | "downgrade"
  | "instant"
  | "unicorn"
  | "neigh";

export type Card = {
  id: string;
  name: string;
  type: CardType;
  image: string;
};

export type Player = {
  id: string;
  name: string;
};

export type GameState = {
  deck: Card[];
  discardPile: string[];
  drawPile: string[];
  nusery: string[];
  players: Player[];
  hands: Record<string, string[]>;
  stables: Record<string, string[]>;
  cardBeingPlayed: string | null;
  neighDecision: Record<string, string | null>[];
};

export interface Moves {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: (...args: any[]) => void;
  drawCard: () => void;
  playCard: (cardId: string) => void;
  discardCard: (cardId: string) => void;
  makeNeighDecision: (decision: boolean) => void;
  endNeigh: () => void;
}
