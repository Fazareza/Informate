// app/(tabs)/bookmark.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../src/api";
import EventCard from "@/components/EventCard";
import { useThemeMode } from "@/hooks/useTheme";
import { Colors } from "@/constants/colors";
import { useRouter } from "expo-router";

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
    <ScrollView style={[styles.container, { backgroundColor: c.background }]}>
      <Text style={[styles.title, { color: c.text }]}>Bookmarks</Text>

      {loading ? (
        <ActivityIndicator size="large" color={c.text} />
      ) : bookmarkedEvents.length === 0 ? (
        <Text style={[styles.emptyText, { color: c.secondaryText }]}>
          Belum ada bookmark.
        </Text>
      ) : (
        bookmarkedEvents.map((ev) => (
          <EventCard
            key={ev.event_id}
            event={ev}
            themeColors={c}
            bookmarked={true}
            onPress={() =>
              router.push({
                pathname: "/event/detail",
                params: { id: ev.event_id },
              })
            }
            onBookmarkChange={(state) => {
              if (!state) removeBookmark(ev.event_id);
            }}
          />
        ))
      )}

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 12 },
  emptyText: { textAlign: "center", marginTop: 40 },
});
