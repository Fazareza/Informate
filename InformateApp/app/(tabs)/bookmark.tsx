// app/(tabs)/bookmark.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../src/api";
import EventCard from "@/components/EventCard";
import { useThemeMode } from "@/hooks/useTheme";
import { Colors } from "@/constants/colors";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function BookmarksScreen() {
  const { theme } = useThemeMode();
  const c = Colors[theme];
  const router = useRouter();

  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await loadBookmarks();
      await loadEvents();
    })();
  }, []);

  const loadBookmarks = async () => {
    try {
      const raw = await AsyncStorage.getItem("informate_bookmarks_v1");
      setBookmarks(raw ? JSON.parse(raw) : []);
    } catch {
      setBookmarks([]);
    }
  };

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/events");
      setEvents(res.data?.data || []);
    } catch (e) {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (id: number) => {
    const remaining = bookmarks.filter((b) => b !== id);
    setBookmarks(remaining);
    await AsyncStorage.setItem(
      "informate_bookmarks_v1",
      JSON.stringify(remaining)
    );
  };

  const bookmarkedEvents = events.filter((e) => bookmarks.includes(e.event_id));

  return (
    <View style={[styles.container]}>
      {/* WEB3 GRADIENT BACKGROUND */}
      <LinearGradient
        colors={["#e0f2fe", "#eef2ff", "#f5f3ff"]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Neo-glass Header Card */}
      <View style={styles.headerCard}>
        <Text style={[styles.title, { color: "#1e1b4b" }]}>Bookmarks</Text>
        <Text style={styles.subtitle}>
          Event favorit Anda tersimpan di sini
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={c.text}
          style={{ marginTop: 40 }}
        />
      ) : bookmarkedEvents.length === 0 ? (
        <Text style={[styles.emptyText, { color: c.secondaryText }]}>
          Belum ada bookmark.
        </Text>
      ) : (
        <FlatList
          data={bookmarkedEvents}
          keyExtractor={(ev) => ev.event_id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View style={styles.glassCard}>
              <EventCard
                event={item}
                themeColors={c}
                bookmarked={true}
                onPress={() =>
                  router.push({
                    pathname: "/event/detail",
                    params: { id: item.event_id },
                  })
                }
                onBookmarkChange={(state) => {
                  if (!state) removeBookmark(item.event_id);
                }}
              />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  headerCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 18,
    backgroundColor: "rgba(255,255,255,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    backdropFilter: "blur(15px)",
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
  },

  subtitle: {
    fontSize: 14,
    marginTop: 4,
    color: "#475569",
    fontWeight: "500",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
  },

  glassCard: {
    marginBottom: 16,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.4)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
    padding: 10,
    shadowColor: "#818cf8",
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
});
