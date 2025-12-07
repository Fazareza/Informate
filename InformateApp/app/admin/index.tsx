import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useThemeMode } from "@/hooks/useTheme";
import { useRouter, useFocusEffect } from "expo-router";
import api from "../../src/api";
import { Swipeable } from "react-native-gesture-handler";

export default function AdminDashboard() {
  const { theme, toggleTheme } = useThemeMode();
  const isDark = theme === "dark";
  const router = useRouter();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // === LOGOUT ===
  const handleLogout = () => {
    Alert.alert("Logout", "Yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          router.replace("/auth/login");
        },
      },
    ]);
  };

  // === FETCH EVENTS ===
  const fetchEvents = async () => {
    try {
      const res = await api.get("/events");
      setEvents(res.data.data);
    } catch (error) {
      console.log("Error fetching:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
    >
      {/* ===================== TOPBAR ===================== */}
      <View style={styles.topbar}>
        <Text style={[styles.topbarTitle, { color: Colors[theme].text }]}>
          Informate
        </Text>

        <View style={styles.topbarActions}>
          {/* Theme Toggle */}
          <TouchableOpacity onPress={toggleTheme}>
            <Ionicons
              name={isDark ? "sunny-outline" : "moon-outline"}
              size={26}
              color={Colors[theme].text}
            />
          </TouchableOpacity>

          {/* Go to Profile */}
          <TouchableOpacity onPress={() => router.push("/admin/profile")}>
            <Ionicons
              name="person-circle-outline"
              size={28}
              color={Colors[theme].text}
            />
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={26} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ===================== ANALYTICS ===================== */}
      <View style={styles.analyticsRow}>
        <View
          style={[
            styles.analyticsCard,
            {
              backgroundColor: Colors[theme].card,
              borderColor: Colors[theme].border,
            },
          ]}
        >
          <Ionicons name="people-outline" size={30} color="#2563eb" />
          <Text style={[styles.analyticsNumber, { color: Colors[theme].text }]}>
            1,241
          </Text>
          <Text
            style={[
              styles.analyticsLabel,
              { color: Colors[theme].secondaryText },
            ]}
          >
            Total Users
          </Text>
        </View>

        <View
          style={[
            styles.analyticsCard,
            {
              backgroundColor: Colors[theme].card,
              borderColor: Colors[theme].border,
            },
          ]}
        >
          <Ionicons name="calendar-outline" size={30} color="#10b981" />
          <Text style={[styles.analyticsNumber, { color: Colors[theme].text }]}>
            {events.length}
          </Text>
          <Text
            style={[
              styles.analyticsLabel,
              { color: Colors[theme].secondaryText },
            ]}
          >
            Total Events
          </Text>
        </View>

        <View
          style={[
            styles.analyticsCard,
            {
              backgroundColor: Colors[theme].card,
              borderColor: Colors[theme].border,
            },
          ]}
        >
          <Ionicons name="shield-checkmark-outline" size={30} color="#f59e0b" />
          <Text style={[styles.analyticsNumber, { color: Colors[theme].text }]}>
            3
          </Text>
          <Text
            style={[
              styles.analyticsLabel,
              { color: Colors[theme].secondaryText },
            ]}
          >
            Admins
          </Text>
        </View>
      </View>

      {/* ===================== LIST HEADER ===================== */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
          Daftar Event
        </Text>

        <TouchableOpacity onPress={() => router.push("/admin/create")}>
          <Ionicons name="add-circle" size={30} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* ===================== LIST ===================== */}
      {loading ? (
        <ActivityIndicator size="large" color={Colors[theme].text} />
      ) : (
        events.map((item: any) => (
          <Swipeable
            key={item.event_id}
            overshootRight={false}
            renderRightActions={() => (
              <View style={styles.swipeAction}>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/admin/edit",
                      params: { id: item.event_id },
                    })
                  }
                  style={styles.swipeButton}
                >
                  <Ionicons name="pencil" size={20} color="white" />
                </TouchableOpacity>
              </View>
            )}
          >
            <View
              style={[
                styles.card,
                {
                  backgroundColor: Colors[theme].card,
                  borderColor: Colors[theme].border,
                },
              ]}
            >
              {/* Thumbnail */}
              <Image
                source={{
                  uri: item.image_url || "https://via.placeholder.com/100",
                }}
                style={styles.thumbnail}
              />

              {/* Text */}
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: Colors[theme].text }]}>
                  {item.nama_acara}
                </Text>

                <Text
                  style={[
                    styles.cardDate,
                    { color: Colors[theme].secondaryText },
                  ]}
                >
                  {new Date(item.tanggal_mulai).toLocaleDateString("id-ID", {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>

                <Text
                  style={[
                    styles.cardSub,
                    { color: Colors[theme].secondaryText },
                  ]}
                  numberOfLines={1}
                >
                  {item.lokasi} • {item.kategori}
                </Text>
              </View>
            </View>
          </Swipeable>
        ))
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  // TOPBAR
  topbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  topbarTitle: { fontSize: 26, fontWeight: "800" },
  topbarActions: {
    flexDirection: "row",
    gap: 18,
    alignItems: "center",
  },

  // ANALYTICS
  analyticsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  analyticsCard: {
    width: "30%",
    paddingVertical: 18,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
  },
  analyticsNumber: { fontSize: 24, fontWeight: "800", marginTop: 6 },
  analyticsLabel: { fontSize: 12, marginTop: 4 },

  // SECTION HEADER
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
  },

  // CARD
  card: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#ddd",
  },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardDate: { fontSize: 12, marginTop: 4 },
  cardSub: { fontSize: 12, marginTop: 2 },

  // Swipe Action
  swipeAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    backgroundColor: "#2563eb",
    borderRadius: 14,
    marginBottom: 12,
  },
  swipeButton: {
    width: 70,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
