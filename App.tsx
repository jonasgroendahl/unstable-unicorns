import {
  Alert,
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { state } from "./src/store/state";
import { Card } from "./src/components/Card";
import { OnGoingEvent } from "./src/components/OngoingEvent";
import { useEffect } from "react";

export default function App() {
  const {
    players,
    drawPile,
    playerTurn,
    playerPhase,
    startGame,
    pickACard,
    playACard,
    readyToPickup,
    actionPickACard,
    checkIfWinner,
  } = state();

  useEffect(() => {
    const winner = checkIfWinner();
    if (winner !== null) {
      Alert.alert("Woo you won!");
    }
  }, [players]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Text>Hi, {playerTurn}</Text>
        <Text>Draw pile</Text>
        {/* <View>
          <ScrollView horizontal contentContainerStyle={{ gap: 10 }}>
            {drawPile.map((card, dpi) => (
              <Card key={`dpi_${dpi}`} card={card} />
            ))}
          </ScrollView>
        </View> */}
        <Button title="Start" onPress={() => startGame()} />
        {players.map((player, playerI) => (
          <View
            key={playerI}
            style={[
              styles.playerView,
              {
                backgroundColor:
                  playerTurn === playerI ? "lightgreen" : undefined,
              },
            ]}
          >
            <Text>On hand</Text>
            <ScrollView horizontal>
              {player.cardsOnHand.map((card, cardI) => (
                <Card
                  onPress={() => {
                    if (playerPhase === 2) {
                      playACard(card, playerI);
                    }
                  }}
                  key={`hand_${playerI}_${cardI}`}
                  card={card}
                />
              ))}
              {playerPhase === 0 && (
                <Button title="Ready to pick-up" onPress={readyToPickup} />
              )}
              {playerPhase === 1 && (
                <Button
                  title="Pick a card"
                  onPress={() => pickACard(playerI)}
                />
              )}
              {playerPhase === 2 && (
                <Button
                  title="Pick a new card"
                  onPress={() => actionPickACard(playerI)}
                />
              )}
            </ScrollView>
            <Text>In stable</Text>
            <ScrollView horizontal>
              {player.cardsInStable.map((card, cardI) => (
                <Card key={`stable_${playerI}_${cardI}`} card={card} />
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
      <OnGoingEvent />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  playerView: {
    marginBottom: 50,
  },
});
