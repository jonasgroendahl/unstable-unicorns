import { Ctx } from "boardgame.io";
import { Card, Player } from "../types/game-types";
import { RandomAPI } from "boardgame.io/dist/types/src/plugins/random/random";
import { Cards } from "./cards";

const isTesting = true;

export const setupBoard = (ctx: Ctx, random: RandomAPI) => {
  const players: Player[] = Array.from({ length: ctx.numPlayers }, (_, idx) => {
    return {
      id: `${idx}`,
      name: `Player ${idx}`,
    };
  });

  const playerHands: Record<string, string[]> = {};
  const playerStables: Record<string, string[]> = {};

  const allCards: Card[] = [];
  const nusery: Card[] = [];
  let idCounter = 0;

  Cards.forEach((card) => {
    for (let i = 0; i < card.count; i++) {
      const cardId = idCounter.toString();

      const objectToPush: Card = {
        id: cardId,
        name: card.name,
        type: card.type,
        image: card.image,
        description: card.description,
        effect: card.effect,
      };

      if (card.type === "baby") {
        nusery.push(objectToPush);
      }

      allCards.push(objectToPush);

      idCounter++;
    }
  });

  // Shuffle the deck.
  const drawPile = random
    .Shuffle(allCards.filter((card) => card.type !== "baby"))
    .map((card) => card.id);

  console.log("drawPile length", drawPile.length);

  // Distribute cards to players.
  players.forEach((player, i) => {
    // temp testing specific cards
    if (isTesting) {
      const cards = [];
      if (i === 0) {
        const classyNar = drawPile.findIndex((cardId) => cardId === "18");
        cards.push(...drawPile.splice(classyNar, 1));
        const anotherOne = drawPile.findIndex((cardId) => cardId === "14");
        cards.push(...drawPile.splice(anotherOne, 1));
        const nar = drawPile.findIndex((cardId) => cardId === "13");
        cards.push(...drawPile.splice(nar, 1));
        const ddd = drawPile.findIndex((cardId) => cardId === "16");
        cards.push(...drawPile.splice(ddd, 1));
        cards.push(...drawPile.splice(0, 1));
      } else {
        // take 5 random cards from the drawPile
        cards.push(...drawPile.splice(0, 5));
      }

      playerHands[player.id] = cards;
      playerStables[player.id] = [nusery.pop()!.id];
    } else {
      // take 5 random cards from the drawPile
      const cards = drawPile.splice(0, 5);

      playerHands[player.id] = cards;
      playerStables[player.id] = [nusery.pop()!.id];
    }
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
    onGoingAction: undefined,
    actionIndex: 0,
  };
};
