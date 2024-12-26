export type CardType =
  | "baby"
  | "basic"
  | "magical"
  | "upgrade"
  | "downgrade"
  | "instant"
  | "unicorn"
  | "neigh"
  | "narwhal";

type Passive =
  | "cannot_be_destroyed_by_magic"
  | "cannot_be_neighed"
  | "unicorns_cannot_be_destroyed"
  | "double_turn"
  | "pandas"
  | "all_basic_unicorns";

type GenericAction = {
  type?: CardType;
  count: number;
  optional: boolean;
};

type DestroyAction = {
  action: "destroy";
  from: "player";
} & GenericAction;

type DiscardAction = {
  action: "discard";
  from: "active_player" | "all_players" | "player" | "all_players_but_self";
} & GenericAction;

type DrawAction = {
  action: "draw" | "search";
  from:
    | "deck"
    | "discard_pile"
    | "all_players"
    | "player"
    | "player_current_player_choose"
    | "nusery";
  to: "hand" | "stable";
} & GenericAction;

type StealAction = {
  action: "steal";
  from: "player";
} & GenericAction;

type SacrificeAction = {
  action: "sacrifice";
  from: "active_player" | "current_card" | "all_downgrades" | "all_players";
} & GenericAction;

type ReturnAction = {
  action: "return";
  from: "player" | "all_players";
} & GenericAction;

export type Action =
  | DestroyAction
  | StealAction
  | SacrificeAction
  | ReturnAction
  | DiscardAction
  | DrawAction;

type Effect = {
  trigger: "enter" | "passive" | "in_stable_at_start_of_turn" | "toast";
  choose_one_action?: boolean;
  actions: Action[];
  passive?: Passive[];
};

export type Card = {
  id: string;
  name: string;
  type: CardType;
  image: string;
  effect?: Effect;
  description: string;
};

export type Player = {
  id: string;
  name: string;
};

export type CardEffectState = {
  actionIndex: number;
  actionState: {
    playersAndCardSelections: Record<string, string[]>;
    playerChosen?: null | string;
  }[];
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
  cardEffectState?: CardEffectState;
  actionIndex: number;
};

export interface Moves {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: (...args: any[]) => void;
  drawCard: () => void;
  playCard: (cardId: string) => void;
  discardCard: (cardId: string) => void;
  makeNeighDecision: (decision: boolean) => void;
  endNeigh: () => void;
  selectCard: (args: { cardIds: string[]; playerId: string }) => void;
  selectPlayer: (playerId: string) => void;
}
