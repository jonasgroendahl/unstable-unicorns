import React from "react";
import { ScrollView, Text } from "react-native";
import { Card as CardType, PlayerState } from "../store/state";
import { Card } from "./Card";

interface IPlayerStableProps {
  player: PlayerState;
  playerIndex: number;
  onPressCard: (card: CardType) => void;
}

export const PlayerStable: React.FC<IPlayerStableProps> = ({
  player,
  playerIndex,
  onPressCard,
}) => {
  if (player.cardsInStable.length === 0) {
    return <Text>No cards in stable</Text>;
  }

  return (
    <ScrollView horizontal>
      <Text>Player {playerIndex}</Text>
      {player.cardsInStable.map((card, cardI) => (
        <Card
          onPress={() => onPressCard(card)}
          key={`stable_${playerIndex}_${cardI}`}
          card={card}
        />
      ))}
    </ScrollView>
  );
};
