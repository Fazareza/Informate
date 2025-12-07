// components/LoopCarousel.tsx
import React, { useRef } from "react";
import {
  View,
  Animated,
  Dimensions,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
} from "react-native";

const { width } = Dimensions.get("window");

// SETTING
const CARD_WIDTH = width * 0.75;
const SIDE_PREVIEW = (width - CARD_WIDTH) / 2; // crop kiri/kanan
const SPACING = 16;

export default function LoopCarousel({ data, onPress }: any) {
  const scrollX = useRef(new Animated.Value(0)).current;

  // Duplikasi data biar bisa loop
  const loopData = [...data, ...data, ...data];
  const middleIndex = data.length;

  const onScrollEnd = (e: any) => {
    const index = Math.round(
      e.nativeEvent.contentOffset.x / (CARD_WIDTH + SPACING)
    );

    if (index >= middleIndex * 2) {
      // reset ke tengah
      e.target.scrollTo({
        x: middleIndex * (CARD_WIDTH + SPACING),
        animated: false,
      });
    }
  };

  return (
    <View style={{ marginBottom: 30 }}>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate={0.9}
        snapToInterval={CARD_WIDTH + SPACING}
        contentContainerStyle={{
          paddingHorizontal: SIDE_PREVIEW,
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={onScrollEnd}
      >
        {loopData.map((item, index) => {
          const inputRange = [
            (index - 2) * (CARD_WIDTH + SPACING),
            (index - 1) * (CARD_WIDTH + SPACING),
            index * (CARD_WIDTH + SPACING),
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1, 0.8],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
            extrapolate: "clamp",
          });

          return (
            <View
              key={index}
              style={{ width: CARD_WIDTH, marginRight: SPACING }}
            >
              <Animated.View
                style={[styles.card, { transform: [{ scale }], opacity }]}
              >
                <TouchableOpacity onPress={() => onPress(item)}>
                  <Image
                    source={{
                      uri:
                        item.image_url || "https://via.placeholder.com/400x250",
                    }}
                    style={styles.image}
                  />
                  <View style={styles.overlay}>
                    <Text style={styles.title} numberOfLines={1}>
                      {item.nama_acara}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </View>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 18,
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
