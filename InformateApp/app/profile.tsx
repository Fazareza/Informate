// app/profile.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useThemeMode } from "@/hooks/useTheme";
import { Colors } from "@/constants/colors";
import api from "@/src/api";

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useThemeMode();
  const c = Colors[theme];

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Ambil profil user login
  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.data);
    } catch (err) {
      console.log("Gagal ambil profil:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Auto refresh saat masuk halaman
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  // Logout user biasa
  const handleLogout = () => {
    Alert.alert("Konfirmasi", "Yakin ingin logout?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("userToken");
          await AsyncStorage.removeItem("userRole");

          router.dismissAll();
          router.replace("/auth/login");
        },
      },
    ]);
  };

  // Avatar (kalau backend belum ada foto)
  const getAvatarUrl = (name: string) => {
    const clean = name ? name.replace(/\s+/g, "+") : "User";
    return `https://ui-avatars.com/api/?name=${clean}&background=random&color=fff&size=256`;
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: c.background, justifyContent: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={c.text} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />

      {/* Header */}
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

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* User info */}
        <View style={styles.profileSection}>
          <Image
            source={{ uri: getAvatarUrl(user?.nama || "User") }}
            style={styles.avatar}
          />
          <Text style={[styles.name, { color: c.text }]}>
            {user?.nama || "Pengguna"}
          </Text>
          <Text style={[styles.email, { color: c.secondaryText }]}>
            {user?.email || "email@unknown.com"}
          </Text>
        </View>

        {/* Menu section */}
        <View style={styles.menuWrapper}>
          <MenuItem
            icon="bookmark-outline"
            label="My Bookmarks"
            color={c.text}
            onPress={() => router.push("/bookmark")}
          />

          <MenuItem
            icon="color-palette-outline"
            label="Switch Theme"
            color={c.text}
            onPress={toggleTheme}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* COMPONENT: Menu Item */
const MenuItem = ({ icon, label, color, onPress }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Ionicons name={icon} size={20} color={color} />
    <Text style={[styles.menuLabel, { color }]}>{label}</Text>
    <Ionicons
      name="chevron-forward"
      size={20}
      color={color}
      style={{ opacity: 0.5 }}
    />
  </TouchableOpacity>
);

/* STYLES (TIDAK DIUBAH SAMA SEKALI) */
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
  backBtn: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  profileSection: {
    alignItems: "center",
    marginTop: 10,
    paddingBottom: 20,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 14,
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
  },
  email: {
    fontSize: 14,
    marginTop: 2,
  },
  menuWrapper: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: "rgba(0,0,0,0.07)",
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginLeft: 12,
  },
  logoutBtn: {
    marginTop: 30,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 6,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ef4444",
  },
});
