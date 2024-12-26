/* eslint-disable no-case-declarations */
import { Move, type Game } from "boardgame.io";
import { CardType, GameState } from "../types/game-types";
import { checkIfActionShouldAutoEnd, Stage } from "./helper";
import { setupBoard } from "./setup";

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

const endTurn: Move<GameState> = ({ G, events }) => {
  if (G.cardBeingPlayed === null) {
    console.error("No card is being played");
    return;
  }

  G.cardBeingPlayed = null;
  events.endTurn();
};

const actuallyPlayCard: Move<GameState> = (params) => {
  const { G, ctx, events } = params;
  if (G.cardBeingPlayed === null) {
    console.error("No card is being played");
    return;
  }

  const cardInfo = G.deck[Number(G.cardBeingPlayed)];
  G.stables[ctx.currentPlayer].push(G.cardBeingPlayed);
  G.neighDecision = [];

  if (!cardInfo.effect) {
    return endTurn(params);
  }

  G.cardEffectState = {
    actionIndex: 0,
    actionState: cardInfo.effect.actions.map((a) => {
      return {
        playerChosen:
          (a.action === "draw" && a.from === "player") ||
          (a.action === "discard" && a.from !== "active_player") ||
          a.action === "destroy"
            ? null
            : undefined,
        playersAndCardSelections: G.players.reduce(
          (acc: Record<string, string[]>, player) => {
            acc[player.id] = [];
            return acc;
          },
          {}
        ),
      };
    }),
  };

  if (checkIfActionShouldAutoEnd(G)) {
    events.endTurn();
    return;
  }

  events.setActivePlayers({ all: Stage.endOfTurn });
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
};

const makeNeighDecision: Move<GameState> = (
  { G, playerID },
  decision: boolean
) => {
  const neighCard = G.hands[playerID].find((cardId) => {
    const cardInfo = G.deck[Number(cardId)];
    return cardInfo.type === "neigh";
  });

  if (!neighCard || !decision) {
    G.neighDecision[G.neighDecision.length - 1][playerID] = null;
  } else {
    G.neighDecision[G.neighDecision.length - 1][playerID] = neighCard;
  }
};

const skip: Move<GameState> = ({ events }) => {
  events.setStage("draw");
};

const selectCard: Move<GameState> = (
  { G, events, ctx },
  args: { cardIds: string[]; playerId: string }
) => {
  if (G.cardEffectState === undefined) {
    return;
  }

  if (G.cardBeingPlayed === null) {
    return;
  }

  for (const cardId of args.cardIds) {
    if (args.playerId === "special") continue;

    G.cardEffectState.actionState[
      G.cardEffectState.actionIndex
    ].playersAndCardSelections[args.playerId].push(cardId);
  }

  // check if we reached the last action yet otherwise incremenet
  if (
    G.cardEffectState.actionIndex !==
    G.cardEffectState.actionState.length - 1
  ) {
    G.cardEffectState.actionIndex++;

    if (checkIfActionShouldAutoEnd(G)) {
      events.endTurn();
    }

    return;
  }

  const card = G.deck[Number(G.cardBeingPlayed)];

  console.log("actionStates", G.cardEffectState.actionState.length);

  for (let i = 0; i < G.cardEffectState.actionState.length; i++) {
    const actionInstance = G.cardEffectState.actionState[i];

    console.log("processing", actionInstance.playerChosen);

    Object.entries(actionInstance.playersAndCardSelections).forEach(
      ([playerId, cardIds]) => {
        for (const cardId of cardIds) {
          const action = card.effect?.actions[i];

          if (!action) {
            continue;
          }

          console.log("action", action.action);

          switch (action.action) {
            case "search":
              let searchIndex = -1;

              if (action.from === "deck") {
                searchIndex = G.drawPile.findIndex((id) => id === cardId);

                if (searchIndex !== -1) {
                  G.drawPile.splice(searchIndex, 1);
                  G.hands[playerId].push(cardId);
                }
              } else if (action.from === "discard_pile") {
                searchIndex = G.discardPile.findIndex((id) => id === cardId);

                if (searchIndex !== -1) {
                  G.discardPile.splice(searchIndex, 1);
                  G.hands[playerId].push(cardId);
                }
              }

              break;
            case "discard":
              const cardIndex = G.hands[playerId].findIndex(
                (id) => id === cardId
              );

              console.log("trying to discard card", cardIndex, cardId, cardIds);
              G.hands[playerId].splice(cardIndex, 1);
              G.discardPile.push(cardId);

              break;
            case "draw":
              const from = action.from;

              if (from === "player" || from === "all_players") {
                const cardIndex = G.hands[playerId].findIndex(
                  (id) => id === cardId
                );
                console.log(cardId, cardIndex, G.hands[playerId][0]);
                G.hands[playerId].splice(cardIndex, 1);
              } else if (from === "deck") {
                const drawPileIndex = G.drawPile.findIndex(
                  (id) => id === cardId
                );
                G.drawPile.splice(drawPileIndex, 1);
              }

              G.hands[ctx.currentPlayer].push(cardId);
              break;
            case "steal":
              const stealIndex = G.stables[playerId].findIndex(
                (id) => id === cardId
              );

              if (stealIndex !== -1) {
                G.stables[playerId].splice(stealIndex, 1);
                G.stables[ctx.currentPlayer].push(cardId);
              }

              break;

            case "return":
              const returnIndex = G.stables[playerId].findIndex(
                (id) => id === cardId
              );

              if (returnIndex !== -1) {
                G.stables[playerId].splice(returnIndex, 1);
                G.hands[playerId].push(cardId);
              }
              break;

            case "destroy":
              const destroyIndex = G.stables[playerId].findIndex(
                (id) => id === cardId
              );

              if (destroyIndex !== -1) {
                G.stables[playerId].splice(destroyIndex, 1);
              }
              break;

            case "sacrifice":
              const sacrificeIndex = G.stables[playerId].findIndex(
                (id) => id === cardId
              );

              if (sacrificeIndex !== -1) {
                G.stables[playerId].splice(sacrificeIndex, 1);
              }

              break;
          }
        }
      }
    );
  }

  G.cardBeingPlayed = null;
  G.cardEffectState = undefined;

  events.endTurn();
};

const selectPlayer: Move<GameState> = ({ G }, playerId: string) => {
  if (G.cardEffectState === undefined) {
    return;
  }

  G.cardEffectState.actionState[G.cardEffectState.actionIndex].playerChosen =
    playerId;

  G.cardEffectState.actionState[
    G.cardEffectState.actionIndex
  ].playersAndCardSelections[playerId] = [];
};

export const UnstableUnicornsGame: Game<GameState> = {
  setup: ({ ctx, random }) => {
    return setupBoard(ctx, random);
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
        moves: {
          selectCard,
          selectPlayer,
          endTurn,
        },
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
      // calculate the total points each player's stable
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
