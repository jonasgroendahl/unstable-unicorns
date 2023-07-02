import React from "react";
import { Card as CardType } from "../store/state";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "react-native";

type CardProps = { card: CardType; onPress?: () => void };

export const Card: React.FC<CardProps> = React.memo(({ card, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Image
        source={{
          uri: "https://www.unicornsdatabase.com" + card.image,
        }}
        style={styles.img}
      />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  img: {
    height: 200,
    width: 80,
  },
});
