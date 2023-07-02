import React from "react";
import { ScrollView, Text } from "react-native";
import { Card as CardType, PlayerState } from "../store/state";
import { Card } from "./Card";

interface IPlayerHandProps {
  player: PlayerState;
  playerIndex: number;
  onPressCard: (card: CardType) => void;
}

export const PlayerHand: React.FC<IPlayerHandProps> = ({
  player,
  playerIndex,
  onPressCard,
}) => {
  if (player.cardsOnHand.length === 0) {
    return <Text>No cards on hand</Text>;
  }

  return (
    <ScrollView horizontal>
      <Text>Player {playerIndex}</Text>
      {player.cardsOnHand.map((card, cardI) => (
        <Card
          onPress={() => onPressCard(card)}
          key={`stable_${playerIndex}_${cardI}`}
          card={card}
        />
      ))}
    </ScrollView>
  );
};
