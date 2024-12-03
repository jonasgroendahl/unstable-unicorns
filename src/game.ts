import { Move, type Game } from "boardgame.io";
import { Cards } from "./cards";
import { Card, CardType, GameState, Player } from "./game-types";

const Stage = {
  startOfTurn: "startOfTurn",
  draw: "draw",
  actionTurn: "actionTurn",
  discardOverflowingCards: "discardOverflowingCards",
  neighPhase: "neighPhase",
  endOfTurn: "endOfTurn",
} as const;

const drawCard: Move<GameState> = ({ G, ctx, events, playerID }) => {
  const drawNcard = G.drawPile.pop(); // Remove the top card from the deck.

  const currentPlayerStage = ctx.activePlayers?.[playerID];

  if (drawNcard !== undefined) {
    G.hands[playerID].push(drawNcard);
  }

  // a card was drawn during the action phase will end the turn
  if (currentPlayerStage === Stage.actionTurn) {
    if (G.hands[playerID].length > 7) {
      events.setStage(Stage.discardOverflowingCards);
    } else {
      events.endTurn();
    }
  } else if (currentPlayerStage === Stage.draw) {
    events.setStage(Stage.actionTurn);
  }
};

const discardCard: Move<GameState> = (
  { G, ctx, events, playerID },
  cardId: string
) => {
  // Discard a card from the player's hand.
  const index = G.hands[playerID].indexOf(cardId);
  if (index !== -1) {
    G.hands[playerID].splice(index, 1);
    G.discardPile.push(cardId);
  }

  if (ctx.activePlayers?.[playerID] === Stage.discardOverflowingCards) {
    events.endTurn();
  }
};

const playCard: Move<GameState> = ({ events, G, ctx }, cardId: string) => {
  // Remove the card from the player's hand.
  const cardIndex = G.hands[ctx.currentPlayer].findIndex((id) => id === cardId);
  G.hands[ctx.currentPlayer].splice(cardIndex, 1);

  G.cardBeingPlayed = cardId;
  G.neighDecision.push({ [ctx.currentPlayer]: null });
  events.setActivePlayers({ all: "neighPhase" });
};

const actuallyPlayCard: Move<GameState> = ({ G, ctx, events }) => {
  if (G.cardBeingPlayed === null) {
    console.error("No card is being played");
    return;
  }

  const card = G.deck[Number(G.cardBeingPlayed)];

  if (card.type === "baby") {
    // do something
  } else if (card.type === "basic") {
    // do something
  } else if (card.type === "magical") {
    // do something
  } else if (card.type === "upgrade") {
    // do something
  } else if (card.type === "downgrade") {
    // do something
  } else if (card.type === "instant") {
    // do something
  } else if (card.type === "unicorn") {
    // do something
  }

  G.stables[ctx.currentPlayer].push(G.cardBeingPlayed);
  G.cardBeingPlayed = null;
  G.neighDecision = [];
  events.endTurn();
};

const endNeigh: Move<GameState> = (params) => {
  const { G, ctx } = params;

  const latestNeighDecision = G.neighDecision[G.neighDecision.length - 1];

  const neighDecisionsValues = Object.values(latestNeighDecision);
  const allPlayersDidntNeigh = neighDecisionsValues.every(
    (decision) => !decision
  );

  if (allPlayersDidntNeigh && G.neighDecision.length === 1) {
    actuallyPlayCard(params);
  } else if (!allPlayersDidntNeigh) {
    G.neighDecision.push({});
  } else {
    const lastNeighDecision = G.neighDecision[G.neighDecision.length - 2];

    // clean-up played neighcards
    G.neighDecision.forEach((neighDiscussion) => {
      Object.entries(neighDiscussion).forEach(([playerId, cId]) => {
        if (cId) {
          G.discardPile.push(cId);

          const neighCardLocationInHand = G.hands[playerId].findIndex(
            (id) => id === cId
          );

          G.hands[playerId].splice(neighCardLocationInHand, 1);
        }
      });
    });

    const cardId = lastNeighDecision[ctx.currentPlayer];

    // card gets played since the last neigh decision was made by the current player
    if (cardId) {
      actuallyPlayCard(params);
    } else {
      G.discardPile.push(G.cardBeingPlayed!);
      G.cardBeingPlayed = null;
    }
  }
  // someone recently neighed

  // if (
  //   Object.values(G.neighDecision[G.neighDecision.length - 1]).every(
  //     (decision) => !decision
  //   )
  // ) {
  //   neigh(params);
  //   events.endStage();
  // } else {
  //   G.neighDecision.push({});
  // }
};

const makeNeighDecision: Move<GameState> = (
  { G, playerID },
  decision: boolean
) => {
  const neighCard = G.hands[playerID].find((cardId) => {
    const cardInfo = G.deck[Number(cardId)];
    return cardInfo.type === "neigh";
  });

  console.log("neighCard", neighCard);

  if (!neighCard || !decision) {
    G.neighDecision[G.neighDecision.length - 1][playerID] = null;
  } else {
    G.neighDecision[G.neighDecision.length - 1][playerID] = neighCard;
  }
};

const skip: Move<GameState> = ({ events }) => {
  events.setStage("draw");
};

export const UnstableUnicornsGame: Game<GameState> = {
  setup: ({ ctx, random }) => {
    const players: Player[] = Array.from(
      { length: ctx.numPlayers },
      (_, idx) => {
        return {
          id: `${idx}`,
          name: `Player ${idx}`,
        };
      }
    );

    const playerHands: Record<string, string[]> = {};
    const playerStables: Record<string, string[]> = {};

    const allCards: Card[] = [];
    const nusery: Card[] = [];
    let idCounter = 0;

    Cards.forEach((card) => {
      for (let i = 0; i < card.count; i++) {
        const cardId = idCounter.toString();
        if (card.type === "baby") {
          nusery.push({
            id: cardId,
            name: card.title,
            type: card.type as CardType,
            image: card.image,
          });
        }

        allCards.push({
          id: cardId,
          name: card.title,
          type: card.type as CardType,
          image: card.image,
        });

        idCounter++;
      }
    });

    // Shuffle the deck.
    const drawPile = random
      .Shuffle(allCards.filter((card) => card.type !== "baby"))
      .map((card) => card.id);

    console.log("drawPile length", drawPile.length);

    // Distribute cards to players.
    players.forEach((player) => {
      // take 5 random cards from the drawPile
      const cards = drawPile.splice(0, 5);

      playerHands[player.id] = cards;
      playerStables[player.id] = [nusery.pop()!.id];
    });

    console.log("drawPile length after distrubting", drawPile.length);

    return {
      deck: allCards,
      discardPile: [],
      drawPile,
      nusery: [],
      players: players,
      hands: playerHands,
      stables: playerStables,
      cardBeingPlayed: null,
      neighDecision: [],
    };
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
      [Stage.discardOverflowingCards]: {
        moves: {
          discardCard,
        },
      },
      [Stage.neighPhase]: {
        moves: {
          endNeigh,
          makeNeighDecision,
        },
        next: Stage.endOfTurn,
      },
      [Stage.endOfTurn]: {
        moves: {},
      },
    },
    onBegin: ({ G, ctx, events }) => {
      // skip to draw phase if the player has no upgrade card in stables
      if (
        !G.stables[ctx.currentPlayer].some(
          (cardId) => G.deck[Number(cardId)].type === "upgrade"
        )
      ) {
        events.setActivePlayers({ currentPlayer: Stage.draw });
      }
    },
  },
  endIf: ({ G, ctx }) => {
    let winner: null | string = null;

    const typeThatCountAsPoint: CardType[] = ["baby", "basic", "unicorn"];

    Object.entries(G.stables).forEach(([playerId, stable]) => {
      // calculate the total points of the stable
      const totalPoints = stable.reduce((acc, cardId) => {
        const cardInfo = G.deck[Number(cardId)];
        const isWorthPoints = typeThatCountAsPoint.includes(cardInfo.type);

        return acc + (isWorthPoints ? 1 : 0);
      }, 0);

      if (totalPoints >= 7) {
        winner = playerId;
      }
    });

    if (winner) {
      return { winner: ctx.currentPlayer };
    }
  },
};
