import { Ctx } from "boardgame.io";
import { GameState } from "../types/game-types";

export const checkIfActionShouldAutoEnd = (G: GameState) => {
  const card = G.deck[Number(G.cardBeingPlayed)];
  const currentAction =
    card?.effect?.actions?.[G.cardEffectState?.actionIndex ?? 0];

  if (!currentAction) {
    return false;
  }

  if (currentAction.action === "search") {
    if (currentAction.from === "deck" && G.drawPile.length === 0) {
      return true;
    } else if (
      currentAction.from === "discard_pile" &&
      G.discardPile.length === 0
    ) {
      return true;
    }
  }
};

export const Stage = {
  startOfTurn: "startOfTurn",
  draw: "draw",
  actionTurn: "actionTurn",
  discardOverflowingCards: "discardOverflowingCards",
  neighPhase: "neighPhase",
  endOfTurn: "endOfTurn",
} as const;

export const getCurrentAction = (G: GameState) => {
  const card = G.deck[Number(G.cardBeingPlayed)];
  return card?.effect?.actions?.[G.cardEffectState?.actionIndex ?? 0];
};

export const getCurrentPlayerStage = (ctx: Ctx) => {
  return ctx.activePlayers?.[ctx.currentPlayer] as keyof typeof Stage;
};

export const isMyTurn = (ctx: Ctx, playerId: string) => {
  return ctx.currentPlayer === playerId;
};

export const isMyTurnAndView = (
  ctx: Ctx,
  playerId: string,
  currentPlayerView: string
) => {
  return ctx.currentPlayer === playerId && currentPlayerView === playerId;
};
