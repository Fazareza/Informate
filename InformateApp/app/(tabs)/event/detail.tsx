// app/event/detail.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import api from "../../../src/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useThemeMode } from "@/hooks/useTheme";
import { Colors } from "@/constants/colors";

export default function EventDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useThemeMode();
  const c = Colors[theme];

  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEvent();
      checkBookmark();
    }
  }, [id]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data?.data || null);
    } catch (e) {
      Alert.alert("Error", "Gagal mengambil detail event");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const checkBookmark = async () => {
    try {
      const raw = await AsyncStorage.getItem("informate_bookmarks_v1");
      const arr = raw ? JSON.parse(raw) : [];
      setBookmarked(arr.includes(Number(id)));
    } catch {
      setBookmarked(false);
    }
  };

  const toggleBookmark = async () => {
    try {
      const raw = await AsyncStorage.getItem("informate_bookmarks_v1");
      const arr = raw ? JSON.parse(raw) : [];
      let updated = [...arr];
      if (bookmarked) {
        updated = updated.filter((n: number) => n !== Number(id));
      } else {
        if (!updated.includes(Number(id))) updated.push(Number(id));
      }
      await AsyncStorage.setItem(
        "informate_bookmarks_v1",
        JSON.stringify(updated)
      );
      setBookmarked(!bookmarked);
    } catch (e) {
      // ignore
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  if (!event)
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <Text style={{ color: c.text }}>Tidak ada data</Text>
      </View>
    );

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.background }]}>
      <Image
        source={{
          uri: event.image_url || "https://via.placeholder.com/800x300",
        }}
        style={styles.banner}
      />
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: c.text }]}>
          {event.nama_acara}
        </Text>
        <TouchableOpacity onPress={toggleBookmark} style={styles.bookmarkBtn}>
          <Ionicons
            name={bookmarked ? "bookmark" : "bookmark-outline"}
            size={22}
            color={bookmarked ? "#2563eb" : c.text}
          />
        </TouchableOpacity>
      </View>

      <Text style={[styles.meta, { color: c.secondaryText }]}>
        {new Date(event.tanggal_mulai).toLocaleString()}
      </Text>
      <Text style={[styles.meta, { color: c.secondaryText }]}>
        {event.lokasi} • {event.kategori}
      </Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Deskripsi</Text>
        <Text style={[styles.sectionBody, { color: c.secondaryText }]}>
          {event.deskripsi || "-"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Contact</Text>
        <Text style={[styles.sectionBody, { color: c.secondaryText }]}>
          {event.contact_person || "-"}
        </Text>
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: {
    width: "100%",
    height: 220,
    resizeMode: "cover",
    backgroundColor: "#ddd",
  },
  headerRow: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 20, fontWeight: "800", flex: 1, marginRight: 8 },
  bookmarkBtn: { padding: 8 },
  meta: { paddingHorizontal: 16, fontSize: 13, marginTop: 4 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  sectionBody: { fontSize: 14, lineHeight: 20 },
});
