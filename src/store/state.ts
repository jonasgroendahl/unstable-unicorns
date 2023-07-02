import { create } from "zustand";
import { cards, nusery, reversedCards } from "./cards";

const CardTypes = {
  UNICORN: "UNICORN",
  UNICORN_MAGIC: "UNICORN_MAGIC",
  UNICORN_BASIC: "UNICORN_BASIC",
  UNICORN_BABY: "UNICORN_BABY",
  MAGIC: "MAGIC",
  UPGRADE: "UPGRADE",
  DOWNGRADE: "DOWNGRADE",
  INSTANT: "INSTANT",
} as const;

export type CardType = keyof typeof CardTypes;

type EventStable = {
  variant: "CARD_STABLE";
  cardType: Card["type"] | "ANY";
  playersEffected: number[];
  to: number;
};

type EventHand = {
  variant: "CARD_HAND";
};

type EventPlayer = {
  variant: "CHOOSE_PLAYER";
};

type CardEvent = EventStable | EventHand | EventPlayer;

export type Card = {
  id: string;
  name: string;
  description: string;
  image: string;
  type: CardType;
  unifornCount?: number;
  effect?: any;
  event?: CardEvent;
};

export type PlayerState = {
  cardsOnHand: Card[];
  cardsInStable: Card[];
  index: number;
};

type GameState = {
  // simple state
  discardPile: Card[];
  drawPile: Card[];
  playerTurn: number;
  playerPhase: number;
  players: PlayerState[];
  // advanced state
  event?: CardEvent;
  // functions
  pickACard: (playerIndex: number) => void;
  actionPickACard: (playerIndex: number) => void;
  checkIfWinner: () => null | number;
  startGame: () => void;
  playACard: (card: Card, player: number) => void;
  readyToPickup: () => void;
  moveCard: (
    card: Card,
    fromStable: number,
    toStable: number,
    location: "hand" | "stable"
  ) => void;
  discardPlayerCard: (card: Card, player: number) => void;
  clearEvent: () => void;
  nextPlayer: () => void;
};

const getNextPlayer = (currentPlayerTurn: number, playerCount: number) => {
  console.log(currentPlayerTurn, playerCount);

  return currentPlayerTurn === playerCount - 1 ? 0 : currentPlayerTurn + 1;
};

const drawTopCard = (state: GameState, playerIndex: number) => {
  const drawPile = state.drawPile;

  const nextCard = drawPile[drawPile.length - 1];

  const newPlayers = [...state.players];

  newPlayers[playerIndex].cardsOnHand.push(nextCard);

  return newPlayers;
};

export const state = create<GameState>((set, get) => ({
  discardPile: [],
  drawPile: reversedCards,
  playerPhase: 0,
  playerTurn: 1,
  players: [
    {
      cardsInStable: [],
      cardsOnHand: [],
      index: 0,
    },
    {
      cardsInStable: [],
      cardsOnHand: [],
      index: 1,
    },
  ],
  pickACard: (index) => {
    set((prev) => {
      const newPlayers = drawTopCard(prev, index);

      return {
        ...prev,
        playerPhase: 2,
        drawPile: prev.drawPile.slice(0, prev.drawPile.length - 1),
        players: newPlayers,
      };
    });
  },
  actionPickACard: (index) => {
    set((prev) => {
      const newPlayers = drawTopCard(prev, index);

      return {
        ...prev,
        playerPhase: 0,
        playerTurn: prev.playerTurn === 0 ? 1 : 0,
        drawPile: prev.drawPile.slice(0, prev.drawPile.length - 1),
        players: newPlayers,
      };
    });
  },
  checkIfWinner: () => {
    const playerNo = get().players.find(
      (player) =>
        player.cardsInStable.reduce(
          (acc, cur) => (acc += cur.unifornCount ?? 0),
          0
        ) >= 7
    );

    return playerNo?.index ?? null;
  },
  playACard: (card: Card, player: number) => {
    set((prev) => {
      const copyOfCardsOnHand = [...prev.players];
      const cardThatWasPlayed = prev.players[player].cardsOnHand.findIndex(
        (cardOnHand) => cardOnHand.name === card.name
      );

      copyOfCardsOnHand[player].cardsOnHand.splice(cardThatWasPlayed, 1);

      console.log("played card", card);

      switch (card.type) {
        case "UNICORN":
          copyOfCardsOnHand[player].cardsInStable.push(card);

          break;
        case "UPGRADE":
          copyOfCardsOnHand[player].cardsInStable.push(card);
          break;
      }

      return {
        ...prev,
        players: copyOfCardsOnHand,
        event: card.event,
        playerTurn: !card.event
          ? getNextPlayer(prev.playerTurn, prev.players.length)
          : prev.playerTurn,
        playerPhase: !card.event ? 0 : prev.playerPhase,
      };
    });
  },
  readyToPickup: () => {
    set({ playerPhase: 1 });
  },
  startGame: () => {
    set((prev) => {
      const players: PlayerState[] = [
        { cardsInStable: [], cardsOnHand: [], index: 0 },
        { cardsInStable: [], cardsOnHand: [], index: 1 },
      ];

      const pile = [...prev.drawPile];

      for (let i = 0; i < players.length; i++) {
        for (let j = 0; j < 5; j++) {
          const randomIndex = Math.floor(Math.random() * pile.length);
          const card = pile[randomIndex];
          players[i].cardsOnHand.push(card);
          pile.splice(randomIndex, 1);
        }

        players[i].cardsInStable.push(
          nusery[Math.floor(Math.random() * nusery.length)]
        );
      }

      return {
        ...prev,
        drawPile: pile,
        players,
        playerTurn: 0,
        playerPhase: 0,
      };
    });
  },
  moveCard: (card, from, to, location) => {
    set((prev) => {
      console.log("moving card", card);

      const players = [...prev.players];

      const cardIndex = players[from].cardsOnHand.findIndex(
        (c) => c.id === card.id
      );

      const aGreatCard = players[from].cardsOnHand[cardIndex];

      console.log("aGreatCard", aGreatCard, card, cardIndex, players);

      players[to].cardsOnHand.push(aGreatCard);
      players[from].cardsOnHand.splice(cardIndex, 1);

      return {
        ...prev,
        players,
      };
    });
  },
  discardPlayerCard: (card, player) => {
    set((prev) => {
      const players = [...prev.players];

      const i = prev.players[player].cardsOnHand.findIndex(
        (c) => c.id === card.id
      );

      players[player].cardsOnHand.splice(i, 1);

      return {
        ...prev,
        players,
      };
    });
  },
  clearEvent: () => set({ event: undefined }),
  nextPlayer: () =>
    set((prev) => ({
      playerTurn: getNextPlayer(prev.playerTurn, prev.players.length),
      playerPhase: 0,
    })),
}));
