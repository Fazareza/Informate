// components/EventCard.tsx
import React, { useMemo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  GestureResponderEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
let BlurView: any;
try {
  BlurView = require("expo-blur").BlurView;
} catch (error) {
  console.log("expo-blur not available:", error);
  BlurView = null;
}

type Props = {
  event: any;
  themeColors: {
    background: string;
    text: string;
    card: string;
    border: string;
    secondaryText: string;
  };
  bookmarked?: boolean;
  onPress?: (e?: GestureResponderEvent) => void;
  onBookmarkChange?: (state: boolean) => Promise<void> | void;
};

export default function EventCard({
  event,
  themeColors = {
    background: "#fff",
    text: "#000",
    card: "#f8f8f8",
    border: "#ddd",
    secondaryText: "#666",
  },
  bookmarked = false,
  onPress,
  onBookmarkChange,
}: Props) {
  const touchScale = new Animated.Value(1);

  const onPressIn = () =>
    Animated.spring(touchScale, {
      toValue: 0.985,
      useNativeDriver: true,
    }).start();
  const onPressOut = () =>
    Animated.spring(touchScale, { toValue: 1, useNativeDriver: true }).start();

  const dateStr = useMemo(() => {
    if (!event?.tanggal_mulai) return "-";
    try {
      const d = new Date(event.tanggal_mulai);
      return d.toLocaleString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return event.tanggal_mulai;
    }
  }, [event]);

  return (
    <Animated.View
      style={[styles.wrapper, { transform: [{ scale: touchScale }] }]}
    >
      {/* Glass / blur layer */}
      {BlurView ? (
        <BlurView
          intensity={50}
          tint={themeColors.background === "#000" ? "dark" : "light"}
          style={[styles.blur, { backgroundColor: themeColors.card }]}
        />
      ) : (
        <View style={[styles.blur, { backgroundColor: themeColors.card }]} />
      )}

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.card,
          {
            borderColor: themeColors.border,
            backgroundColor: themeColors.card,
          },
        ]}
      >
        <Image
          source={{
            uri: event.image_url || "https://via.placeholder.com/400x300",
          }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.content}>
          <Text
            numberOfLines={2}
            style={[styles.title, { color: themeColors.text }]}
          >
            {event.nama_acara}
          </Text>

          <View style={styles.metaRow}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={themeColors.secondaryText}
            />
            <Text
              style={[styles.metaText, { color: themeColors.secondaryText }]}
            >
              {dateStr}
            </Text>

            <Ionicons
              name="location-outline"
              size={14}
              color={themeColors.secondaryText}
              style={{ marginLeft: 12 }}
            />
            <Text
              style={[styles.metaText, { color: themeColors.secondaryText }]}
              numberOfLines={1}
            >
              {event.lokasi}
            </Text>
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{event.kategori || "Umum"}</Text>
            </View>

            <View style={{ flex: 1 }} />

            <TouchableOpacity
              onPress={async () => {
                try {
                  await (onBookmarkChange
                    ? onBookmarkChange(!bookmarked)
                    : Promise.resolve());
                } catch {}
              }}
              style={styles.iconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={bookmarked ? "bookmark" : "bookmark-outline"}
                size={20}
                color={bookmarked ? "#2563eb" : themeColors.secondaryText}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
  },
  blur: {
    ...Platform.select({
      ios: { borderRadius: 16 },
      android: { borderRadius: 16 },
      default: { borderRadius: 16 },
    }),
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.9,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    minHeight: 100,
  },
  image: {
    width: 120,
    height: 100,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  content: {
    padding: 12,
    flex: 1,
  },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { marginLeft: 6, fontSize: 12 },
  bottomRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  badge: {
    backgroundColor: "#eef2ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: { color: "#2563eb", fontWeight: "700", fontSize: 12 },
  iconBtn: { paddingHorizontal: 6, paddingVertical: 4 },
});
