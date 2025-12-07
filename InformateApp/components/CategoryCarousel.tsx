// components/CategoryCarousel.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";

type Props = {
  categories: string[];
  selected?: string | null;
  onSelect?: (cat: string) => void;
  themeColors: any;
};

export default function CategoryCarousel({
  categories,
  selected,
  onSelect,
  themeColors,
}: Props) {
  return (
    <View style={{ paddingVertical: 10 }}>
      <FlatList
        horizontal
        data={categories}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(i) => i}
        renderItem={({ item }) => {
          const isSel = selected === item;
          return (
            <TouchableOpacity
              onPress={() => onSelect?.(item)}
              style={[
                styles.chip,
                { backgroundColor: isSel ? "#2563eb" : themeColors.card },
              ]}
            >
              <Text
                style={{
                  color: isSel ? "#fff" : themeColors.text,
                  fontWeight: isSel ? "800" : "600",
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
});
