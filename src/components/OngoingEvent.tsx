import React, { useMemo } from "react";
import { state } from "../store/state";
import { Button, Modal, SafeAreaView, Text, View } from "react-native";
import { PlayerStable } from "./PlayerStable";
import { PlayerHand } from "./PlayerHand";
import { ChoosePlayer } from "./ChoosePlayer";

interface IOnGoingEventProps {}

export const OnGoingEvent: React.FC<IOnGoingEventProps> = () => {
  const {
    event,
    players,
    discardPlayerCard,
    moveCard,
    playerTurn,
    clearEvent,
    nextPlayer,
  } = state();

  const renderedEvent = () => {
    if (!event) {
      return null;
    }

    switch (event.variant) {
      case "CARD_STABLE":
        return (
          <View>
            {players
              .filter((player, pindex) => pindex !== playerTurn)
              .map((p, pindex) => (
                <PlayerStable
                  onPressCard={(card) => {
                    if (card.type !== event.cardType) {
                      return;
                    }

                    moveCard(card, playerTurn, p.index, "stable");
                    clearEvent();
                    nextPlayer();
                  }}
                  player={p}
                  key={pindex}
                  playerIndex={pindex}
                />
              ))}
          </View>
        );
      case "CARD_HAND":
        return (
          <View>
            {players
              .filter((player, pindex) => pindex !== playerTurn)
              .map((p, pindex) => (
                <PlayerHand
                  onPressCard={(card) => {
                    moveCard(card, p.index, playerTurn, "hand");
                    clearEvent();
                    nextPlayer();
                  }}
                  player={p}
                  key={pindex}
                  playerIndex={pindex}
                />
              ))}
          </View>
        );
      case "CHOOSE_PLAYER":
        return (
          <ChoosePlayer
            playerTurn={playerTurn}
            players={players}
            onPressCard={(card, num) => {
              discardPlayerCard(card, num);
              clearEvent();
              nextPlayer();
            }}
          />
        );
    }
    return null;
  };

  if (!event) {
    return null;
  }

  return (
    <Modal>
      <SafeAreaView>
        <Button
          title="Close"
          onPress={() => {
            clearEvent();
            nextPlayer();
          }}
        />
        {renderedEvent()}
      </SafeAreaView>
    </Modal>
  );
};
