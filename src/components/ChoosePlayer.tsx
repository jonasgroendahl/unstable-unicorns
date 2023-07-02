import React from "react";
import { Button, Text, View } from "react-native";
import { Card, CardType, PlayerState } from "../store/state";
import { PlayerHand } from "./PlayerHand";

interface IChoosePlayerProps {
  players: PlayerState[];
  playerTurn: number;
  onPressCard: (card: Card, player: number) => void;
}

export const ChoosePlayer: React.FC<IChoosePlayerProps> = ({
  players,
  playerTurn,
  onPressCard,
}) => {
  const [selectedPlayer, setSelectedPlayer] = React.useState<PlayerState>();

  return (
    <View>
      {players
        .filter((player, pindex) => pindex !== playerTurn)
        .map((p, pindex) => (
          <View key={`player_${pindex}`}>
            <Text>Player {pindex}</Text>
            <Button
              title="Choose"
              onPress={() => {
                setSelectedPlayer(p);
              }}
            />
            {selectedPlayer && (
              <PlayerHand
                onPressCard={(card) => {
                  onPressCard(card, p.index);
                  setSelectedPlayer(undefined);
                }}
                playerIndex={selectedPlayer.index}
                player={selectedPlayer}
              />
            )}
          </View>
        ))}
    </View>
  );
};
