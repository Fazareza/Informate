// app/profile.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import api from "../src/api";
import { useThemeMode } from "@/hooks/useTheme";
import { Colors } from "@/constants/colors";

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useThemeMode();
  const c = Colors[theme];

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // === GET PROFILE DARI BACKEND ===
  const getProfile = async () => {
    try {
      const res = await api.get("/auth/me"); // <-- sudah sesuai API
      setUser(res.data.data); // { user_id, nama, email, avatar, role }
    } catch (e) {
      console.log("Profile load error:", e);
      Alert.alert("Error", "Gagal memuat profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  // === LOGOUT ===
  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    router.replace("/auth/login");
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={c.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: c.text }]}>Profile</Text>

        <TouchableOpacity onPress={toggleTheme}>
          <Ionicons
            name={theme === "dark" ? "sunny-outline" : "moon-outline"}
            size={22}
            color={c.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        {/* USER INFO */}
        <View style={styles.profileSection}>
          <Image
            source={{
              uri:
                user?.avatar ||
                `https://ui-avatars.com/api/?background=random&name=${user?.nama}`,
            }}
            style={styles.avatar}
          />

          <Text style={[styles.name, { color: c.text }]}>{user?.nama}</Text>
          <Text style={[styles.email, { color: c.secondaryText }]}>
            {user?.email}
          </Text>
        </View>

        {/* MENU */}
        <View style={styles.menuWrapper}>
          <MenuItem
            icon="bookmark-outline"
            label="My Bookmarks"
            color={c.text}
            onPress={() => router.push("/bookmark")}
          />

          <MenuItem
            icon="color-palette-outline"
            label="Ganti Tema"
            color={c.text}
            onPress={toggleTheme}
          />
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* MENU ITEM COMPONENT */
const MenuItem = ({ icon, label, color, onPress }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Ionicons name={icon} size={20} color={color} />
    <Text style={[styles.menuLabel, { color }]}>{label}</Text>
    <Ionicons
      name="chevron-forward"
      size={20}
      color={color}
      style={{ opacity: 0.4 }}
    />
  </TouchableOpacity>
);

/* ====================
   STYLES
   ==================== */
const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  backBtn: { padding: 8 },

  headerTitle: { fontSize: 20, fontWeight: "700" },

  profileSection: { alignItems: "center", marginTop: 10 },

  avatar: { width: 110, height: 110, borderRadius: 55, marginBottom: 14 },

  name: { fontSize: 22, fontWeight: "800" },

  email: { fontSize: 14, marginTop: 2 },

  menuWrapper: { marginTop: 25, paddingHorizontal: 16 },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },

  menuLabel: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: "600" },

  logoutBtn: {
    marginTop: 40,
    marginHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#ef4444",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },

  logoutText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
