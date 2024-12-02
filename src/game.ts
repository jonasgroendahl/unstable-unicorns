import { Move, type Game } from "boardgame.io";
import { Cards } from "./cards";
import { Card, GameState } from "./game-types";

const Stage = {
  startOfTurn: "startOfTurn",
  draw: "draw",
  actionTurn: "actionTurn",
} as const;

const drawCard: Move<GameState> = ({ G, ctx, events, playerID }) => {
  const _ = G.deck.pop(); // Remove the top card from the deck.

  const currentPlayerStage = ctx.activePlayers?.[playerID];

  // a card was drawn during the action phase will end the turn
  if (currentPlayerStage === Stage.actionTurn) {
    events.endTurn();
  } else if (currentPlayerStage === Stage.draw) {
    events.setStage("actionTurn");
  }
};

const playCard: Move<GameState> = ({ G, ctx, events }) => {
  // Play a card from the player's hand.

  events.setStage("actionTurn");
};

const skip: Move<GameState> = ({ G, ctx, events }) => {
  events.setStage("draw");
};

export const UnstableUnicornsGame: Game<GameState> = {
  setup: (props) => {
    const allCards: Card[] = Cards.map((card) => ({
      id: card.title,
      name: card.title,
    }));

    return {
      deck: allCards,
      discardPile: [],
      nusery: [],
      players: [],
    };
  },
  moves: {
    drawCard,
  },
  events: {},
  phases: {},
  name: "UnstableUnicorns",
  minPlayers: 2,
  maxPlayers: 7,
  turn: {
    activePlayers: {
      all: "startOfTurn",
    },
    stages: {
      [Stage.startOfTurn]: {
        moves: {
          activateStartOfTurnCard: () => {},
          skip,
        },
      },
      [Stage.draw]: {
        moves: {
          drawCard,
        },
      },
      [Stage.actionTurn]: {
        moves: {
          drawCard,
          playCard,
        },
      },
    },
  },
};
