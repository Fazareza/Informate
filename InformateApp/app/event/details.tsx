import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import api from "../../src/api";
import { EventItem } from "../../types/event";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function EventDetail() {
  const { id } = useLocalSearchParams();
  const [event, setEvent] = useState<EventItem | null>(null);

  const loadDetail = async () => {
    try {
      const res = await api.get(`/event/${id}`);
      setEvent(res.data.data);
    } catch (e) {
      console.log("Error load detail:", e);
    }
  };

  useEffect(() => {
    loadDetail();
  }, []);

  if (!event)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );

  return (
    <View style={{ flex: 1 }}>
      {/* Background Web3 Gradient */}
      <LinearGradient
        colors={["#e0f2fe", "#eef2ff", "#f5f3ff"]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Title Card */}
        <View style={styles.headerCard}>
          <Text style={styles.title}>{event.nama_acara}</Text>
          <Text style={styles.subtitle}>Detail informasi lengkap acara</Text>
        </View>

        {/* Description Card */}
        <View style={styles.glassCard}>
          <Text style={styles.cardTitle}>Deskripsi</Text>
          <Text style={styles.content}>{event.deskripsi}</Text>
        </View>

        {/* Date Card */}
        <View style={styles.glassCard}>
          <Text style={styles.cardTitle}>Waktu Acara</Text>

          <View style={styles.row}>
            <Ionicons name="calendar-outline" size={20} color="#4338ca" />
            <Text style={styles.content}>Mulai: {event.tanggal_mulai}</Text>
          </View>

          <View style={[styles.row, { marginTop: 6 }]}>
            <Ionicons name="calendar-clear-outline" size={20} color="#4338ca" />
            <Text style={styles.content}>Selesai: {event.tanggal_selesai}</Text>
          </View>
        </View>

        {/* Location Card */}
        <View style={styles.glassCard}>
          <Text style={styles.cardTitle}>Lokasi</Text>
          <View style={styles.row}>
            <Ionicons name="location-outline" size={20} color="#4338ca" />
            <Text style={styles.content}>{event.lokasi}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
  },

  headerCard: {
    marginBottom: 20,
    padding: 24,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    shadowColor: "#a5b4fc",
    shadowOpacity: 0.35,
    shadowRadius: 25,
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#1e1b4b",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },

  glassCard: {
    marginBottom: 18,
    padding: 18,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    shadowColor: "#818cf8",
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#312e81",
    marginBottom: 8,
  },

  content: {
    fontSize: 15,
    color: "#1f2937",
    lineHeight: 22,
    flexShrink: 1,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
